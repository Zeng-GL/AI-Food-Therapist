"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useLanguageStore } from "@/store/use-language-store";
import { getTongueData, TongueType } from "@/lib/tongue-data";
import { getTongueImage, getFoodImage } from "@/lib/image-mapping";

// 修正 Interface，使其符合 API 回傳與頁面渲染所需
interface DetailedRecord {
  id: string;
  resultCode: TongueType;
  name: { zh: string; en: string };
  quote: { zh: string; en: string };
  desc: { zh: string; en: string };
  advice: { zh: string; en: string };
  tongue_coating_desc: { zh: string; en: string };
  tongue_body_desc: { zh: string; en: string };
  foods: Array<Object>;
  imageUrl: string;
  createdAt: string;
}

export default function TrendsDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { language } = useLanguageStore();
  const [record, setRecord] = useState<DetailedRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const isZh = language === "zh";

  useEffect(() => {
    if (params.id) {
      loadRecord();
    }
  }, [params.id]);

  const loadRecord = async () => {
  try {
    setLoading(true);
    const response = await fetch(`/api/history/${params.id}`, { 
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      console.error("Record not found");
      router.push("/trends");
      return;
    }

    const data = await response.json();
    const found = data.item;

    if (found) {
      console.log(found);
      setRecord({
        id: found.historyId,
        resultCode: found.result.id,
        name: found.result.name,
        quote: found.result.quote,
        desc: found.result.desc,
        advice: found.result.advice,
        tongue_body_desc: found.result.tongue_body_desc,
        tongue_coating_desc: found.result.tongue_coating_desc,
        foods: found.result.foods,
        imageUrl: found.imageUrl || getTongueImage(found.result.id, found.result.name),
        createdAt: found.createdAt,
      });
    } else {
      router.push("/trends");
    }
  } catch (error) {
    console.error("Error fetching record:", error);
    router.push("/trends");
  } finally {
    setLoading(false);
  }
};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 如果載入完成但找不到 record，顯示錯誤
  if (!record) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="mb-4">{isZh ? "找不到紀錄" : "Record not found"}</p>
        <button
          onClick={() => router.push("/trends")}
          className="text-brand underline"
        >
          {isZh ? "返回列表" : "Back to Trends"}
        </button>
      </div>
    );
  }

  // 取得該舌象類型的詳細本地定義資料 (包含食物、建議等)
  const tongueData = getTongueData(record.resultCode);
  const displayName = isZh ? record.name.zh : record.name.en;
  const displayQuote = isZh ? record.quote.zh : record.quote.en;
  const displayDesc = isZh ? record.desc.zh : record.desc.en;
  const displayAdvice = isZh ? record.advice.zh : record.advice.en;
  const displayTongueBodyDesc = isZh
    ? record.tongue_body_desc.zh
    : record.tongue_body_desc.en;
  const displayTongueCoatingDesc = isZh
    ? record.tongue_coating_desc.zh
    : record.tongue_coating_desc.en;

  return (
    <div className="min-h-screen bg-surface pb-20">
      <header className="w-full p-4 flex items-center bg-white shadow-sm sticky top-0 z-10">
        <button
          onClick={() => router.push("/trends")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="ml-2 font-semibold text-lg">
          {isZh ? "檢測詳情" : "Diagnosis Detail"}
        </h1>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* 圖片對比區
        <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-center text-xs font-medium text-gray-500">
                {isZh ? "您的舌照" : "Your Photo"}
              </p>
              <div className="w-full max-w-xs mx-auto aspect-square rounded-lg border-2 border-gray-200 overflow-hidden">
                <img
                  src={record.imageUrl}
                  alt="User tongue"
                  className="w-full h-full object-cover object-center scale-150 transition-transform duration-300"
                />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-center text-xs font-medium text-gray-500">
                {isZh ? "參考舌像" : "Reference"}
              </p>
              <div className="aspect-square rounded-xl overflow-hidden border bg-gray-50">
                <img
                  src={getTongueImage(record.resultCode, tongueData.name)}
                  alt="Reference tongue"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div> */}
        {/* Image Preview - User's Photo and Reference Tongue Image */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* 使用 flex 並在 md 以上橫向排列，gap 保持一致 */}
          <div className="flex flex-col md:flex-row gap-8 items-start justify-center">
            {/* 左側：使用者照片 - 集中放大版 */}
            <div className="flex-1 w-full flex flex-col items-center">
              <p className="text-sm font-medium text-text-secondary mb-3">
                {isZh ? "您的舌頭照片" : "Your Tongue Photo"}
              </p>
              {/* 關鍵：使用 aspect-square 確保是正方形，w-full 配合 flex-1 確保左右容器等寬 */}
              <div className="w-full aspect-square max-w-[280px] rounded-xl border-2 border-brand/20 overflow-hidden shadow-inner bg-gray-50">
                <img
                  src={record.imageUrl}
                  alt="User tongue"
                  className="w-full h-full object-cover object-center scale-150"
                />
              </div>
            </div>

            {/* 右側：參考舌像 - 標準比例版 */}
            <div className="flex-1 w-full flex flex-col items-center">
              <p className="text-sm font-medium text-text-secondary mb-3">
                {isZh ? "參考舌像" : "Reference Tongue"}
              </p>
              {/* 這裡使用完全一樣的容器類別：w-full aspect-square max-w-[280px] */}
              <div className="w-full aspect-square max-w-[280px] rounded-xl border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50 shadow-sm">
                <img
                  src={getTongueImage(record.resultCode, tongueData.name)}
                  alt={displayName}
                  className="w-full h-full object-contain p-2" // 使用 object-contain 確保參考圖不被裁切且完整顯示
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 診斷結論 */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 space-y-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {displayName}
            </h2>
            <div className="inline-block px-3 py-1 bg-brand/10 text-brand text-sm rounded-full font-medium">
              {displayDesc}
            </div>
          </div>
          <div className="bg-surface p-4 rounded-xl italic text-gray-700 border-l-4 border-brand">
            「{displayQuote}」
          </div>
          <div className="pt-2">
            <h3 className="font-bold text-gray-900 mb-2">
              {isZh ? "健康建議" : "Advice"}
            </h3>
            <p className="text-gray-600 leading-relaxed">{displayAdvice}</p>
          </div>
          <div className="pt-2">
            <h3 className="text-xl font-semibold mb-2">
              {isZh ? "舌體分析" : "Tongue Body Analysis"}
            </h3>
            <p className="text-lg text-gray-600">{displayTongueBodyDesc}</p>
          </div>
          <div className="pt-2">
            <h3 className="text-xl font-semibold mb-2">
              {isZh ? "舌苔分析" : "Tongue Coating Analysis"}
            </h3>
            <p className="text-lg text-gray-600">{displayTongueCoatingDesc}</p>
          </div>
        </div>

        {/* 食療建議 */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold px-1">
            {isZh ? "食療推薦" : "Food Therapy"}
          </h3>
          <div className="grid gap-4">
            {tongueData.foods.map((food, idx) => {
              const name = isZh ? food.name.zh : food.name.en;
              const benefit = isZh ? food.benefit.zh : food.benefit.en;
              const foodImg =
                getFoodImage(name) ||
                getFoodImage(food.name.en) ||
                "/assets/images/Foods/default.png";

              return (
                <div
                  key={idx}
                  className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4"
                >
                  <img
                    src={foodImg}
                    alt={name}
                    className="w-16 h-16 rounded-lg object-cover bg-gray-50"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{name}</h4>
                    <p className="text-sm text-gray-500">{benefit}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
