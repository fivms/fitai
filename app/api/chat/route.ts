import OpenAI from "openai";
import { NextResponse } from "next/server";
type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

export async function POST(request: Request) {
  const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
  try {
    const body = await request.json();

    const message = body.message;

    if (typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "اكتب رسالتك أولًا." },
        { status: 400 }
      );
    }

    const history: ChatMessage[] = Array.isArray(body.history)
      ? body.history
          .filter(
            (item: ChatMessage) =>
              (item.role === "user" || item.role === "assistant") &&
              typeof item.text === "string"
          )
          .slice(-12)
      : [];

    const conversation = [
      ...history.map((item) => {
        return `${item.role === "user" ? "المستخدم" : "مدرب FitAI"}: ${item.text.slice(0, 2000)}`;
      }),
      `المستخدم: ${message.trim().slice(0, 2000)}`,
    ].join("\n\n");

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