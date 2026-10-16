"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../utils/supabase";

type Message = {
  role: "user" | "assistant";
  text: string;
};

export default function CoachPage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "أهلًا بك في مدرب FitAI 💚 اسألني عن التغذية والتمارين والعادات الصحية.",
    },
  ]);

  useEffect(() => {
    async function checkUser() {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        router.replace("/login");
        return;
      }

      const completed =
        data.user.user_metadata?.profile_completed === true;

      if (!completed) {
        router.replace("/profile");
        return;
      }

      setEmail(data.user.email ?? "");
      setChecking(false);
    }

    void checkUser();
  }, [router]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  const text = message.trim();

  if (!text || loading) return;

  setErrorMessage("");
  setMessage("");
  setMessages((previous) => [
    ...previous,
    { role: "user", text },
  ]);
  setLoading(true);

  try {
    // التحقق من جلسة المستخدم
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      router.replace("/login");
      return;
    }

    // إرسال السؤال مع رمز الجلسة إلى الخادم
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        message: text,
        history: messages.slice(1).slice(-12),
      }),
    });

    const data = await response.json();

    if (response.status === 401) {
      router.replace("/login");
      return;
    }

    if (response.status === 403) {
      router.replace("/profile");
      return;
    }

    if (!response.ok) {
      throw new Error(data.error || "تعذّر الحصول على رد.");
    }

    setMessages((previous) => [
      ...previous,
      {
        role: "assistant",
        text: data.reply || "جرّب إرسال سؤالك مرة أخرى.",
      },
    ]);
  } catch {
    setErrorMessage("تعذّر الاتصال بالمدرب. حاول مرة أخرى.");
  } finally {
    setLoading(false);
  }
}

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (checking) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#07110e] text-green-400"
      >
        جارٍ التحقق من حسابك... 💚
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#07110e] p-5 text-white sm:p-8"
    >
      <header className="mx-auto flex max-w-4xl items-center justify-between gap-3">
        <a href="/dashboard" className="text-2xl font-bold text-green-400">
          🌿 FitAI
        </a>

        <button
          onClick={() => router.push("/dashboard")}
          className="rounded-xl border border-gray-700 px-4 py-2"
        >
          لوحة التحكم
        </button>
      </header>

      <section className="mx-auto mt-8 max-w-4xl">
        <div className="rounded-3xl border border-green-900 bg-[#101c17] p-6 sm:p-8">
          <p className="text-sm text-green-400">مدربك الشخصي الذكي</p>

          <h1 className="mt-2 text-3xl font-bold">
            أهلًا بك في مدرب FitAI 🤖
          </h1>

          <p className="mt-3 break-all text-sm text-gray-400">
            {email}
          </p>

          <p className="mt-4 leading-8 text-gray-300">
            اسأل عن الوجبات الصحية والتمارين وتنظيم العادات،
            واحصل على إرشادات عامة تناسب أهدافك.
          </p>
        </div>

        <div className="mt-6 rounded-3xl border border-gray-800 bg-[#101c17] p-5 sm:p-6">
          <div
            aria-live="polite"
            className="max-h-[55vh] min-h-64 space-y-3 overflow-y-auto rounded-2xl bg-[#07110e] p-4"
          >
            {messages.map((item, index) => (
              <div
                key={index}
                className={`rounded-xl p-4 leading-7 ${
                  item.role === "assistant"
                    ? "bg-green-950"
                    : "bg-gray-800"
                }`}
              >
                <p className="mb-1 text-xs text-green-300">
                  {item.role === "assistant" ? "🤖 مدرب FitAI" : "أنت"}
                </p>

                <p className="whitespace-pre-wrap">
                  {item.text.replace(/\*\*/g, "")}
                </p>
              </div>
            ))}

            {loading && (
              <p className="rounded-xl bg-green-950 p-4 text-gray-300">
                المدرب يجهّز الرد... 💭
              </p>
            )}
          </div>

          <form onSubmit={sendMessage} className="mt-4">
            <label htmlFor="coach-message" className="mb-2 block">
              اكتب سؤالك للمدرب
            </label>

            <textarea
              id="coach-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="مثلاً: اقترح لي وجبة فطور صحية..."
              maxLength={2000}
              rows={3}
              disabled={loading}
              className="w-full rounded-xl border border-gray-700 bg-[#07110e] p-3 text-white placeholder:text-gray-500"
            />

            {errorMessage && (
              <p role="alert" className="mt-3 text-sm text-red-400">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="mt-3 w-full rounded-xl bg-green-400 p-3 font-bold text-black disabled:opacity-50"
            >
              {loading ? "جاري الإرسال..." : "أرسل للمدرب ←"}
            </button>
          </form>

          <button
            onClick={logout}
            className="mt-4 text-sm text-gray-400 hover:text-red-400"
          >
            تسجيل الخروج
          </button>
        </div>
      </section>
    </main>
  );
}