import { NextResponse } from "next/server";
import OpenAI from "openai";
import tongue_ref_data from "./recommend_rule_v1.json";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY!,
  defaultHeaders: {
    "HTTP-Referer": "https://ai-food-therapist.vercel.app",
    "X-Title": "TCM Tongue Analysis",
  },
});

// =======================
// CONFIG
// =======================
const MODELS = [
  "google/gemini-2.5-flash",
  "openai/gpt-4o-mini",
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// =======================
// SAFE JSON PARSER
// =======================
function safeParseJSON(text: string) {
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {}

  try {
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .replace(/^[^{]*/g, "")
      .replace(/[^}]*$/g, "")
      .trim();

    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

// =======================
// MAIN ROUTE
// =======================
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { imageUrl, language = "zh" } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Missing image URL" },
        { status: 400 }
      );
    }

    // =======================
    // KB (token optimized)
    // =======================
    const simplifiedKB = tongue_ref_data.data.map((item: any) => ({
      id: item.id,
      description: item.description?.en || "",
    }));

    const systemInstruction = `
You are a Traditional Chinese Medicine tongue diagnosis expert.

STRICT RULES:
- Return ONLY JSON
- NO markdown
- NO explanation
- NO extra text

FORMAT:
{
  "id": "string",
  "tongue_body_desc": { "zh": "", "en": "" },
  "tongue_coating_desc": { "zh": "", "en": "" }
}

VALID IDS:
${simplifiedKB.map((i: any) => i.id).join(",")}

If no tongue detected → "no_tongue"
`;

    const promptText = "Analyze this tongue image and return matching ID.";

    let aiResponse: any = null;
    let usedModel = "";
    let lastError: any = null;

 
    for (const model of MODELS) {
      try {
        const completion = await openai.chat.completions.create({
          model,
          messages: [
            { role: "system", content: systemInstruction },
            {
              role: "user",
              content: [
                { type: "text", text: promptText },
                { type: "image_url", image_url: { url: imageUrl } },
              ],
            },
          ],
          response_format: { type: "json_object" },
          max_tokens: 800,
          temperature: 0.2,
        });

        const raw = completion.choices?.[0]?.message?.content || "";
        const parsed = safeParseJSON(raw);

        if (parsed?.id) {
          aiResponse = parsed;
          usedModel = model;
          break;
        }
      } catch (err: any) {
        lastError = err;

        console.error(`❌ ${model} failed`);
        console.error("Error details:", {
          message: err.message,
          status: err.status,
        });

        continue;
      }
    }

    if (!aiResponse) {
      return NextResponse.json(
        {
          error: "All models failed",
          details: lastError?.message || "Unknown error",
        },
        { status: 500 }
      );
    }

    // =======================
    // VALIDATE ID
    // =======================
    const baseRecord = tongue_ref_data.data.find(
      (item: any) => item.id === aiResponse.id
    );

    if (!baseRecord) {
      return NextResponse.json(
        { error: `Invalid ID: ${aiResponse.id}` },
        { status: 500 }
      );
    }

    // =======================
    // FORMAT LANG
    // =======================
    const formatLang = (field: any) => ({
      zh: field?.zh || field || "",
      en: field?.en || field || "",
    });

    // =======================
    // FINAL RESULT
    // =======================
    const finalResult = {
      id: baseRecord.id,
      name: formatLang(baseRecord.name),
      description: formatLang(baseRecord.description),
      quote: formatLang(baseRecord.quote),
      advice: formatLang(baseRecord.advice),

      tongue_body_desc: formatLang(aiResponse.tongue_body_desc),
      tongue_coating_desc: formatLang(aiResponse.tongue_coating_desc),

      foods: (baseRecord.foods || []).map((f: any) => ({
        ...f,
        name: formatLang(f.name),
        benefitText: formatLang(f.benefitText),
      })),
    };

    return NextResponse.json({
      success: true,
      model: usedModel,
      result: finalResult,
    });
  } catch (error: any) {
    console.error("🔥 Route Error:", error);

    return NextResponse.json(
      {
        error: "AI analysis failed",
        details: error.message,
      },
      { status: 500 }
    );
  }
}