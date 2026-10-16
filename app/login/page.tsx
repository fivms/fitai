"use client";

import { useState, type FormEvent } from "react";
import { supabase } from "../utils/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [resending, setResending] = useState(false);
  const [showResend, setShowResend] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setShowResend(false);
    setLoading(true);

    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

       if (data.session) {
  setMessage("تم إنشاء حسابك بنجاح! يمكنك الآن استخدام FitAI.");
} else {
  setMessage(
    "تم إنشاء الحساب أو قد يكون موجودًا مسبقًا. إذا كان تأكيد البريد مطلوبًا، افحص بريدك الإلكتروني."
  );
  setShowResend(true);
}
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        window.location.href = "/";
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "حدث خطأ. حاول مرة ثانية."
      );
    } finally {
      setLoading(false);
    }
  }

    async function handleResendConfirmation() {
    if (!email.trim()) {
      setMessage("اكتب بريدك الإلكتروني أولًا.");
      return;
    }

    setResending(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
        options: {
          emailRedirectTo: "https://vocal-douhua-75a75e.netlify.app",
        },
      });

      if (error) throw error;

      setMessage("تم طلب إعادة إرسال رسالة التحقق. تفقد بريدك الإلكتروني.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "تعذرت إعادة إرسال الرسالة. حاول مرة أخرى."
      );
    } finally {
      setResending(false);
    }
  }
  return (
    <main
      dir="rtl"
      className="flex min-h-screen items-center justify-center bg-[#07110e] p-6 text-white"
    >
      <section className="w-full max-w-md rounded-3xl border border-green-900 bg-[#101c17] p-8">
        <h1 className="mb-2 text-center text-3xl font-bold text-green-400">
          🌿 FitAI
        </h1>

        <h2 className="mb-2 text-center text-2xl font-bold">
  {isSignup ? "إنشاء حساب جديد" :  "أهلًا بك 💚"}
</h2>

        <p className="mb-6 text-center text-gray-400">
  {isSignup
    ? "أنشئ حسابك وابدأ رحلتك الصحية معنا."
    : "سجّل دخولك لمتابعة رحلتك الصحية."}
</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-2 block">
              البريد الإلكتروني
            </label>

            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-gray-700 bg-[#07110e] p-3"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block">
              كلمة المرور
            </label>

            <input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete={isSignup ? "new-password" : "current-password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-gray-700 bg-[#07110e] p-3"
              placeholder="8 أحرف على الأقل"
            />
          </div>

          {message && (
            <p role="status" className="break-words text-sm leading-7 text-green-300">
              {message}
            </p>
          )}

          {isSignup && showResend && (
  <button
    type="button"
    onClick={handleResendConfirmation}
    disabled={resending}
    className="w-full rounded-xl border border-green-700 p-3 text-green-300 disabled:opacity-50"
  >
    {resending
      ? "جارٍ إرسال الرسالة..."
      : "إعادة إرسال رسالة التحقق"}
  </button>
)}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-green-400 p-3 font-bold text-black disabled:opacity-50"
          >
            {loading
              ? "يرجى الانتظار..."
              : isSignup
                ? "إنشاء الحساب"
                : "تسجيل الدخول"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setIsSignup(!isSignup);
            setMessage("");
          }}
          className="mt-5 w-full text-green-400"
        >
          {isSignup
            ? "عندك حساب؟ سجّل دخولك"
            : "ما عندك حساب؟ أنشئ حسابًا جديدًا"}
        </button>

        <a
          href="/"
          className="mt-6 block text-center text-sm text-gray-400"
        >
          العودة إلى الصفحة الرئيسية
        </a>
      </section>
    </main>
  );
}