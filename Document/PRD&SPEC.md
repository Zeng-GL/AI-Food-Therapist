Product Requirement Document (PRD) - AI Tongue Diagnosis Prototype

1. 產品概述

一個基於 Web 的 AI 舌診健康助理。用戶透過手機瀏覽器拍攝舌頭，系統透過後端 Python API 分析 7 種體質，並給予相應的健康建議與食療方案。
核心價值：快速篩檢、無痛追蹤、中英雙語對照。

2. 核心功能與流程 (User Flow)

2.1 身份驗證流程 (Auth Flow)

Landing Page: 顯示產品 Logo 與 Slogan。

Action: 用戶點擊「Start Diagnosis (開始檢測)」。

Login Modal:

選項 A: "Continue with Google" (註冊/登入)。

選項 B: "Continue as Guest" (跳過，不紀錄歷史)。

Guest 用戶流程：
- Guest 用戶的檢測結果僅存在瀏覽器 localStorage（最多保留最近 5 筆）
- 檢測結果包含：圖片（Base64 或 Blob URL）、result_code、timestamp
- 若 Guest 用戶點擊「Save Record」，顯示註冊提示 Modal
- 註冊後，將 localStorage 中的歷史記錄遷移至 Supabase（需用戶確認）
- 遷移後清除 localStorage 中的 Guest 資料

註冊用戶 Onboarding 流程：
- 用戶點擊「Continue with Google」後，完成 OAuth 認證
- 首次登入的新用戶會自動導向 Onboarding 問卷（4 個步驟）
- 完成問卷後，進入會員首頁（Home Screen with Bottom Navigation）
- 已完成 Onboarding 的用戶，直接進入會員首頁

**Onboarding 階段實作策略（Mock 模式）**：
- 在串接真實 Supabase 前，使用 localStorage 暫存 Onboarding 資料
- 資料結構：`{ isOnboardingCompleted: boolean, userProfile: {...} }`
- Mock 模式下，點擊「Continue with Google」後：
  1. 模擬登入成功，生成假的用戶資料（name, email, avatar）
  2. 檢查 localStorage 是否有 `isOnboardingCompleted` 標記
  3. 若無，導向 Onboarding 問卷
  4. 若有，直接進入會員首頁
- 真實 Supabase 串接後，改為查詢 User Profile 表的 `onboarding_completed` 欄位

2.1.1 Onboarding 問卷規格 (First-time User Setup)

**目的**：收集用戶健康基本資訊，以便後續 AI 根據個人化條件調整舌診結果與食療建議。

**觸發時機**：
- 首次使用 Google 登入的新用戶
- 完成 OAuth 認證後，系統檢測到 `onboarding_completed = false`

**UI/UX 設計原則**：
- 採用逐步引導式問卷（Step-by-step），每次只顯示一個問題
- 使用進度條（Progress Bar）顯示完成度（例如：1/4, 2/4...）
- 支援「上一步」按鈕，允許用戶修改答案
- 最後一步顯示「完成」按鈕，提交後導向會員首頁

**技術實作（Mock 模式）**：
- 使用 Zustand Store 管理 Onboarding 狀態與答案
- 暫存於 localStorage（key: `onboarding_data`）
- 完成後設置 `isOnboardingCompleted: true`

---

**Q1: 生理基礎資訊 (Basic Profile)**

User Story: 
「身為用戶，我提供基礎生理資訊，以便 AI 能根據不同年齡與性別的氣血基準校準舌診結果。」

欄位定義：
```typescript
{
  gender: 'Male' | 'Female' | 'Other',
  age_group: 'Under_20' | '21_25' | '26_30' | '31_35' | '36_40' | '41_45' | '46_50' | '51_65' | 'Over_65'
}
```

UI 設計建議：
- 標題：「Tell us about yourself / 關於您的基本資訊」
- 性別選擇：使用大型點選卡片（Segmented Control），圖示 + 文字
  - Male / 男性（♂ 圖示）
  - Female / 女性（♀ 圖示）
  - Other / 其他
- 年齡群組：下拉選單（Dropdown）或滾輪選擇器（Picker）
- 必填項目：是

驗證邏輯：
- 兩個欄位均需選擇才能進入下一步
- 錯誤提示：「請選擇您的性別與年齡範圍」

---

**Q2: 核心健康目標 (Health Goals)**

User Story:
「我選擇我最在意的健康問題，讓 App 優先推薦相關的食療方案。」

欄位定義：
```typescript
{
  primary_goals: Array<'sleep_quality' | 'digestion' | 'fatigue_relief' | 'skin_health' | 'general_wellness'>
  // 最多選擇 2 項
}
```

選項內容（中英對照）：
- `sleep_quality`: Improve Sleep Quality / 改善睡眠品質
- `digestion`: Digestive Health / 消化系統健康
- `fatigue_relief`: Energy & Fatigue Relief / 提升精力、緩解疲勞
- `skin_health`: Skin Health / 皮膚健康
- `general_wellness`: Overall Wellness / 整體健康

UI 設計建議：
- 標題：「What are your health priorities? / 您最在意的健康目標？」
- 副標題：「Select up to 2 / 最多選擇 2 項」
- 多選按鈕（Multiple Selection Chips），點選後變色（例如：teal 色底 + 白色文字）
- 顯示已選數量（例如：「1/2 selected」）

邏輯判斷：
- 至少選擇 1 項，最多 2 項
- 若用戶嘗試選擇第 3 項，彈出提示：「最多只能選擇 2 項目標」
- 錯誤提示：「請至少選擇 1 項健康目標」

後續影響：
- 若用戶選擇 `digestion`，AI 推薦食物時會提高「健脾養胃」類食材的權重
- 若選擇 `sleep_quality`，會推薦「安神助眠」類食材

---

**Q3: 生活型態與壓力感 (Lifestyle Baseline)**

User Story:
「我填寫近期的作息與壓力狀態，幫助系統區分我的舌象是短期生活影響還是長期體質。」

欄位定義：
```typescript
{
  sleep_habit: 'Regular' | 'Late_night' | 'Insufficient',
  stress_level: 1 | 2 | 3 | 4 | 5  // 1 = 很放鬆, 5 = 壓力很大
}
```

UI 設計建議：
- 標題：「Your lifestyle habits / 您的生活型態」

