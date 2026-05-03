import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import tongue_ref_data from "./recommend_rule.json";

const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
];

// 只給必要 ID（減 token）
const ALL_IDS = tongue_ref_data.data.map((item: any) => item.id);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function extractJSON(text: string) {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : null;
}

function safeParseJSON(text: string) {
  try {
    return JSON.parse(text);
  } catch {
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
}

const withTimeout = (promise: Promise<any>, ms = 10000) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms),
    ),
  ]);

export async function POST(req: Request) {
  const genAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
  });

  try {
    const body = await req.json();
    const { imageUrl, language = "zh" } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Missing image URL" },
        { status: 400 },
      );
    }

    // 下載圖片
    const imageResp = await fetch(imageUrl);
    if (!imageResp.ok) {
      throw new Error("Image fetch failed");
    }

    const buffer = await imageResp.arrayBuffer();
    const base64Data = Buffer.from(buffer).toString("base64");

    // 🔥 簡化 KB（省 token）
    const simplifiedKB = ALL_IDS.map((id) => {
      const item = tongue_ref_data.data.find((x: any) => x.id === id);
      return {
        id,
        desc: item?.description?.en || "",
      };
    });

    const systemInstruction = `
You are a Traditional Chinese Medicine tongue diagnosis system.

STRICT RULES:
- Return ONLY valid JSON
- NO markdown
- NO explanation
- NO extra text

FORMAT:
{
  "id": "string",
  "tongue_body_desc": { "zh": "", "en": "" },
  "tongue_coating_desc": { "zh": "", "en": "" },
  "confidence": number
}

VALID IDS:
${ALL_IDS.join(",")}

If no tongue detected → return "no_tongue"
`;

    let aiResponse: any = null;
    let rawResponse = "";
    let usedModel = "";

    // 🔥 fallback loop
    for (const modelName of MODELS) {
      try {
        const res: any = await withTimeout(
          genAI.models.generateContent({
            model: modelName,
            contents: [
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: base64Data,
                },
              },
              { text: "Analyze this tongue image." },
            ],
            config: {
              systemInstruction,
              responseMimeType: "application/json",
              maxOutputTokens: 400,
              temperature: 0.2,
            },
          }),
          12000,
        );

        rawResponse = res.text || "";

        const extracted = extractJSON(rawResponse);
        const parsed = extracted ? safeParseJSON(extracted) : null;

        if (parsed?.id) {
          aiResponse = parsed;
          usedModel = modelName;
          break;
        }
      } catch (err: any) {
        console.error(`${modelName} failed:`, err);

        // 🔥 429 quota handling
        if (err?.status === 429) {
          console.log("Quota hit → wait 25s");
          await sleep(25000);
        }

        continue;
      }
    }

    if (!aiResponse) {
      throw new Error("All models failed");
    }

    // 查表
    const baseRecord = tongue_ref_data.data.find(
      (item: any) => item.id === aiResponse.id,
    );

    if (!baseRecord) {
      throw new Error(`Invalid ID: ${aiResponse.id}`);
    }

    const formatLang = (field: any) => ({
      zh: field?.zh || field || "",
      en: field?.en || field || "",
    });

    const finalResult = {
      id: baseRecord.id,
      name: formatLang(baseRecord.name),
      description: formatLang(baseRecord.description),
      quote: formatLang(baseRecord.quote),
      advice: formatLang(baseRecord.advice),

      tongue_body_desc: formatLang(aiResponse.tongue_body_desc),
      tongue_coating_desc: formatLang(aiResponse.tongue_coating_desc),

      confidence: aiResponse.confidence ?? null,

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
      rawText: rawResponse,
    });
  } catch (error: any) {
    console.error("Gemini Error:", error);

    return NextResponse.json(
      {
        error: "AI analysis failed",
        details: error.message,
      },
      { status: 500 },
    );
  }
}



// OpenRouter 版本
// import { NextResponse } from "next/server";
// import OpenAI from "openai";
// import tongue_ref_data from "./recommend_rule.json";

// const openai = new OpenAI({
//   baseURL: "https://openrouter.ai/api/v1",
//   apiKey: process.env.OPENROUTER_API_KEY!,
//   defaultHeaders: {
//     "HTTP-Referer": "https://ai-food-therapist.vercel.app",
//     "X-Title": "TCM Tongue Analysis",
//   },
// });

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const { imageUrl, language = "zh" } = body;

//     if (!imageUrl) {
//       return NextResponse.json(
//         { error: language === "zh" ? "缺少圖片網址" : "Missing image URL" },
//         { status: 400 }
//       );
//     }

//     const isZh = language === "zh" || language.startsWith("zh-");

//     // 1. 準備精簡版知識庫
//     const simplifiedKB = tongue_ref_data.data.map((item: any) => ({
//       id: item.id,
//       description: item.description, //item.description?.zh ||
//     }));

