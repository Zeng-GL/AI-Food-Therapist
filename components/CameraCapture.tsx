"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Camera, X, RotateCcw, Check, Upload } from "lucide-react";
import { useLanguageStore } from "@/store/use-language-store";
import {
  validateImageFile,
  compressImage,
  blobToFile,
} from "@/lib/image-utils";

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export default function CameraCapture({
  onCapture,
  onClose,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { language } = useLanguageStore();
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const isZh = language === "zh";

  // ── 停止相機：直接操作 ref，不依賴 state ─────────────────────────────
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, []);

  // ── 啟動相機 ─────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    // 先確保舊的 stream 已停止
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setError(null);
    setIsStreaming(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      // 確認 component 還存在（避免 async race condition）
      if (!videoRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      videoRef.current.srcObject = stream;

      await videoRef.current.play();
      setIsStreaming(true);
    } catch (err) {
      console.error("Camera error:", err);
      setError(
        isZh
          ? "無法存取相機，請檢查權限設定"
          : "Cannot access camera, please check permissions",
      );
    }
  }, [isZh]);

  // ── Mount / Unmount ───────────────────────────────────────────────────
  useEffect(() => {
    startCamera();

    // beforeunload 保險：瀏覽器關閉或重整時也停相機
    const handleUnload = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      // Component unmount（路由離開、登出等）時停相機
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []); // 只執行一次

  // ── 關閉：先停相機再呼叫 onClose ─────────────────────────────────────
  const handleClose = useCallback(() => {
    stopCamera();
    onClose();
  }, [stopCamera, onClose]);

  // ── 拍照 ─────────────────────────────────────────────────────────────
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.save();
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();

    setCapturedImage(canvas.toDataURL("image/jpeg", 0.9));
  };

  // ── 重拍：停舊 stream 再重啟 ─────────────────────────────────────────
  const handleRetake = () => {
    setCapturedImage(null);
    setError(null);
    setIsCompressing(false);
    startCamera();
  };

  // ── 上傳圖片 ─────────────────────────────────────────────────────────
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    stopCamera();

    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || "Invalid image");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => setCapturedImage(e.target?.result as string);
    reader.onerror = () =>
      setError(isZh ? "讀取檔案失敗" : "Failed to read file");
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  // ── 分析：停相機 → 壓縮 → 回傳 ─────────────────────────────────────
  const handleAnalyze = async () => {
    stopCamera();

    if (!capturedImage) return;
    setIsCompressing(true);
    setError(null);

    try {
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const originalFile = new File([blob], "tongue.jpg", {
        type: "image/jpeg",
      });

      const validation = validateImageFile(originalFile);
      if (!validation.valid) {
        setError(validation.error || "Invalid image");
        setIsCompressing(false);
        return;
      }

      const compressedBlob = await compressImage(originalFile);
      const compressedFile = blobToFile(
        compressedBlob,
        "tongue-compressed.jpg",
      );

      setIsCompressing(false);
      onCapture(compressedFile);
    } catch (err) {
      console.error("Error processing image:", err);
      setError(
        isZh
          ? "圖片處理失敗，請重試"
          : "Image processing failed, please try again",
      );
      setIsCompressing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="relative w-full h-full flex flex-col">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-black/50 p-4 flex items-center justify-between">
          <button
            onClick={handleClose}
            className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
            aria-label={isZh ? "關閉" : "Close"}
          >
            <X size={24} />
          </button>
          <h2 className="text-white font-semibold">
            {isZh ? "拍攝舌頭" : "Capture Tongue"}
          </h2>
          <div className="w-10" />
        </div>

        {/* Camera Preview */}
        {!capturedImage && (
          <div className="flex-1 relative flex items-center justify-center overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />

            {/* Tongue Guide Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <svg
                viewBox="0 0 200 300"
                className="w-64 h-96 opacity-60"
                style={{
                  filter: "drop-shadow(0 0 10px rgba(255,255,255,0.5))",
                }}
              >
                <path
                  d="M 100 50 
                     Q 140 60, 160 90
                     Q 180 120, 175 150
                     Q 170 180, 160 200
                     Q 150 220, 130 240
                     Q 110 250, 100 250
                     Q 90 250, 70 240
                     Q 50 220, 40 200
                     Q 30 180, 25 150
                     Q 20 120, 40 90
                     Q 60 60, 100 50 Z"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeDasharray="12,6"
                  strokeLinecap="round"
                />
                <line
                  x1="100"
                  y1="80"
                  x2="100"
                  y2="220"
                  stroke="white"
                  strokeWidth="2"
                  strokeDasharray="8,4"
                  opacity="0.5"
                />
                <line
                  x1="60"
                  y1="150"
                  x2="140"
                  y2="150"
                  stroke="white"
                  strokeWidth="2"
                  strokeDasharray="8,4"
                  opacity="0.5"
                />
              </svg>
            </div>

            {/* Bottom Buttons */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center space-x-4">
              {/* Upload */}
              <label className="w-16 h-16 bg-brand rounded-full border-4 border-white flex items-center justify-center shadow-2xl hover:opacity-90 cursor-pointer">
                <Upload size={24} className="text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Capture */}
              <button
                onClick={capturePhoto}
                disabled={!isStreaming}
                className="w-20 h-20 bg-white rounded-full border-4 border-gray-300 flex items-center justify-center shadow-2xl hover:scale-105 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={isZh ? "拍攝" : "Capture"}
              >
                {isStreaming ? (
                  <Camera size={32} className="text-gray-800" />
                ) : (
                  <div className="w-8 h-8 border-4 border-gray-600 border-t-transparent rounded-full animate-spin" />
                )}
              </button>

              <div className="w-16" />
            </div>
          </div>
        )}

        {/* Captured Image Preview */}
        {capturedImage && (
          <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <img
                src={capturedImage}
                alt={isZh ? "拍攝的舌頭照片" : "Captured tongue"}
                // className="max-w-full max-h-full object-contain"
                className="w-full h-full object-cover object-center"
                style={{ maxHeight: "calc(100vh - 200px)" }}
              />
            </div>

            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center space-x-4">
              <button
                onClick={handleRetake}
                disabled={isCompressing}
                className="px-5 py-2 bg-white/90 rounded-full flex items-center space-x-1.5 text-sm font-semibold hover:bg-white transition-colors disabled:opacity-50"
              >
                <RotateCcw size={18} />
                <span>{isZh ? "重拍" : "Retake"}</span>
              </button>

              <button
                onClick={handleAnalyze}
                disabled={isCompressing}
                className="px-5 py-2 bg-brand text-white rounded-full flex items-center space-x-1.5 text-sm font-semibold hover:opacity-90 transition-colors disabled:opacity-50"
              >
                {isCompressing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{isZh ? "處理中..." : "Processing..."}</span>
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    <span>{isZh ? "分析" : "Analyze"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[100] bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg max-w-[90vw] text-center">
            {error}
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

// "use client";

// import { useRef, useState, useEffect } from "react";
// import { Camera, X, RotateCcw, Check, Upload } from "lucide-react";
// import { useLanguageStore } from "@/store/use-language-store";
// import {
//   validateImageFile,
//   compressImage,
//   blobToFile,
// } from "@/lib/image-utils";

// interface CameraCaptureProps {
//   onCapture: (file: File) => void;
//   onClose: () => void;
// }

// export default function CameraCapture({
//   onCapture,
//   onClose,
// }: CameraCaptureProps) {
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const streamRef = useRef<MediaStream | null>(null);
//   const { language } = useLanguageStore();
//   const [isStreaming, setIsStreaming] = useState(false);
//   const [capturedImage, setCapturedImage] = useState<string | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [isCompressing, setIsCompressing] = useState(false);
//   const [videoReady, setVideoReady] = useState(false);
//   const isZh = language === "zh";

//   useEffect(() => {
//     startCamera();
//     return () => {
//       if (streamRef.current) {
//         streamRef.current.getTracks().forEach((track) => track.stop());
//         streamRef.current = null;
//       }
//     };
//   }, []);

//   // 備用機制：確保按鈕會顯示
//   useEffect(() => {
//     if (videoRef.current && !capturedImage) {
//       const checkVideo = setInterval(() => {
//         if (videoRef.current && videoRef.current.readyState >= 2) {
//           setIsStreaming(true);
//           setVideoReady(true);
//           clearInterval(checkVideo);
//         }
//       }, 100);

//       return () => clearInterval(checkVideo);
//     }
//   }, [capturedImage]);

//   useEffect(() => {
//     const handleUnload = () => {
//       if (streamRef.current) {
//         streamRef.current.getTracks().forEach((track) => track.stop());
//       }
//     };
//     window.addEventListener("beforeunload", handleUnload);
//     return () => window.removeEventListener("beforeunload", handleUnload);
//   }, []);

//   const startCamera = async () => {
//     try {
//       setError(null); // 清除之前的錯誤
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: {
//           facingMode: "user",
//           width: { ideal: 1280 },
//           height: { ideal: 720 },
//         },
//       });

//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//         streamRef.current = stream;

//         // 多個事件監聽確保狀態更新
//         const video = videoRef.current;

//         const setReady = () => {
//           setIsStreaming(true);
//           setVideoReady(true);
//         };

//         video.onloadedmetadata = setReady;
//         video.oncanplay = setReady;
//         video.onplaying = setReady;

//         // 如果已經有 metadata，直接設置
//         if (video.readyState >= 2) {
//           setReady();
//         }

//         // 備用：延遲檢查
//         setTimeout(() => {
//           if (video.readyState >= 2) {
//             setReady();
//           }
//         }, 500);
//       }
//     } catch (err) {
//       console.error("Error accessing camera:", err);
//       setError(
//         isZh
//           ? "無法存取相機，請檢查權限設定"
//           : "Cannot access camera, please check permissions",
//       );
//       // 即使有錯誤，也確保按鈕顯示（上傳功能仍可用）
//     }
//   };

//   const stopCamera = () => {
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach((track) => track.stop());
//       streamRef.current = null;
//     }
//     setIsStreaming(false);
//   };

//   const capturePhoto = () => {
//     if (!videoRef.current || !canvasRef.current) return;

//     const video = videoRef.current;
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");

//     if (!ctx) return;

//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;
//     ctx.drawImage(video, 0, 0);

//     const imageDataUrl = canvas.toDataURL("image/jpeg", 0.9);
//     setCapturedImage(imageDataUrl);
//     // 不停止相機，讓用戶可以繼續拍攝
//   };

//   const handleRetake = () => {
//     setCapturedImage(null);
//     setError(null);
//     setIsCompressing(false);

//     // 確保視頻元素正確顯示
//     if (videoRef.current && streamRef.current) {
//       // 如果視頻流還在，確保它正確連接到視頻元素
//       if (videoRef.current.srcObject !== streamRef.current) {
//         videoRef.current.srcObject = streamRef.current;
//       }
//       // 確保視頻正在播放
//       videoRef.current.play().catch((err) => {
//         console.error("Error playing video after retake:", err);
//       });
//     } else if (!isStreaming) {
//       // 如果相機已停止，重新啟動
//       startCamera();
//     } else {
//       // 如果狀態不一致，重新啟動相機
//       stopCamera();
//       setTimeout(() => {
//         startCamera();
//       }, 100);
//     }
//   };

//   const handleFileUpload = async (
//     event: React.ChangeEvent<HTMLInputElement>,
//   ) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     // 驗證檔案
//     const validation = validateImageFile(file);
//     if (!validation.valid) {
//       setError(validation.error || "Invalid image");
//       return;
//     }

//     // 讀取檔案為 Data URL
//     const reader = new FileReader();
//     reader.onload = (e) => {
//       const result = e.target?.result as string;
//       setCapturedImage(result);
//     };
//     reader.onerror = () => {
//       setError(isZh ? "讀取檔案失敗" : "Failed to read file");
//     };
//     reader.readAsDataURL(file);

//     // 重置 input
//     event.target.value = "";
//   };

//   const handleAnalyze = async () => {
//     if (!capturedImage || !canvasRef.current) return;

//     stopCamera();
//     setIsCompressing(true);
//     setError(null);

//     try {
//       // 將 Data URL 轉換為 Blob
//       const response = await fetch(capturedImage);
//       const blob = await response.blob();
//       const originalFile = new File([blob], "tongue.jpg", {
//         type: "image/jpeg",
//       });

//       // 驗證檔案
//       const validation = validateImageFile(originalFile);
//       if (!validation.valid) {
//         setError(validation.error || "Invalid image");
//         setIsCompressing(false);
//         return;
//       }

//       // 壓縮圖片
//       const compressedBlob = await compressImage(originalFile);
//       const compressedFile = blobToFile(
//         compressedBlob,
//         "tongue-compressed.jpg",
//       );

//       setIsCompressing(false);
//       onCapture(compressedFile);
//     } catch (err) {
//       console.error("Error processing image:", err);
//       setError(
//         isZh
//           ? "圖片處理失敗，請重試"
//           : "Image processing failed, please try again",
//       );
//       setIsCompressing(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 bg-black">
//       <div className="relative w-full h-full flex flex-col">
//         {/* Header */}
//         <div className="absolute top-0 left-0 right-0 z-10 bg-black/50 p-4 flex items-center justify-between">
//           <button
//             onClick={() => {
//               stopCamera();
//               onClose();
//             }}
//             className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
//             aria-label={isZh ? "關閉" : "Close"}
//           >
//             <X size={24} />
//           </button>
//           <h2 className="text-white font-semibold">
//             {isZh ? "拍攝舌頭" : "Capture Tongue"}
//           </h2>
//           <div className="w-10" /> {/* Spacer */}
//         </div>

//         {/* Camera Preview */}
//         {!capturedImage && (
//           <div className="flex-1 relative flex items-center justify-center overflow-hidden">
//             <video
//               ref={videoRef}
//               autoPlay
//               playsInline
//               muted
//               className="w-full h-full object-cover"
//               onLoadedMetadata={() => {
//                 setIsStreaming(true);
//                 setVideoReady(true);
//               }}
//               onCanPlay={() => {
//                 setIsStreaming(true);
//                 setVideoReady(true);
//               }}
//               onPlaying={() => {
//                 setIsStreaming(true);
//                 setVideoReady(true);
//               }}
//               onError={(e) => {
//                 console.error("Video error:", e);
//                 setError(
//                   isZh
//                     ? "視頻載入錯誤，請重試"
//                     : "Video loading error, please retry",
//                 );
//               }}
//             />

//             {/* Tongue Overlay Guide - 更真實的舌頭形狀 */}
//             <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
//               <svg
//                 viewBox="0 0 200 300"
//                 className="w-64 h-96 opacity-60"
//                 style={{
//                   filter: "drop-shadow(0 0 10px rgba(255,255,255,0.5))",
//                 }}
//               >
//                 {/* 舌頭形狀路徑 - 更接近真實舌頭輪廓 */}
//                 <path
//                   d="M 100 50
//                      Q 140 60, 160 90
//                      Q 180 120, 175 150
//                      Q 170 180, 160 200
//                      Q 150 220, 130 240
//                      Q 110 250, 100 250
//                      Q 90 250, 70 240
//                      Q 50 220, 40 200
//                      Q 30 180, 25 150
//                      Q 20 120, 40 90
//                      Q 60 60, 100 50 Z"
//                   fill="none"
//                   stroke="white"
//                   strokeWidth="3"
//                   strokeDasharray="12,6"
//                   strokeLinecap="round"
//                 />
//                 {/* 中央對焦線 */}
//                 <line
//                   x1="100"
//                   y1="80"
//                   x2="100"
//                   y2="220"
//                   stroke="white"
//                   strokeWidth="2"
//                   strokeDasharray="8,4"
//                   opacity="0.5"
//                 />
//                 <line
//                   x1="60"
//                   y1="150"
//                   x2="140"
//                   y2="150"
//                   stroke="white"
//                   strokeWidth="2"
//                   strokeDasharray="8,4"
//                   opacity="0.5"
//                 />
//               </svg>
//             </div>

//             {/* Capture Button and Upload Button - 固定在底部，始終顯示 */}
//             <div
//               className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[100] flex items-center space-x-4"
//               style={{ position: "fixed" }}
//             >
//               {/* Upload Button - 始終可用 */}
//               <label className="w-16 h-16 bg-brand rounded-full border-4 border-white flex items-center justify-center shadow-2xl hover:opacity-90 transition-colors cursor-pointer">
//                 <Upload size={24} className="text-white" />
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={handleFileUpload}
//                   className="hidden"
//                 />
//               </label>

//               {/* Capture Button */}
//               <button
//                 onClick={capturePhoto}
//                 disabled={
//                   !isStreaming &&
//                   !videoReady &&
//                   !(videoRef.current && videoRef.current.readyState >= 2)
//                 }
//                 className="w-20 h-20 bg-white rounded-full border-4 border-gray-300 flex items-center justify-center shadow-2xl hover:scale-105 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
//                 aria-label={isZh ? "拍攝" : "Capture"}
//                 style={{ backgroundColor: "white" }}
//               >
//                 {isStreaming ||
//                 videoReady ||
//                 (videoRef.current && videoRef.current.readyState >= 2) ? (
//                   <Camera size={32} className="text-gray-800" />
//                 ) : (
//                   <div className="w-8 h-8 border-4 border-gray-600 border-t-transparent rounded-full animate-spin" />
//                 )}
//               </button>

//               {/* Spacer for symmetry */}
//               <div className="w-16" />
//             </div>

//             {/* Error Message - 顯示在按鈕上方 */}
//             {error && (
//               <div className="fixed bottom-32 left-1/2 transform -translate-x-1/2 z-[100]">
//                 <div className="bg-error text-white px-6 py-3 rounded-lg text-center shadow-lg">
//                   {error}
//                 </div>
//               </div>
//             )}
//           </div>
//         )}

//         {/* Captured Image Preview */}
//         {capturedImage && (
//           <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden">
//             {/* Preview Image Container - 確保圖片不會超出視圖 */}
//             <div className="absolute inset-0 flex items-center justify-center p-4">
//               <img
//                 src={capturedImage}
//                 alt={isZh ? "拍攝的舌頭照片" : "Captured tongue"}
//                 className="max-w-full max-h-full w-auto h-auto object-contain"
//                 style={{
//                   maxWidth: "100%",
//                   maxHeight: "calc(100vh - 200px)", // 為按鈕和 header 留出空間
//                   width: "auto",
//                   height: "auto",
//                 }}
//               />
//             </div>

//             {/* Action Buttons - 使用 fixed 定位確保始終可見 */}
//             <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[100] flex items-center space-x-4">
//               {/* Retake Button */}
//               <button
//                 onClick={handleRetake}
//                 disabled={isCompressing}
//                 className="px-5 py-2 bg-white/90 rounded-full flex items-center space-x-1.5 text-sm font-semibold hover:bg-white transition-colors disabled:opacity-50"
//               >
//                 <RotateCcw size={18} />
//                 <span>{isZh ? "重拍" : "Retake"}</span>
//               </button>

//               {/* Analyze Button */}
//               <button
//                 onClick={handleAnalyze}
//                 disabled={isCompressing}
//                 className="px-5 py-2 bg-brand text-white rounded-full flex items-center space-x-1.5 text-sm font-semibold hover:opacity-90 transition-colors disabled:opacity-50"
//               >
//                 {isCompressing ? (
//                   <>
//                     <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                     <span>{isZh ? "處理中..." : "Processing..."}</span>
//                   </>
//                 ) : (
//                   <>
//                     <Check size={18} />
//                     <span>{isZh ? "分析" : "Analyze"}</span>
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Error Message - 使用 fixed 定位確保始終可見 */}
//         {error && (
//           <div className="fixed bottom-32 left-1/2 transform -translate-x-1/2 z-[100] bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg max-w-[90vw] text-center">
//             {error}
//           </div>
//         )}
//       </div>

//       {/* Hidden Canvas for Capture */}
//       <canvas ref={canvasRef} className="hidden" />
//     </div>
//   );
// }
