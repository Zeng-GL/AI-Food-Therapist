"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Save, ArrowLeft } from "lucide-react";
import { useLanguageStore } from "@/store/use-language-store";
import { useSession } from "next-auth/react";
import { useResultStore } from "@/store/use-result-store";
import { getTongueImage, getFoodImage } from "@/lib/image-mapping";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { sendGAEvent } from "@next/third-parties/google";

// --- 型別定義 ---
interface DiagnosisResult {
  result_code: string;
  confidence: number;
  imageFile: string;
}

interface Translation {
  en: string;
  zh: string;
}

interface AnalysisData {
  id: string;
  name: Translation;
  description: Translation;
  quote: Translation;
  advice: Translation;
  tongue_body_desc?: Translation;
  tongue_coating_desc?: Translation;
  foods: Array<{
    id: string;
    name: Translation;
    benefitText: Translation;
  }>;
}

export default function ResultPage() {
  const router = useRouter();
  const { language } = useLanguageStore();
  const { data: session, status } = useSession();
  
  const isGuest = typeof window !== "undefined" && sessionStorage.getItem("is_guest") === "true";
  const isLoggedIn = status === "authenticated" && !isGuest;
  const isZh = language === "zh";

  // 從 Zustand 取得原始資料
  const _analysisData = useResultStore((state) => state.analysisResult);
  const imageUrl = useResultStore((state) => state.imageUrl);

  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [saving, setSaving] = useState(false);

  // 解析後的強型別資料
  let analysisData: AnalysisData | null = null;
  if (_analysisData) {
    try {
      analysisData = JSON.parse(_analysisData) as AnalysisData;
    } catch (e) {
      console.error("Failed to parse analysis data", e);
    }
  }

  useEffect(() => {
    const stored = sessionStorage.getItem("diagnosis_result");
    if (stored) {
      setResult(JSON.parse(stored));
    } else if (!analysisData && !imageUrl) {
      router.push("/diagnosis");
    }
  }, [router, analysisData, imageUrl]);

  // --- 渲染前的防禦檢查 ---
  if (!result || !analysisData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <p className="text-text-secondary">{isZh ? "載入中..." : "Loading..."}</p>
        </div>
      </div>
    );
  }

  // --- 資料顯示映射 ---
  const displayName = isZh ? analysisData.name.zh : analysisData.name.en;
  const displayQuote = isZh ? analysisData.quote.zh : analysisData.quote.en;
  const displayDesc = isZh ? analysisData.description.zh : analysisData.description.en;
  const displayAdvice = isZh ? analysisData.advice.zh : analysisData.advice.en;
  
  const displayTongueBody = isZh 
    ? analysisData.tongue_body_desc?.zh 
    : analysisData.tongue_body_desc?.en;
  const displayTongueCoating = isZh 
    ? analysisData.tongue_coating_desc?.zh 
    : analysisData.tongue_coating_desc?.en;

  const displayFoods = analysisData.foods.map((food) => ({
    name: isZh ? food.name.zh : food.name.en,
    benefit: isZh ? food.benefitText.zh : food.benefitText.en,
    originalName: food.name.en, // 用於圖片匹配
  }));

  // --- 處理函式 ---
  const handleReturn = () => {
    isLoggedIn ? router.push("/home") : router.push("/");
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);

    try {
      if (isLoggedIn) {
        const response = await fetch("/api/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            diagnosisData: analysisData,
            imageUrl: imageUrl,
          }),
        });

        if (!response.ok) throw new Error("Cloud save failed");

        sendGAEvent("event", "photo_upload_success", { method: "database" });
        alert(isZh ? "已成功儲存" : "Saved Successfully");
        router.push("/trends");
      } else {
        // 訪客逻辑：存入 localStorage 並引導登入
        localStorage.setItem("pending_save_result", JSON.stringify({ ...result, timestamp: Date.now() }));
        if (confirm(isZh ? "儲存記錄需要登入，是否要登入？" : "Please sign in to save your records.")) {
          router.push("/auth/choose");
        }
      }
    } catch (error) {
      sendGAEvent("event", "photo_upload_fail", { 
        error: error instanceof Error ? error.message : "Unknown" 
      });
      alert("Error saving data");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <header className="w-full p-4 flex items-center justify-between">
        <button onClick={handleReturn} className="p-2 hover:bg-brand/10 rounded-lg transition-colors text-brand-muted">
          <ArrowLeft size={24} />
        </button>
        {isGuest && <LanguageSwitcher />}
        {!isGuest && <div className="w-10"></div>}
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* 圖片對比區域 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex flex-col md:flex-row gap-8 items-start justify-center">
            {/* 使用者照片 */}
            <div className="flex-1 w-full flex flex-col items-center">
              <p className="text-sm font-medium text-text-secondary mb-3">
                {isZh ? "您的舌頭照片" : "Your Tongue Photo"}
              </p>
              <div className="w-full aspect-square max-w-[280px] rounded-xl border-2 border-brand/20 overflow-hidden shadow-inner bg-gray-50">
                <img src={result.imageFile} alt="User tongue" className="w-full h-full object-cover scale-150" />
              </div>
            </div>

            {/* 參考圖 */}
            <div className="flex-1 w-full flex flex-col items-center">
              <p className="text-sm font-medium text-text-secondary mb-3">
                {isZh ? "參考舌像" : "Reference Tongue"}
              </p>
              <div className="w-full aspect-square max-w-[280px] rounded-xl border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50 shadow-sm">
                <img 
                  src={getTongueImage(analysisData.id as any, analysisData.name)} 
                  alt={displayName} 
                  className="w-full h-full object-contain p-2"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 診斷結果詳情 */}
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">{displayName}</h1>
            <p className="text-lg text-gray-600">{displayDesc}</p>
          </div>

          <div className="bg-brand/10 border-l-4 border-brand p-4 rounded">
            <p className="text-lg italic text-gray-800">{displayQuote}</p>
          </div>

          <div className="pt-4">
            <h2 className="text-xl font-semibold mb-2">{isZh ? "健康建議" : "Health Advice"}</h2>
            <p className="text-gray-700">{displayAdvice}</p>
          </div>

          {isLoggedIn && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <h3 className="font-semibold text-brand">{isZh ? "舌體分析" : "Body Analysis"}</h3>
                <p className="text-sm text-gray-600">{displayTongueBody || "N/A"}</p>
              </div>
              <div>
                <h3 className="font-semibold text-brand">{isZh ? "舌苔分析" : "Coating Analysis"}</h3>
                <p className="text-sm text-gray-600">{displayTongueCoating || "N/A"}</p>
              </div>
            </div>
          )}
        </div>

        {/* 食物推薦 */}
        {displayFoods.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">{isZh ? "推薦食物" : "Recommended Foods"}</h2>
            <div className="space-y-4">
              {displayFoods.map((food, index) => {
                const foodImage = getFoodImage(food.name) || getFoodImage(food.originalName);
                return (
                  <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow flex items-center space-x-4">
                    <div className="w-20 h-20 flex-shrink-0">
                      <img 
                        src={foodImage || "/assets/images/Foods/1. Lotus.png"} 
                        alt={food.name} 
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-primary-dark">{food.name}</h3>
                      <p className="text-sm text-text-secondary">{food.benefit}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 操作按鈕 */}
        <div className="flex flex-col sm:flex-row gap-4">
          {analysisData.id !== "no_tongue" && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 px-6 bg-brand text-white rounded-full font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <Save size={20} />
              <span>{saving ? (isZh ? "儲存中..." : "Saving...") : (isZh ? "儲存記錄" : "Save Record")}</span>
            </button>
          )}

          <button
            onClick={() => router.push("/diagnosis")}
            className="flex-1 py-3 px-6 bg-brand-muted text-white rounded-full font-semibold hover:opacity-90 transition-all flex items-center justify-center space-x-2"
          >
            <RotateCcw size={20} />
            <span>{isZh ? "再次檢測" : "Test Again"}</span>
          </button>
        </div>
      </main>
    </div>
  );
}