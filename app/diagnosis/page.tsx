"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DisclaimerModal from "@/components/DisclaimerModal";
import CameraCapture from "@/components/CameraCapture";
import { useLanguageStore } from "@/store/use-language-store";
import { useSession } from "next-auth/react";
import { useResultStore } from "@/store/use-result-store";

type Step = "disclaimer" | "camera" | "analyzing";

export default function DiagnosisPage() {
  const router = useRouter();
  const { language } = useLanguageStore();
  const { data: session, status } = useSession();
  
  // ✅ 修正：改用 State 並在 useEffect 讀取，避免編譯時 ReferenceError: sessionStorage is not defined
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [step, setStep] = useState<Step>("disclaimer");
  const [analysisStep, setAnalysisStep] = useState<string>("");
  const setAnalysisData = useResultStore((state) => state.setAnalysisData);
  const isZh = language === "zh";

  const isLoggedIn = status === "authenticated" && !isGuest;

  useEffect(() => {
    // ✅ 確保只在瀏覽器端讀取
    const guestStatus = typeof window !== "undefined" && sessionStorage.getItem("is_guest") === "true";
    setIsGuest(guestStatus);
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

      sessionStorage.setItem(
        "diagnosis_result",
        JSON.stringify({
          result_code: data.result.result_code,
          confidence: data.result.confidence,
          imageFile: viewUrl,
        }),
      );

      router.push("/result");
    } catch (error) {
      console.error("Process error:", error);
      alert(isZh ? "處理失敗：" + (error as Error).message : "Failed: " + (error as Error).message);
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
              if (typeof window !== "undefined") sessionStorage.removeItem("is_guest");
              router.push("/");
            }
          }}
        />
      )}
      {step === "analyzing" && (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xl font-semibold">{analysisStep || (isZh ? "處理中..." : "Processing...")}</p>
          </div>
        </div>
      )}
    </div>
  );
}
// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import DisclaimerModal from "@/components/DisclaimerModal";
// import CameraCapture from "@/components/CameraCapture";
// import { useLanguageStore } from "@/store/use-language-store";
// // import { useAuthStore } from '@/store/use-auth-store';
// import { useSession } from "next-auth/react";
// import { useResultStore } from "@/store/use-result-store";
// // import { analyzeTongue } from '@/lib/api';

// type Step = "disclaimer" | "camera" | "analyzing";

// export default function DiagnosisPage() {
//   const router = useRouter();
//   const { language } = useLanguageStore();
//   const { data: session, status } = useSession();
//   const isGuest = sessionStorage.getItem("is_guest") === "true";
//   const isLoggedIn = status === "authenticated" && !isGuest;
//   const [step, setStep] = useState<Step>("disclaimer");
//   const [analysisStep, setAnalysisStep] = useState<string>("");
//   const setAnalysisData = useResultStore((state) => state.setAnalysisData);
//   const isZh = language === "zh";

//   useEffect(() => {
//     console.log("status:", status);
//     console.log("session:", session);
//   });

//   // 檢查已登入用戶是否已經同意過免責聲明
//   useEffect(() => {
//     if (status === "authenticated") {
//       const hasAgreed = localStorage.getItem("disclaimer_agreed");
//       if (hasAgreed === "true") {
//         setStep("camera");
//       }
//     }
//   }, [status]);

//   const handleDisclaimerAgree = () => {
//     if (status === "authenticated") {
//       localStorage.setItem("disclaimer_agreed", "true");
//     }
//     setStep("camera");
//   };

//   const handleCapture = async (file: File) => {
//     setStep("analyzing");

//     try {
//       // --- 步驟 1: 取得預簽名網址 ---
//       setAnalysisStep(isZh ? "正在準備上傳..." : "Preparing upload...");
//       const resAuth = await fetch("/api/s3_upload", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ fileType: file.type }),
//       });
//       if (!resAuth.ok) throw new Error("Failed to get signed URL");

//       const { uploadUrl, viewUrl, key } = await resAuth.json();

//       // --- 步驟 2: 直接上傳檔案到 S3 ---
//       setAnalysisStep(isZh ? "正在上傳圖片..." : "Uploading image...");
//       const uploadRes = await fetch(uploadUrl, {
//         method: "PUT",
//         body: file,
//         headers: { "Content-Type": file.type },
//         mode: "cors",
//       });

//       if (!uploadRes.ok) {
//         const errorText = await uploadRes.text();
//         console.error("S3 詳細錯誤訊息:", errorText);
//         throw new Error(`S3 上傳失敗 (${uploadRes.status})`);
//       }

//       // --- 步驟 3: 呼叫 OpenAI API 分析 ---
//       setAnalysisStep(isZh ? "AI 正在分析您的舌象..." : "AI is analyzing...");
//       const resAnalysis = await fetch("/api/analyze", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           imageUrl: viewUrl, // 傳遞 S3 網址
//         }),
//       });

//       if (!resAnalysis.ok) throw new Error("AI Analysis Failed");

//       const data = await resAnalysis.json();

//       // --- 步驟 4: 儲存結果並導航 ---
//       // sessionStorage.setItem('diagnosis_result', JSON.stringify({
//       //   result_code: result.result_code || 'SUCCESS',
//       //   analysis: result.analysis, // 來自 OpenAI 的回覆
//       //   imageFile: await fileToBase64(file), // 預覽用
//       // }));
//       setAnalysisData(data.result, key);

//       sessionStorage.setItem(
//         "diagnosis_result",
//         JSON.stringify({
//           result_code: data.result.result_code,
//           confidence: data.result.confidence,
//           imageFile: viewUrl, // 使用 S3 網址
//         }),
//       );

//       router.push("/result");
//     } catch (error) {
//       console.error("Process error:", error);
//       alert(
//         isZh
//           ? "處理失敗：" + (error as Error).message
//           : "Failed: " + (error as Error).message,
//       );
//       setStep("camera");
//     }
//   };

//   const fileToBase64 = (file: File): Promise<string> => {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.onload = () => resolve(reader.result as string);
//       reader.onerror = reject;
//       reader.readAsDataURL(file);
//     });
//   };

//   if (status === "loading") {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
//         <div className="animate-pulse">Loading...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-900">
//       {step === "disclaimer" && (
//         <DisclaimerModal
//           isOpen={true}
//           onClose={() => router.push(isLoggedIn ? "/home" : "/")}
//           onAgree={handleDisclaimerAgree}
//         />
//       )}

//       {step === "camera" && (
//         <CameraCapture
//           onCapture={handleCapture}
//           onClose={() => {
//             if (isLoggedIn) {
//               router.push("/home");
//             } else {
//               sessionStorage.removeItem("is_guest"); // 離開時清掉
//               router.push("/");
//             }
//           }}
//         />
//       )}

//       {step === "analyzing" && (
//         <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
//           <div className="text-center space-y-6">
//             <div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto"></div>
//             <p className="text-xl font-semibold">
//               {analysisStep || (isZh ? "處理中..." : "Processing...")}
//             </p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
