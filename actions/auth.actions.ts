"use server";

import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { authSchema } from "@/lib/validations";
import { clearSession, createSession, hashPassword, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";

export type AuthState = {
  error?: string;
};

export async function registerUser(_state: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = authSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid registration details" };
  }

  try {
    const user = await prisma.user.create({
      data: {
        username: parsed.data.username.toLowerCase(),
        passwordHash: await hashPassword(parsed.data.password),
      },
    });
    await createSession(user.id);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "Username is already taken" };
    }
    return { error: "Could not create account" };
  }

  redirect("/dashboard");
}

export async function loginUser(_state: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = authSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid login details" };
  }

  let user = null;
  try {
    user = await prisma.user.findUnique({
      where: { username: parsed.data.username.toLowerCase() },
    });
  } catch {
    return { error: "Database is unavailable right now" };
  }

  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return { error: "Invalid username or password" };
  }

  await createSession(user.id);
  redirect("/dashboard");
}

export async function logoutUser() {
  await clearSession();
  redirect("/login");
}
