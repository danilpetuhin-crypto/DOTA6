import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import bcrypt from "bcryptjs";

// Регистрация пользователя
export const register = mutation({
  args: {
    login: v.string(),
    password: v.string(),
    ip: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Проверка: логин занят
    const existingByLogin = await ctx.db
      .query("users")
      .withIndex("by_login", (q) => q.eq("login", args.login))
      .first();

    if (existingByLogin) {
      throw new Error("Пользователь с таким логином уже существует");
    }

    // Проверка: 1 IP = 1 аккаунт
    if (args.ip) {
      const existingByIP = await ctx.db
        .query("users")
        .withIndex("by_ip", (q) => q.eq("ip", args.ip))
        .first();

      if (existingByIP) {
        throw new Error("С этого устройства уже зарегистрирован аккаунт");
      }
    }

    // Хэширование пароля
    const hashedPassword = await bcrypt.hash(args.password, 10);

    // Создание пользователя
    const userId = await ctx.db.insert("users", {
      login: args.login,
      password: hashedPassword,
      ip: args.ip,
      subscription: "free",
      analysesToday: 0,
      createdAt: Date.now(),
    });

    return userId;
  },
});

// Логин пользователя
export const login = mutation({
  args: {
    login: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_login", (q) => q.eq("login", args.login))
      .first();

    if (!user) {
      throw new Error("Неверный логин или пароль");
    }

    const isValid = await bcrypt.compare(args.password, user.password);

    if (!isValid) {
      throw new Error("Неверный логин или пароль");
    }

    return {
      userId: user._id,
      login: user.login,
      subscription: user.subscription,
      analysesToday: user.analysesToday,
    };
  },
});

// Получение текущего пользователя
export const getCurrentUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) {
      return null;
    }

    return {
      id: user._id,
      login: user.login,
      subscription: user.subscription,
      analysesToday: user.analysesToday,
      subExpires: user.subExpires,
      licenseKey: user.licenseKey,
    };
  },
});
