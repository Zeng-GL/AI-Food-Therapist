"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Camera, X, RotateCcw, Check, Upload } from "lucide-react";
import { useLanguageStore } from "@/store/use-language-store";
import {
  validateImageFile,
  compressImage,
  blobToFile,
} from "@/lib/image-utils";
import { sendGAEvent } from '@next/third-parties/google'

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
    ctx.scale(-1, 1);
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();

    setCapturedImage(canvas.toDataURL("image/jpeg", 0.9));
    // 發送 GA 事件：使用者點擊了拍照
    sendGAEvent('event', 'camera_capture', {
      event_category: 'engagement',
      event_label: 'user_took_photo'
    });
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
  // const handleAnalyze = async () => {
  //   stopCamera();

  //   if (!capturedImage) return;
  //   setIsCompressing(true);
  //   setError(null);

  //   try {
  //     const response = await fetch(capturedImage);
  //     const blob = await response.blob();
  //     const originalFile = new File([blob], "tongue.jpg", {
  //       type: "image/jpeg",
  //     });

  //     const validation = validateImageFile(originalFile);
  //     if (!validation.valid) {
  //       setError(validation.error || "Invalid image");
  //       setIsCompressing(false);
  //       return;
  //     }

  //     const compressedBlob = await compressImage(originalFile);
  //     const compressedFile = blobToFile(
  //       compressedBlob,
  //       "tongue-compressed.jpg",
  //     );

  //     setIsCompressing(false);
  //     onCapture(compressedFile);
  //   } catch (err) {
  //     console.error("Error processing image:", err);
  //     setError(
  //       isZh
  //         ? "圖片處理失敗，請重試"
  //         : "Image processing failed, please try again",
  //     );
  //     setIsCompressing(false);
  //   }
  // };
  const handleAnalyze = async () => {
  stopCamera();
  if (!capturedImage) return;
  setIsCompressing(true);
  setError(null);

  try {
    // 1. 建立一個虛擬的 Image 物件來讀取目前的預覽圖
    const img = new Image();
    img.src = capturedImage;
    await new Promise((resolve) => (img.onload = resolve));

    // 2. 建立一個新的隱藏 Canvas 用於裁切
    const cropCanvas = document.createElement("canvas");
    const cropCtx = cropCanvas.getContext("2d");
    if (!cropCtx) throw new Error("Canvas context failed");

    // 設定輸出的尺寸（例如固定 640x640，這對 AI 分析來說通常足夠且清晰）
    const outputSize = 640;
    cropCanvas.width = outputSize;
    cropCanvas.height = outputSize;

    // 3. 計算裁切區域 (以中央為準，取 1/1.5 倍的範圍，對應 scale-150)
    const scaleFactor = 1.5; // 這邊要對應你視覺上的 scale-150
    const sourceSize = Math.min(img.width, img.height) / scaleFactor;
    const sourceX = (img.width - sourceSize) / 2;
    const sourceY = (img.height - sourceSize) / 2;

    // 4. 執行裁切繪製
    cropCtx.drawImage(
      img,
      sourceX, sourceY, sourceSize, sourceSize, // 來源：中央部分
      0, 0, outputSize, outputSize             // 目標：填滿新畫布
    );

    // 5. 將裁切後的 Canvas 轉為 Blob
    const croppedBlob = await new Promise<Blob | null>((resolve) =>
      cropCanvas.toBlob((b) => resolve(b), "image/jpeg", 0.9)
    );

    if (!croppedBlob) throw new Error("Blob conversion failed");

    // 6. 包裝成檔案並傳給後端/AI
    const croppedFile = new File([croppedBlob], "tongue-cropped.jpg", {
      type: "image/jpeg",
    });

    onCapture(croppedFile);
    setIsCompressing(false);
  } catch (err) {
    console.error("Error cropping image:", err);
    setError(isZh ? "圖片處理失敗" : "Image processing failed");
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
            {/* 圖片容器：設定固定最大寬度與方形比例，並裁切超出部分 */}
            <div className="relative w-full max-w-xs aspect-square rounded-lg border-2 border-white/20 overflow-hidden shadow-2xl">
              <img
                src={capturedImage}
                alt={isZh ? "拍攝的舌頭照片" : "Captured tongue"}
                /* 關鍵：object-cover 填滿，scale-150 放大聚焦中央 */
                className="w-full h-full object-cover object-center scale-150 transition-transform duration-300"
              />

              {/* 選項：可以在預覽圖上加一個淡淡的引導線，讓使用者確認位置是否正確 */}
              <div className="absolute inset-0 border border-white/10 pointer-events-none"></div>
            </div>

            {/* Action Buttons */}
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