//     // 2. 構建 System Instruction (要求同時回傳中英文，對齊 A 版本 schema)
//     const systemInstruction = `You are a professional TCM tongue diagnosis expert.
// You are a professional TCM tongue diagnosis expert. Please provide your analysis of the tongue body and tongue coating. Analyze the provided tongue photo and classify it strictly based on the knowledge base. Output only the single best match from the knowledge base. Please match with the description of each category.
// Analyze the user's tongue photo and provide detailed analysis in JSON format.

// 【Rules】:
// 1. Classification must strictly follow the IDs in Knowledge Base. If no tongue is detected, use "no_tongue" class.
// 2. You MUST provide both Chinese and English for analysis fields.
// 3. Output Format:
// {
//   "id": "string",
//   "tongue_body_desc": { "zh": "...", "en": "..." },
//   "tongue_coating_desc": { "zh": "...", "en": "..." }
// }
// 4.  Output id must be one of the ids present in the knowledge base. If the photo does not contain a tongue, return "no_tongue" as the id and provide appropriate descriptions.

// 【Knowledge Base】:
// ${JSON.stringify(simplifiedKB)}`;

//     const promptText = "Analyze this tongue photo and match an ID from the knowledge base.";

//     const models = ["google/gemini-2.5-flash", "openai/gpt-4o-mini"];
//     let aiResponse = null;
//     let usedModel = "";

//     for (const modelName of models) {
//       try {
//         const completion = await openai.chat.completions.create({
//           model: modelName,
//           messages: [
//             { role: "system", content: systemInstruction },
//             {
//               role: "user",
//               content: [
//                 { type: "text", text: promptText },
//                 { type: "image_url", image_url: { url: imageUrl } },
//               ],
//             },
//           ],
//           response_format: { type: "json_object" },
//           max_tokens: 2000,
//         });

//         const content = completion.choices[0].message.content;
//         if (content) {
//           aiResponse = JSON.parse(content);
//           usedModel = modelName;
//           // console.log(`Model ${usedModel} succeeded.`);
//           // console.log(aiResponse);
//           break;
//         }
//       } catch (err) {
//         console.error(`${modelName} failed:`, err);
//         continue;
//       }
//     }

//     if (!aiResponse || !aiResponse.id) {
//       throw new Error("Please ensure the photo contains a clear tongue image and try again.");
//     }

//     // 3. 後端查表並完整對齊 A 版本的格式
//     const baseRecord = tongue_ref_data.data.find((item: any) => item.id === aiResponse.id);

//     if (!baseRecord) {
//       throw new Error(`Invalid ID: ${aiResponse.id}`);
//     }

//     // 輔助函式：確保對象具有 zh/en 結構
//     const formatLang = (field: any) => ({
//       zh: field?.zh || field || "",
//       en: field?.en || field || ""
//     });

//     // 4. 組合成與 A 版本完全一致的結構
//     const finalResult = {
//       id: baseRecord.id,
//       name: formatLang(baseRecord.name),
//       // A 版本使用的是 "desc" 欄位而非 "description"
//       description: formatLang(baseRecord.description),
//       quote: formatLang(baseRecord.quote),
//       advice: formatLang(baseRecord.advice),
//       tongue_body_desc: formatLang(aiResponse.tongue_body_desc),
//       tongue_coating_desc: formatLang(aiResponse.tongue_coating_desc),
//       foods: (baseRecord.foods || []).map((f: any) => ({
//         ...f,
//         name: formatLang(f.name),
//         benefitText: formatLang(f.benefitText)
//       }))
//     };

//     // 5. 回傳 Response (注意：result 必須是 Object，不可 stringify)
//     return NextResponse.json({
//       success: true,
//       result: finalResult,
//       rawText: JSON.stringify(aiResponse) // 模擬 A 版本的 rawText 供除錯
//     });

//   } catch (error: any) {
//     console.error("Route Error:", error);
//     return NextResponse.json(
//       { error: "AI analysis failed", details: error.message },
//       { status: 500 }
//     );
//   }
// }


// 舊Gemini版本（已棄用）
// import { NextResponse } from "next/server";
// import { GoogleGenAI } from "@google/genai";
// import tongue_ref_data from "./recommend_rule.json";

// export async function POST(req: Request) {
//   // Initialize Google GenAI client
//   const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

//   try {
//     const body = await req.json();
//     const { imageUrl, language = "zh" } = body;

//     if (!imageUrl) {
//       return NextResponse.json(
//         { error: language === "zh" ? "缺少圖片網址" : "Missing image URL" },
//         { status: 400 },
//       );
//     }

//     const imageResp = await fetch(imageUrl);
//     if (!imageResp.ok) {
//       throw new Error(`Failed to fetch image: ${imageResp.statusText}`);
//     }

//     const buffer = await imageResp.arrayBuffer();
//     const base64Data = Buffer.from(buffer).toString("base64");

//     const contentType = imageResp.headers.get("content-type") || "image/jpeg";
//     const mimeType = contentType.startsWith("image/")
//       ? contentType
//       : "image/jpeg";

//     const isZh = language === "zh" || language.startsWith("zh-");

