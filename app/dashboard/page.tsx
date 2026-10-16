"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../utils/supabase";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [newWeight, setNewWeight] = useState("");
const [targetWeight, setTargetWeight] = useState("");
const [savingWeight, setSavingWeight] = useState(false);
const [weightMessage, setWeightMessage] = useState("");
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<{
  age: number;
  weight: number;
  height: number;
  goal: string;
  activity: string;
} | null>(null);

  useEffect(() => {
    async function checkUser() {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        router.replace("/login");
        return;
      }

      setEmail(data.user.email ?? "");

const metadata = data.user.user_metadata;

if (metadata?.profile_completed === true) {
  setProfile({
    age: Number(metadata.age),
    weight: Number(metadata.weight),
    height: Number(metadata.height),
    goal: String(metadata.goal ?? "maintain"),
    activity: String(metadata.activity ?? "moderate"),
  });
}

setLoading(false);
    }

    checkUser();
  }, [router]);
async function handleSaveWeight() {
  const weight = Number(newWeight);
  const target = Number(targetWeight);

  if (!Number.isFinite(weight) || weight < 25 || weight > 350) {
    setWeightMessage("أدخل وزنًا حاليًا صحيحًا بين 25 و350 كغ.");
    return;
  }

  if (!Number.isFinite(target) || target < 25 || target > 350) {
    setWeightMessage("أدخل وزنًا مستهدفًا صحيحًا بين 25 و350 كغ.");
    return;
  }

  setSavingWeight(true);
  setWeightMessage("");

  const { data, error } = await supabase.auth.updateUser({
    data: {
      weight,
      target_weight: target,
    },
  });

  setSavingWeight(false);

  if (error) {
    setWeightMessage("تعذّر حفظ البيانات. حاول مرة أخرى.");
    return;
  }

  setProfile((previous) =>
    previous ? { ...previous, weight } : previous
  );

  setNewWeight("");
  setTargetWeight("");
  setWeightMessage("تم تحديث وزنك الحالي والوزن المستهدف بنجاح! 💚");
}
  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (loading) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#07110e] text-green-400"
      >
        جارٍ تجهيز لوحة التحكم...
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#07110e] px-5 py-8 text-white sm:px-10"
    >
      <header className="mx-auto flex max-w-6xl items-center justify-between border-b border-green-900/60 pb-6">
        <h1 className="text-2xl font-bold text-green-400">
          🌿 FitAI
        </h1>

        <button
          onClick={handleLogout}
          className="rounded-xl border border-green-800 px-4 py-2 text-sm text-green-300 transition hover:bg-green-950"
        >
          تسجيل الخروج
        </button>
      </header>

      <section className="mx-auto max-w-6xl py-10">
        <p className="mb-3 text-sm text-green-400">
          مساحة FitAI الشخصية
        </p>

        <h2 className="text-3xl font-bold sm:text-4xl">
          أهلًا بك في رحلتك الصحية 💚
        </h2>

        <p className="mt-3 break-all text-gray-400">
          {email}
        </p>
        {profile && (
  <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
    <div className="rounded-2xl border border-gray-800 bg-[#101c17] p-5">
      <p className="text-sm text-gray-400">الوزن الحالي</p>
      <p className="mt-2 text-2xl font-bold text-green-400">
        {profile.weight} <span className="text-sm">كغ</span>
      </p>
    </div>

    <div className="rounded-2xl border border-gray-800 bg-[#101c17] p-5">
      <p className="text-sm text-gray-400">الطول</p>
      <p className="mt-2 text-2xl font-bold text-green-400">
        {profile.height} <span className="text-sm">سم</span>
      </p>
    </div>

    <div className="rounded-2xl border border-gray-800 bg-[#101c17] p-5">
      <p className="text-sm text-gray-400">العمر</p>
      <p className="mt-2 text-2xl font-bold text-green-400">
        {profile.age} <span className="text-sm">سنة</span>
      </p>
    </div>

    <div className="rounded-2xl border border-gray-800 bg-[#101c17] p-5">
      <p className="text-sm text-gray-400">مؤشر كتلة الجسم</p>
      <p className="mt-2 text-2xl font-bold text-green-400">
        {(profile.weight / (profile.height / 100) ** 2).toFixed(1)}
      </p>
    </div>
  </div>
)}
<div className="mt-6 rounded-2xl border border-green-900 bg-[#101c17] p-6">
  <h3 className="text-xl font-bold text-green-400">
    ⚖️ تحديث بيانات الوزن
  </h3>

  <p className="mt-2 text-sm text-gray-400">
    حدّث وزنك الحالي وحدد الوزن الذي تريد الوصول إليه.
  </p>

  <form
    onSubmit={(e) => {
      e.preventDefault();
      handleSaveWeight();
    }}
    className="mt-5 grid gap-4 sm:grid-cols-2"
  >
    <div>
      <label className="mb-2 block text-sm text-gray-300">
        الوزن الحالي (كغ)
      </label>

      <input
        type="number"
        min="25"
        max="350"
        step="0.1"
        value={newWeight}
        onChange={(e) => setNewWeight(e.target.value)}
        placeholder={`وزنك الحالي: ${profile?.weight ?? ""}`}
        required
        className="w-full rounded-xl border border-gray-700 bg-[#07110e] p-3 text-white outline-none focus:border-green-500"
      />
    </div>

    <div>
      <label className="mb-2 block text-sm text-gray-300">
        الوزن المستهدف (كغ)
      </label>

      <input
        type="number"
        min="25"
        max="350"
        step="0.1"
        value={targetWeight}
        onChange={(e) => setTargetWeight(e.target.value)}
        placeholder="مثال: 75"
        required
        className="w-full rounded-xl border border-gray-700 bg-[#07110e] p-3 text-white outline-none focus:border-green-500"
      />
    </div>

    <button
      type="submit"
      disabled={savingWeight}
      className="rounded-xl bg-green-500 px-5 py-3 font-bold text-[#07110e] transition hover:bg-green-400 disabled:opacity-50 sm:col-span-2"
    >
      {savingWeight ? "جارٍ الحفظ..." : "حفظ التغييرات"}
    </button>

    {weightMessage && (
      <p className="text-sm text-green-400 sm:col-span-2">
        {weightMessage}
      </p>
    )}
  </form>
