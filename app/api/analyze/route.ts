import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import tongue_ref_data from "./recommend_rule.json";
import { id } from "date-fns/locale";


export async function POST(req: Request) {
  // Initialize Google GenAI client
  const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

  try {
    const body = await req.json();
    const { imageUrl, language = "zh" } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: language === "zh" ? "缺少圖片網址" : "Missing image URL" },
        { status: 400 },
      );
    }

    const imageResp = await fetch(imageUrl);
    if (!imageResp.ok) {
      throw new Error(`Failed to fetch image: ${imageResp.statusText}`);
    }

    const buffer = await imageResp.arrayBuffer();
    const base64Data = Buffer.from(buffer).toString("base64");

    const contentType = imageResp.headers.get("content-type") || "image/jpeg";
    const mimeType = contentType.startsWith("image/")
      ? contentType
      : "image/jpeg";

    const isZh = language === "zh" || language.startsWith("zh-");

    const promptText = isZh
      ? "你是一位專業的中醫舌診專家。你的任務是分析使用者提供的舌頭照片。請提出你對於舌體及舌苔的分析，兩部分的分析可以儘量詳細，舌體和舌苔兩部分，每一部分字數控制在200個中文字或200英文單字內。其他內容須嚴格根據我提供的知識庫進行分類。請只輸出符合知識庫的單一最匹配結果。"
      : "You are a professional TCM tongue diagnosis expert. Please provide your analysis of the tongue body and tongue coating. Analyze the provided tongue photo and classify it strictly based on the knowledge base. Output only the single best match from the knowledge base.";

    const knowledgeText = `
【核心規則】
1. 必須嚴格比對照片特徵與知識庫中的 desc 描述、食物名稱及食物功效；但如果照片中沒有舌頭，請一律回覆"No Tongue"類別
2. 輸出的 id 必須是知識庫中存在的 id
3. 只選擇最明顯、最匹配的一種舌象（不要多選）
4. 所有輸出的欄位都要完整填寫，不可遺漏
5. 舌體分析重點在於顏色、形狀、濕潤度等，對應回傳值tongue_body_desc；舌苔分析重點在於厚薄、顏色、分佈等，對應回傳值tongue_coating_desc
6. 回覆內容中英文都要有，且要符合語言習慣（例如中文回覆要用地道的中醫術語，英文回覆要用專業的醫學英文）

知識庫內容：
${JSON.stringify(tongue_ref_data, null, 2)}
    `;

    const result = await genAI.models.generateContent({
      model: "gemini-3-flash-preview", //gemini-2.5-flash  gemini-3-flash-preview
      contents: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Data,
          },
        },
        { text: promptText },
      ],
      config: {
        systemInstruction: knowledgeText,
        responseMimeType: "application/json",
        responseSchema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: {
                type: "object",
                properties: { zh: { type: "string" }, en: { type: "string" } },
              },
              tongue_body_desc: {
                type: "object",
                properties: { zh: { type: "string" }, en: { type: "string" } },
              },
              tongue_coating_desc: {
                type: "object",
                properties: { zh: { type: "string" }, en: { type: "string" } },
              },
              desc: {
                type: "object",
                properties: { zh: { type: "string" }, en: { type: "string" } },
              },
              quote: {
                type: "object",
                properties: { zh: { type: "string" }, en: { type: "string" } },
              },
              advice: {
                type: "object",
                properties: { zh: { type: "string" }, en: { type: "string" } },
              },
              foods: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    name: {
                      type: "object",
                      properties: {
                        zh: { type: "string" },
                        en: { type: "string" },
                      },
                    },
                    benefitText: {
                      type: "object",
                      properties: {
                        zh: { type: "string" },
                        en: { type: "string" },
                      },
                    },
                    diet: {
                      type: "object",
                      properties: {
                        vegan: { type: "boolean" },
                        vegetarian: { type: "boolean" },
                      },
                    },
                    allergens: { type: "array", items: { type: "string" } },
                    contraindications: {
                      type: "array",
                      items: { type: "string" },
                    },
                    healthBenefits: {
                      type: "array",
                      items: { type: "string" },
                    },
                  },
                  required: ["id", "name", "benefitText"],
                },
              },
            },
            required: [
              "id",
              "name",
              "desc",
              "quote",
              "advice",
              "foods",
              "tongue_body_desc",
              "tongue_coating_desc",
            ],
          },
          minItems: 1,
          maxItems: 1, // Make sure to only get one result as per the requirement
        },
      },
    });

    const rawResponse = result.text;

    let analysisResult = null;

    try {
      const jsonArray = JSON.parse(rawResponse || "[]");
      analysisResult = jsonArray[0] || null; // replace first item（because schema + maxItems:1）
      console.log(analysisResult)
    } catch (parseError) {
      console.error("Gemini JSON parse failed:", rawResponse, parseError);
    }

    return NextResponse.json({
      success: !!analysisResult,
      result: analysisResult,
      rawText: rawResponse, // 除錯用，可移除
    });
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return NextResponse.json(
      {
        error: "AI analysis failed, please try again later",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
