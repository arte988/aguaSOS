"use client";

import { useAuth } from "@clerk/nextjs";
import { ConvexProvider, ConvexReactClient, useMutation } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useEffect, type ReactNode } from "react";
import { api } from "../../convex/_generated/api";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;
const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

function SincronizarUsuario() {
  const { isSignedIn } = useAuth();
  const sincronizar = useMutation(api.usuarios.sincronizar);

  useEffect(() => {
    if (!isSignedIn) {
      return;
    }
    void sincronizar();
  }, [isSignedIn, sincronizar]);

  return null;
}

function ConvexConClerk({
  client,
  children,
}: {
  client: ConvexReactClient;
  children: ReactNode;
}) {
  return (
    <ConvexProviderWithClerk client={client} useAuth={useAuth}>
      <SincronizarUsuario />
      {children}
    </ConvexProviderWithClerk>
  );
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!convex) {
    return children;
  }

  if (clerkEnabled) {
    return <ConvexConClerk client={convex}>{children}</ConvexConClerk>;
  }

  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}

export function isConvexConfigured(): boolean {
  return convex !== null;
}
