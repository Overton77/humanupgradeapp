import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import "dotenv/config";

export type EmbeddingModelId =
  | "amazon.titan-embed-text-v1"
  | "cohere.embed-v4:0"
  | string;

export type EmbedTextInputType = "search_document" | "search_query";

export type EmbedTextOptions = {
  modelId?: EmbeddingModelId;
  dimensions?: 1536;
  inputType?: EmbedTextInputType;
};

type TitanEmbedResponse = {
  embedding: number[];
  inputTextTokenCount?: number;
};

type CohereEmbedResponse = {
  embeddings?: {
    float?: number[][];
    int8?: number[][];
    uint8?: number[][];
    binary?: string[];
    ubinary?: string[];
  };
};

export const DEFAULT_EMBEDDING_MODEL_ID = "cohere.embed-v4:0" as const;
export const DEFAULT_EMBEDDING_DIMENSIONS = 1536 as const;
export const SUPPORTED_EMBEDDING_MODEL_IDS = [
  DEFAULT_EMBEDDING_MODEL_ID,
  "amazon.titan-embed-text-v1",
] as const;

const region = process.env.AWS_REGION || "us-east-1";
let client: BedrockRuntimeClient | null = null;

function getBedrockClient(): BedrockRuntimeClient {
  if (!process.env.AWS_BEARER_TOKEN_BEDROCK) {
    throw new Error("Missing AWS_BEARER_TOKEN_BEDROCK");
  }

  if (!client) {
    client = new BedrockRuntimeClient({ region });
  }

  return client;
}

function assertNonEmptyText(text: string): string {
  const clean = text.trim();
  if (!clean) {
    throw new Error("Embedding input must be a non-empty string");
  }
  return clean;
}

function decodeJsonBody(body: Uint8Array): unknown {
  return JSON.parse(new TextDecoder().decode(body));
}

function buildTitanRequest(text: string): string {
  return JSON.stringify({
    inputText: text,
  });
}

function buildCohereEmbedV4Request(
  text: string,
  dimensions: 1536,
  inputType: EmbedTextInputType,
): string {
  return JSON.stringify({
    texts: [text],
    input_type: inputType,
    embedding_types: ["float"],
    output_dimension: dimensions,
  });
}
function extractTitanEmbedding(payload: unknown): number[] {
  const data = payload as TitanEmbedResponse;
  if (!Array.isArray(data.embedding) || data.embedding.length === 0) {
    throw new Error("Titan response did not contain an embedding");
  }
  return data.embedding;
}

function extractCohereEmbedding(payload: unknown): number[] {
  const data = payload as CohereEmbedResponse;
  const embedding = data.embeddings?.float?.[0];
  if (!Array.isArray(embedding) || embedding.length === 0) {
    throw new Error("Cohere response did not contain a float embedding");
  }
  return embedding;
}

export function resolveEmbeddingModelId(
  options: EmbedTextOptions = {},
): EmbeddingModelId {
  return (
    options.modelId ||
    process.env.BEDROCK_EMBEDDING_MODEL_ID ||
    DEFAULT_EMBEDDING_MODEL_ID
  );
}

export async function embedTextBedrock(
  text: string,
  options: EmbedTextOptions = {},
): Promise<number[]> {
  const clean = assertNonEmptyText(text);
  const modelId = resolveEmbeddingModelId(options);
  const dimensions = options.dimensions ?? DEFAULT_EMBEDDING_DIMENSIONS;
  const inputType = options.inputType ?? "search_document";

  let body: string;
  if (modelId.startsWith("cohere.embed-v4")) {
    body = buildCohereEmbedV4Request(clean, dimensions, inputType);
  } else if (modelId.startsWith("amazon.titan-embed-text-v1")) {
    body = buildTitanRequest(clean);
  } else {
    throw new Error(`Unsupported embedding model: ${modelId}`);
  }

  const command = new InvokeModelCommand({
    modelId,
    contentType: "application/json",
    accept: "application/json",
    body,
  });

  const response = await getBedrockClient().send(command);
  const payload = decodeJsonBody(response.body);
  const embedding = modelId.startsWith("cohere.embed-v4")
    ? extractCohereEmbedding(payload)
    : extractTitanEmbedding(payload);

  if (embedding.length !== DEFAULT_EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Expected ${DEFAULT_EMBEDDING_DIMENSIONS} dimensions, got ${embedding.length} from model ${modelId}`,
    );
  }

  return embedding;
}
