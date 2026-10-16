"use client";

import { useState, type FormEvent } from "react";

type Message = {
  role: "user" | "assistant";
  text: string;
};

export default function Home() {
  const [weight, setWeight] = useState("85");
  const [height, setHeight] = useState("175");
  const [goal, setGoal] = useState("75");
  const [result, setResult] = useState("");

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "أهلًا فيك! 👋 أنا مدرب FitAI. اسألني عن التغذية أو التمارين أو العادات الصحية، ورح أساعدك قدر الإمكان.",
    },
  ]);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatError, setChatError] = useState("");

  function calculate() {
    const w = Number(weight);
    const h = Number(height);
    const g = Number(goal);

    if (!weight || !height || !goal || w < 35 || h < 120 || g < 30) {
      setResult("تأكد من إدخال بيانات صحيحة.");
      return;
    }

    const bmi = w / (h / 100) ** 2;

    setResult(
      `مؤشر كتلة جسمك التقديري ${bmi.toFixed(1)}، والفرق بين وزنك الحالي وهدفك ${Math.abs(w - g).toFixed(1)} كغ. هذه نتيجة أولية وليست تشخيصًا طبيًا.`
    );
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = message.trim();

    if (!text || loading) return;

    setChatError("");
    setMessage("");
    setMessages((previous) => [
      ...previous,
      { role: "user", text },
    ]);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
  message: text,
  history: messages.slice(1),
}),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "تعذّر الحصول على رد.");
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: data.reply || "ما قدرت أجهّز ردًا. جرّب مرة ثانية.",
        },
      ]);
    } catch {
      setChatError(
        "ما قدرنا نتصل بالمدرب الآن. تأكد من إعدادات الاتصال وحاول مرة ثانية."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main dir="rtl" className="min-h-screen bg-[#07110e] p-6 text-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between">
        <h1 className="text-3xl font-bold text-green-400">🌿 FitAI</h1>
        <span className="text-gray-400">مدربك الشخصي الذكي</span>
      </header>

      <section className="mx-auto mt-10 max-w-6xl rounded-3xl border border-green-900 bg-gradient-to-l from-green-950 to-[#101c17] p-8">
        <p className="mb-4 text-green-400">أهلًا بك في FitAI</p>

        <h2 className="text-4xl font-bold leading-relaxed">
          رحلتك الصحية،
          <br />
          تبدأ بخطوة 💚
        </h2>

        <p className="mt-4 leading-8 text-gray-300">
          تعرّف على مؤشرات جسمك، نظّم وجباتك، وابدأ ببناء عادات صحية تناسب حياتك.
        </p>

        <a
          href="/login"
          className="mt-6 inline-block rounded-xl bg-green-400 px-6 py-3 font-bold text-black"
        >
          ابدأ الآن ←
        </a>
      </section>

      <section
        id="calculator"
        className="mx-auto mt-8 grid max-w-6xl gap-6 md:grid-cols-2"
      >
        <div className="rounded-2xl border border-gray-800 bg-[#101c17] p-6">
          <h2 className="mb-3 text-2xl font-bold">📊 حاسبة الوزن</h2>

          <p className="mb-6 text-gray-400">
            أدخل بياناتك لتحصل على تقدير أولي لمؤشر كتلة الجسم.
          </p>

          <label className="mb-2 block">وزنك الحالي (كغ)</label>
          <input
            type="number"
            min="35"
            value={weight}
            onChange={(event) => setWeight(event.target.value)}
            className="mb-4 w-full rounded-xl border border-gray-700 bg-[#07110e] p-3 text-white"
          />

          <label className="mb-2 block">طولك (سم)</label>
          <input
            type="number"
            min="120"
            value={height}
            onChange={(event) => setHeight(event.target.value)}
            className="mb-4 w-full rounded-xl border border-gray-700 bg-[#07110e] p-3 text-white"
          />

          <label className="mb-2 block">وزنك المستهدف (كغ)</label>
          <input
            type="number"
            min="30"
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
            className="mb-5 w-full rounded-xl border border-gray-700 bg-[#07110e] p-3 text-white"
          />

          <button
            onClick={calculate}
            className="w-full rounded-xl bg-green-400 p-3 font-bold text-black"
          >
            احسب النتيجة
          </button>

          {result && (
            <p className="mt-5 rounded-xl bg-green-950 p-4 leading-8">
              {result}
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-gray-800 bg-[#101c17] p-6">
          <h2 className="mb-4 text-2xl font-bold">🤖 مدربك الذكي</h2>

          <div
            aria-live="polite"
            className="max-h-96 space-y-3 overflow-y-auto rounded-xl bg-[#07110e] p-4"
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
            <label htmlFor="chat-message" className="mb-2 block">
              اكتب سؤالك للمدرب
            </label>

            <textarea
              id="chat-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="مثلاً: اقترح لي أفكارًا لفطور صحي..."
              maxLength={2000}
              rows={3}
              disabled={loading}
              className="w-full resize-y rounded-xl border border-gray-700 bg-[#07110e] p-3 text-white placeholder:text-gray-500"
            />

            {chatError && (
              <p role="alert" className="mt-3 text-sm text-red-400">
                {chatError}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="mt-3 w-full rounded-xl bg-green-400 p-3 font-bold text-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "جاري الإرسال..." : "أرسل للمدرب ←"}
            </button>
          </form>

          <p className="mt-4 text-sm leading-7 text-gray-400">
            يقدم المدرب معلومات عامة عن الصحة واللياقة، ولا يغني عن استشارة مختص عند الحاجة.
          </p>
        </div>
      </section>

      <footer className="mt-12 pb-6 text-center text-gray-500">
        FitAI © 2026 — صحتك تستحق الاهتمام 💚
      </footer>
    </main>
  );
}