- **睡眠習慣**：
  - 問題：「How would you describe your sleep? / 您的睡眠狀況如何？」
  - 選項（單選按鈕）：
    - Regular / 規律充足（每晚 7-8 小時）
    - Late_night / 經常晚睡（超過 12 點）
    - Insufficient / 睡眠不足（少於 6 小時）

- **壓力程度**：
  - 問題：「How stressed do you feel recently? / 近期壓力程度？」
  - UI 元件：Slider（滑桿）或 5 個表情符號（😌 😊 😐 😟 😰）
  - 數值對應：1 = Very Relaxed / 很放鬆, 5 = Very Stressed / 壓力很大

驗證邏輯：
- 兩個欄位均需選擇
- 錯誤提示：「請完成所有問題」

資料用途：
- 輔助標註舌象數據（例如：若壓力大且舌尖紅，標註為「心火旺」）
- 影響食療建議（壓力大 -> 推薦「疏肝解鬱」類食材）

---

**Q4: 飲食禁忌與過敏原 (Dietary Restrictions)**

User Story:
「我設定我的飲食偏好與過敏原，以確保 AI 推薦的食物對我而言是安全且可食用的。」

欄位定義：
```typescript
{
  allergies: Array<'Seafood' | 'Nuts' | 'Gluten' | 'Dairy' | 'Soy' | 'Eggs' | 'None'>,
  diet_type: 'General' | 'Vegetarian' | 'Vegan' | 'No_Beef' | 'No_Pork',
  medical_conditions: Array<'G6PD' | 'Diabetes' | 'Hypertension' | 'Kidney_Disease' | 'None'>
}
```

選項內容（中英對照）：

**過敏原（Allergies）**：
- Seafood / 海鮮
- Nuts / 堅果
- Gluten / 麩質
- Dairy / 乳製品
- Soy / 大豆
- Eggs / 雞蛋
- None / 無過敏

**飲食類型（Diet Type）**：
- General / 一般飲食
- Vegetarian / 素食（可食蛋奶）
- Vegan / 純素
- No_Beef / 不吃牛肉
- No_Pork / 不吃豬肉

**健康狀況（Medical Conditions）**：
- G6PD / 蠶豆症
- Diabetes / 糖尿病
- Hypertension / 高血壓
- Kidney_Disease / 腎臟疾病
- None / 無特殊狀況

UI 設計建議：
- 標題：「Dietary preferences & restrictions / 飲食偏好與禁忌」
- 副標題：「Help us recommend safe foods for you / 幫助我們推薦安全的食物」
- 使用搜尋式標籤雲（Searchable Tags）或分類式多選列表
- 每個類別獨立顯示（Allergies、Diet Type、Medical Conditions）
- 預設勾選「None」，取消後可選擇其他選項

邏輯判斷：
- 過敏原與健康狀況可多選（若選擇「None」則其他選項自動取消）
- 飲食類型只能單選
- 此問題可選填（允許用戶跳過），但建議選擇以提升推薦準確度

**重要**：這是「負向篩選」機制
- AI 產出建議後必須經過這一層過濾器
- 範例：
  - 用戶有海鮮過敏 -> 不推薦「海參」、「魚膠」
  - 用戶是 Vegan -> 不推薦任何動物性食材
  - 用戶有糖尿病 -> 不推薦「紅棗」、「甘蔗汁」等高糖食物

完成按鈕：
- 文字：「Complete Setup / 完成設定」
- 點擊後：
  - 將資料儲存至 localStorage（Mock 模式）或 Supabase（真實模式）
  - 設置 `onboarding_completed = true`
  - 導向會員首頁（`/home`）

---

2.2 檢測流程 (Diagnosis Flow)

免責聲明 (Disclaimer): 彈出視窗或頁面，需勾選「I Agree」才能繼續。

免責聲明文字：

English:
"This tongue diagnosis result is for reference only and does not constitute medical diagnosis or treatment. Please consult a qualified healthcare professional for any health concerns. The AI analysis is based on image recognition and may not be 100% accurate. We are not responsible for any decisions made based on these results."

中文：
"本舌診結果僅供參考，不構成醫療診斷或治療建議。如有健康疑慮，請諮詢合格的醫療專業人員。AI 分析基於影像識別技術，可能無法達到 100% 準確度。我們不對基於此結果所做的任何決定負責。"

相機權限: 瀏覽器請求 Camera 權限。

拍攝/上傳:

顯示相機預覽 (Video Stream)。

關鍵 UI: 中央顯示舌頭形狀的虛線框 (Overlay)。

拍攝後顯示預覽，可選擇「Retake」或「Analyze」。

分析狀態: 顯示動畫 (Compressing -> Sending to AI -> Analyzing)。

API 串接: 將圖片 FormData 發送至後端 Python API。

圖片處理流程：
1. **自動壓縮機制**：如果原始檔案超過 5MB，系統會自動進行壓縮處理
   - 壓縮目標：< 2MB（維持可接受的圖片品質）
   - 壓縮策略：先調整尺寸，再降低 JPEG 品質（如需要）
   - 壓縮過程顯示進度提示：「正在壓縮圖片...」
2. 轉換為 JPEG 格式（品質 85%，若檔案仍過大則逐步降低至 70%）
3. 調整尺寸（最大邊長 1920px，保持長寬比）
   - 如果原始圖片超過 1920px，按比例縮小
   - 如果壓縮後仍 > 2MB，進一步縮小至 1600px 或降低品質
4. 上傳至 Supabase Storage（路徑：`tongue-images/{user_id}/{timestamp}.jpg`）
5. 取得 Storage URL 後，發送分析請求至 Next.js API Route
6. Next.js API Route 轉發至 Python Backend（帶上圖片 URL 或 Base64）

**注意**：所有壓縮處理均在客戶端（瀏覽器）完成，不影響原始拍攝品質的顯示，僅影響上傳與分析的檔案大小。

2.3 結果頁 (Result Page)

Header: 顯示原始圖片縮圖。

Diagnosis: 顯示體質名稱 (EN/ZH)、健康小語 (Health Quote)。

Recommendations: 3 種推薦食物卡片 (含圖片/Icon、名稱、功效)。

Actions:

"Save Record" (若是 Guest，引導註冊)。

"Test Again".

2.4 歷史紀錄 (History - Members Only)

僅登入用戶可見。

UI 佈局：
- 列表/卡片式佈局（響應式：手機單欄，桌面可多欄）
- 每個卡片顯示：日期、體質標籤（含顏色標識）、舌頭縮圖（圓形或方形）
- 點擊卡片可展開查看詳細建議（體質描述、推薦食物）
- 支援下拉重新整理

