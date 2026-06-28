import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Создание анализа раздачи
export const create = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const analysisId = await ctx.db.insert("analyses", {
      sessionId: args.sessionId,
      userId: args.userId,
      hole: args.hole,
      board: args.board,
      equity: args.equity,
      combo: args.combo,
      action: args.action,
      actionClass: args.actionClass,
      pot: args.pot,
      outcome: args.outcome,
      createdAt: Date.now(),
    });

    // Увеличиваем счётчик анализов за сегодня
    const user = await ctx.db.get(args.userId);
    if (user) {
      await ctx.db.patch(args.userId, {
        analysesToday: user.analysesToday + 1,
      });
    }

    return analysisId;
  },
});

// Удаление анализа
export const delete = mutation({
  args: { analysisId: v.id("analyses") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.analysisId);
    return { success: true };
  },
});

// Получение анализов сессии
export const getBySession = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const analyses = await ctx.db
      .query("analyses")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    return analyses;
  },
});

// Получение анализов пользователя
export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const analyses = await ctx.db
      .query("analyses")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return analyses;
  },
});
