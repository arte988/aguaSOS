import { SignUp } from "@clerk/nextjs";
import { isClerkConfigured } from "@/components/ClerkGate";
import { ClerkNoConfigurado } from "@/components/ClerkNoConfigurado";

export default function SignUpPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      {isClerkConfigured() ? <SignUp /> : <ClerkNoConfigurado accion="crear una cuenta" />}
    </div>
  );
}