功能：
- 排序：預設按日期降序（最新在前）
- 分頁：每頁顯示 10 筆，支援無限滾動或分頁按鈕
- 刪除：長按或點擊選單可刪除單筆記錄
- 篩選：可依體質類型篩選（可選功能）

2.5 會員專屬功能 (Member-only Features)

登入用戶完成 Onboarding 後，會進入專屬的會員首頁，與訪客體驗有以下差異：

**差異對照表**：

| 功能 | Guest 模式 | 登入會員模式 |
|------|-----------|-------------|
| 導覽列 | 無（單一流程頁面） | 底部導覽列（3 Tab） |
| 首頁 | Landing Page | 會員首頁（個人化內容） |
| 舌診功能 | ✅ 可用 | ✅ 可用（含歷史對比） |
| 歷史記錄 | localStorage（最多 5 筆） | Supabase 雲端儲存（無限制） |
| 個人化建議 | ❌ 無 | ✅ 根據 Onboarding 資料 |
| 趨勢分析 | ❌ 無 | ✅ 顯示體質變化圖表 |
| 個人檔案 | ❌ 無 | ✅ 可查看與編輯 |
| 食療推薦 | 通用建議 | 過濾過敏原與禁忌 |
| 健康小知識 | 通用內容 | 個人化內容（依體質） |

---

2.5.1 底部導覽列 (Bottom Navigation)

**設計原則**：
- 固定在螢幕底部，始終可見
- 使用圖示 + 文字標籤（提升可用性）
- 當前頁面 Tab 高亮顯示（teal 色）
- 響應式：手機版顯示圖示+文字，平板/桌面可顯示側邊欄

**3 個 Tab 配置**：

| Tab | 路由 | 圖示 | 英文 | 中文 | 核心功能 |
|-----|------|------|------|------|---------|
| 1 | `/home` | 🏠 Home | Home | 首頁 | 核心行動點：拍照診斷、健康提醒 |
| 2 | `/trends` | 📈 TrendingUp | Trends | 健康日誌 | 價值體現點：體質變化、歷史記錄 |
| 3 | `/profile` | 👤 User | Profile | 個人中心 | 基礎建設：個人資料、設定 |

**技術實作**：
- 使用 Next.js App Router Layout 結構
- 建立 `app/(member)/layout.tsx` 包含 BottomNav 組件
- 使用 `usePathname()` 判斷當前路由並高亮對應 Tab
- Tab 切換使用 `<Link>` 元件（Client-side navigation）

**Mock 模式實作**：
- 建立 Zustand Store 管理登入狀態 (`useAuthStore`)
- 檢查 `isLoggedIn` 與 `isOnboardingCompleted` 決定顯示哪種 Layout
- Guest 模式：不顯示 BottomNav
- 登入模式：顯示 BottomNav + 會員專屬頁面

---

2.5.2 會員首頁設計 (Member Home Screen)

**設計理念**：「行動導向」且「資訊高度概括」，讓用戶快速開始診斷並看到價值。

**頁面結構（由上至下）**：

---

**1. 狀態與打招呼區 (Greeting & Status)**

內容：
- 問候語：「Good morning, [Name]! / 早安，[用戶名]！」
  - 根據時間動態變化（早安/午安/晚安）
- 副標題：「How are you feeling today? / 今天感覺如何？」
- 背景：漸層色或中醫節氣插圖

額外元素（可選）：
- 當天的天氣（☀️ Sunny 25°C）
- 中醫節氣提示（例如：「今日大寒，宜補氣避寒」）
  - 資料來源：本地 JSON 配置（24 節氣資料）
  - 顯示邏輯：根據當前日期自動匹配

技術實作：
- 從 Zustand Store 或 localStorage 取得用戶名稱
- 使用 `new Date().getHours()` 判斷時段（0-11: 早安, 12-17: 午安, 18-23: 晚安）
- 節氣資料：建立 `lib/solar-terms.ts` 配置檔

---

**2. 核心行動區 (Primary CTA - The "Big Button")**

這是 App 的靈魂，必須最顯眼。

內容：
- 大型圓形或卡片式按鈕
- 圖示：相機圖示（Camera Icon）
- 文字：「Start Tongue Scan / 開始舌診」
- 提示文案（條件顯示）：
  - 當天尚未檢測：「You haven't scanned today! / 你今天還沒拍照記錄喔！」
  - 當天已檢測：「Last scan: Today 09:30 AM / 上次檢測：今日 09:30」

設計建議：
- 放置在頁面上半部中央
- 使用 teal 色（品牌色）
- 加入微動畫（hover 時放大、點擊時縮小）
- 尺寸：120x120px（手機），150x150px（平板/桌面）

互動邏輯：
- 點擊後：導向 `/diagnosis` 頁面（相機拍攝流程）
- 若當天已檢測 3 次以上，顯示提示：「建議每日檢測 1-2 次即可」（不阻擋，僅提示）

---

**3. 上次檢測快報 (Latest Insight Summary)**

讓用戶一眼看到最近一次的健康狀態，不必點進歷史頁面。

內容：
- 卡片式佈局（Card Component）
- 標題：「Your Latest Result / 最近一次檢測」
- 顯示內容：
  - 日期與時間：「2024-01-15  09:30 AM」
  - 舌頭縮圖：圓形或方形（80x80px）
  - 體質名稱：「Qi Deficiency / 氣虛體質」（加上顏色標籤）
  - 核心指標（1-2 個）：
    - 濕熱指數：⚠️ High / 高
    - 氣血狀態：✅ Normal / 正常

進步對比（條件顯示）：
- 若有 2 次以上記錄，顯示趨勢箭頭：
  - 「Moisture level: ↓ Improved / 濕氣：↓ 好轉」（綠色）
  - 「Energy level: ↑ Increased / 精力：↑ 提升」（綠色）
  - 「Inflammation: → Unchanged / 發炎：→ 持平」（灰色）

互動：
- 點擊卡片：導向 `/result?id=xxx` 查看完整結果
- 右上角「View Details」按鈕

技術實作：
- 從 localStorage（Mock 模式）或 Supabase（真實模式）取得最新一筆記錄
- 若無記錄，顯示空狀態：「No scans yet. Start your first scan! / 尚無記錄，開始您的第一次檢測！」

---

