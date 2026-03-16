"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOnboardingStore, SleepHabit } from "@/store/use-onboarding-store";
import { useLanguageStore } from "@/store/use-language-store";
import { onboardingText } from "@/lib/onboarding-i18n";
import { ChevronLeft } from "lucide-react";
import { useSaveProfile } from "@/hooks/use-save-profile";

export default function EditLifestyle() {
  const router = useRouter();
  const {
    sleepHabit: initialSleep,
    stressLevel: initialStress,
    updateProfile,
  } = useOnboardingStore();
  const { saveProfile } = useSaveProfile();
  const { language } = useLanguageStore();
  const isZh = language === "zh";
  const q3 = onboardingText.q3;

  const [sleepHabit, setSleepHabit] = useState<SleepHabit | null>(initialSleep);
  const [stressLevel, setStressLevel] = useState(initialStress);

  const sleepOptions: SleepHabit[] = ["Regular", "Late_night", "Insufficient"];

  const handleSave = async() => {
    updateProfile({ sleepHabit, stressLevel });
    await saveProfile({ sleepHabit, stressLevel });
    router.push("/profile/health-profile");
  };

  const isValid = sleepHabit !== null && stressLevel >= 1 && stressLevel <= 5;

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
              {isZh ? "生活型態" : "Lifestyle"}
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
      <div className="flex-1 px-6 py-6 space-y-8">
        {/* Sleep Habit */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">
            {q3.sleepLabel[language]}
          </label>
          <div className="space-y-3">
            {sleepOptions.map((option) => (
              <button
                key={option}
                onClick={() => setSleepHabit(option)}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  sleepHabit === option
                    ? "border-brand bg-brand/10"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                style={
                  sleepHabit === option
                    ? {
                        borderColor: "#6C9A5D",
                        backgroundColor: "rgba(108,154,93,0.1)",
                      }
                    : {}
                }
              >
                <div
                  className={`font-medium ${
                    sleepHabit === option ? "text-brand-muted" : "text-gray-800"
                  }`}
                  style={sleepHabit === option ? { color: "#6C9A5D" } : {}}
                >
                  {q3.sleepOptions[option][language]}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {q3.sleepSubtitle[option][language]}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Stress Level */}
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-gray-700">
            {q3.stressLabel[language]}
          </label>

          {/* Stress Level Slider */}
          <div className="space-y-4">
            <input
              type="range"
              min="1"
              max="5"
              value={stressLevel}
              onChange={(e) => setStressLevel(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand"
              style={{
                accentColor: "#6C9A5D",
              }}
            />

            {/* Stress Level Indicator */}
            <div className="flex justify-between text-xs text-gray-500">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`text-center ${
                    stressLevel === level ? "font-bold" : ""
                  }`}
                  style={stressLevel === level ? { color: "#4DB6AC" } : {}}
                >
                  <div className="text-2xl mb-1">{getStressEmoji(level)}</div>
                  <div>{level}</div>
                </div>
              ))}
            </div>

            {/* Current Selection */}
            {/* <div className="text-center p-4 bg-surface rounded-xl">
              <div className="text-3xl mb-2">{getStressEmoji(stressLevel)}</div>
              <div className="text-sm font-medium text-gray-700">
                {
                  q3.stressLevels[stressLevel as keyof typeof q3.stressLevels][language]
                }
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function
function getStressEmoji(level: number): string {
  const emojis = ["😌", "😊", "😐", "😟", "😰"];
  return emojis[level - 1] || "😐";
}
