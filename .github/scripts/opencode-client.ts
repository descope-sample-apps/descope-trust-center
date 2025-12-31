import { spawn } from "child_process";
import { createOpencodeClient } from "@opencode-ai/sdk";

export interface OpenCodeClient {
  createSession(): Promise<string>;
  sendMessage(sessionId: string, prompt: string): Promise<string>;
  cleanup(): Promise<void>;
}

export async function createOpenCodeClient(): Promise<OpenCodeClient> {
  const hostname = "127.0.0.1";
  const port = 4096;
  const baseUrl = `http://${hostname}:${port}`;

  // Start OpenCode server
  const serverProcess = spawn(
    "opencode",
    ["serve", "--hostname", hostname, "--port", port.toString()],
    {
      stdio: ["ignore", "pipe", "pipe"],
      detached: false,
    },
  );

  // Wait for server to be ready
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      serverProcess.kill();
      reject(new Error("OpenCode server failed to start within 30 seconds"));
    }, 30000);

    let output = "";
    const checkReady = (data: Buffer) => {
      output += data.toString();
      if (
        output.includes("Server started") ||
        output.includes("Listening on")
      ) {
        clearTimeout(timeout);
        resolve();
      }
    };

    serverProcess.stdout?.on("data", checkReady);
    serverProcess.stderr?.on("data", checkReady);

    serverProcess.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });

  // Create SDK client
  const client = createOpencodeClient({ baseUrl });

  return {
    async createSession(): Promise<string> {
      const session = await client.session.create();
      return session.id;
    },

    async sendMessage(sessionId: string, prompt: string): Promise<string> {
      let result = "";

      return new Promise((resolve, reject) => {
        const stream = client.chat.stream({
          sessionId,
          messages: [{ role: "user", content: prompt }],
        });

        stream.on("data", (chunk) => {
          if (chunk.type === "text") {
            result += chunk.content;
          }
        });

        stream.on("end", () => resolve(result));
        stream.on("error", reject);
      });
    },

    async cleanup(): Promise<void> {
      try {
        serverProcess.kill();
        // Wait a bit for graceful shutdown
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        // Ignore cleanup errors
        console.warn("Warning: failed to cleanup OpenCode server:", error);
      }
    },
  };
}
