"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import LoginModal from "@/components/LoginModal";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguageStore } from "@/store/use-language-store";

export default function HomePage() {
  const router = useRouter();
  const { language } = useLanguageStore();
  // const { isLoggedIn } = useAuthStore();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isZh = language === "zh";

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // If already logged in, redirect to member home
  // useEffect(() => {
  //   if (mounted && isLoggedIn) {
  //     router.push('/home');
  //   }
  // }, [mounted, isLoggedIn, router]);

  const handleStartDiagnosis = () => {
    console.log("Start diagnosis clicked"); // Debug log
    setShowLoginModal(true);
  };

  const handleGuestContinue = () => {
    console.log("Guest continue clicked"); // Debug log
    // Guest mode - go directly to diagnosis
    router.push("/diagnosis");
  };

  const handleModalClose = () => {
    console.log("Modal close clicked"); // Debug log
    setShowLoginModal(false);
  };

  // Show loading state during hydration
  if (!mounted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#FDF8F7" }}
      >
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#6C9A5D] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#4F6D50]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FDF8F7" }}>
      {/* Header */}
      <header className="w-full px-4 py-4 flex justify-end">
        <LanguageSwitcher />
      </header>

      {/* Hero: 左文右圖（大螢幕）/ 上圖下文（小螢幕） */}
      <main className="flex flex-col md:flex-row md:items-center md:justify-center md:min-h-[calc(100vh-120px)] md:gap-10 lg:gap-16 px-4 pb-8 md:px-8 max-w-6xl md:mx-auto">
        {/* 文字區 - 左側（桌面） / 上方（手機先顯示插畫再文字，或反過來：手機先文字再圖） */}
        <div className="flex-1 order-2 md:order-1 flex flex-col justify-center text-center md:text-left md:max-w-md">
          <h1
            className="text-3xl md:text-4xl lg:text-[2.5rem] font-bold leading-tight"
            style={{ color: "#4F6D50" }}
          >
            {isZh ? "日常健康舌診" : "Daily Health Tongue Check"}
          </h1>
          <p
            className="mt-3 text-lg md:text-xl font-medium"
            style={{ color: "#5a7d5b" }}
          >
            {isZh
              ? "隨時隨地，關愛自己"
              : "Anytime, anywhere, care for yourself"}
          </p>
          <p className="mt-2 text-sm" style={{ color: "#6b8a6c" }}>
            {isZh
              ? "中醫舌診 · 個人化飲食建議"
              : "TCM tongue diagnosis · Personalized food tips"}
          </p>
          <div className="mt-6 md:mt-8">
            <button
              onClick={handleStartDiagnosis}
              className="w-full md:w-auto md:px-10 py-3.5 text-white text-lg font-semibold rounded-full transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
              style={{ backgroundColor: "#6C9A5D" }}
            >
              {isZh ? "開始檢測" : "Start to checkup"}
            </button>
          </div>
        </div>

        {/* 插畫區 - 右側（桌面）/ 上方（手機先看到圖） */}
        <div className="flex-1 order-1 md:order-2 flex items-center justify-center py-6 md:py-0">
          <div className="relative w-full max-w-sm md:max-w-md">
            <Image
              src="/assets/images/hero-friendly-tongue-health.png"
              alt={
                isZh
                  ? "日常舌診，關愛自己"
                  : "Daily tongue check, care for yourself"
              }
              width={400}
              height={400}
              className="w-full h-auto object-contain drop-shadow-sm"
              priority
            />
          </div>
        </div>
      </main>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={handleModalClose}
        onGuestContinue={handleGuestContinue}
      />
    </div>
  );
}
