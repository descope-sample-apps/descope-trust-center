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
  const { host, port } = SERVER_CONFIG;
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

  const client = createOpencodeClient({ baseUrl });

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
      let response = "";
      const controller = new AbortController();

      const timeoutId = setTimeout(() => {
        controller.abort();
      }, SERVER_CONFIG.chatTimeoutMs);

      try {
        const { stream } = await client.event.subscribe({
          signal: controller.signal,
          onSseError: (err) => {
            console.error("SSE error:", err);
          },
        });

        const eventPromise = (async () => {
          for await (const rawEvent of stream) {
            try {
              const event = JSON.parse(rawEvent.data);

              if (event.type === "part") {
                const part = event.properties?.part;

                if (part?.type === "text" && part.text) {
                  process.stdout.write(part.text);
                } else if (part?.type === "tool_call") {
                  const toolName = part.tool ?? "unknown";
                  const status = part.state?.status;

                  if (status === "pending") {
                    console.log(`\n🔧 ${toolName}...`);
                  }
                }
              }
            } catch (parseErr) {
              console.error("Failed to parse event:", parseErr);
            }
          }
        })();

        const chatResponse = await client.session.prompt<true>({
          path: { id: session.id },
          body: {
            parts: [{ type: "text", text: prompt }],
          },
          signal: controller.signal,
        });

        await eventPromise;

        const data = chatResponse.data as {
          parts?: Array<{ type: string; text?: string }>;
          error?: string;
        };

        if (data.error) {
          throw new Error(`OpenCode error: ${data.error}`);
        }

        const match = data.parts
          ? [...data.parts].reverse().find((p) => p.type === "text")
          : undefined;
        if (!match?.text) {
          throw new Error("No text response from OpenCode");
        }

        response = match.text;
        return response;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          throw new Error(
            `Chat timed out after ${Math.round(SERVER_CONFIG.chatTimeoutMs / 1000 / 60)} minutes`,
          );
        }
        throw err;
      } finally {
        clearTimeout(timeoutId);
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
