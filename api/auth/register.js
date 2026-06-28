// Convex HTTP endpoint для регистрации
export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ message: "Метод не разрешён" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { login, password } = await req.json();
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (!login || !password) {
      return new Response(JSON.stringify({ message: "Заполните логин и пароль" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Convex URL из переменных окружения
    const convexUrl = process.env.CONVEX_URL;

    if (!convexUrl) {
      return new Response(JSON.stringify({ message: "Convex не настроен" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Вызов Convex функции регистрации
    const response = await fetch(`${convexUrl}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ login, password, ip }),
    });

    if (!response.ok) {
      const error = await response.json();
      return new Response(JSON.stringify({ message: error.message || "Ошибка регистрации" }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const result = await response.json();

    return new Response(JSON.stringify({
      success: true,
      userId: result,
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Ошибка регистрации:", err);
    return new Response(JSON.stringify({ message: "Ошибка сервера" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
