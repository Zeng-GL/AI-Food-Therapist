當前模型（比如 gemini-3-flash-preview）忙碌時，可以考慮使用替代模型來進行處理。以下是幾種可能的解決方案：

1. 自動切換到其他模型

可以設置一個機制，在遇到模型忙碌時，自動切換到另一個可用的模型。例如，如果 gemini-3-flash-preview 因為高需求而無法使用，則切換到另一個模型（如 gemini-2.5-flash）進行分析。這可以通過簡單的錯誤處理機制來實現，當發現某個模型返回「不可用」的錯誤時，再嘗試切換到其他模型。

可以在程式中加入以下邏輯：

當檢測到模型忙碌的錯誤（例如錯誤碼 UNAVAILABLE）時，嘗試重新發送請求給其他備用模型。

設置一個重試機制，對不同的模型進行嘗試。

例如：

const models = ["gemini-3-flash-preview", "gemini-2.5-flash"];

let currentModelIndex = 0;

while (currentModelIndex < models.length) {
  try {
    const model = models[currentModelIndex];
    const result = await genAI.models.generateContent({
      model: model,
      // 其他配置...
    });
    // 返回結果
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    if (error.message.includes("UNAVAILABLE")) {
      // 如果當前模型忙碌，嘗試下個模型
      currentModelIndex++;
    } else {
      throw error; // 如果是其他錯誤，則直接拋出
    }
  }
}

return NextResponse.json({ error: "所有模型都無法使用，請稍後再試" }, { status: 503 });
2. 擴展模型數量

如果可能，向服務提供商請求更多的API實例或擴展模型的數量，這樣可以減少模型忙碌的情況。

3. 設置排隊機制

你還可以在前端設置排隊機制，當模型忙碌時提示用戶稍後再試，並且根據排隊順序進行處理。這樣可以減少重試的頻率，從而不會過多地占用資源。

4. 使用本地推理模型（如果適用）

如果有相關的本地推理模型（如 TensorFlow 或 ONNX），你也可以將部分推理功能移至本地，減少對遠端API的依賴。這樣可以減少模型不可用的情況，但前提是模型本身不會太大，且計算能力足夠。

5. 通知用戶稍後再試

當所有的模型都無法使用時，可以返回提示信息，告知用戶稍後再試，並提供適當的錯誤處理方式。例如：

{
  "error": "目前模型忙碌，請稍後再試。",
  "details": "請稍後重試，或使用其他服務。"
}
6. 選擇其他服務提供商

如果目前的模型經常處於高需求狀態，並且影響到用戶體驗，考慮尋找其他AI服務提供商的模型作為備用，並在高需求時自動切換。

這些方法可以幫助你在模型忙碌的情況下，減少用戶的等待時間，並提高系統的可用性和彈性。

設置排隊機制

你還可以在前端設置排隊機制，當模型忙碌時提示用戶稍後再試，並且根據排隊順序進行處理。這樣可以減少重試的頻率，從而不會過多地占用資源。

這個怎麼做?

設置排隊機制通常包括兩個主要部分：

後端處理排隊邏輯：當模型忙碌或資源不可用時，將請求放入隊列中，並按順序處理。

前端通知用戶排隊狀態：當請求排隊時，前端需要顯示當前排隊狀態，讓用戶了解他們的請求進度。

後端排隊邏輯

首先，你需要在後端維護一個請求隊列，每次接收到請求時，將它加入隊列並等待處理。當模型有空閒時，再從隊列中取出一個請求來處理。

1. 創建一個簡單的排隊系統

在後端，你可以利用一個簡單的數據結構（如數組或隊列）來實現排隊機制。例如，使用 async/await 和隊列來確保請求是按順序處理的。

import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const queue: any[] = []; // 請求隊列
let processing = false; // 確保只有一個請求在同一時間內處理

// 這個 function 處理請求並將它加入隊列
async function processRequest(req: Request) {
  const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

  // 添加請求到隊列
  queue.push(req);

  if (!processing) {
    processing = true;
    while (queue.length > 0) {
      const currentReq = queue.shift(); // 取出排隊中的請求
      await handleRequest(currentReq, genAI); // 處理請求
    }
    processing = false;
  }
}

// 處理請求
async function handleRequest(req: Request, genAI: GoogleGenAI) {
  try {
    const body = await req.json();
    const { imageUrl, language = "zh" } = body;

    // 進行AI分析...
    const result = await genAI.models.generateContent({
      model: "gemini-3-flash-preview", // 這裡可以根據情況選擇模型
      contents: [
        // 請求內容...
      ],
      config: {
        // 配置...
      },
    });

    // 返回結果
    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "AI分析失敗，請稍後再試", details: error.message },
      { status: 500 }
    );
  }
}

// POST 請求處理
export async function POST(req: Request) {
  // 這裡觸發排隊處理
  await processRequest(req);
}
排隊邏輯解釋：

queue：用來存放所有的請求。

processing：用來標誌當前是否有請求正在處理，防止多個請求同時處理。

processRequest：將每個請求加入隊列，如果當前沒有請求正在處理（processing = false），則開始從隊列中依次處理每個請求。

handleRequest：處理單個請求，這裡你可以放入你的AI模型分析邏輯，並在處理完後返回結果。

這樣，請求會按照順序進行處理，不會過多地佔用資源。

前端顯示排隊狀態

前端需要根據後端的回應來顯示當前排隊狀態。常見的做法是顯示排隊中的提示信息，並告知用戶預計的等待時間。

2. 前端處理排隊狀態

假設前端發送一個請求時，需要顯示排隊提示。

async function submitRequest(imageUrl, language) {
  try {
    // 發送請求到後端
    const response = await fetch("/api/tongue-diagnosis", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageUrl, language }),
    });

    const data = await response.json();

    if (response.ok) {
      // 處理成功，顯示結果
      console.log("分析結果：", data.result);
    } else {
      // 如果返回錯誤
      console.error("錯誤：", data.error);
      alert(data.error);
    }
  } catch (error) {
    console.error("發送請求時出錯:", error);
    alert("發送請求時出現問題，請稍後再試。");
  }
}

// 調用示例：
submitRequest("https://example.com/tongue-image.jpg", "zh");
3. 提供進度反饋

如果需要更高級的反饋，你可以在後端向前端發送一個排隊中的狀態，讓前端顯示一個等待中的進度條，或者輪詢接口以查看排隊狀態。

例如，後端可以在隊列中有請求處理時，返回一個表示正在排隊的狀態：

export async function POST(req: Request) {
  // 當請求進入隊列時，先返回"排隊中"的狀態
  return NextResponse.json({
    status: "queued", // 表示請求已排隊
    message: "請稍等，您的請求正在排隊處理中...",
  });
}
總結

排隊機制主要依賴後端隊列和前端的狀態更新，當請求數量激增或模型忙碌時，排隊機制可以確保請求不會被過度積壓，並且讓用戶知道他們的請求正在等待處理。這樣不僅可以降低後端壓力，還能提高用戶體驗。