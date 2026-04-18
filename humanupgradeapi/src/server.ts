import "dotenv/config";
import { timingSafeEqual } from "node:crypto";
import { readFileSync } from "node:fs";
import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { ApolloServerPluginLandingPageDisabled } from "@apollo/server/plugin/disabled";
import { expressMiddleware } from "@as-integrations/express5";
import { resolvers } from "./graphql/resolvers/index.js";
import { createContext } from "./lib/context.js";
import { prisma } from "./lib/prisma.js";

const typeDefs = readFileSync(
  new URL("./graphql/schema.graphql", import.meta.url),
  "utf8",
);

const isProduction =
  process.env.NODE_ENV === "production" || !!process.env.VERCEL;
const productionApiKey = isProduction
  ? process.env.PRODUCTION_API_KEY?.trim()
  : undefined;

if (isProduction && !productionApiKey) {
  throw new Error(
    "Missing PRODUCTION_API_KEY in production. Refusing to start an unprotected API.",
  );
}

const app: express.Express = express();

function getRequestApiKey(req: express.Request) {
  const headerApiKey = req.header("x-api-key")?.trim();

  if (headerApiKey) {
    return headerApiKey;
  }

  const authorizationHeader = req.header("authorization")?.trim();

  if (!authorizationHeader) {
    return undefined;
  }

  const [scheme, token] = authorizationHeader.split(/\s+/, 2);

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return undefined;
  }

  return token.trim();
}

function hasMatchingApiKey(expectedApiKey: string, providedApiKey?: string) {
  if (!providedApiKey) {
    return false;
  }

  const expectedBuffer = Buffer.from(expectedApiKey);
  const providedBuffer = Buffer.from(providedApiKey);

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, providedBuffer);
}

function requireProductionApiKey(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  if (!isProduction || !productionApiKey) {
    next();
    return;
  }

  const providedApiKey = getRequestApiKey(req);

  if (hasMatchingApiKey(productionApiKey, providedApiKey)) {
    next();
    return;
  }

  res.status(401).json({ error: "Unauthorized" });
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: !isProduction,
  plugins: [
    isProduction
      ? ApolloServerPluginLandingPageDisabled()
      : ApolloServerPluginLandingPageLocalDefault({
          embed: true,
          footer: false,
        }),
  ],
});

await server.start();

if (!isProduction) {
  app.use(cors());
}

app.use(express.json());

const paths = isProduction ? ["/api/graphql"] : ["/api/graphql", "/graphql"];

for (const path of paths) {
  app.use(
    path,
    requireProductionApiKey,
    expressMiddleware(server, { context: createContext }),
  );
}

app.get("/api/health", requireProductionApiKey, (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

let httpServer: ReturnType<typeof app.listen> | null = null;
let shuttingDown = false;

async function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log(`${signal} received. Shutting down gracefully...`);

  try {
    if (httpServer) {
      await new Promise<void>((resolve, reject) => {
        httpServer!.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    await server.stop();
    await prisma.$disconnect();

    console.log("Shutdown complete.");
    process.exit(0);
  } catch (error) {
    console.error("Shutdown error:", error);
    process.exit(1);
  }
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

if (!isProduction) {
  const PORT = Number(process.env.PORT ?? 4000);

  httpServer = app.listen(PORT, () => {
    console.log(`Apollo Sandbox:  http://localhost:${PORT}/graphql`);
    console.log(`GraphQL API:     http://localhost:${PORT}/api/graphql`);
    console.log(`Health check:    http://localhost:${PORT}/api/health`);
  });
}

export default app;
