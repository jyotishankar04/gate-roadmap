"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { AuthState } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function AuthForm({
  mode,
  action,
}: {
  mode: "login" | "register";
  action: (state: AuthState, formData: FormData) => Promise<AuthState>;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const isLogin = mode === "login";

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{isLogin ? "Login" : "Create account"}</CardTitle>
        <CardDescription>{isLogin ? "Continue your GATE CSE plan." : "Start tracking your preparation with GateTrack."}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <FieldGroup>
          <Field>
            <FieldLabel htmlFor="username">Username</FieldLabel>
            <Input id="username" name="username" autoComplete="username" required minLength={3} />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input id="password" name="password" type="password" autoComplete={isLogin ? "current-password" : "new-password"} required minLength={6} />
          </Field>
          {state.error ? <FieldError>{state.error}</FieldError> : null}
          <Button type="submit" disabled={pending}>
            {isLogin ? "Login" : "Register"}
          </Button>
          </FieldGroup>
          <p className="text-center text-sm text-muted-foreground">
            {isLogin ? "New here?" : "Already have an account?"}{" "}
            <Link className="font-semibold text-primary" href={isLogin ? "/register" : "/login"}>
              {isLogin ? "Register" : "Login"}
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
