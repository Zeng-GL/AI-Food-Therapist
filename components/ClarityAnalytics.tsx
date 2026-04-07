"use client"; // 必須標記為客戶端元件

import { useEffect } from "react";
import Clarity from "@microsoft/clarity";

export default function ClarityAnalytics() {
  const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

  useEffect(() => {
    // 確保只在瀏覽器端執行
    if (projectId && typeof window !== "undefined") {
      Clarity.init(projectId);
    }
  }, []);

  return null; // 這個元件不需要渲染任何東西
}