**4. 今日食療推薦 (Daily Food Recommendation)**

這是 App 的核心價值輸出。

內容：
- 標題：「Today's Food for You / 今日為您推薦」
- 副標題：「Based on your latest result / 根據您的最新體質」
- 推薦 2-3 種食材（橫向滑動卡片）

每個食材卡片顯示：
- 食材圖片（120x120px，圓形或方形）
- 食材名稱：「Mung Bean / 綠豆」
- 功效標籤：「🔥 Clear Heat / 清熱降火」
- 推薦理由（簡短）：「Good for reducing internal heat / 適合您的熱性體質」

過濾邏輯（重要）：
- 根據用戶 Onboarding 資料過濾：
  - 過敏原：若用戶對「Nuts」過敏，不推薦堅果類食材
  - 飲食類型：若用戶是 Vegan，不推薦動物性食材
  - 健康狀況：若用戶有糖尿病，不推薦高糖食物（紅棗、甘蔗汁等）
- 優先推薦符合「健康目標」的食材：
  - 若用戶選擇「sleep_quality」，優先推薦「安神助眠」類食材（百合、蓮子）

互動：
- 點擊卡片：顯示食材詳情 Modal（完整功效、食用方法、禁忌）
- 「View More」按鈕：導向完整食材庫（未來功能）

技術實作：
- 建立 `lib/food-recommendation-engine.ts`
- 輸入：`result_code`（體質類型）、`userProfile`（Onboarding 資料）
- 輸出：過濾後的 3 種推薦食材
- 資料來源：`lib/tongue-data.ts` 的 `food_recommendations`

---

**5. 健康小知識/季節提醒 (Health Tips)**

內容：
- 卡片式佈局（可摺疊）
- 標題：「Health Tip / 健康小知識」
- 內容：隨機推送一條與用戶體質相關的中醫養生短文
  - 範例：「氣虛體質的人，立春後應多食用溫補食材，如紅棗、山藥，避免生冷食物。」
  - 英文版：「For Qi Deficiency, consume warming foods like red dates and yam after Start of Spring. Avoid cold foods.」

內容來源：
- 建立 `lib/health-tips.ts` 配置檔
- 結構：
  ```typescript
  {
    constitution: 'pale',  // 對應體質
    season: 'spring',      // 季節（可選）
    tip: {
      en: "...",
      zh: "..."
    }
  }
  ```
- 顯示邏輯：
  - 根據用戶最新體質類型 (`result_code`) 篩選
  - 若有當前季節的提示，優先顯示
  - 每日隨機輪換（避免重複）

設計：
- 左側：燈泡圖示 💡 或書本圖示 📖
- 背景：淡色卡片（米白色或淡綠色）
- 可展開查看更多（可選）

---

**6. 快速統計區 (Quick Stats - 可選)**

內容（簡化版）：
- 顯示 3 個數字指標：
  - 「7 Scans / 已檢測 7 次」
  - 「3 Days Streak / 連續 3 天」
  - 「2 Goals Achieved / 達成 2 個目標」

設計：
- 3 個小卡片橫向排列
- 使用圖示 + 數字 + 文字
- 點擊後導向 `/trends` 頁面查看詳細趨勢

技術實作：
- 統計來源：Supabase History 表或 localStorage
- 計算邏輯：
  - Scans：總記錄數
  - Streak：連續天數（最近一次檢測與前一次間隔 < 48 小時）
  - Goals：根據體質變化判斷（例如：濕氣降低 = 目標達成）

---

**空狀態處理（首次使用）**：

若用戶剛完成 Onboarding，尚未進行過舌診：
- 隱藏「上次檢測快報」與「今日食療推薦」
- 顯示大型引導卡片：
  - 標題：「Welcome! Let's start your first scan / 歡迎！開始您的第一次檢測」
  - 副標題：「Discover your constitution and get personalized food recommendations / 發現您的體質，獲得個人化食療建議」
  - 大型 CTA 按鈕：「Start First Scan / 開始首次檢測」
- 顯示產品功能介紹（3 個圖示 + 文字）：
  - 「📸 Quick Scan / 快速檢測」
  - 「📊 Track Progress / 追蹤進度」
  - 「🍲 Personalized Foods / 個人化食療」

---

2.5.3 健康日誌頁面 (Trends / Health Journal)

**路由**：`/trends`

**目的**：價值體現點，顯示舌象隨時間的變化，讓用戶感覺「調理有效」。

**頁面結構**：

**1. Header**
- 標題：「Health Trends / 健康日誌」
- 副標題：「Track your progress over time / 追蹤您的健康變化」

**2. 日期範圍選擇器（可選）**
- 預設：最近 30 天
- 選項：7 天 / 30 天 / 90 天 / 全部

**3. 體質變化圖表（核心功能）**
- 視覺化顯示體質類型的分佈
- X 軸：日期
- Y 軸：體質類型或指標（濕氣、氣血、熱性等）
- 圖表類型：折線圖（Line Chart）或點狀圖（Scatter Plot）
- 使用圖表庫：Recharts 或 Chart.js

範例指標（可選擇顯示）：
- 濕氣指數（Moisture Level）：0-100
- 氣血狀態（Qi & Blood）：0-100
- 熱性程度（Heat Level）：0-100

計算邏輯（簡化版 Mock 模式）：
- 根據 `result_code` 映射到指標值
- 範例：
  - `white_thick` (濕熱痰多) -> 濕氣指數 80
  - `pale` (氣血虛弱) -> 氣血狀態 40
  - `red` (陰虛火旺) -> 熱性程度 85

**4. 歷史記錄列表（與 2.4 整合）**
- 顯示所有檢測記錄（卡片式佈局）
- 每個卡片：日期、舌頭縮圖、體質標籤、簡短描述
- 點擊展開查看完整建議

**5. 空狀態**
- 若記錄少於 2 筆，顯示：
  - 「Not enough data yet. Complete more scans to see your trends! / 資料不足，完成更多檢測以查看趨勢！」
  - 引導按鈕：「Go to Home / 返回首頁」

技術實作：
- Mock 模式：從 localStorage 讀取歷史記錄
- 真實模式：從 Supabase History 表查詢
- 圖表資料處理：建立 `lib/trend-calculator.ts`

---

2.5.4 個人中心頁面 (Profile / Settings)

**路由**：`/profile`

**目的**：基礎建設，管理個人資料、飲食禁忌、App 設定。

**頁面結構**：

