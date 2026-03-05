# AI Food Therapist - Tongue Diagnosis Prototype

一個基於 Web 的 AI 舌診健康助理原型，使用 Next.js 14 開發。

## 功能特色

- 📸 手機相機拍攝舌頭照片
- 🤖 AI 分析 7 種舌頭類型
- 🍎 提供個人化食物推薦
- 📊 歷史紀錄追蹤（需登入）
- 🌐 中英雙語支援
- 👤 Guest 模式（無需註冊即可使用）

## 技術棧

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Auth & DB**: Supabase
- **State**: Zustand

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 設置環境變數

複製 `.env.local.example` 為 `.env.local` 並填入你的 Supabase 配置：

```bash
cp .env.local.example .env.local
```

### 3. 運行開發伺服器

```bash
npm run dev
```

打開 [http://localhost:3000](http://localhost:3000) 查看應用。

## 專案結構

```
├── app/                    # Next.js App Router
│   ├── page.tsx           # Landing Page
│   ├── diagnosis/         # 診斷流程頁面
│   ├── result/            # 結果頁面
│   └── history/           # 歷史紀錄頁面
├── components/            # React 組件
├── lib/                   # 工具函數和配置
│   ├── supabase.ts       # Supabase 客戶端
│   ├── tongue-data.ts    # 舌頭類型資料
│   └── i18n.ts           # 國際化配置
├── hooks/                 # Custom Hooks
└── store/                 # Zustand 狀態管理
```

## 開發模式

預設使用 Mock 模式（`NEXT_PUBLIC_USE_MOCK_MODE=true`），會返回隨機的診斷結果，無需連接真實的 Python 後端。

要使用真實 API，請：
1. 設置 `PYTHON_API_URL`
2. 設置 `NEXT_PUBLIC_USE_MOCK_MODE=false`

## 部署

推薦使用 Vercel 部署：

```bash
vercel
```

## 相關文件

- [PRD&SPEC.md](./PRD&SPEC.md) - 產品需求文件
- [7 Tongues.md](./7%20Tongues.md) - 技術規格
- [Disclaimer.md](./Disclaimer.md) - 免責聲明

