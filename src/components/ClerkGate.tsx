import { ClerkProvider } from "@clerk/nextjs";
import { type ReactNode } from "react";

export function isClerkConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
}

export function ClerkGate({ children }: { children: ReactNode }) {
  if (!isClerkConfigured()) {
    return children;
  }

  return <ClerkProvider>{children}</ClerkProvider>;
}
