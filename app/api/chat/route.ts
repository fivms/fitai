import OpenAI from "openai";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

export async function POST(request: Request) {
  try {
    // 1. التحقق من تسجيل دخول المستخدم
    const authorization = request.headers.get("Authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "سجّل الدخول لاستخدام مدرب FitAI." },
        { status: 401 }
      );
    }

    const token = authorization.slice(7);

    // 2. التحقق من صحة جلسة Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const { data: userData, error: userError } =
      await supabase.auth.getUser(token);

    if (userError || !userData.user) {
      return NextResponse.json(
        { error: "انتهت صلاحية الجلسة. سجّل الدخول مجددًا." },
        { status: 401 }
      );
    }

    // 3. التحقق من اكتمال الملف الشخصي
    if (userData.user.user_metadata?.profile_completed !== true) {
      return NextResponse.json(
        { error: "أكمل ملفك الشخصي أولًا لاستخدام المدرب الذكي." },
        { status: 403 }
      );
    }

    // 4. التأكد من وجود مفتاح OpenAI
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "خدمة المدرب غير مهيأة حاليًا." },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // 5. قراءة رسالة المستخدم
    const body = await request.json();
    const message = body.message;

    if (typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "اكتب رسالتك أولًا." },
        { status: 400 }
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { error: "الرسالة طويلة جدًا. اختصرها إلى 2000 حرف." },
        { status: 400 }
      );
    }

    // 6. تجهيز سجل المحادثة
    const history: ChatMessage[] = Array.isArray(body.history)
      ? body.history
          .filter(
            (item: ChatMessage) =>
              item &&
              (item.role === "user" || item.role === "assistant") &&
              typeof item.text === "string"
          )
          .slice(-12)
      : [];

    const conversation = [
      ...history.map((item) => {
        return `${item.role === "user" ? "المستخدم" : "مدرب FitAI"}: ${item.text.slice(0, 2000)}`;
      }),
      `المستخدم: ${message.trim()}`,
    ].join("\n\n");

    // 7. إرسال السؤال إلى الذكاء الاصطناعي
    const response = await openai.responses.create({
      model: "gpt-6-luna",
      instructions: `
أنت مدرب FitAI الصحي، وتتحدث باللغة العربية بأسلوب ودود وواضح.

اقرأ سجل المحادثة بعناية قبل الإجابة.
إذا قال المستخدم "غيرهم" أو "خيارات ثانية"، فارجع إلى الاقتراحات السابقة وقدّم 3 بدائل جديدة ومختلفة عنها قدر الإمكان.
لا تطلب من المستخدم تكرار طلبه إذا كان السياق السابق يوضحه.
استخدم قوائم واضحة وتجنب علامات Markdown غير الضرورية.
قدّم معلومات عامة عن التغذية والرياضة والعادات الصحية.
لا تشخّص الأمراض ولا تصف علاجات طبية.
`,
      input: conversation,
      max_output_tokens: 500,
    });

    // 8. إعادة الرد إلى المستخدم
    return NextResponse.json({
      reply: response.output_text,
    });
  } catch (error) {
    console.error("FitAI API error:", error);

    return NextResponse.json(
      { error: "تعذّر الحصول على رد الآن. حاول مرة أخرى." },
      { status: 500 }
    );
  }
}