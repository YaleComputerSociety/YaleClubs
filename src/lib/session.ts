import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import type { AuthUser } from "@/lib/authUser";

interface DecodedToken {
  netid: string;
  email: string;
  role?: string;
  iat: number;
  exp: number;
}

function isValidDecodedToken(decoded: unknown): decoded is DecodedToken {
  if (typeof decoded !== "object" || decoded === null) return false;
  const token = decoded as Record<string, unknown>;
  return (
    typeof token.netid === "string" &&
    typeof token.email === "string" &&
    (token.role === undefined || typeof token.role === "string") &&
    typeof token.iat === "number" &&
    typeof token.exp === "number"
  );
}

/** Reads the httpOnly session cookie. Returns null when the request is signed out or the token is invalid. */
export async function getSessionUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  const secret = process.env.JWT_SECRET;
  if (!token?.value || !secret) return null;

  try {
    const decoded = jwt.verify(token.value, secret);
    if (!isValidDecodedToken(decoded)) return null;
    return {
      netid: decoded.netid,
      email: decoded.email,
      role: decoded.role || "user",
    };
  } catch {
    return null;
  }
}
