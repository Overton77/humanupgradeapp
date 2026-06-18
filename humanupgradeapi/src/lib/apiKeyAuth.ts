import { timingSafeEqual } from "node:crypto";
import type express from "express";

export const isProduction =
  process.env.NODE_ENV === "production" || !!process.env.VERCEL;

export const productionApiKey = isProduction
  ? process.env.PRODUCTION_API_KEY?.trim()
  : undefined;

export function assertProductionApiKeyConfigured() {
  if (isProduction && !productionApiKey) {
    throw new Error(
      "Missing PRODUCTION_API_KEY in production. Refusing to start an unprotected API.",
    );
  }
}

export function getRequestApiKey(req: express.Request) {
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

export function hasMatchingApiKey(
  expectedApiKey: string,
  providedApiKey?: string,
) {
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

export function requireProductionApiKey(
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
