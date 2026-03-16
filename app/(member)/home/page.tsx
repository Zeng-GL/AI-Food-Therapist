"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useOnboardingStore } from "@/store/use-onboarding-store";
import { useLanguageStore } from "@/store/use-language-store";
import Image from "next/image";
import { Camera, TrendingUp } from "lucide-react";
import {
  getRecommendedFoods,
  getRecommendationReason,
  FilteredFoodRecommendation,
} from "@/lib/food-recommendation-engine";
import type { OnboardingProfile } from "@/store/use-onboarding-store";
import { getTongueData, TongueType } from "@/lib/tongue-data";
import { getTongueImage } from "@/lib/image-mapping";
import { getFoodImage } from "@/lib/image-mapping";

interface HistoryRecord {
  resultCode: TongueType;
  name: { zh: string; en: string };
  timestamp: number;
  imageUrl?: string;
  food_list: Array<Object>;
}

export const dynamic = "force-dynamic";

export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const userProfile = useOnboardingStore();
  const { language } = useLanguageStore();
  const isZh = language === "zh";

  const [latestScan, setLatestScan] = useState<HistoryRecord | null>(null);
  const [hasScanToday, setHasScanToday] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const user =
    isLoggedIn && session?.user
      ? { id: (session.user as any).id, name: session.user.name }
      : null;

  // ── 登入後初始化：檢查 onboarding + 拉最新紀錄 ──────────────────────────
  useEffect(() => {
    const isGuest = sessionStorage.getItem("is_guest") === "true";
    if (isGuest) {
      router.push("/");
    }
  }, []);

  useEffect(() => {
    if (status !== "authenticated" || !user) return;

    const init = async () => {
      try {
        // 1. 檢查 onboarding 是否完成
        const profileRes = await fetch("/api/user/profile");
        if (profileRes.ok) {
          const { onboardingCompleted, profile } = await profileRes.json();

          if (!onboardingCompleted && !userProfile.isCompleted) {
            router.push("/onboarding");
            return;
          }

          // 把 DB 資料同步進 Zustand store
          if (profile) {
            userProfile.updateProfile({
              gender: profile.gender ?? null,
              ageGroup: profile.ageGroup ?? null,
              primaryGoals: profile.primaryGoals ?? [],
              sleepHabit: profile.sleepHabit ?? null,
              stressLevel: profile.stressLevel ?? 0,
              allergies: profile.allergies ?? [],
              dietType: profile.dietType ?? "General",
              medicalConditions: profile.medicalConditions ?? [],
              customAllergy: profile.customAllergy ?? "",
              customDietType: profile.customDietType ?? "",
              customMedicalCondition: profile.customMedicalCondition ?? "",
            });
          }
        }

        // 2. 拉最新一筆 history
        const historyRes = await fetch("/api/history/latest");
        if (historyRes.ok) {
          const { item } = await historyRes.json();
          if (item) {
            const record: HistoryRecord = {
              resultCode: item.result.id as TongueType,
              name: item.result.name,
              timestamp: item.createdAt
                ? new Date(item.createdAt).getTime()
                : Date.now(),
              imageUrl: getTongueImage(
                item.result.id,
                getTongueData(item.result.id).name,
              ),
              food_list: item.result?.foods ?? [],
            };
            console.log(record);
            setLatestScan(record);
            setHasScanToday(isToday(record.timestamp));
          }
        }
      } catch (err) {
        console.error("Home init error:", err);
      } finally {
        setPageLoading(false);
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return isZh ? "早安" : "Good morning";
    if (hour < 18) return isZh ? "午安" : "Good afternoon";
    return isZh ? "晚安" : "Good evening";
  };

  const recommendedFoods = latestScan
    ? getRecommendedFoods(
        latestScan.resultCode,
        userProfile.isCompleted ? userProfile : null,
        3,
      )
    : [];

  // ── Guards ───────────────────────────────────────────────────────────────
  if (status === "loading" || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Greeting */}
      <div className="bg-brand text-white px-6 py-8 rounded-b-3xl shadow-sm">
        <h1 className="text-2xl font-bold mb-2">
          {getGreeting()}, {session?.user?.name || "User"}!
        </h1>
        <p className="text-white/90">
          {isZh ? "今天感覺如何？" : "How are you feeling today?"}
        </p>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Scan Button */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => router.push("/diagnosis")}
            className="w-32 h-32 rounded-full bg-brand shadow-lg flex flex-col items-center justify-center transition-transform hover:scale-105 active:scale-95 text-white"
          >
            <Camera size={40} />
            <span className="text-sm font-semibold mt-2">
              {isZh ? "開始舌診" : "Start Scan"}
            </span>
          </button>

          {hasScanToday && latestScan ? (
            <p className="mt-3 text-xs text-gray-500 text-center">
              {isZh ? "上次檢測：今日 " : "Last scan: Today "}
              {new Date(latestScan.timestamp).toLocaleTimeString(
                isZh ? "zh-TW" : "en-US",
                { hour: "2-digit", minute: "2-digit" },
              )}
            </p>
          ) : (
            <p className="mt-3 text-sm text-gray-600 text-center">
              {isZh ? "你今天還沒拍照記錄喔！" : "You haven't scanned today!"}
            </p>
          )}
        </div>

        {/* Latest Scan */}
        {latestScan && (
          <div className="bg-white rounded-2xl shadow-md p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-800">
                {isZh ? "最近一次檢測" : "Your Latest Result"}
              </h2>
              <button
                onClick={() => router.push("/trends")}
                className="text-sm text-brand-muted font-medium flex items-center space-x-1"
              >
                <span>{isZh ? "查看詳情" : "View Details"}</span>
                <TrendingUp size={16} />
              </button>
            </div>
            <LatestScanCard scan={latestScan} language={language} />
          </div>
        )}

        {/* Food Recommendations */}
        {recommendedFoods.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md p-5">
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              {isZh ? "今日為您推薦" : "Today's Food for You"}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {isZh ? "根據您的最新體質" : "Based on your latest result"}
            </p>
            <div className="space-y-3">
              {recommendedFoods.map((food, index) => (
                <FoodCard
                  key={index}
                  food={food}
                  userProfile={userProfile.isCompleted ? userProfile : null}
                  language={language}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!latestScan && (
          <div className="bg-white rounded-2xl shadow-md p-8 text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {isZh
                ? "歡迎！開始您的第一次檢測"
                : "Welcome! Let's start your first scan"}
            </h3>
            <p className="text-gray-600 mb-6">
              {isZh
                ? "發現您的體質，獲得個人化食療建議"
                : "Discover your constitution and get personalized food recommendations"}
            </p>
            <div className="grid grid-cols-3 gap-4 mt-6">
              {[
                {
                  src: "/assets/images/icon-quick-scan.png",
                  label: isZh ? "快速檢測" : "Quick Scan",
                },
                {
                  src: "/assets/images/icon-track-progress.png",
                  label: isZh ? "追蹤進度" : "Track Progress",
                },
                {
                  src: "/assets/images/icon-personalized-foods.png",
                  label: isZh ? "個人化食療" : "Personalized Foods",
                },
              ].map(({ src, label }) => (
                <div key={label} className="text-center">
                  <div className="w-14 h-14 mx-auto mb-2">
                    <Image
                      src={src}
                      alt={label}
                      width={56}
                      height={56}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-xs text-gray-600">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Health Tip */}
        <div className="bg-brand/5 rounded-2xl p-5 border border-brand/10">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">💡</div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-800 mb-1">
                {isZh ? "健康小知識" : "Health Tip"}
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {isZh
                  ? "定期進行舌診可以幫助您了解身體狀態的變化，建議每週檢測 1-2 次。"
                  : "Regular tongue diagnosis helps you track changes in your body. We recommend scanning 1-2 times per week."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function LatestScanCard({
  scan,
  language,
}: {
  scan: HistoryRecord;
  language: "en" | "zh";
}) {
  const isZh = language === "zh";
  return (
    <div className="flex items-center space-x-4 p-3 bg-surface rounded-xl border border-gray-100">
      <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
        {scan.imageUrl ? (
          <img
            src={scan.imageUrl}
            alt={isZh ? "舌診照片" : "Tongue photo"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-brand/10">
            <span className="text-2xl">👅</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 mb-1">
          {new Date(scan.timestamp).toLocaleDateString(
            isZh ? "zh-TW" : "en-US",
            {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            },
          )}
        </p>
        {/* <p className="font-bold text-gray-800">{scan.resultCode}</p> */}
        <p className="font-bold text-gray-800">
          {isZh ? scan.name.zh : scan.name.en}
        </p>
      </div>
    </div>
  );
}

function FoodCard({
  food,
  userProfile,
  language,
}: {
  food: FilteredFoodRecommendation;
  userProfile: OnboardingProfile | null;
  language: "en" | "zh";
}) {
  const reason = getRecommendationReason(food, userProfile);
  const isZh = language === "zh";
  const foodName = isZh ? food.name.zh : food.name.en;
  const foodImage =
    getFoodImage(foodName) ||
    getFoodImage(food.name.en) ||
    getFoodImage(food.name.zh);

  return (
    <div className="flex items-center space-x-4 p-3 bg-surface rounded-xl border border-gray-100 hover:bg-brand/5 transition-colors">
      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
        {foodImage ? (
          <img
            src={foodImage}
            alt={foodName}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              (e.target as HTMLImageElement).parentElement!.innerHTML =
                '<span class="text-2xl">🥘</span>';
            }}
          />
        ) : (
          <span className="text-2xl">🥘</span>
        )}
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-gray-800 text-sm">
          {food.name[language]}
        </h4>
        <p className="text-xs text-gray-600 mt-0.5">{food.benefit[language]}</p>
        {reason && (
          <p className="text-xs text-brand-muted mt-1 font-medium">
            ✓ {reason[language]}
          </p>
        )}
      </div>
    </div>
  );
}

function isToday(timestamp: number): boolean {
  const today = new Date();
  const date = new Date(timestamp);
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}
