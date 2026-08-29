import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppFrame } from "@/components/AppFrame";
import { ClerkGate } from "@/components/ClerkGate";
import { ConvexClientProvider } from "./ConvexClientProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "aguaSOS",
    template: "%s · aguaSOS",
  },
  description:
    "Reporta la escasez de agua y encuentra las fuentes de suministro más cercanas.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://tiles.openfreemap.org" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://tiles.openfreemap.org" />
      </head>
      <body className="h-full bg-background font-sans text-foreground">
        <ClerkGate>
          <ConvexClientProvider>
            <AppFrame>{children}</AppFrame>
          </ConvexClientProvider>
        </ClerkGate>
      </body>
    </html>
  );
}
