import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    login: v.string(),
    password: v.string(),
    ip: v.optional(v.string()),
    subscription: v.string(),
    analysesToday: v.number(),
    subExpires: v.optional(v.number()),
    licenseKey: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_login", ["login"])
    .index("by_ip", ["ip"]),

  sessions: defineTable({
    userId: v.id("users"),
    name: v.string(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"]),

  analyses: defineTable({
    sessionId: v.id("sessions"),
    userId: v.id("users"),
    hole: v.string(),
    board: v.optional(v.string()),
    equity: v.optional(v.number()),
    combo: v.optional(v.string()),
    action: v.string(),
    actionClass: v.string(),
    pot: v.optional(v.number()),
    outcome: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_user", ["userId"]),
});
