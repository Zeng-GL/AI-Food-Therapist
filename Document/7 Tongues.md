# Role
You are a Senior Frontend Engineer and UX Designer specializing in Mobile-first Health Applications. You are building a "Tongue Diagnosis AI" web prototype using Next.js.

# Project Goal
Build a Responsive Web App (Mobile First) where users take a photo of their tongue, and AI analyzes it to provide health feedback based on Traditional Chinese Medicine (TCM).

# Tech Stack
- **Framework**: Next.js 14 (App Router) with TypeScript.
- **Styling**: Tailwind CSS + Lucide React Icons.
- **Auth/DB**: Supabase (Handle Google Login & History table).
- **State**: Standard React Hooks or Context.
- **Deployment target**: Vercel.

# Core Data Structure (The 7 Tongue Types)
*IMPORTANT*: Use this exact data structure for the diagnosis results. The app is Bilingual (English Default).

```typescript
type TongueType = 'red' | 'pale' | 'white_thick' | 'yellow_thick' | 'peeled' | 'teeth_marks' | 'cracked';

const TONGUE_DATA = {
  red: {
    id: 'red',
    name: { en: 'Red Tongue', zh: '舌紅' },
    desc: { en: 'Excess internal heat, prone to heatiness', zh: '火氣大、內熱傾向' },
    quote: { en: 'Feeling the heat? Don’t let little things ruin your mood 🔥', zh: '最近火氣有點旺，別讓小事燒掉你的好心情🔥' },
    advice: { en: 'A red tongue often indicates excess heat in the body. Cooling and yin-nourishing foods help restore balance.', zh: '舌紅多與體內熱盛有關，適合選擇清涼、養陰的食物，幫助降火平衡。' },
    foods: [
      { name: { en: 'Lotus seeds', zh: '蓮子' }, benefit: { en: 'Calm the mind and reduce internal heat', zh: '清心安神，降內火' } },
      { name: { en: 'Lily bulbs', zh: '百合' }, benefit: { en: 'Nourish yin and moisten dryness', zh: '滋陰潤燥' } },
      { name: { en: 'Mung bean soup', zh: '綠豆湯' }, benefit: { en: 'Clear heat and detoxify', zh: '清熱解毒' } }
    ]
  },
  pale: {
    id: 'pale',
    name: { en: 'Pale Tongue', zh: '舌淡白' },
    desc: { en: 'Cold-deficiency constitution, weaker circulation', zh: '虛寒體質、循環較弱' },
    quote: { en: 'Your energy seems low — warm foods and rest will help 🛌', zh: '看起來有點虛，不妨多補充溫暖食物與休息🛌' },
    advice: { en: 'A pale tongue is often linked to qi and blood deficiency. Warm, spleen-strengthening foods can improve vitality and circulation.', zh: '舌淡白常與氣血不足有關，適合溫補、健脾的食物，幫助提升體力與循環。' },
    foods: [
      { name: { en: 'Red dates', zh: '紅棗' }, benefit: { en: 'Tonify qi and nourish blood', zh: '補氣養血' } },
      { name: { en: 'Goji berries', zh: '枸杞' }, benefit: { en: 'Nourish the liver and improve vision', zh: '養肝明目' } },
      { name: { en: 'Chinese yam', zh: '山藥' }, benefit: { en: 'Strengthen spleen and kidney', zh: '健脾補腎' } }
    ]
  },
  white_thick: {
    id: 'white_thick',
    name: { en: 'Thick White Coating', zh: '舌苔白厚' },
    desc: { en: 'Dampness accumulation, poor digestion', zh: '濕氣重、消化不良' },
    quote: { en: 'Feeling heavy? Try herbal tea to clear the damp ☁️', zh: '濕氣卡住了你？試試去濕茶，讓身體清爽點☁️' },
    advice: { en: 'A thick white coating often indicates dampness in the spleen and stomach. Foods that drain dampness and promote digestion are recommended.', zh: '舌苔白厚多與脾胃濕重有關，適合健脾化濕、利水的食物。' },
    foods: [
      { name: { en: "Job's tears", zh: '薏仁' }, benefit: { en: 'Drain dampness and promote urination', zh: '利水滲濕' } },
      { name: { en: 'White radish', zh: '白蘿蔔' }, benefit: { en: 'Aid digestion', zh: '助消化' } },
      { name: { en: 'Winter melon', zh: '冬瓜' }, benefit: { en: 'Clear heat and promote urination', zh: '清熱利尿' } }
    ]
  },
  yellow_thick: {
    id: 'yellow_thick',
    name: { en: 'Thick Yellow Coating', zh: '舌苔黃厚' },
    desc: { en: 'Internal damp-heat, heat syndrome', zh: '濕熱內蘊、上火' },
    quote: { en: 'Watch out for heatiness! Cool down with light meals 🍵', zh: '小心上火！多吃清熱食物，給自己降溫🍵' },
    advice: { en: 'A thick yellow coating is often linked to internal damp-heat and poor digestion. Choose foods that clear heat, remove dampness, and aid digestion.', zh: '舌苔黃厚多與體內濕熱、消化不良有關，適合清熱、去濕、助消化的食物。' },
    foods: [
      { name: { en: 'Bitter melon', zh: '苦瓜' }, benefit: { en: 'Clears heat and relieves summer heat', zh: '清熱解暑' } },
      { name: { en: 'Mung beans', zh: '綠豆' }, benefit: { en: 'Clear heat and detoxify', zh: '清熱解毒' } },
      { name: { en: 'Aged tangerine peel', zh: '陳皮' }, benefit: { en: 'Strengthen spleen and regulate qi', zh: '健脾理氣' } }
    ]
  },
  peeled: {
    id: 'peeled',
    name: { en: 'Peeled / No Coating', zh: '舌苔剝落 / 無苔' },
    desc: { en: 'Stomach yin deficiency, qi deficiency, general weakness', zh: '胃陰虛、氣虛、身體較虛弱' },
    quote: { en: 'Running low? Time to recharge with rest and nutrients 💧', zh: '最近有點累過頭，記得放慢腳步，補充營養💧' },
    advice: { en: 'A peeled tongue coating is often related to stomach yin deficiency. Gentle, yin-nourishing foods are ideal.', zh: '舌苔剝落多與胃陰不足有關，適合滋陰養胃、溫和補養的食物' },
    foods: [
      { name: { en: 'Snow pear', zh: '雪梨' }, benefit: { en: 'Generate fluids and moisten dryness', zh: '生津潤燥' } },
      { name: { en: 'Fresh lily bulbs', zh: '鮮百合' }, benefit: { en: 'Nourish yin and moisten lungs', zh: '養陰潤肺' } },
      { name: { en: 'Millet porridge', zh: '小米粥' }, benefit: { en: 'Strengthen spleen and nourish stomach', zh: '健脾養胃' } }
    ]
  },
  teeth_marks: {
    id: 'teeth_marks',
    name: { en: 'Teeth Marks (Scalloped)', zh: '舌有齒痕' },
    desc: { en: 'Spleen deficiency, edema, internal dampness', zh: '脾虛、水腫、體內濕氣' },
    quote: { en: 'Stress shows — sleep early and cut the salt 🌙', zh: '壓力太大會水腫喔，早睡和少鹽可以幫你消腫🌙' },
    advice: { en: 'Teeth marks on the tongue are often related to spleen deficiency and excess dampness. Foods that strengthen the spleen and drain dampness are beneficial.', zh: '有齒痕多與脾虛、體內濕氣重有關，適合健脾利濕的食物。' },
    foods: [
      { name: { en: "Job's tears", zh: '薏仁' }, benefit: { en: 'Drain dampness', zh: '利水滲濕' } },
      { name: { en: 'Red beans', zh: '紅豆' }, benefit: { en: 'Strengthen spleen and remove dampness', zh: '健脾祛濕' } },
      { name: { en: 'Fresh ginger', zh: '生薑' }, benefit: { en: 'Warm the middle and expel dampness', zh: '溫中祛濕' } }
    ]
  },
  cracked: {
    id: 'cracked',
    name: { en: 'Cracked Tongue', zh: '舌有裂紋' },
    desc: { en: 'Fluid deficiency, stress-related heat or internal heat', zh: '體液不足、壓力大或內熱' },
    quote: { en: 'Your tongue tells what your heart hides — be kind to yourself 💬', zh: '你內心的疲憊悄悄顯現在舌頭上，該好好愛自己了💬' },
    advice: { en: 'A cracked tongue is often associated with yin deficiency or lack of body fluids. Choose yin-nourishing and fluid-generating foods.', zh: '舌有裂紋多與陰虛或體液不足有關，適合滋陰養津的食物' },
    foods: [
      { name: { en: 'Black sesame', zh: '黑芝麻' }, benefit: { en: 'Nourish yin and moisten dryness', zh: '滋陰潤燥' } },
      { name: { en: 'White fungus', zh: '銀耳' }, benefit: { en: 'Nourish yin and generate fluids', zh: '養陰生津' } },
      { name: { en: 'Sugarcane juice', zh: '甘蔗汁' }, benefit: { en: 'Clear heat and generate fluids', zh: '清熱生津' } }
    ]
  }
};

# Feature Implementation Guidelines

## 1. Authentication & Guest Mode
- Use Supabase Auth for Google Login.
- Provide a "Continue as Guest" button on the login screen.
- **Rule**: Guests can use the camera and see results, but their data is NOT saved to the History database.
- **Rule**: Logged-in users' results are automatically saved to Supabase table `history`.

## 2. Camera & Disclaimer Flow
- **Step 1**: Show a Disclaimer Checkbox: "I understand this is an AI prototype and not a medical diagnosis." (Must be checked to proceed).
- **Step 2**: Request Browser Camera Permissions (`navigator.mediaDevices.getUserMedia`).
- **Step 3**: **Camera UI**: Display a video stream with a semi-transparent SVG overlay in the center shaped like a tongue to guide the user.
- **Step 4**: Capture photo -> Compress (Max width 1024px) -> Send to API.

## 3. Analysis Simulation (Mock vs Real)
- Create a service function `analyzeTongue(imageFile)`.
- **Mode A (Mock)**: If a specific ENV variable is set, wait 3 seconds and return a random result from `TONGUE_DATA`.
- **Mode B (Real)**: Use `fetch` to POST the image `FormData` to the Python backend endpoint.
- **Loading UI**: While waiting, show 3 steps: "Compressing Image...", "AI Segmenting...", "Generating Report...".

## 4. Result & Recommendation UI
- Display the `quote` prominently.
- Display the `name` and `desc`.
- **Food Cards**: Iterate through the `foods` array. Each card should have a placeholder for an image, the food name, and the benefit.
- **Language Switch**: Add a simple toggle button (EN/ZH) that switches the text displayed from the `TONGUE_DATA` object.

## 5. History Page
- Only accessible for logged-in users.
- Fetch data from Supabase `history` table.
- Display a list of past scans with date and result summary.

# Deliverables
Please generate the code structure, focusing on:
1. The `TongueDiagnosis` component (Main logic).
2. The `useAuth` hook (Handling Supabase user vs Guest).
3. The `TONGUE_DATA` constant file.
4. The API service function.
