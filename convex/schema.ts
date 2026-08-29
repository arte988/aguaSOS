import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  waterReports: defineTable({
    title: v.string(),
    description: v.string(),
    kind: v.union(
      v.literal("outage"),
      v.literal("contamination"),
      v.literal("leak"),
      v.literal("flood"),
      v.literal("other")
    ),
    status: v.union(
      v.literal("open"),
      v.literal("acknowledged"),
      v.literal("resolved")
    ),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_createdAt", ["createdAt"]),
});
