import "server-only";

import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

const COOKIE_NAME = "gatetrack_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    return "development-only-session-secret-change-me";
  }
  return secret;
}

function getSecretKey() {
  return new TextEncoder().encode(getSecret());
}

async function encodeSession(userId: string) {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());
}

async function decodeSession(token?: string) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, await encodeSession(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = await decodeSession(cookieStore.get(COOKIE_NAME)?.value);
  if (!userId) return null;

  try {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, createdAt: true, updatedAt: true },
    });
  } catch {
    return null;
  }
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function redirectIfAuthenticated() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
}