**1. 用戶資訊卡片**
- 頭像（Avatar）：Google 帳號頭像或預設圖示
- 名稱：「John Doe」
- 電子郵件：「john@example.com」
- 編輯按鈕（可選）：點擊後可修改名稱

**2. 健康檔案（Onboarding 資料）**
- 標題：「Health Profile / 健康檔案」
- 顯示 Onboarding 問卷的答案：
  - 性別與年齡：「Male, 26-30」
  - 健康目標：「Sleep Quality, Digestion」
  - 睡眠習慣：「Late Night」
  - 壓力程度：「😟 Level 4」
  - 飲食禁忌：「Seafood Allergy, Vegetarian」
  - 健康狀況：「None」
- 編輯按鈕：「Edit Profile / 編輯檔案」
  - 點擊後導向 Onboarding 問卷（允許修改答案）

**3. App 設定**
- 語言切換：「Language / 語言」（EN / 中文）
- 通知設定（未來功能）：「Notifications / 通知提醒」
- 隱私政策：「Privacy Policy / 隱私政策」
- 服務條款：「Terms of Service / 服務條款」

**4. 帳號管理**
- 登出按鈕：「Log Out / 登出」
  - 點擊後清除登入狀態（localStorage 或 Supabase Session）
  - 導向 Landing Page
- 刪除帳號（未來功能）：「Delete Account / 刪除帳號」

技術實作：
- 從 Zustand Store 或 localStorage 讀取用戶資料
- 編輯功能：使用 Modal 或導向 Onboarding 頁面
- 登出邏輯：清除 `isLoggedIn`、`userProfile`、`onboarding_data`

---

2.4 歷史紀錄 (History - Members Only - 已整合至 Trends 頁面)

此功能已整合至 2.5.3 健康日誌頁面 (`/trends`)，不再單獨設立頁面。

原有功能保留：

3. 技術規格 (Technical SPEC)

3.1 Tech Stack

Framework: Next.js 14+ (App Router)

Language: TypeScript

Styling: Tailwind CSS

Auth & DB: Supabase (Google Auth + PostgreSQL)

State: Zustand (推薦使用，適合跨組件狀態共享，效能較佳)

i18n: 
- 使用 JSON 檔案儲存翻譯內容
- 檔案結構：`/locales/en.json`, `/locales/zh.json`
- 預設語言：EN（根據瀏覽器語言自動偵測，支援 en, zh-TW, zh-CN）
- 語言切換：Header 右上角顯示語言選擇器（EN / 中文）
- 實作方式：使用 React Context 或 Zustand 管理當前語言狀態

3.2 資料結構 (Data Structure)

Users Table (Supabase)

| Column | Type | Note |
|--------|------|------|
| id | uuid | Primary Key |
| email | text | Google Email |
| full_name | text | Google Name |
| avatar_url | text | Google Avatar URL (可選) |
| onboarding_completed | boolean | Onboarding 問卷完成狀態（預設 false） |
| created_at | timestamp | 註冊時間 |
| updated_at | timestamp | 最後更新時間 |

User_Profiles Table (Supabase) - 儲存 Onboarding 資料

| Column | Type | Note |
|--------|------|------|
| id | uuid | Primary Key |
| user_id | uuid | FK to Users（唯一） |
| gender | text | 'Male', 'Female', 'Other' |
| age_group | text | 'Under_20', '21_25', ..., 'Over_65' |
| primary_goals | text[] | Array ['sleep_quality', 'digestion', ...] (最多 2 項) |
| sleep_habit | text | 'Regular', 'Late_night', 'Insufficient' |
| stress_level | integer | 1-5 |
| allergies | text[] | Array ['Seafood', 'Nuts', ...] |
| diet_type | text | 'General', 'Vegetarian', 'Vegan', ... |
| medical_conditions | text[] | Array ['G6PD', 'Diabetes', ...] |
| created_at | timestamp | 建立時間 |
| updated_at | timestamp | 最後更新時間 |

**Mock 模式資料結構（localStorage）**：

在串接 Supabase 前，使用以下 localStorage keys：

```typescript
// 登入狀態
localStorage.setItem('auth_mock', JSON.stringify({
  isLoggedIn: boolean,
  user: {
    id: string,
    email: string,
    full_name: string,
    avatar_url: string
  }
}));

// Onboarding 狀態
localStorage.setItem('onboarding_status', JSON.stringify({
  isCompleted: boolean,
  currentStep: number  // 1-4，用於中斷後恢復
}));

// Onboarding 資料
localStorage.setItem('user_profile', JSON.stringify({
  gender: string,
  age_group: string,
  primary_goals: string[],
  sleep_habit: string,
  stress_level: number,
  allergies: string[],
  diet_type: string,
  medical_conditions: string[]
}));
```

History Table (Supabase)

| Column | Type | Note |
|--------|------|------|
| id | uuid | Primary Key |
| user_id | uuid | FK to Users |
| image_url | text | Supabase Storage path |
| result_code | string | 對應 7 種舌像的 Key (如 'red', 'pale') |
| created_at | timestamp | 檢測時間 |

資料儲存策略：僅儲存 `result_code`，完整診斷資料（name, quote, desc, food_recommendations）透過前端 TypeScript Config 查詢，減少資料庫儲存空間並提升效能。



3.3 舌像資料定義 (Master Data - Hardcoded in Frontend)

由於 7 種結果是固定的，建議直接寫成 TypeScript Constant Config，不需要每次都讀資料庫，提升效能。

Key: red, pale, white_thick, yellow_thick, peeled, teeth_marks, cracked

Fields: 
- name: { en: string, zh: string } - 體質名稱（中英雙語）
- quote: { en: string, zh: string } - 健康小語（中英雙語）
- desc: { en: string, zh: string } - 體質描述（中英雙語）
- food_recommendations: Array<FoodItem> - 推薦食物列表（至少 3 項）

FoodItem 結構：
```typescript
{
  name: { en: string, zh: string },
  image_url: string,  // 本地圖片路徑或外部 URL
  icon?: string,      // 可選的 Icon 名稱
  benefit: { en: string, zh: string }  // 功效說明（中英雙語）
}
```

3.4 API Interface (Next.js BFF -> Python Backend)

雖然是 Client 直接上傳，但建議透過 Next.js API Route 轉發，隱藏 Python Backend 真實位址。

POST /api/analyze

Request: multipart/form-data (image file)

