import { Request, Response, NextFunction } from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";

const JWKS_URL = `${process.env.CLIENT_URL || "http://localhost:3000"}/api/auth/jwks`;

const jwks = createRemoteJWKSet(new URL(JWKS_URL));

export interface AuthPayload {
  sub: string;
  role: string;
  name: string;
  email: string;
  image?: string | null;
  aud: string;
  [key: string]: unknown;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer: process.env.BETTER_AUTH_URL || "http://localhost:3000",
      audience: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    });

    req.user = payload as unknown as AuthPayload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}
