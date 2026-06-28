import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import bcrypt from "bcryptjs";

const http = httpRouter();

// Регистрация пользователя
http.route({
  path: "/auth/register",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const { login, password, ip } = await request.json();

      if (!login || !password) {
        return new Response(JSON.stringify({ message: "Заполните логин и пароль" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Проверка: логин занят
      const existingByLogin = await ctx.runQuery(api.auth.getCurrentUser, { 
        userId: "check" as any 
      });

      // Вызов mutation регистрации
      const userId = await ctx.runMutation(api.auth.register, { login, password, ip });

      return new Response(JSON.stringify({ success: true, userId }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ message: err.message || "Ошибка регистрации" }), {
        status: err.message?.includes("уже существует") ? 400 : 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

// Логин пользователя
http.route({
  path: "/auth/login",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const { login, password } = await request.json();

      if (!login || !password) {
        return new Response(JSON.stringify({ message: "Заполните логин и пароль" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const result = await ctx.runMutation(api.auth.login, { login, password });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ message: err.message || "Ошибка входа" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

// Получение пользователя
http.route({
  path: "/auth/me",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const { userId } = await request.json();
      const user = await ctx.runQuery(api.auth.getCurrentUser, { userId });
      
      if (!user) {
        return new Response(JSON.stringify({ message: "Пользователь не найден" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(user), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ message: err.message || "Ошибка" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

export default http;