Response: 
```json
{
  "result_code": "red",
  "confidence": 0.95
}
```

注意：前端收到 `result_code` 後，使用本地 TypeScript Config 查詢完整的診斷資料（name, quote, desc, food_recommendations），避免 API 回應過大。

3.5 Python Backend API 規格

後端端點配置：
- 環境變數：`PYTHON_API_URL`（在 Next.js `.env.local` 中設定）
- 預設端點：`POST {PYTHON_API_URL}/analyze`
- 認證：可選的 API Key（透過環境變數 `PYTHON_API_KEY` 設定）

請求格式：
```json
{
  "image_url": "string",  // Supabase Storage URL
  "image_base64": "string"  // 或直接傳 Base64（二選一）
}
```

回應格式：
成功：
```json
{
  "result_code": "red",
  "confidence": 0.95
}
```

錯誤：
```json
{
  "error": "string",
  "error_code": "string",  // 如 "INVALID_IMAGE", "API_ERROR"
  "message": "string"
}
```

超時與重試：
- 請求超時：30 秒
- 重試策略：失敗時最多重試 2 次（間隔 2 秒）
- 若重試後仍失敗，顯示友善錯誤訊息給用戶

3.6 圖片儲存規格 (Supabase Storage)

儲存位置：Supabase Storage Bucket `tongue-images`

路徑格式：
- 登入用戶：`{user_id}/{timestamp}_{random}.jpg`
- Guest 用戶：不儲存至 Supabase（僅存 localStorage）

圖片限制：
- **原始檔案限制**：最大 10MB（系統會自動壓縮）
- **上傳檔案限制**：壓縮後 < 2MB（系統自動處理）
- **支援格式**：JPEG, PNG（上傳前統一轉換為 JPEG）
- **建議尺寸**：最大邊長 1920px（超過會自動縮小）

**自動壓縮機制**：
- 如果原始檔案 > 5MB，系統會自動觸發壓縮流程
- 壓縮步驟：
  1. 檢查檔案大小，若 > 5MB 顯示「正在壓縮圖片...」提示
  2. 調整圖片尺寸（最大邊長 1920px，保持長寬比）
  3. 轉換為 JPEG 格式，品質設定為 85%
  4. 若壓縮後仍 > 2MB，逐步降低品質（85% → 75% → 70%）或進一步縮小尺寸
  5. 最終確保檔案 < 2MB 後再進行上傳
- 壓縮過程對用戶透明，無需手動操作
- 若壓縮後仍無法達到 < 2MB（極少數情況），顯示錯誤提示並建議重新拍攝

儲存時機：
- 登入用戶：分析成功後立即上傳並儲存 URL 至 History 表
- Guest 用戶：不上傳至 Supabase Storage

存取權限：
- 使用 Supabase Row Level Security (RLS)
- 用戶僅能存取自己的圖片

3.7 錯誤處理規格

錯誤情境與處理方式：

1. 相機權限被拒
   - 顯示友善提示：「請允許相機權限以使用此功能」
   - 提供「開啟設定」按鈕（引導至瀏覽器設定）

2. 圖片上傳失敗
   - 顯示錯誤訊息：「圖片上傳失敗，請重試」
   - 自動重試 1 次
   - 若仍失敗，允許用戶重新選擇圖片

3. API 分析失敗
   - 顯示錯誤訊息：「分析失敗，請稍後再試」
   - 記錄錯誤至 Console（開發環境）
   - 提供「重試」按鈕

4. 網路錯誤
   - 檢測網路連線狀態
   - 顯示：「網路連線中斷，請檢查網路後重試」
   - 提供「重試」按鈕

5. 圖片格式/大小驗證與壓縮
   - **格式驗證**：格式必須為 JPEG/PNG
   - **大小驗證**：
     - 原始檔案：最大 10MB（超過會自動壓縮）
     - 上傳檔案：壓縮後必須 < 2MB
   - **自動壓縮流程**：
     - 如果原始檔案 > 5MB，自動觸發壓縮（顯示「正在壓縮圖片...」）
     - 壓縮後驗證：若仍 > 2MB，繼續壓縮或顯示錯誤
   - **驗證失敗處理**：
     - 格式不支援：「圖片格式不支援，請使用 JPEG 或 PNG 格式」
     - 檔案過大（> 10MB）：「圖片檔案過大，請選擇較小的圖片或重新拍攝」
     - 壓縮失敗：「圖片處理失敗，請重新拍攝或選擇其他圖片」

6. 後端 API 錯誤
   - 根據 `error_code` 顯示對應訊息
   - `INVALID_IMAGE`: 「圖片無法識別，請重新拍攝」
   - `API_ERROR`: 「服務暫時無法使用，請稍後再試」
   - 其他：顯示通用錯誤訊息

錯誤提示 UI：
- 使用 Toast 通知（成功/錯誤）
- 重要錯誤使用 Modal 顯示
- 所有錯誤訊息支援中英雙語

3.8 非功能性需求

行動裝置相容性：
- 支援 iOS Safari 14+, Chrome Mobile, Firefox Mobile
- 響應式設計：適配手機（320px+）、平板（768px+）、桌面（1024px+）
- 觸控優化：按鈕最小點擊區域 44x44px

瀏覽器支援：
- Chrome/Edge 90+
- Safari 14+
- Firefox 88+
- 不支援 IE（顯示升級提示）

效能要求：
- 首頁載入時間：< 3 秒（3G 網路）
- API 回應時間：< 10 秒（包含圖片上傳與分析）
- 圖片壓縮時間：< 2 秒（客戶端）
- Lighthouse 分數：Performance > 70, Accessibility > 90

安全性考量：
- API 限流：每個 IP 每分鐘最多 10 次請求
- 圖片驗證：檢查檔案類型與大小（防止惡意上傳）
- HTTPS 強制：所有 API 請求使用 HTTPS
- CORS 設定：僅允許指定域名存取
- 資料隱私：用戶資料加密儲存，符合 GDPR 基本要求

無障礙需求：
- 支援鍵盤導航
- 圖片提供 Alt Text
- 顏色對比度符合 WCAG AA 標準
- 支援螢幕閱讀器

3.9 環境變數與配置

