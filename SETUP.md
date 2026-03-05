# 設置指南 / Setup Guide

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 設置環境變數

複製 `.env.local.example` 為 `.env.local`：

```bash
cp .env.local.example .env.local
```

編輯 `.env.local` 並填入你的配置：

```env
# Supabase Configuration (必需)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Python Backend API (可選，用於真實 API 模式)
PYTHON_API_URL=your_python_backend_url
PYTHON_API_KEY=your_api_key

# Mock Mode (預設為 true，使用模擬資料)
NEXT_PUBLIC_USE_MOCK_MODE=true
```

### 3. Supabase 設置

#### 3.1 建立資料表

在 Supabase SQL Editor 中執行以下 SQL：

```sql
-- Users 表（通常 Supabase Auth 會自動建立，但確保有以下欄位）
-- 如果需要額外欄位，可以建立 profiles 表

-- History 表
CREATE TABLE IF NOT EXISTS history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  result_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_history_user_id ON history(user_id);
CREATE INDEX IF NOT EXISTS idx_history_created_at ON history(created_at DESC);

-- 啟用 Row Level Security
ALTER TABLE history ENABLE ROW LEVEL SECURITY;

-- 建立 RLS Policy：用戶只能看到自己的記錄
CREATE POLICY "Users can view own history"
  ON history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history"
  ON history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own history"
  ON history FOR DELETE
  USING (auth.uid() = user_id);
```

#### 3.2 建立 Storage Bucket

1. 在 Supabase Dashboard 中進入 Storage
2. 建立新的 Bucket，名稱：`tongue-images`
3. 設定為 Public（或設定適當的 RLS Policy）
4. 建立 Storage Policy：

```sql
-- 允許用戶上傳自己的圖片
CREATE POLICY "Users can upload own images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'tongue-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 允許用戶讀取自己的圖片
CREATE POLICY "Users can view own images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'tongue-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

#### 3.3 啟用 Google OAuth

1. 在 Supabase Dashboard 中進入 Authentication > Providers
2. 啟用 Google Provider
3. 填入 Google OAuth Client ID 和 Secret
4. 設定 Redirect URL：`https://your-domain.com/auth/callback`

### 4. 運行開發伺服器

```bash
npm run dev
```

打開 [http://localhost:3000](http://localhost:3000) 查看應用。

## 功能說明

### Mock 模式

預設啟用 Mock 模式（`NEXT_PUBLIC_USE_MOCK_MODE=true`），系統會：
- 返回隨機的舌頭類型診斷結果
- 無需連接真實的 Python 後端
- 適合前端開發和測試

### 真實 API 模式

要使用真實的 Python 後端：
1. 設置 `PYTHON_API_URL`
2. 設置 `NEXT_PUBLIC_USE_MOCK_MODE=false`
3. 確保 Python 後端 API 符合規格（見 PRD&SPEC.md）

## 專案結構

```
├── app/                    # Next.js App Router
│   ├── page.tsx           # Landing Page
│   ├── diagnosis/         # 診斷流程頁面
│   ├── result/            # 結果頁面
│   ├── history/           # 歷史紀錄頁面
│   ├── auth/callback/     # OAuth 回調
│   └── api/analyze/       # API Route (轉發到 Python Backend)
├── components/            # React 組件
│   ├── CameraCapture.tsx  # 相機拍攝組件
│   ├── DisclaimerModal.tsx # 免責聲明
│   ├── LoginModal.tsx     # 登入模態框
│   └── LanguageSwitcher.tsx # 語言切換
├── hooks/                 # Custom Hooks
│   └── use-auth.ts        # 認證 Hook
├── lib/                   # 工具函數和配置
│   ├── supabase.ts       # Supabase 客戶端
│   ├── tongue-data.ts    # 舌頭類型資料
│   ├── i18n.ts           # 國際化配置
│   ├── api.ts            # API 服務
│   ├── image-utils.ts    # 圖片處理工具
│   └── storage-utils.ts  # localStorage 工具
└── store/                 # Zustand 狀態管理
    └── use-language-store.ts # 語言狀態
```

## 常見問題

### 1. 相機無法使用

- 確保使用 HTTPS 或 localhost
- 檢查瀏覽器權限設定
- 某些瀏覽器可能需要手動允許相機權限

### 2. Supabase 連接失敗

- 檢查 `.env.local` 中的 Supabase URL 和 Key
- 確認 Supabase 專案已正確設置
- 檢查網路連線

### 3. 圖片上傳失敗

- 檢查 Supabase Storage Bucket 是否已建立
- 確認 Storage Policy 已正確設置
- 檢查圖片大小是否超過限制

## 部署

### Vercel 部署

1. 將專案推送到 GitHub
2. 在 Vercel 中導入專案
3. 設置環境變數
4. 部署

### 環境變數設置

在 Vercel Dashboard 中設置以下環境變數：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `PYTHON_API_URL` (可選)
- `PYTHON_API_KEY` (可選)
- `NEXT_PUBLIC_USE_MOCK_MODE` (可選，預設 true)

## 下一步

- 連接真實的 Python 後端 API
- 添加更多錯誤處理
- 優化圖片壓縮演算法
- 添加更多語言支援
- 實現資料遷移功能（Guest → 登入用戶）

