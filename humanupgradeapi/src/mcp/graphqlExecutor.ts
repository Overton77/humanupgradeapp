import { readFileSync } from "node:fs";
import { ApolloServer } from "@apollo/server";
import { resolvers } from "../graphql/resolvers/index.js";
import { createContext, type GraphQLContext } from "../lib/context.js";

const typeDefs = readFileSync(
  new URL("../graphql/schema.graphql", import.meta.url),
  "utf8",
);

const mcpGraphqlServer = new ApolloServer<GraphQLContext>({
  typeDefs,
  resolvers,
  introspection: false,
});

let started: Promise<void> | undefined;

function ensureStarted() {
  started ??= mcpGraphqlServer.start();
  return started;
}

export async function executeMcpGraphql<TData = Record<string, unknown>>(
  query: string,
  variables: Record<string, unknown>,
): Promise<TData> {
  await ensureStarted();

  const response = await mcpGraphqlServer.executeOperation<TData>(
    { query, variables },
    { contextValue: await createContext({} as never) },
  );

  if (response.body.kind !== "single") {
    throw new Error("MCP GraphQL executor does not support incremental results.");
  }

  const result = response.body.singleResult;

  if (result.errors?.length) {
    throw new Error(
      result.errors
        .map((error) => error.message)
        .join("; "),
    );
  }

  if (!result.data) {
    throw new Error("MCP GraphQL executor returned no data.");
  }

  return result.data;
}
