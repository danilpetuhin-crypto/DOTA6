// Convex HTTP endpoint для получения пользователя
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
    const { userId } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ message: "Требуется userId" }), {
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

    // Вызов Convex функции получения пользователя
    const response = await fetch(`${convexUrl}/auth/me`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const error = await response.json();
      return new Response(JSON.stringify({ message: error.message || "Ошибка" }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const result = await response.json();

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Ошибка получения пользователя:", err);
    return new Response(JSON.stringify({ message: "Ошибка сервера" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

