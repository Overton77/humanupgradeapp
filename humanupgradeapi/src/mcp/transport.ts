import type express from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createHumanUpgradeMcpServer } from "./server.js";

export async function handleMcpRequest(
  req: express.Request,
  res: express.Response,
) {
  const server = createHumanUpgradeMcpServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });
  let closed = false;

  async function close() {
    if (closed) return;
    closed = true;
    await Promise.allSettled([transport.close(), server.close()]);
  }

  res.on("close", () => {
    void close();
  });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("[mcp] request failed:", error);

    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: "Internal MCP server error",
        },
        id: null,
      });
    }
  }
}

export function rejectUnsupportedMcpMethod(
  _req: express.Request,
  res: express.Response,
) {
  res.status(405).json({
    error:
      "HumanUpgrade MCP is deployed in stateless Streamable HTTP mode. Send MCP JSON-RPC requests with POST /api/mcp.",
  });
}
