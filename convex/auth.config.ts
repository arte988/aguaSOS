/**
 * Clerk JWT for Convex: add CLERK_JWT_ISSUER in the Convex dashboard
 * (issuer URL from a Clerk JWT template named `convex`) and switch
 * providers to [{ domain: process.env.CLERK_JWT_ISSUER, applicationID: "convex" }].
 * Do not invent a Clerk domain here — empty providers keep anonymous Convex working.
 */
const authConfig = {
  providers: [] as { domain: string; applicationID: string }[],
};

export default authConfig;
