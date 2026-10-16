"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../utils/supabase";

export default function ProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [goal, setGoal] = useState("lose");
  const [activity, setActivity] = useState("moderate");

  useEffect(() => {
    async function checkUser() {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        router.replace("/login");
        return;
      }

      setLoading(false);
    }

    checkUser();
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const ageValue = Number(age);
    const weightValue = Number(weight);
    const heightValue = Number(height);

    if (
      !Number.isFinite(ageValue) ||
      ageValue < 18 ||
      ageValue > 120
    ) {
      setMessage("أدخل عمرًا صحيحًا بين 18 و120 سنة.");
      return;
    }

    if (
      !Number.isFinite(weightValue) ||
      weightValue < 25 ||
      weightValue > 350
    ) {
      setMessage("أدخل وزنًا صحيحًا بالكيلوغرام.");
      return;
    }

    if (
      !Number.isFinite(heightValue) ||
      heightValue < 100 ||
      heightValue > 250
    ) {
      setMessage("أدخل طولًا صحيحًا بالسنتيمتر.");
      return;
    }

    setSaving(true);

    try {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        router.replace("/login");
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          age: ageValue,
          weight: weightValue,
          height: heightValue,
          goal,
          activity,
          profile_completed: true,
        },
      });

      if (updateError) throw updateError;

      router.push("/dashboard");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "تعذر حفظ المعلومات. حاول مرة أخرى."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#07110e] text-green-400"
      >
        جارٍ تحميل ملفك الشخصي...
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#07110e] px-5 py-10 text-white"
    >
      <div className="mx-auto max-w-2xl">
        <a
          href="/dashboard"
          className="text-xl font-bold text-green-400"
        >
          🌿 FitAI
        </a>

        <section className="mt-8 rounded-3xl border border-green-900 bg-[#101c17] p-6 sm:p-9">
          <p className="mb-3 text-sm text-green-400">
            الخطوة الأولى في رحلتك
          </p>

          <h1 className="text-3xl font-bold">
            خلينا نتعرف عليك 💚
          </h1>

          <p className="mt-3 leading-7 text-gray-400">
            أدخل معلوماتك الأساسية لنساعدك على تحديد أهداف صحية مناسبة لك.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label htmlFor="age" className="mb-2 block">
                العمر (بالسنوات)
              </label>

              <input
                id="age"
                type="number"
                min="18"
                max="120"
                required
                value={age}
                onChange={(event) => setAge(event.target.value)}
                className="w-full rounded-xl border border-gray-700 bg-[#07110e] p-3 text-white"
                placeholder="مثال: 25"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="weight" className="mb-2 block">
                  الوزن الحالي (كغ)
                </label>

                <input
                  id="weight"
                  type="number"
                  min="25"
                  max="350"
                  step="0.1"
                  required
                  value={weight}
                  onChange={(event) => setWeight(event.target.value)}
                  className="w-full rounded-xl border border-gray-700 bg-[#07110e] p-3 text-white"
                  placeholder="مثال: 80"
                />
              </div>

              <div>
                <label htmlFor="height" className="mb-2 block">
                  الطول (سم)
                </label>

                <input
                  id="height"
                  type="number"
                  min="100"
                  max="250"
                  required
                  value={height}
                  onChange={(event) => setHeight(event.target.value)}
                  className="w-full rounded-xl border border-gray-700 bg-[#07110e] p-3 text-white"
                  placeholder="مثال: 175"
                />
              </div>
            </div>

            <div>
              <label htmlFor="goal" className="mb-2 block">
                ما هدفك؟
              </label>

              <select
                id="goal"
                value={goal}
                onChange={(event) => setGoal(event.target.value)}
                className="w-full rounded-xl border border-gray-700 bg-[#07110e] p-3 text-white"
              >
                <option value="lose">خسارة الوزن</option>
                <option value="gain">زيادة الوزن</option>
                <option value="maintain">المحافظة على الوزن</option>
                <option value="fitness">تحسين اللياقة البدنية</option>
              </select>
            </div>

            <div>
              <label htmlFor="activity" className="mb-2 block">
                مستوى نشاطك اليومي
              </label>

              <select
                id="activity"
                value={activity}
                onChange={(event) => setActivity(event.target.value)}
                className="w-full rounded-xl border border-gray-700 bg-[#07110e] p-3 text-white"
              >
                <option value="low">منخفض — حركة قليلة</option>
                <option value="light">خفيف — تمارين بسيطة</option>
                <option value="moderate">متوسط — تمارين منتظمة</option>
                <option value="high">مرتفع — نشاط مكثف</option>
              </select>
            </div>

            {message && (
              <p
                role="alert"
                className="break-words text-sm leading-7 text-red-300"
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-green-400 p-4 font-bold text-black transition hover:bg-green-300 disabled:opacity-50"
            >
              {saving ? "جارٍ حفظ معلوماتك..." : "حفظ ومتابعة ←"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}