Next.js 環境變數（`.env.local`）：
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
PYTHON_API_URL=your_python_backend_url
PYTHON_API_KEY=your_api_key (可選)
```

Supabase 設定：
- 啟用 Google OAuth Provider
- 建立 Storage Bucket：`tongue-images`
- 設定 RLS Policies（Users 與 History 表）
- 建立必要的 Database Indexes（user_id, created_at）

部署策略（建議）：
- 前端：Vercel（Next.js 原生支援）
- 後端：可選 AWS Lambda, Google Cloud Functions, 或獨立伺服器
- 資料庫：Supabase（已包含）
- CDN：Vercel 自動提供

---

## 4. 實作流程與開發順序

### 4.1 Phase 1: Onboarding 功能實作（Mock 模式）

**目標**：完成 Google 登入按鈕點擊後的 Onboarding 問卷流程，使用假資料模擬登入。

**實作步驟**：

#### Step 1: 建立 Zustand Store 管理狀態

建立 `store/use-onboarding-store.ts`：

```typescript
interface OnboardingState {
  // 步驟控制
  currentStep: number;
  isCompleted: boolean;
  
  // Q1: 基礎資訊
  gender: 'Male' | 'Female' | 'Other' | null;
  ageGroup: string | null;
  
  // Q2: 健康目標
  primaryGoals: string[];
  
  // Q3: 生活型態
  sleepHabit: string | null;
  stressLevel: number;
  
  // Q4: 飲食禁忌
  allergies: string[];
  dietType: string;
  medicalConditions: string[];
  
  // Actions
  setStep: (step: number) => void;
  updateProfile: (data: Partial<OnboardingState>) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  loadFromStorage: () => void;
  saveToStorage: () => void;
}
```

#### Step 2: 建立 Onboarding 頁面

建立 `app/onboarding/page.tsx`：
- 使用 `currentStep` 控制顯示哪個問題
- 每個問題獨立成組件（`components/onboarding/Q1.tsx`, `Q2.tsx`, ...）
- 加入進度條（1/4, 2/4, 3/4, 4/4）
- 實作「上一步」、「下一步」、「完成」按鈕

#### Step 3: 建立問卷組件

建立問卷組件（放在 `components/onboarding/` 目錄）：

**Q1BasicProfile.tsx**：
- 性別選擇：3 個大型卡片（Male, Female, Other）
- 年齡選擇：Dropdown 或 Select 元件

**Q2HealthGoals.tsx**：
- 5 個選項的多選 Chips
- 限制最多選 2 項
- 顯示已選數量（1/2）

**Q3Lifestyle.tsx**：
- 睡眠習慣：3 個單選按鈕
- 壓力程度：5 個表情符號按鈕或 Slider

**Q4DietaryRestrictions.tsx**：
- 分 3 個區塊：過敏原、飲食類型、健康狀況
- 使用 Checkbox 多選（過敏原、健康狀況）
- 使用 Radio 單選（飲食類型）

#### Step 4: 修改 LoginModal 實作 Mock 登入

修改 `components/LoginModal.tsx`：

```typescript
const handleGoogleLogin = () => {
  // Mock 模式：模擬登入
  if (process.env.NEXT_PUBLIC_USE_MOCK_MODE === 'true') {
    // 生成假用戶資料
    const mockUser = {
      id: 'mock-user-' + Date.now(),
      email: 'mock.user@example.com',
      full_name: 'Mock User',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mock'
    };
    
    // 儲存至 localStorage
    localStorage.setItem('auth_mock', JSON.stringify({
      isLoggedIn: true,
      user: mockUser
    }));
    
    // 檢查是否完成 Onboarding
    const onboardingStatus = localStorage.getItem('onboarding_status');
    const isCompleted = onboardingStatus 
      ? JSON.parse(onboardingStatus).isCompleted 
      : false;
    
    if (!isCompleted) {
      // 導向 Onboarding
      router.push('/onboarding');
    } else {
      // 導向會員首頁
      router.push('/home');
    }
  } else {
    // 真實 Supabase 登入（未來實作）
    // await supabase.auth.signInWithOAuth({ provider: 'google' })
  }
};
```

#### Step 5: 建立會員首頁 Layout

建立 `app/(member)/layout.tsx`：

```typescript
export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // 檢查登入狀態
  useEffect(() => {
    const auth = localStorage.getItem('auth_mock');
    if (!auth) {
      router.push('/');
      return;
    }
    
    const { isLoggedIn } = JSON.parse(auth);
    if (!isLoggedIn) {
      router.push('/');
    }
  }, []);
  
  return (
    <div className="min-h-screen pb-16">
      {children}
      <BottomNavigation currentPath={pathname} />
    </div>
  );
}
```

建立 `components/BottomNavigation.tsx`：
- 3 個 Tab：Home, Trends, Profile
- 使用 `<Link>` 導向對應路由
- 根據 `currentPath` 高亮當前 Tab

#### Step 6: 建立會員首頁頁面

建立 `app/(member)/home/page.tsx`：
- 實作 2.5.2 的 5 個區塊
- 從 localStorage 讀取用戶資料與最新檢測記錄
- 使用 `lib/food-recommendation-engine.ts` 過濾推薦食材

建立 `app/(member)/trends/page.tsx`：
- 顯示歷史記錄列表
- 若記錄 >= 2 筆，顯示簡單的趨勢圖表（可使用 Recharts）

建立 `app/(member)/profile/page.tsx`：
- 顯示用戶資訊與 Onboarding 資料
- 實作編輯按鈕（導回 `/onboarding`）
- 實作登出按鈕

#### Step 7: 建立食療推薦引擎

建立 `lib/food-recommendation-engine.ts`：

```typescript
interface UserProfile {
  allergies: string[];
  dietType: string;
  medicalConditions: string[];
  primaryGoals: string[];
}

export function getRecommendedFoods(
  resultCode: string,
  userProfile: UserProfile
): FoodItem[] {
  // 1. 從 tongue-data.ts 取得該體質的所有推薦食材
  const tongueData = getTongueData(resultCode);
  let foods = tongueData.food_recommendations;
  
  // 2. 過濾過敏原
  foods = foods.filter(food => {
    return !userProfile.allergies.some(allergy => 
      food.allergens?.includes(allergy)
    );
  });
  
  // 3. 過濾飲食類型
  if (userProfile.dietType === 'Vegan') {
    foods = foods.filter(food => food.isVegan);
  } else if (userProfile.dietType === 'Vegetarian') {
    foods = foods.filter(food => food.isVegetarian);
  }
  
  // 4. 過濾健康狀況禁忌
  foods = foods.filter(food => {
    return !userProfile.medicalConditions.some(condition =>
      food.contraindications?.includes(condition)
    );
  });
  
  // 5. 根據健康目標排序（優先推薦相關食材）
  foods.sort((a, b) => {
    const aScore = userProfile.primaryGoals.filter(goal =>
      a.benefits?.includes(goal)
    ).length;
    const bScore = userProfile.primaryGoals.filter(goal =>
      b.benefits?.includes(goal)
    ).length;
    return bScore - aScore;
  });
  
  // 6. 返回前 3 項
  return foods.slice(0, 3);
}
```

#### Step 8: 擴充 tongue-data.ts

修改 `lib/tongue-data.ts`，在 FoodItem 結構中加入：

```typescript
interface FoodItem {
  name: { en: string; zh: string };
  image_url: string;
  benefit: { en: string; zh: string };
  