</div>

        <div className="mt-10 rounded-3xl border border-green-900 bg-gradient-to-l from-[#10291d] to-[#101c17] p-7 sm:p-10">
          <p className="mb-3 text-sm text-green-300">
            رحلتك الصحية تبدأ بخطوة
          </p>

          <h3 className="text-2xl font-bold sm:text-3xl">
            ابنِ عادات صحية تناسبك
          </h3>

          <p className="mt-4 max-w-2xl leading-8 text-gray-300">
  {profile
    ? `هدفك الحالي هو ${
        profile.goal === "lose"
          ? "خسارة الوزن"
          : profile.goal === "gain"
            ? "زيادة الوزن"
            : profile.goal === "maintain"
              ? "المحافظة على الوزن"
              : "تحسين اللياقة البدنية"
      }. تابع تقدمك مع FitAI، وخطّط لعادات صحية تناسب حياتك. 💚`
    : "أكمل بياناتك الأساسية لنساعدك على تنظيم أهدافك وبناء عادات صحية تناسبك."}
</p>

    
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <article className="rounded-2xl border border-gray-800 bg-[#101c17] p-6">
            <div className="mb-4 text-3xl">⚖️</div>
            <h3 className="text-xl font-bold">متابعة الوزن</h3>
            <p className="mt-3 leading-7 text-gray-400">
              تابع تغيّر وزنك وسجّل تقدمك نحو هدفك.
            </p>
          </article>

          <article className="rounded-2xl border border-gray-800 bg-[#101c17] p-6">
            <div className="mb-4 text-3xl">🥗</div>
            <h3 className="text-xl font-bold">التغذية الذكية</h3>
            <p className="mt-3 leading-7 text-gray-400">
              استعد لاكتشاف أفكار وجبات تناسب احتياجاتك.
            </p>
          </article>

          <article className="rounded-2xl border border-gray-800 bg-[#101c17] p-6 sm:col-span-2 lg:col-span-1">
            <div className="mb-4 text-3xl">🤖</div>
            <h3 className="text-xl font-bold">مدرب FitAI</h3>
            <p className="mt-3 leading-7 text-gray-400">
              احصل على إرشادات تساعدك على فهم أهدافك الصحية.
            </p>

            <button
              onClick={() => router.push("/coach")}
              className="mt-4 text-green-400 hover:text-green-300"
            >
              اكتشف المدرب ←
            </button>
          </article>
        </div>
      </section>
    </main>
  );
}