# Design System - AI Food Therapist

## 顏色系統 (Color Palette)

### 主色調 (Primary Colors)
- **Primary Green**: `#2D8659` (深綠色 - 標題、重要元素)
- **Primary Light Green**: `#E8F5E9` (淺綠色 - 背景)
- **Primary Teal**: `#4DB6AC` (青綠色 - 漸變按鈕右側)

### 漸變色 (Gradients)
- **Button Gradient**: 從 `#2D8659` (左) 到 `#4DB6AC` (右)
- **Background**: `#F1F8F4` (淺灰綠色背景)

### 文字顏色 (Text Colors)
- **Primary Text**: `#1B5E20` (深綠色 - 標題)
- **Secondary Text**: `#424242` (深灰色 - 描述文字)
- **Button Text**: `#FFFFFF` (白色 - 按鈕文字)

### 功能顏色 (Functional Colors)
- **Success**: `#4CAF50`
- **Error**: `#F44336`
- **Warning**: `#FF9800`
- **Info**: `#2196F3`

## 字體系統 (Typography)

### 字體大小 (Font Sizes)
- **Display Large**: `48px` / `3rem` - 主標題
- **Display Medium**: `36px` / `2.25rem` - 次標題
- **Heading 1**: `32px` / `2rem` - 大標題
- **Heading 2**: `24px` / `1.5rem` - 中標題
- **Heading 3**: `20px` / `1.25rem` - 小標題
- **Body Large**: `18px` / `1.125rem` - 大正文
- **Body**: `16px` / `1rem` - 正文
- **Body Small**: `14px` / `0.875rem` - 小正文
- **Caption**: `12px` / `0.75rem` - 說明文字

### 字體粗細 (Font Weights)
- **Bold**: `700` - 標題
- **Semibold**: `600` - 次標題
- **Medium**: `500` - 強調文字
- **Regular**: `400` - 正文

### 行高 (Line Heights)
- **Tight**: `1.2` - 標題
- **Normal**: `1.5` - 正文
- **Relaxed**: `1.75` - 長段落

## 間距系統 (Spacing)

### 基礎間距單位
- **Base Unit**: `4px`
- **Scale**: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96

### 常用間距
- **XS**: `4px` / `0.25rem`
- **SM**: `8px` / `0.5rem`
- **MD**: `16px` / `1rem`
- **LG**: `24px` / `1.5rem`
- **XL**: `32px` / `2rem`
- **2XL**: `48px` / `3rem`
- **3XL**: `64px` / `4rem`

## 圓角系統 (Border Radius)

- **None**: `0`
- **SM**: `4px` / `0.25rem` - 小元素
- **MD**: `8px` / `0.5rem` - 按鈕、卡片
- **LG**: `12px` / `0.75rem` - 大卡片
- **XL**: `16px` / `1rem` - 模態框
- **Full**: `9999px` - 圓形元素

## 陰影系統 (Shadows)

- **SM**: `0 1px 2px 0 rgba(0, 0, 0, 0.05)`
- **MD**: `0 4px 6px -1px rgba(0, 0, 0, 0.1)`
- **LG**: `0 10px 15px -3px rgba(0, 0, 0, 0.1)`
- **XL**: `0 20px 25px -5px rgba(0, 0, 0, 0.1)`

## 按鈕樣式 (Button Styles)

### Primary Button
- **背景**: 漸變 (從 `#2D8659` 到 `#4DB6AC`)
- **文字**: 白色、粗體
- **圓角**: `8px`
- **內距**: `16px 32px`
- **陰影**: Medium
- **Hover**: 稍微加深顏色

### Secondary Button
- **背景**: 白色
- **邊框**: `2px solid #2D8659`
- **文字**: `#2D8659`
- **圓角**: `8px`

## 卡片樣式 (Card Styles)

- **背景**: 白色
- **圓角**: `12px`
- **陰影**: Medium
- **內距**: `24px`

## 圖標系統 (Icon System)

- **大小**: 16px, 20px, 24px, 32px, 48px
- **顏色**: 繼承文字顏色或使用主色調
- **庫**: Lucide React

## 響應式斷點 (Breakpoints)

- **Mobile**: `320px - 767px`
- **Tablet**: `768px - 1023px`
- **Desktop**: `1024px+`

## 動畫與過渡 (Animations)

- **Duration**: 150ms, 200ms, 300ms
- **Easing**: `ease-in-out`, `ease-out`
- **常用動畫**: Fade, Slide, Scale

## 組件規範

### Landing Page
- 背景: 淺綠色漸變 (`#F1F8F4` 到 `#E8F5E9`)
- 標題: "Tongue Mirror, Body Truth" - 深綠色粗體
- 描述: 深灰色，中等大小
- 按鈕: 漸變綠色，白色文字，圓角

### 設計原則
1. **簡潔**: 保持界面簡潔，避免過多裝飾
2. **一致性**: 統一使用設計系統中的顏色和間距
3. **可讀性**: 確保文字對比度符合 WCAG AA 標準
4. **醫療感**: 使用溫和的綠色調，傳達健康、自然的感覺

