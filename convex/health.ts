import { query } from "./_generated/server";
import { v } from "convex/values";

export const ping = query({
  args: {},
  returns: v.object({
    ok: v.boolean(),
    app: v.string(),
    backend: v.string(),
  }),
  handler: async () => {
    return {
      ok: true,
      app: "Contra Corriente",
      backend: "convex",
    };
  },
});