  // 新增欄位
  isVegan?: boolean;           // 是否純素
  isVegetarian?: boolean;      // 是否素食
  allergens?: string[];        // 可能的過敏原
  contraindications?: string[]; // 健康狀況禁忌
  benefits?: string[];         // 對應的健康目標
}
```

範例：
```typescript
{
  name: { en: 'Mung Bean', zh: '綠豆' },
  image_url: '/assets/images/Foods/3. Mung bean soup.png',
  benefit: { en: 'Clear heat and detoxify', zh: '清熱解毒' },
  isVegan: true,
  isVegetarian: true,
  allergens: [],
  contraindications: [],
  benefits: ['digestion', 'skin_health']
}
```

#### Step 9: 測試流程

**測試情境 1：首次登入**
1. 點擊 Landing Page 的「Start Diagnosis」
2. 點擊「Continue with Google」
3. 應導向 `/onboarding`（第 1 步）
4. 依序完成 4 個問題
5. 點擊「Complete Setup」
6. 應導向 `/home`（會員首頁）

**測試情境 2：已完成 Onboarding**
1. 清除 localStorage 中的 `onboarding_status`
2. 設置 `isCompleted: true`
3. 點擊「Continue with Google」
4. 應直接導向 `/home`（跳過 Onboarding）

**測試情境 3：編輯個人資料**
1. 在 `/profile` 頁面點擊「Edit Profile」
2. 應導向 `/onboarding`（但保留原有答案）
3. 修改答案後點擊「Complete Setup」
4. 應返回 `/profile`

**測試情境 4：食療推薦過濾**
1. 在 Onboarding 設置：過敏「Seafood」、飲食類型「Vegan」
2. 完成一次舌診（Mock 結果）
3. 在 `/home` 查看「今日食療推薦」
4. 確認沒有海鮮類與動物性食材

---

### 4.2 Phase 2: Supabase 真實串接（未來實作）

**前置作業**：
1. 建立 Supabase 專案
2. 啟用 Google OAuth Provider
3. 建立資料表（Users, User_Profiles, History）
4. 設定 RLS Policies

**實作步驟**：
1. 修改 LoginModal 使用真實 Supabase Auth
2. 建立 API Route：`/api/profile` 處理 User_Profiles CRUD
3. 修改 Onboarding 頁面：完成後呼叫 `/api/profile` 儲存資料
4. 修改會員首頁：從 Supabase 讀取資料（替代 localStorage）
5. 實作資料遷移：Guest 記錄遷移至 Supabase

**注意事項**：
- 保留 Mock 模式開關（`NEXT_PUBLIC_USE_MOCK_MODE`）
- 使用相同的資料結構，確保平滑過渡
- 先在本地測試，確認無誤後再部署

---

### 4.3 開發優先順序建議

**第 1 週**：
- [ ] 建立 Onboarding Store（Zustand）
- [ ] 實作 4 個問卷組件（Q1-Q4）
- [ ] 建立 `/onboarding` 頁面與流程控制
- [ ] 修改 LoginModal 實作 Mock 登入

**第 2 週**：
- [ ] 建立 Member Layout 與 BottomNavigation
- [ ] 實作會員首頁（`/home`）的 5 個區塊
- [ ] 建立食療推薦引擎（過濾邏輯）
- [ ] 擴充 tongue-data.ts（加入過敏原、禁忌等欄位）

**第 3 週**：
- [ ] 實作 Trends 頁面（`/trends`）
- [ ] 實作 Profile 頁面（`/profile`）
- [ ] 整合編輯個人資料功能
- [ ] 完整測試所有流程

**第 4 週**（可選）：
- [ ] 串接真實 Supabase Auth
- [ ] 建立 API Routes 處理 User_Profiles
- [ ] 實作趨勢圖表（Recharts）
- [ ] 優化 UI/UX 與響應式設計

---

### 4.4 Mock 模式環境變數

在 `.env.local` 中添加：

```env
# Mock 模式開關
NEXT_PUBLIC_USE_MOCK_MODE=true

# Supabase（Mock 模式下可使用假值）
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder_key
```

當 `NEXT_PUBLIC_USE_MOCK_MODE=true` 時：
- LoginModal 使用 Mock 登入（不呼叫 Supabase）
- 所有資料讀寫使用 localStorage
- 分析 API 返回隨機 Mock 結果

當 `NEXT_PUBLIC_USE_MOCK_MODE=false` 時：
- LoginModal 使用真實 Supabase OAuth
- 所有資料讀寫使用 Supabase API
- 分析 API 呼叫真實 Python Backend

---

### 4.5 開發注意事項

**資料一致性**：
- Mock 模式與真實模式使用相同的資料結構
- localStorage keys 與 Supabase 欄位名稱保持一致
- 使用 TypeScript Interface 確保型別安全

**用戶體驗**：
- Onboarding 問卷支援「上一步」修改答案
- 每個步驟自動儲存（防止意外關閉）
- 完成 Onboarding 後顯示歡迎訊息

**錯誤處理**：
- 若 localStorage 資料損壞，重置為初始狀態
- 若用戶中途離開 Onboarding，下次自動恢復至最後一步
- 若登入狀態過期，自動導回 Landing Page

**國際化**：
- 所有 Onboarding 問卷文字支援中英雙語
- 使用 `useLanguageStore` 管理語言狀態
- 選項文字統一管理（建立 `lib/onboarding-i18n.ts`）

**可訪問性**：
- 所有表單元素加入適當的 `label` 與 `aria-label`
- 支援鍵盤導航（Tab、Enter）
- 顏色對比度符合 WCAG AA 標準

---