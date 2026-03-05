"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOnboardingStore, HealthGoal } from "@/store/use-onboarding-store";
import { useLanguageStore } from "@/store/use-language-store";
import { onboardingText } from "@/lib/onboarding-i18n";
import { ChevronLeft, Check } from "lucide-react";
import { useSaveProfile } from "@/hooks/use-save-profile";

export default function EditHealthGoals() {
  const router = useRouter();
  const { primaryGoals: initialGoals, updateProfile } = useOnboardingStore();
  const { saveProfile } = useSaveProfile();
  const { language } = useLanguageStore();
  const isZh = language === "zh";
  const q2 = onboardingText.q2;

  const [goals, setGoals] = useState<HealthGoal[]>(initialGoals);

  const goalOptions: HealthGoal[] = [
    "sleep_quality",
    "digestion",
    "fatigue_relief",
    "skin_health",
    "general_wellness",
  ];

  const toggleGoal = (goal: HealthGoal) => {
    if (goals.includes(goal)) {
      setGoals(goals.filter((g) => g !== goal));
    } else {
      if (goals.length < 2) {
        setGoals([...goals, goal]);
      }
    }
  };

  const handleSave = async () => {
    updateProfile({ primaryGoals: goals });
    await saveProfile({ primaryGoals: goals });
    router.push("/profile/health-profile");
  };

  const isValid = goals.length >= 1 && goals.length <= 2;

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => router.push("/profile/health-profile")}
              className="mr-3 text-gray-600 hover:text-gray-800"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-xl font-bold text-gray-800">
              {isZh ? "健康目標" : "Health Goals"}
            </h1>
          </div>
          <button
            onClick={handleSave}
            disabled={!isValid}
            className="text-brand-muted font-semibold text-base disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ color: isValid ? "#6C9A5D" : undefined }}
          >
            {isZh ? "儲存" : "Save"}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-semibold text-gray-700">
              {q2.subtitle[language]}
            </label>
            <span className="text-sm font-medium" style={{ color: "#6C9A5D" }}>
              {q2.selected[language](goals.length)}
            </span>
          </div>

          <div className="space-y-3">
            {goalOptions.map((goal) => {
              const isSelected = goals.includes(goal);
              const isDisabled = !isSelected && goals.length >= 2;

              return (
                <button
                  key={goal}
                  onClick={() => toggleGoal(goal)}
                  disabled={isDisabled}
                  className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                    isSelected
                      ? "border-brand bg-brand/10"
                      : isDisabled
                        ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                        : "border-gray-200 hover:border-gray-300"
                  }`}
                  style={
                    isSelected
                      ? {
                          borderColor: "#6C9A5D",
                          backgroundColor: "rgba(108,154,93,0.1)",
                        }
                      : {}
                  }
                >
                  <span
                    className={`text-base font-medium ${
                      isSelected ? "text-brand-muted" : "text-gray-700"
                    }`}
                    style={isSelected ? { color: "#6C9A5D" } : {}}
                  >
                    {q2.options[goal][language]}
                  </span>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full flex items-center justify-center bg-brand text-white">
                      <Check size={16} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
