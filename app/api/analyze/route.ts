import { NextResponse } from "next/server";
import OpenAI from "openai";
import tongue_ref_data from "./recommend_rule.json";

// 初始化 OpenRouter (兼容 OpenAI SDK)
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY!,
  defaultHeaders: {
    "HTTP-Referer": "https://ai-food-therapist.vercel.app", // 建議替換為你的網站網址
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

    // 1. 準備精簡版知識庫 (只提供 ID 和判斷描述，減少 AI 負擔)
    const simplifiedKB = tongue_ref_data.data.map((item) => ({
      id: item.id,
      description: item.description,
    }));

    // 2. 構建 System Instruction
    const systemInstruction = `You are a professional TCM tongue diagnosis expert.
Analyze the user's tongue photo and provide detailed analysis for 'tongue_body_desc' and 'tongue_coating_desc' (around 200 words each).
Then, classify the tongue strictly based on the ID from the provided Knowledge Base.

【Rules】:
1. Return result in JSON format.
2. Select only the SINGLE best matching 'id'. If no tongue is found, use id "No Tongue".
3. Tongue body analysis: Focus on color, shape, moisture.
4. Tongue coating analysis: Focus on thickness, color, distribution.
5. All descriptions must be in ${isZh ? "Traditional Chinese" : "English"}.

【Knowledge Base (ID & Criteria)】:
${JSON.stringify(simplifiedKB)}`;

    const promptText = isZh ? "請詳細分析這張舌頭照片。" : "Please provide a detailed analysis of this tongue photo.";

    // 3. 定義模型順序：主要用 Gemini，輔助用 OpenAI
    const models = ["google/gemini-2.5-flash", "openai/gpt-4o-mini"];
    let aiResponse = null;
    let usedModel = "";

    // 4. 手動備援輪詢
    for (const modelName of models) {
      try {
        console.log(`正在嘗試呼叫模型: ${modelName}`);
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
        });

        const content = completion.choices[0].message.content;
        if (content) {
          aiResponse = JSON.parse(content);
          usedModel = modelName;
          break; // 成功取得結果，跳出迴圈
        }
      } catch (err) {
        console.error(`${modelName} 調用失敗:`, err);
        continue; // 嘗試下一個模型
      }
    }

    if (!aiResponse || !aiResponse.id) {
      throw new Error("All AI models failed to provide a valid response.");
    }

    // 5. 後端查表：從原始 JSON 中撈出完整資訊 (食物、建議、引用)
    const baseRecord = tongue_ref_data.data.find((item: typeof tongue_ref_data.data[0]) => item.id === aiResponse.id);
    
    if (!baseRecord) {
        // 如果 AI 回傳了不存在的 ID (雖然機率低)，提供一個基礎回饋
        return NextResponse.json({ success: true, result: aiResponse, model: usedModel });
    }

    // 6. 組合最終結果：保留 JSON 的結構，但使用 AI 生成的詳細描述
    const finalResult = {
      ...baseRecord,
      tongue_body_desc: {
        [isZh ? "zh" : "en"]: aiResponse.tongue_body_desc,
      },
      tongue_coating_desc: {
        [isZh ? "zh" : "en"]: aiResponse.tongue_coating_desc,
      },
    };

    return NextResponse.json({
      success: true,
      result: finalResult,
      model: usedModel, // 回傳使用的模型以便追蹤
    });

  } catch (error: any) {
    console.error("Route Error:", error);
    return NextResponse.json(
      { error: "AI analysis failed", details: error.message },
      { status: 500 }
    );
  }
}