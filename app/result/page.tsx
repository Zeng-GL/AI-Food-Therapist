"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Save, ArrowLeft } from "lucide-react";
import { useLanguageStore } from "@/store/use-language-store";
// import { useAuthStore } from '@/store/use-auth-store';
import { useSession } from "next-auth/react";
import { useResultStore } from "@/store/use-result-store";
import { getTongueData, TongueType } from "@/lib/tongue-data";
import { getTongueImage, getFoodImage } from "@/lib/image-mapping";
import { saveGuestHistory } from "@/lib/storage-utils";
// import { supabase } from '@/lib/supabase';
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { is } from "date-fns/locale";

interface DiagnosisResult {
  result_code: TongueType;
  confidence: number;
  imageFile: string;
}

export default function ResultPage() {
  const router = useRouter();
  const { language } = useLanguageStore();
  // const { isLoggedIn, user: authStoreUser } = useAuthStore();
  const { data: session, status } = useSession();
  const isGuest =
    typeof window !== "undefined" &&
    sessionStorage.getItem("is_guest") === "true";
  const isLoggedIn = status === "authenticated" && !isGuest;
  const _analysisData = useResultStore((state) => state.analysisResult);
  let analysisData: any = null;
  const imageUrl = useResultStore((state) => state.imageUrl);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);
  const isZh = language === "zh";

  // 根據 session 決定 user 物件（包含訪客和會員）
  const user =
    isLoggedIn && session?.user
      ? {
          id: (session.user as any).id, // 在[...nextauth] 設定的 token.sub
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
          provider: "google", // 之後如果加了 email 登入，這裡可以動態區分
        }
      : null;

  useEffect(() => {
    const stored = sessionStorage.getItem("diagnosis_result");
    if (stored) {
      setResult(JSON.parse(stored));
    } else {
      router.push("/");
    }
  }, [router]);

  // 自動儲存：如果用戶已登入且尚未儲存
  // useEffect(() => {
  //   if (result && user && !isGuest && !autoSaved) {
  //     handleAutoSave();
  //   }
  // }, [result, user, isGuest, autoSaved]);

  useEffect(() => {
    if (!analysisData && !imageUrl) {
      console.log("No data found in Zustand, checking sessionStorage...");
      const stored = sessionStorage.getItem("diagnosis_result");
      if (!stored) router.push("/diagnosis");
    }
  }, [analysisData, imageUrl, router]);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>{isZh ? "載入中..." : "Loading..."}</p>
        </div>
      </div>
    );
  }

  if (_analysisData) {
    try {
      analysisData = JSON.parse(_analysisData);
      // console.log("Parsed analysis data", analysisData);
    } catch (e) {
      console.error("分析結果不是有效 JSON", e);
    }
  }

  const tongueData = getTongueData(analysisData.id);
  const displayName = isZh ? analysisData.name.zh : analysisData.name.en;
  const displayQuote = isZh ? analysisData.quote.zh : analysisData.quote.en;
  const displayDesc = isZh ? analysisData.desc.zh : analysisData.desc.en;
  const displayAdvice = isZh ? analysisData.advice.zh : analysisData.advice.en;
  const displayTongueBodyDesc = isZh
    ? analysisData.tongue_body_desc.zh
    : analysisData.tongue_body_desc.en;
  const displayTongueCoatingDesc = isZh
    ? analysisData.tongue_coating_desc.zh
    : analysisData.tongue_coating_desc.en;
  // const displayName = analysisData.name;
  // const displayQuote = analysisData.quote;
  // const displayDesc = analysisData.desc;
  // const displayAdvice = analysisData.advice;
  // const displayTongueBodyDesc = analysisData.tongue_body_desc;
  // const displayTongueCoatingDesc = analysisData.tongue_coating_desc;
  const displayFoods = tongueData.foods.map((food: any) => {
    return {
      id: food.id,
      name: isZh ? food.name.zh : food.name.en,
      benefit: isZh ? food.benefit.zh : food.benefit.en,
    };
  });

  const handleReturn = async () => {
    if (user) {
      // auto save
      // try {

      // } catch (error) {
      //   console.error("Failed to save guest history:", error);
      // }

      router.push("/home");
    } else {
      router.push("/");
    }
  };

  // const handleAutoSave = async () => {
  //   if (!user || !result) return;

  //   // Mock 模式下：儲存到 localStorage 的 tongue_history
  //   const useMockMode = process.env.NEXT_PUBLIC_USE_MOCK_MODE === 'true';
  //   if (useMockMode) {
  //     console.log('⚠️ Mock mode: Saving to localStorage');

  //     // 儲存到 localStorage (供 /trends 健康日誌使用)
  //     try {
  //       const history = localStorage.getItem('tongue_history');
  //       const records = history ? JSON.parse(history) : [];
  //       records.push({
  //         id: `record-${Date.now()}`,
  //         resultCode: result.result_code,
  //         timestamp: Date.now(),
  //         imageUrl: result.imageFile,
  //       });
  //       localStorage.setItem('tongue_history', JSON.stringify(records));
  //     } catch (error) {
  //       console.error('Failed to save to localStorage:', error);
  //     }

  //     setAutoSaved(true);
  //     console.log('✅ 自動儲存成功 (localStorage)');
  //     return;
  //   }

  //   setSaving(true);
  //   try {
  //     // 上傳圖片到 Supabase Storage
  //     const imageBlob = await (await fetch(result.imageFile)).blob();
  //     const fileName = `${user.id}/${Date.now()}.jpg`;
  //     const { data: uploadData, error: uploadError } = await supabase.storage
  //       .from('tongue-images')
  //       .upload(fileName, imageBlob, {
  //         contentType: 'image/jpeg',
  //       });

  //     if (uploadError) throw uploadError;

  //     // 取得公開 URL
  //     const { data: urlData } = supabase.storage
  //       .from('tongue-images')
  //       .getPublicUrl(fileName);

  //     // 儲存到 History 表
  //     const { error: dbError } = await supabase
  //       .from('history')
  //       .insert({
  //         user_id: user.id,
  //         image_url: urlData.publicUrl,
  //         result_code: result.result_code,
  //       });

  //     if (dbError) throw dbError;

  //     setAutoSaved(true);
  //     console.log('✅ 自動儲存成功');
  //   } catch (error) {
  //     console.error('Auto-save error:', error);
  //     // 自動儲存失敗不顯示錯誤，用戶仍可手動儲存
  //   } finally {
  //     setSaving(false);
  //   }
  // };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);

    try {
      if (isLoggedIn) {
        // 會員：呼叫後端 API
        const response = await fetch("/api/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            diagnosisData: analysisData,
            imageUrl: imageUrl,
          }),
        });

        if (!response.ok) throw new Error("Save to cloud failed");

        alert(isZh ? "已成功儲存" : "Saved Successfully");
      } else {
        // 訪客：維持原本的 LocalStorage 邏輯
        if (result) {
          localStorage.setItem(
            "pending_save_result",
            JSON.stringify({
              result_code: result.result_code,
              confidence: result.confidence,
              imageFile: result.imageFile,
              timestamp: Date.now(),
            }),
          );
        }

        if (
          confirm(
            isZh
              ? "儲存記錄需要登入，是否要登入？"
              : "Saving records requires login. Would you like to sign in?",
          )
        ) {
          router.push("/auth/choose");
        }
      }
      setAutoSaved(true);
    } catch (err) {
      console.error(err);
      alert("Error saving data");
    } finally {
      setSaving(false);
    }
  };

  const handleTestAgain = () => {
    router.push("/diagnosis");
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="w-full p-4 flex items-center justify-between">
        <button
          onClick={handleReturn}
          className="p-2 hover:bg-brand/10 rounded-lg transition-colors text-brand-muted"
        >
          <ArrowLeft size={24} />
        </button>
        {/* 只在訪客模式下顯示語言切換器 */}
        {isGuest && <LanguageSwitcher />}
        {/* 會員模式下保持對稱 */}
        {!isGuest && <div className="w-10"></div>}
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Image Preview - User's Photo and Reference Tongue Image */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* User's Photo */}
            <div className="text-center">
              <p className="text-sm text-text-secondary mb-2">
                {isZh ? "您的舌頭照片" : "Your Tongue Photo"}
              </p>
              <div className="w-full max-w-xs mx-auto aspect-square">
                <img
                  src={result.imageFile}
                  alt={isZh ? "舌頭照片" : "Tongue image"}
                  className="w-full h-full rounded-lg border-2 border-gray-200 object-cover"
                />
              </div>
            </div>

            {/* Reference Tongue Image */}
            <div className="text-center">
              <p className="text-sm text-text-secondary mb-2">
                {isZh ? "參考舌像" : "Reference Tongue"}
              </p>
              <div className="w-full max-w-xs mx-auto aspect-square">
                <img
                  src={getTongueImage(analysisData.id, analysisData.name)}
                  alt={displayName}
                  className="w-full h-full rounded-lg border-2 border-gray-200 object-cover"
                  onError={(e) => {
                    const imagePath = getTongueImage(
                      analysisData.id,
                      analysisData.name,
                    );
                    console.error("Failed to load tongue image:", imagePath);
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Diagnosis Result */}
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">{displayName}</h1>
            <p className="text-lg text-gray-600">{displayDesc}</p>
          </div>

          {/* Quote */}
          <div className="bg-brand/10 border-l-4 border-brand p-4 rounded">
            <p className="text-lg italic text-gray-800">{displayQuote}</p>
          </div>

          {/* Advice */}
          <div className="pt-4">
            <h2 className="text-xl font-semibold mb-2">
              {isZh ? "健康建議" : "Health Advice"}
            </h2>
            <p className="text-gray-700">{displayAdvice}</p>
          </div>

          {isLoggedIn && (
            <>
              {/* Tongue Analysis */}
              <div className="pt-4">
                <h2 className="text-xl font-semibold mb-2">
                  {isZh ? "舌體分析" : "Tongue Body Analysis"}
                </h2>
                <p className="text-gray-700">{displayTongueBodyDesc}</p>
              </div>

              <div className="pt-4">
                <h2 className="text-xl font-semibold mb-2">
                  {isZh ? "舌苔分析" : "Tongue Coating Analysis"}
                </h2>
                <p className="text-gray-700">{displayTongueCoatingDesc}</p>
              </div>
            </>
          )}
        </div>

        {/* Food Recommendations */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">
            {isZh ? "推薦食物" : "Recommended Foods"}
          </h2>

          <div className="space-y-4">
            {tongueData.foods.map((food, index) => {
              const foodName = isZh ? food.name.zh : food.name.en;
              const foodNameEn = food.name.en;
              const foodNameZh = food.name.zh;

              // 嘗試多種匹配方式（優先順序：當前語言 > 英文 > 中文）
              let foodImage = getFoodImage(foodName);
              if (!foodImage) {
                foodImage = getFoodImage(foodNameEn);
              }
              if (!foodImage) {
                foodImage = getFoodImage(foodNameZh);
              }


              return (
                <div
                  key={index}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white flex items-center space-x-4"
                >
                  {/* 左側：圖片 */}
                  <div className="w-20 h-20 flex-shrink-0">
                    {foodImage ? (
                      <img
                        src={foodImage}
                        alt={foodName}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          console.error(
                            "Failed to load food image:",
                            foodImage,
                          );
                          // 載入失敗時顯示一個預設的食物圖片（使用第一個食物圖片作為預設）
                          const defaultImage =
                            "/assets/images/Foods/1. Lotus.png";
                          if (
                            (e.target as HTMLImageElement).src !== defaultImage
                          ) {
                            (e.target as HTMLImageElement).src = defaultImage;
                          } else {
                            // 如果預設圖片也載入失敗，隱藏圖片
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-xs text-gray-400 text-center px-2">
                          {foodName}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 右側：名稱和功效 */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-primary-dark mb-1">
                      {foodName}
                    </h3>
                    <p className="text-sm text-text-secondary">
                      {isZh ? food.benefit.zh : food.benefit.en}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          {isLoggedIn && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 px-6 bg-brand text-white rounded-full font-semibold hover:opacity-90 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <Save size={20} />
              <span>
                {saving
                  ? isZh
                    ? "儲存中..."
                    : "Saving..."
                  : isZh
                    ? "儲存到歷史記錄"
                    : "Save to History"}
              </span>
            </button>
          )}

          <button
            onClick={handleTestAgain}
            className="flex-1 py-3 px-6 bg-brand-muted text-white rounded-full font-semibold hover:opacity-90 transition-colors flex items-center justify-center space-x-2"
          >
            <RotateCcw size={20} />
            <span>{isZh ? "再次檢測" : "Test Again"}</span>
          </button>
        </div>
      </main>
    </div>
  );
}

// { "name" : { "S" : "舌淡白" }, "id" : { "S" : "pale" }, "quote" : { "S" : "看起來有點虛，不妨多補充溫暖食物與休息🛌" }, "advice" : { "S" : "舌淡白常與氣血不足有關，適合溫補、健脾的食物，幫助提升體力與循環。" }, "desc" : { "S" : "虛寒體質、循環較弱" } }
