import { NextResponse } from "next/server";
import OpenAI from "openai";
import tongue_ref_data from "./recommend_rule.json";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY!,
  defaultHeaders: {
    "HTTP-Referer": "https://ai-food-therapist.vercel.app",
    "X-Title": "TCM Tongue Analysis",
  },
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { imageUrl, language = "zh" } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: language === "zh" ? "缺少圖片網址" : "Missing image URL" },
        { status: 400 }
      );
    }

    const isZh = language === "zh" || language.startsWith("zh-");

    // 1. 準備精簡版知識庫
    const simplifiedKB = tongue_ref_data.data.map((item: any) => ({
      id: item.id,
      description: item.description, //item.description?.zh ||
    }));


    // 2. 構建 System Instruction (要求同時回傳中英文，對齊 A 版本 schema)
    const systemInstruction = `You are a professional TCM tongue diagnosis expert.
You are a professional TCM tongue diagnosis expert. Please provide your analysis of the tongue body and tongue coating. Analyze the provided tongue photo and classify it strictly based on the knowledge base. Output only the single best match from the knowledge base.
Analyze the user's tongue photo and provide detailed analysis in JSON format.

【Rules】:
1. Classification must strictly follow the IDs in Knowledge Base. If no tongue is detected, use "no_tongue" class.
2. You MUST provide both Chinese and English for analysis fields.
3. Output Format:
{
  "id": "string",
  "tongue_body_desc": { "zh": "...", "en": "..." },
  "tongue_coating_desc": { "zh": "...", "en": "..." }
}
4.  Output id must be one of the ids present in the knowledge base. If the photo does not contain a tongue, return "no_tongue" as the id and provide appropriate descriptions.

【Knowledge Base】:
${JSON.stringify(simplifiedKB)}`;

    const promptText = "Analyze this tongue photo and match an ID from the knowledge base.";

    const models = ["google/gemini-2.5-flash", "openai/gpt-4o-mini"];
    let aiResponse = null;
    let usedModel = "";

    for (const modelName of models) {
      try {
        const completion = await openai.chat.completions.create({
          model: modelName,
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
          max_tokens: 2000,
        });

        const content = completion.choices[0].message.content;
        if (content) {
          aiResponse = JSON.parse(content);
          usedModel = modelName;
          console.log(`Model ${usedModel} succeeded.`);
          console.log(aiResponse);
          break;
        }
      } catch (err) {
        console.error(`${modelName} failed:`, err);
        continue;
      }
    }

    if (!aiResponse || !aiResponse.id) {
      throw new Error("All AI models failed.");
    }

    // 3. 後端查表並完整對齊 A 版本的格式
    const baseRecord = tongue_ref_data.data.find((item: any) => item.id === aiResponse.id);
    
    if (!baseRecord) {
      throw new Error(`Invalid ID: ${aiResponse.id}`);
    }

    // 輔助函式：確保對象具有 zh/en 結構
    const formatLang = (field: any) => ({
      zh: field?.zh || field || "",
      en: field?.en || field || ""
    });

    // 4. 組合成與 A 版本完全一致的結構
    const finalResult = {
      id: baseRecord.id,
      name: formatLang(baseRecord.name),
      // A 版本使用的是 "desc" 欄位而非 "description"
      description: formatLang(baseRecord.description), 
      quote: formatLang(baseRecord.quote),
      advice: formatLang(baseRecord.advice),
      tongue_body_desc: formatLang(aiResponse.tongue_body_desc),
      tongue_coating_desc: formatLang(aiResponse.tongue_coating_desc),
      foods: (baseRecord.foods || []).map((f: any) => ({
        ...f,
        name: formatLang(f.name),
        benefitText: formatLang(f.benefitText)
      }))
    };

    // 5. 回傳 Response (注意：result 必須是 Object，不可 stringify)
    return NextResponse.json({
      success: true,
      result: finalResult,
      rawText: JSON.stringify(aiResponse) // 模擬 A 版本的 rawText 供除錯
    });

  } catch (error: any) {
    console.error("Route Error:", error);
    return NextResponse.json(
      { error: "AI analysis failed", details: error.message },
      { status: 500 }
    );
  }
}