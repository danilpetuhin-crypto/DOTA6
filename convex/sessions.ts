import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Создание сессии
export const create = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const sessionId = await ctx.db.insert("sessions", {
      userId: args.userId,
      name: args.name || "Текущая сессия",
      createdAt: Date.now(),
    });

    return sessionId;
  },
});

// Получение сессий пользователя
export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return sessions;
  },
});

// Получение сессии по ID
export const getById = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.sessionId);
  },
});
