declare module "convex/browser" {
  export class ConvexHttpClient {
    constructor(deploymentUrl: string);
    mutation(name: string, args: Record<string, unknown>): Promise<unknown>;
    query(name: string, args: Record<string, unknown>): Promise<unknown>;
  }
}
