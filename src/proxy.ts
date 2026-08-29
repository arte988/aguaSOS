import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default clerkEnabled
  ? clerkMiddleware()
  : function passthrough(_request: NextRequest) {
      return NextResponse.next();
    };

export const config = {
  matcher: [
    "/((?!_next|maplibre/|[^?]*\\.(?:html?|css|js(?!on)|mjs|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