//     const promptText = isZh
//       ? "你是一位專業的中醫舌診專家。你的任務是分析使用者提供的舌頭照片。請提出你對於舌體及舌苔的分析，兩部分的分析可以儘量詳細，舌體和舌苔兩部分，每一部分字數控制在200個中文字或200英文單字內。其他內容須嚴格根據我提供的知識庫進行分類。請只輸出符合知識庫的單一最匹配結果。"
//       : "You are a professional TCM tongue diagnosis expert. Please provide your analysis of the tongue body and tongue coating. Analyze the provided tongue photo and classify it strictly based on the knowledge base. Output only the single best match from the knowledge base.";

//     const knowledgeText = `
// 【核心規則】
// 1. 必須嚴格比對照片特徵與知識庫中的 desc 描述、食物名稱及食物功效；但如果照片中沒有舌頭，請一律回覆"No Tongue"類別
// 2. 輸出的 id 必須是知識庫中存在的 id
// 3. 只選擇最明顯、最匹配的一種舌象（不要多選）
// 4. 所有輸出的欄位都要完整填寫，不可遺漏
// 5. 舌體分析重點在於顏色、形狀、濕潤度等，對應回傳值tongue_body_desc；舌苔分析重點在於厚薄、顏色、分佈等，對應回傳值tongue_coating_desc
// 6. 回覆內容中英文都要有，且要符合語言習慣（例如中文回覆要用地道的中醫術語，英文回覆要用專業的醫學英文）

// 知識庫內容：
// ${JSON.stringify(tongue_ref_data, null, 2)}
//     `;

//     const result = await genAI.models.generateContent({
//       model: "gemini-2.5-flash", //gemini-2.5-flash  gemini-3-flash-preview
//       contents: [
//         {
//           inlineData: {
//             mimeType: "image/jpeg",
//             data: base64Data,
//           },
//         },
//         { text: promptText },
//       ],
//       config: {
//         systemInstruction: knowledgeText,
//         responseMimeType: "application/json",
//         responseSchema: {
//           type: "array",
//           items: {
//             type: "object",
//             properties: {
//               id: { type: "string" },
//               name: {
//                 type: "object",
//                 properties: { zh: { type: "string" }, en: { type: "string" } },
//               },
//               tongue_body_desc: {
//                 type: "object",
//                 properties: { zh: { type: "string" }, en: { type: "string" } },
//               },
//               tongue_coating_desc: {
//                 type: "object",
//                 properties: { zh: { type: "string" }, en: { type: "string" } },
//               },
//               desc: {
//                 type: "object",
//                 properties: { zh: { type: "string" }, en: { type: "string" } },
//               },
//               quote: {
//                 type: "object",
//                 properties: { zh: { type: "string" }, en: { type: "string" } },
//               },
//               advice: {
//                 type: "object",
//                 properties: { zh: { type: "string" }, en: { type: "string" } },
//               },
//               foods: {
//                 type: "array",
//                 items: {
//                   type: "object",
//                   properties: {
//                     id: { type: "string" },
//                     name: {
//                       type: "object",
//                       properties: {
//                         zh: { type: "string" },
//                         en: { type: "string" },
//                       },
//                     },
//                     benefitText: {
//                       type: "object",
//                       properties: {
//                         zh: { type: "string" },
//                         en: { type: "string" },
//                       },
//                     },
//                     diet: {
//                       type: "object",
//                       properties: {
//                         vegan: { type: "boolean" },
//                         vegetarian: { type: "boolean" },
//                       },
//                     },
//                     allergens: { type: "array", items: { type: "string" } },
//                     contraindications: {
//                       type: "array",
//                       items: { type: "string" },
//                     },
//                     healthBenefits: {
//                       type: "array",
//                       items: { type: "string" },
//                     },
//                   },
//                   required: ["id", "name", "benefitText"],
//                 },
//               },
//             },
//             required: [
//               "id",
//               "name",
//               "desc",
//               "quote",
//               "advice",
//               "foods",
//               "tongue_body_desc",
//               "tongue_coating_desc",
//             ],
//           },
//           minItems: 1,
//           maxItems: 1, // Make sure to only get one result as per the requirement
//         },
//       },
//     });

//     const rawResponse = result.text;

//     let analysisResult = null;

//     try {
//       const jsonArray = JSON.parse(rawResponse || "[]");
//       analysisResult = jsonArray[0] || null; // replace first item（because schema + maxItems:1）
//       // console.log(analysisResult)
//     } catch (parseError) {
//       console.error("Gemini JSON parse failed:", rawResponse, parseError);
//     }

//     return NextResponse.json({
//       success: !!analysisResult,
//       result: analysisResult,
//       rawText: rawResponse, // 除錯用，可移除
//     });
//   } catch (error: any) {
//     console.error("Gemini Error:", error);
//     return NextResponse.json(
//       {
//         error: "AI analysis failed, please try again later",
//         details: error.message,
//       },
//       { status: 500 },
//     );
//   }
// }