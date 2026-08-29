import { SignIn } from "@clerk/nextjs";
import { isClerkConfigured } from "@/components/ClerkGate";
import { ClerkNoConfigurado } from "@/components/ClerkNoConfigurado";

export default function SignInPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      {isClerkConfigured() ? <SignIn /> : <ClerkNoConfigurado accion="iniciar sesión" />}
    </div>
  );
}
