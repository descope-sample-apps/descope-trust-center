import { spawn } from "child_process";
import type { OpencodeClient } from "@opencode-ai/sdk";
import type { ChildProcess } from "child_process";
import { createOpencodeClient } from "@opencode-ai/sdk";

export type Session = { id: string; title: string; version: string };

export interface OpenCodeServer {
  client: OpencodeClient;
  serverProcess: ChildProcess;
  createSession(): Promise<Session>;
  subscribeAndChat(session: Session, prompt: string): Promise<string>;
  cleanup(): Promise<void>;
}

const SERVER_CONFIG = {
  host: "127.0.0.1",
  port: 4096,
  connectTimeoutMs: 300,
  maxConnectRetries: 30,
  chatTimeoutMs: 25 * 60 * 1000,
} as const;

export async function waitForServer(client: OpencodeClient): Promise<void> {
  let retry = 0;
  let connected = false;
  let lastError: Error | undefined;

  do {
    try {
      await client.app.log<true>({
        body: {
          service: "descope-trust-center-agent",
          level: "info",
          message: "Connecting to OpenCode server",
        },
      });
      connected = true;
      break;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
    await new Promise((resolve) =>
      setTimeout(resolve, SERVER_CONFIG.connectTimeoutMs),
    );
    retry++;
  } while (retry < SERVER_CONFIG.maxConnectRetries);

  if (!connected) {
    throw new Error(
      `Failed to connect after ${SERVER_CONFIG.maxConnectRetries} retries. Last error: ${lastError?.message ?? "unknown"}`,
    );
  }
}

export async function createOpenCodeServer(): Promise<OpenCodeServer> {
  const { host, port, chatTimeoutMs } = SERVER_CONFIG;
  const baseUrl = `http://${host}:${port}`;

  const serverProcess = spawn(
    "opencode",
    ["serve", `--hostname=${host}`, `--port=${port}`],
    {
      stdio: "ignore",
      detached: true,
    },
  );

  const serverProcessErrorPromise = new Promise<never>((_, reject) => {
    serverProcess.once("error", (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === "string"
            ? error
            : "Unknown error";
      reject(new Error(`Failed to start OpenCode server process: ${message}`));
    });
  });

  serverProcess.unref();

  // Create custom fetch with extended timeouts to match our chat timeout
  // Default undici timeout is 300s (5 min), but agent sessions can run longer
  const customFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    // Set connection timeout to match our chat timeout
    // This prevents "HeadersTimeoutError" for long-running agent sessions
    return fetch(input, {
      ...init,
      // @ts-expect-error - Node.js fetch (undici) specific options
      headersTimeout: chatTimeoutMs,
      bodyTimeout: chatTimeoutMs,
    });
  };

  const client = createOpencodeClient({
    baseUrl,
    fetch: customFetch,
  });

  const connectPromise = waitForServer(client);
  await Promise.race([connectPromise, serverProcessErrorPromise]);

  return {
    client,
    serverProcess,

    async createSession(): Promise<Session> {
      const response = await client.session.create<true>();
      return response.data;
    },

    async subscribeAndChat(session: Session, prompt: string): Promise<string> {
      const controller = new AbortController();

      const timeoutId = setTimeout(() => {
        console.error(
          `\n⏰ Chat timed out after ${Math.round(SERVER_CONFIG.chatTimeoutMs / 1000 / 60)} minutes`,
        );
        controller.abort();
      }, SERVER_CONFIG.chatTimeoutMs);

      let streamError: Error | undefined;
      let lastPrintedLength = 0;

      try {
        const { stream } = await client.event.subscribe({
          signal: controller.signal,
          onSseError: (err) => {
            console.error("SSE connection error:", err);
            streamError = err instanceof Error ? err : new Error(String(err));
          },
        });

        const eventPromise = (async () => {
          try {
            for await (const evt of stream as AsyncGenerator<{
              type: string;
              properties: {
                part?: {
                  sessionID: string;
                  type: string;
                  tool?: string;
                  text?: string;
                  state?: { status: string; title?: string };
                  time?: { start?: number; end?: number };
                };
              };
            }>) {
              if (evt.type === "message.part.updated") {
                const part = evt.properties.part;
                if (!part || part.sessionID !== session.id) continue;

                if (part.type === "tool") {
                  if (part.state?.status === "pending" && part.state.title) {
                    process.stdout.write(`🔧 ${part.state.title}...`);
                  } else if (part.state?.status === "completed") {
                    const toolName = part.tool ?? "unknown";
                    process.stdout.write(`\r🔧 ${toolName} ✓\n`);
                  } else if (part.state?.status === "error") {
                    const toolName = part.tool ?? "unknown";
                    process.stdout.write(`\r🔧 ${toolName} ✗\n`);
                  }
                }

                if (part.type === "text" && part.text) {
                  // Print only the new portion of text (streaming delta)
                  const newText = part.text.slice(lastPrintedLength);
                  if (newText) {
                    process.stdout.write(newText);
                    lastPrintedLength = part.text.length;
                  }
                  // Add newline when text part completes
                  if (part.time?.end && lastPrintedLength > 0) {
                    process.stdout.write("\n");
                    lastPrintedLength = 0;
                  }
                }
              }
            }
          } catch (err) {
            if (!controller.signal.aborted) {
              streamError =
                err instanceof Error ? err : new Error(String(err));
              console.error("\nStream error:", streamError.message);
            }
          }
        })();

        // Send the prompt and wait for completion
        let chatResponse;
        try {
          chatResponse = await client.session.prompt<true>({
            path: { id: session.id },
            body: {
              parts: [{ type: "text", text: prompt }],
            },
            signal: controller.signal,
          });
        } catch (err) {
          // Abort the event stream if prompt fails
          controller.abort();
          throw err;
        }

        // Wait for event stream to finish processing
        await eventPromise;

        // Check for stream errors that occurred during processing
        if (streamError) {
          console.warn("\n⚠️  Stream had errors but prompt completed");
        }

        const data = chatResponse.data as {
          parts?: Array<{ type: string; text?: string }>;
          error?: string;
        };

        if (data.error) {
          throw new Error(`OpenCode error: ${data.error}`);
        }

        // Extract final text response
        const textParts = data.parts?.filter(
          (p) => p.type === "text" && p.text,
        );
        const finalText = textParts?.map((p) => p.text).join("\n") ?? "";

        if (!finalText) {
          // Don't fail if streaming printed output but response is empty
          if (lastPrintedLength === 0) {
            console.warn("⚠️  No text response received from OpenCode");
          }
          return "";
        }

        return finalText;
      } catch (err) {
        if (
          err instanceof Error &&
          (err.name === "AbortError" || controller.signal.aborted)
        ) {
          throw new Error(
            `Chat timed out after ${Math.round(SERVER_CONFIG.chatTimeoutMs / 1000 / 60)} minutes`,
          );
        }
        throw err;
      } finally {
        clearTimeout(timeoutId);

        // Close the session gracefully after completion
        try {
          await client.session.abort({
            path: { id: session.id },
          });
        } catch {
          // Session cleanup is best-effort, don't fail if it errors
        }
      }
    },

    async cleanup(): Promise<void> {
      if (!serverProcess.pid) return;

      try {
        console.log(`🧹 Killing OpenCode server (PID: ${serverProcess.pid})`);
        serverProcess.kill("SIGTERM");

        const timeout = setTimeout(() => {
          if (!serverProcess.pid) return;
          try {
            process.kill(serverProcess.pid, 0);
            console.log(
              `🔪 Force killing OpenCode server (PID: ${serverProcess.pid})`,
            );
            serverProcess.kill("SIGKILL");
          } catch {
            // Process already exited
          }
        }, 5000);

        timeout.unref?.();
      } catch (error) {
        console.warn("Warning: failed to cleanup OpenCode server:", error);
      }
    },
  };
}
