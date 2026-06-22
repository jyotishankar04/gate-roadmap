import { registerUser } from "@/actions/auth.actions";
import { AuthForm } from "@/components/auth/auth-form";
import { redirectIfAuthenticated } from "@/lib/auth";

export default async function RegisterPage() {
  await redirectIfAuthenticated();
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <AuthForm mode="register" action={registerUser} />
    </main>
  );
}
