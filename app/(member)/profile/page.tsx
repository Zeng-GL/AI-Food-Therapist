"use client";

import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import {
  useOnboardingStore,
  type HealthGoal,
  type Allergy,
  type MedicalCondition,
} from "@/store/use-onboarding-store";
import { useLanguageStore } from "@/store/use-language-store";
import { onboardingText } from "@/lib/onboarding-i18n";
import { User, Edit, LogOut, Globe, ChevronRight } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";

  // ── store 欄位和 action 分開取，避免 stale closure ──────────────────
  const profile = useOnboardingStore();
  const updateProfile = useOnboardingStore((state) => state.updateProfile);

  const { language, setLanguage } = useLanguageStore();
  const isZh = language === "zh";

  // ── 從 DB 拉最新 profile ─────────────────────────────────────────────
  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/user/profile");
        if (!res.ok) return;

        const { profile: dbProfile } = await res.json();
        if (!dbProfile) return;

        console.log("DB profile:", dbProfile);

        updateProfile({
          gender: dbProfile.gender ?? null,
          ageGroup: dbProfile.ageGroup ?? null,
          primaryGoals: dbProfile.primaryGoals ?? [],
          sleepHabit: dbProfile.sleepHabit ?? null,
          stressLevel: dbProfile.stressLevel ?? 0,
          allergies: dbProfile.allergies ?? [],
          dietType: dbProfile.dietType ?? "General",
          medicalConditions: dbProfile.medicalConditions ?? [],
          customAllergy: dbProfile.customAllergy ?? "",
          customDietType: dbProfile.customDietType ?? "",
          customMedicalCondition: dbProfile.customMedicalCondition ?? "",
        });
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };

    fetchProfile();
  }, [status, updateProfile]);

  const handleEditProfile = () => {
    router.push("/profile/health-profile");
  };

  const handleLogout = async () => {
    if (
      confirm(isZh ? "確定要登出嗎？" : "Are you sure you want to delete your account? This action will also delete your health records and cannot be undone. Please confirm carefully before proceeding.")
    ) {
      try {
        await signOut({ callbackUrl: "/", redirect: true });
      } catch (error) {
        console.error("Logout Error:", error);
      }
    }
  };

  const handleDeleteAccount = async () => {
    // if (!confirm("確定要刪除這筆紀錄嗎？")) return;
    if (
      confirm(isZh ? "確定要刪除帳號嗎？此操作會一併刪除您的健康紀錄，且無法回復，請再三確認再執行此動作" : "Are you sure you want to log out?")
    ) {
      try {
        // 呼叫帳號軟刪除 API
        const res = await fetch("/api/user/profile", { method: "DELETE" });

        if (res.ok) {
          alert(isZh ? "帳號及健康紀錄已成功刪除":"Sucessfully delete your account and health record");
          // 必須在 API 完成後才執行 signOut
          await signOut({ callbackUrl: "/" });
        }
      } catch (error) {
        console.error("註銷失敗", error);
      }
    } else {
      return;
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "zh" : "en");
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="bg-brand text-white px-6 py-8 rounded-b-3xl shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden border-4 border-white/30">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={40} className="text-white" />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">
              {session?.user?.name || "User"}
            </h1>
            <p className="text-white/80 text-sm mt-1">
              {session?.user?.email || "user@example.com"}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Health Profile */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">
              {isZh ? "健康檔案" : "Health Profile"}
            </h2>
            <button
              onClick={handleEditProfile}
              className="text-brand-muted font-medium text-sm flex items-center space-x-1 hover:opacity-80"
            >
              <Edit size={16} />
              <span>{isZh ? "編輯" : "Edit"}</span>
            </button>
          </div>

          <div className="p-5 space-y-4">
            <ProfileItem
              label={onboardingText.q1.genderLabel[language]}
              value={
                profile.gender
                  ? onboardingText.q1.genderOptions[profile.gender][language]
                  : "-"
              }
            />
            <ProfileItem
              label={onboardingText.q1.ageLabel[language]}
              value={
                profile.ageGroup
                  ? onboardingText.q1.ageOptions[profile.ageGroup][language]
                  : "-"
              }
            />
            <ProfileItem
              label={onboardingText.q2.title[language]}
              value={
                profile.primaryGoals.length > 0
                  ? profile.primaryGoals
                      .map(
                        (goal) =>
                          onboardingText.q2.options[goal as HealthGoal][
                            language
                          ],
                      )
                      .join(", ")
                  : "-"
              }
            />
            <ProfileItem
              label={onboardingText.q3.sleepLabel[language]}
              value={
                profile.sleepHabit
                  ? onboardingText.q3.sleepOptions[profile.sleepHabit][language]
                  : "-"
              }
            />
            <ProfileItem
              label={onboardingText.q3.stressLabel[language]}
              value={`${getStressEmoji(profile.stressLevel)} ${isZh ? "等級" : "Level"} ${profile.stressLevel}`}
            />
            <ProfileItem
              label={onboardingText.q4.allergiesLabel[language]}
              value={
                profile.allergies.length > 0
                  ? profile.allergies
                      .map(
                        (a) =>
                          onboardingText.q4.allergiesOptions[a as Allergy][
                            language
                          ],
                      )
                      .join(", ")
                  : "-"
              }
            />
            <ProfileItem
              label={onboardingText.q4.dietLabel[language]}
              value={onboardingText.q4.dietOptions[profile.dietType][language]}
            />
            <ProfileItem
              label={onboardingText.q4.medicalLabel[language]}
              value={
                profile.medicalConditions.length > 0
                  ? profile.medicalConditions
                      .map(
                        (m) =>
                          onboardingText.q4.medicalOptions[
                            m as MedicalCondition
                          ][language],
                      )
                      .join(", ")
                  : "-"
              }
            />
          </div>
        </div>

        {/* App Settings */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">
              {isZh ? "App 設定" : "App Settings"}
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            <button
              onClick={toggleLanguage}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-brand/5 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Globe size={20} className="text-gray-600" />
                <span className="text-gray-800 font-medium">
                  {isZh ? "語言" : "Language"}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600 text-sm">
                  {language === "en" ? "English" : "中文"}
                </span>
                <ChevronRight size={16} className="text-gray-400" />
              </div>
            </button>
          </div>
        </div>

        {/* Account Management */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">
              {isZh ? "帳號管理" : "Account Management"}
            </h2>
          </div>
          {/* <div className="p-5">
            <button
              onClick={handleDeleteAccount}
              className="w-full py-3 px-4 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-colors flex items-center justify-center space-x-2"
            >
              <LogOut size={20} />
              <span>{isZh ? "刪除帳號資料" : "Log Out"}</span>
            </button>
          </div> */}
          <div className="p-5">
            <button
              onClick={handleLogout}
              className="w-full py-3 px-4 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-colors flex items-center justify-center space-x-2"
            >
              <LogOut size={20} />
              <span>{isZh ? "登出" : "Log Out"}</span>
            </button>
          </div>
        </div>

        {/* App Info */}
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">AI Food Therapist v1.0.0</p>
          <p className="text-xs text-gray-400 mt-1">
            {isZh
              ? "基於中醫舌診的智能食療助手"
              : "AI-powered tongue diagnosis & food therapy"}
          </p>
        </div>
      </div>
    </div>
  );
}

function ProfileItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start">
      <dt className="text-sm text-gray-600 flex-shrink-0 w-1/3">{label}</dt>
      <dd className="text-sm font-medium text-gray-800 flex-1 text-right">
        {value}
      </dd>
    </div>
  );
}

function getStressEmoji(level: number): string {
  const emojis = ["😌", "😊", "😐", "😟", "😰"];
  return emojis[level - 1] || "😐";
}
