"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DisclaimerModal from "@/components/DisclaimerModal";
import CameraCapture from "@/components/CameraCapture";
import { useLanguageStore } from "@/store/use-language-store";
import { useSession } from "next-auth/react";
import { useResultStore } from "@/store/use-result-store";
import { sendGAEvent } from '@next/third-parties/google'

type Step = "disclaimer" | "camera" | "analyzing";

export const dynamic = "force-dynamic";

export default function DiagnosisPage() {
  const router = useRouter();
  const { language } = useLanguageStore();
  const { data: session, status } = useSession();

  // ✅ 防護 1：將所有狀態初始化為安全值
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [step, setStep] = useState<Step>("disclaimer");
  const [analysisStep, setAnalysisStep] = useState<string>("");
  const setAnalysisData = useResultStore((state) => state.setAnalysisData);
  const isZh = language === "zh";

  // ✅ 防護 2：isLoggedIn 也要依賴 isGuest 這個 state，而不是直接讀取 sessionStorage
  const isLoggedIn = status === "authenticated" && !isGuest;

  useEffect(() => {
    // ✅ 防護 3：所有 sessionStorage 的讀取必須「嚴格」限制在 useEffect 內部
    if (typeof window !== "undefined") {
      const guestStatus = sessionStorage.getItem("is_guest") === "true";
      setIsGuest(guestStatus);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      const hasAgreed = localStorage.getItem("disclaimer_agreed");
      if (hasAgreed === "true") {
        setStep("camera");
      }
    }
  }, [status]);

  const handleDisclaimerAgree = () => {
    if (status === "authenticated") {
      localStorage.setItem("disclaimer_agreed", "true");
    }
    setStep("camera");
  };

  const handleCapture = async (file: File) => {
    setStep("analyzing");
    try {
      setAnalysisStep(isZh ? "正在準備上傳..." : "Preparing upload...");
      const resAuth = await fetch("/api/s3_upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileType: file.type }),
      });
      if (!resAuth.ok) throw new Error("Failed to get signed URL");

      const { uploadUrl, viewUrl, key } = await resAuth.json();

      setAnalysisStep(isZh ? "正在上傳圖片..." : "Uploading image...");
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
        mode: "cors",
      });

      if (!uploadRes.ok) throw new Error(`S3 上傳失敗 (${uploadRes.status})`);

      setAnalysisStep(isZh ? "AI 正在分析您的舌象..." : "AI is analyzing...");
      const resAnalysis = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: viewUrl }),
      });

      if (!resAnalysis.ok) throw new Error("AI Analysis Failed");

      const data = await resAnalysis.json();
      setAnalysisData(data.result, key);

      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "diagnosis_result",
          JSON.stringify({
            result_code: data.result.result_code,
            confidence: data.result.confidence,
            imageFile: viewUrl,
          }),
        );
      }

      // 發送 GA 事件：使用者點擊了拍照
      sendGAEvent("event", "analyze_image", {
        event_category: "engagement",
        event_label: "user_analyzed_image",
      });

      router.push("/result");
    } catch (error) {
      console.error("Process error:", error);
      alert(
        isZh
          ? "處理失敗：" + (error as Error).message
          : "Failed: " + (error as Error).message,
      );
      setStep("camera");
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {step === "disclaimer" && (
        <DisclaimerModal
          isOpen={true}
          onClose={() => router.push(isLoggedIn ? "/home" : "/")}
          onAgree={handleDisclaimerAgree}
        />
      )}
      {step === "camera" && (
        <CameraCapture
          onCapture={handleCapture}
          onClose={() => {
            if (isLoggedIn) {
              router.push("/home");
            } else {
              if (typeof window !== "undefined") {
                sessionStorage.removeItem("is_guest");
              }
              router.push("/");
            }
          }}
        />
      )}
      {step === "analyzing" && (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xl font-semibold">
              {analysisStep || (isZh ? "處理中..." : "Processing...")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
