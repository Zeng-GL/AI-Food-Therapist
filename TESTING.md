# 測試指南 - 無後端測試流程

## 快速開始（Mock 模式）

### 1. 設置環境變數

創建 `.env.local` 文件（即使沒有 Supabase 也可以測試）：

```env
# Mock 模式（不需要真實的 Supabase）
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder_key

# 啟用 Mock 模式（重要！）
NEXT_PUBLIC_USE_MOCK_MODE=true
```

### 2. 安裝依賴並啟動

```bash
npm install
npm run dev
```

### 3. 測試流程

打開 [http://localhost:3000](http://localhost:3000)

## 完整測試流程

### 步驟 1: Landing Page
- ✅ 查看首頁是否正常顯示
- ✅ 測試語言切換（EN / 中文）
- ✅ 點擊「開始檢測」按鈕

### 步驟 2: 登入選擇
- ✅ 點擊「開始檢測」後會彈出登入模態框
- ✅ 選擇「Continue as Guest」（訪客模式）
- ✅ 或選擇「Continue with Google」（會跳轉但無法完成，因為沒有真實 Supabase）

**建議**：使用 Guest 模式進行測試

### 步驟 3: 免責聲明
- ✅ 閱讀免責聲明內容
- ✅ 勾選「我同意」checkbox
- ✅ 點擊「我同意」按鈕繼續

### 步驟 4: 相機拍攝
- ✅ 允許瀏覽器相機權限
- ✅ 查看相機預覽（應該看到舌頭形狀的虛線框）
- ✅ 點擊拍攝按鈕
- ✅ 查看拍攝預覽
- ✅ 可以選擇「重拍」或「分析」

**注意**：
- 如果沒有相機，可以修改代碼使用檔案上傳（見下方「無相機測試」）

### 步驟 5: 分析過程
- ✅ 看到分析步驟提示：
  - "正在壓縮圖片..." / "Compressing Image..."
  - "發送給 AI..." / "Sending to AI..."
  - "分析中..." / "Analyzing..."
- ✅ 等待約 3 秒（Mock 模式會返回隨機結果）

### 步驟 6: 結果頁面
- ✅ 查看診斷結果（7 種舌頭類型之一）
- ✅ 查看健康小語（Quote）
- ✅ 查看體質描述
- ✅ 查看推薦食物（3 種）
- ✅ 測試語言切換，確認內容會改變
- ✅ 點擊「再次檢測」返回診斷流程

### 步驟 7: 儲存記錄（Guest 模式）
- ✅ 點擊「儲存記錄」
- ✅ 應該會提示需要登入（Guest 模式）
- ✅ 記錄會儲存在 localStorage（最多 5 筆）

### 步驟 8: 歷史紀錄（Guest 模式）
- ✅ 訪問 `/history` 頁面
- ✅ 查看 Guest 模式的歷史記錄（從 localStorage 讀取）
- ✅ 測試展開/收起記錄詳情
- ✅ 測試刪除記錄

## 無相機測試方法

如果沒有實體相機，可以修改代碼添加檔案上傳功能：

### 方法 1: 臨時修改 CameraCapture 組件

在 `components/CameraCapture.tsx` 中添加檔案上傳按鈕：

```tsx
// 在相機預覽區域添加
<input
  type="file"
  accept="image/*"
  onChange={(e) => {
    const file = e.target.files?.[0];
    if (file) {
      // 直接處理檔案
      handleFileUpload(file);
    }
  }}
  className="absolute bottom-20 left-1/2 transform -translate-x-1/2"
/>
```

### 方法 2: 使用瀏覽器開發工具

1. 打開瀏覽器開發工具（F12）
2. 在 Console 中執行：

```javascript
// 創建一個測試圖片
const canvas = document.createElement('canvas');
canvas.width = 800;
canvas.height = 600;
const ctx = canvas.getContext('2d');
ctx.fillStyle = '#ffcccc';
ctx.fillRect(0, 0, 800, 600);
ctx.fillStyle = '#ff0000';
ctx.ellipse(400, 300, 200, 150, 0, 0, 2 * Math.PI);
ctx.fill();

// 轉換為 File 對象
canvas.toBlob((blob) => {
  const file = new File([blob], 'test-tongue.jpg', { type: 'image/jpeg' });
  // 手動觸發分析
  console.log('Test file created:', file);
}, 'image/jpeg', 0.9);
```

## Mock 模式說明

### 工作原理

當 `NEXT_PUBLIC_USE_MOCK_MODE=true` 時：

1. **分析 API** (`lib/api.ts`) 會：
   - 跳過真實的 API 請求
   - 等待 3 秒（模擬分析時間）
   - 隨機返回 7 種舌頭類型之一
   - 返回隨機的 confidence 值（0.85 - 0.95）

2. **資料來源**：
   - 所有診斷資料來自 `lib/tongue-data.ts`
   - 包含完整的中英雙語內容
   - 包含推薦食物列表

3. **儲存功能**：
   - Guest 模式：使用 localStorage（完全可用）
   - 登入模式：需要真實 Supabase（會失敗，但不影響測試）

## 測試檢查清單

### 功能測試
- [ ] 首頁載入正常
- [ ] 語言切換功能
- [ ] 登入模態框顯示
- [ ] Guest 模式選擇
- [ ] 免責聲明顯示和同意
- [ ] 相機權限請求
- [ ] 相機預覽顯示
- [ ] 舌頭形狀引導框顯示
- [ ] 拍攝功能
- [ ] 圖片預覽
- [ ] 重拍功能
- [ ] 分析流程（3 個步驟）
- [ ] 結果頁面顯示
- [ ] 語言切換在結果頁
- [ ] 推薦食物顯示
- [ ] 儲存記錄（Guest 模式）
- [ ] 歷史紀錄頁面
- [ ] 歷史記錄展開/收起
- [ ] 歷史記錄刪除

### UI/UX 測試
- [ ] 響應式設計（手機/平板/桌面）
- [ ] 按鈕點擊反饋
- [ ] 載入動畫
- [ ] 錯誤提示（如果有）
- [ ] 文字顯示完整
- [ ] 圖片顯示正常

### 邊界情況測試
- [ ] 相機權限被拒絕
- [ ] 網路中斷（分析過程中）
- [ ] 大圖片上傳（測試壓縮）
- [ ] 快速連續點擊按鈕
- [ ] 瀏覽器返回按鈕

## 常見問題

### Q: Mock 模式一直返回同一個結果？
A: 這是隨機的，多試幾次會看到不同的結果。如果想測試特定類型，可以修改 `lib/api.ts` 中的 Mock 邏輯。

### Q: Guest 模式的歷史記錄在哪裡？
A: 儲存在瀏覽器的 localStorage，可以在開發工具 > Application > Local Storage 中查看。

### Q: 如何測試登入功能？
A: 需要設置真實的 Supabase 專案並啟用 Google OAuth。參考 `SETUP.md` 中的 Supabase 設置步驟。

### Q: 圖片壓縮功能如何測試？
A: 使用手機拍攝一張大圖片（> 5MB），系統會自動觸發壓縮流程。

## 下一步：連接真實後端

當準備好連接真實後端時：

1. 設置 `NEXT_PUBLIC_USE_MOCK_MODE=false`
2. 設置 `PYTHON_API_URL=your_backend_url`
3. 確保 Python 後端 API 符合規格（見 `PRD&SPEC.md`）

## 測試腳本建議

可以創建一個簡單的測試腳本來驗證所有功能：

```bash
# test.sh
echo "Testing AI Food Therapist..."

# 檢查環境變數
if [ ! -f .env.local ]; then
  echo "⚠️  .env.local not found, creating from example..."
  cp .env.local.example .env.local
fi

# 啟動開發伺服器
echo "🚀 Starting dev server..."
npm run dev
```

現在你可以完整測試整個流程，無需任何後端服務！

