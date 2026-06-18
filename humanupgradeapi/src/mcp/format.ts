import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export function safeJsonStringify(value: unknown) {
  return JSON.stringify(
    value,
    (_key, innerValue: unknown) => {
      if (typeof innerValue === "bigint") {
        return innerValue.toString();
      }

      if (innerValue instanceof Date) {
        return innerValue.toISOString();
      }

      if (
        innerValue &&
        typeof innerValue === "object" &&
        "toJSON" in innerValue &&
        typeof innerValue.toJSON === "function"
      ) {
        return innerValue.toJSON();
      }

      return innerValue;
    },
    2,
  );
}

export function jsonToolResult(value: unknown): CallToolResult {
  return {
    content: [
      {
        type: "text",
        text: safeJsonStringify(value),
      },
    ],
  };
}

export function textToolResult(text: string): CallToolResult {
  return {
    content: [{ type: "text", text }],
  };
}

export function resourceText(uri: string, text: string, mimeType = "text/markdown") {
  return {
    contents: [
      {
        uri,
        mimeType,
        text,
      },
    ],
  };
}
