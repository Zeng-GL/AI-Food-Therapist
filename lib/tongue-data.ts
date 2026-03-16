export type TongueType = 'red' | 'pale' | 'white_thick' | 'yellow_thick' | 'peeled' | 'teeth_marks' | 'cracked' | 'no_tongue';

export interface FoodItem {
  name: { en: string; zh: string };
  benefit: { en: string; zh: string };
  image_url?: string;
  icon?: string;
  
  // New fields for personalization
  isVegan?: boolean;           // 是否純素
  isVegetarian?: boolean;      // 是否素食（可食蛋奶）
  allergens?: string[];        // 可能的過敏原 (e.g., 'Seafood', 'Nuts', 'Dairy', 'Gluten', 'Soy')
  contraindications?: string[]; // 健康狀況禁忌 (e.g., 'Diabetes', 'Hypertension', 'G6PD')
  benefits?: string[];         // 對應的健康目標 (e.g., 'sleep_quality', 'digestion', 'fatigue_relief')
}

export interface TongueData {
  id: TongueType;
  name: { en: string; zh: string };
  desc: { en: string; zh: string };
  quote: { en: string; zh: string };
  advice: { en: string; zh: string };
  foods: FoodItem[];
}

export const TONGUE_DATA: Record<TongueType, TongueData> = {
  red: {
    id: 'red',
    name: { en: 'Red Tongue', zh: '舌紅' },
    desc: { en: 'Excess internal heat, prone to heatiness', zh: '火氣大、內熱傾向' },
    quote: { en: 'Feeling the heat? Don\'t let little things ruin your mood 🔥', zh: '最近火氣有點旺，別讓小事燒掉你的好心情🔥' },
    advice: { en: 'A red tongue often indicates excess heat in the body. Cooling and yin-nourishing foods help restore balance.', zh: '舌紅多與體內熱盛有關，適合選擇清涼、養陰的食物，幫助降火平衡。' },
    foods: [
      { 
        name: { en: 'Lotus seeds', zh: '蓮子' }, 
        benefit: { en: 'Calms the mind and reduces internal heat to restore inner peace', zh: '清心安神，能緩解心煩焦慮，並有助於降低體內虛火' },
        isVegan: true,
        isVegetarian: true,
        allergens: [],
        contraindications: [],
        benefits: ['sleep_quality', 'general_wellness']
      },
      { 
        name: { en: 'Lily bulbs', zh: '百合' }, 
        benefit: { en: 'Nourishes Yin and moistens dryness to soothe the respiratory system', zh: '滋陰潤燥，專門滋養肺部與喉嚨，修復因乾燥引起的不適' },
        isVegan: true,
        isVegetarian: true,
        allergens: [],
        contraindications: [],
        benefits: ['sleep_quality', 'skin_health']
      },
      { 
        name: { en: 'Mung bean soup', zh: '綠豆湯' }, 
        benefit: { en: 'Clears heat and detoxifies the body from accumulated toxins', zh: '清熱解毒，是夏季消暑、排除體內熱毒的經典食療' },
        isVegan: true,
        isVegetarian: true,
        allergens: [],
        contraindications: ['G6PD'],
        benefits: ['skin_health', 'general_wellness']
      }
    ]
  },
  pale: {
    id: 'pale',
    name: { en: 'Pale Tongue', zh: '舌淡白' },
    desc: { en: 'Cold-deficiency constitution, weaker circulation', zh: '虛寒體質、循環較弱' },
    quote: { en: 'Your energy seems low — warm foods and rest will help 🛌', zh: '看起來有點虛，不妨多補充溫暖食物與休息🛌' },
    advice: { en: 'A pale tongue is often linked to qi and blood deficiency. Warm, spleen-strengthening foods can improve vitality and circulation.', zh: '舌淡白常與氣血不足有關，適合溫補、健脾的食物，幫助提升體力與循環。' },
    foods: [
      { 
        name: { en: 'Red dates', zh: '紅棗' }, 
        benefit: { en: 'Tonifies Qi and nourishes blood to enhance energy levels', zh: '補氣養血，能提升氣色並增強脾胃能量' },
        isVegan: true,
        isVegetarian: true,
        allergens: [],
        contraindications: ['Diabetes'],
        benefits: ['fatigue_relief', 'general_wellness']
      },
      { 
        name: { en: 'Goji berries', zh: '枸杞' }, 
        benefit: { en: 'Nourishes the liver and improves vision for eye health', zh: '養肝明目，對長期用眼過度及肝腎陰虛有良好的補益作用' },
        isVegan: true,
        isVegetarian: true,
        allergens: [],
        contraindications: [],
        benefits: ['fatigue_relief', 'general_wellness']
      },
      { 
        name: { en: 'Chinese yam', zh: '山藥' }, 
        benefit: { en: 'Strengthens the spleen and kidney to support digestive health', zh: '健脾補腎，性質溫和，能強健消化系統並固腎益精' },
        isVegan: true,
        isVegetarian: true,
        allergens: [],
        contraindications: [],
        benefits: ['digestion', 'fatigue_relief']
      }
    ]
  },
  white_thick: {
    id: 'white_thick',
    name: { en: 'Thick White Coating', zh: '舌苔白厚' },
    desc: { en: 'Dampness accumulation, poor digestion', zh: '濕氣重、消化不良' },
    quote: { en: 'Feeling heavy? Try herbal tea to clear the damp ☁️', zh: '濕氣卡住了你？試試去濕茶，讓身體清爽點☁️' },
    advice: { en: 'A thick white coating often indicates dampness in the spleen and stomach. Foods that drain dampness and promote digestion are recommended.', zh: '舌苔白厚多與脾胃濕重有關，適合健脾化濕、利水的食物。' },
    foods: [
      { 
        name: { en: "Job's tears", zh: '薏仁' }, 
        benefit: { en: 'Drains dampness and promotes urination to reduce swelling', zh: '利水滲濕，有助於排除體內多餘水分，消除浮腫' },
        isVegan: true,
        isVegetarian: true,
        allergens: ['Gluten'],
        contraindications: [],
        benefits: ['digestion', 'general_wellness']
      },
      { 
        name: { en: 'White radish', zh: '白蘿蔔' }, 
        benefit: { en: 'Aids digestion and promotes smooth movement of Qi', zh: '助消化，能順氣消食，緩解腹脹不適' },
        isVegan: true,
        isVegetarian: true,
        allergens: [],
        contraindications: [],
        benefits: ['digestion']
      },
      { 
        name: { en: 'Winter melon', zh: '冬瓜' }, 
        benefit: { en: 'Clears heat and promotes urination to flush out excess heat', zh: '清熱利尿，透過增加代謝排尿來帶走體內的積熱' },
        isVegan: true,
        isVegetarian: true,
        allergens: [],
        contraindications: [],
        benefits: ['digestion', 'general_wellness']
      }
    ]
  },
  yellow_thick: {
    id: 'yellow_thick',
    name: { en: 'Thick Yellow Coating', zh: '舌苔黃厚' },
    desc: { en: 'Internal damp-heat, heat syndrome', zh: '濕熱內蘊、上火' },
    quote: { en: 'Watch out for heatiness! Cool down with light meals 🍵', zh: '小心上火！多吃清熱食物，給自己降溫🍵' },
    advice: { en: 'A thick yellow coating is often linked to internal damp-heat and poor digestion. Choose foods that clear heat, remove dampness, and aid digestion.', zh: '舌苔黃厚多與體內濕熱、消化不良有關，適合清熱、去濕、助消化的食物。' },
    foods: [
      { 
        name: { en: 'Bitter melon', zh: '苦瓜' }, 
        benefit: { en: 'Clears heat and relieves summer heat, ideal for cooling the body', zh: '清熱解暑，能瀉火除煩，特別適合火氣大時食用' },
        isVegan: true,
        isVegetarian: true,
        allergens: [],
        contraindications: ['Diabetes'],
        benefits: ['digestion', 'general_wellness']
      },
      { 
        name: { en: 'Mung beans', zh: '綠豆' }, 
        benefit: { en: 'Clears heat and detoxifies to protect against heat-related fatigue', zh: '清熱解毒，強效排除體內暑氣與毒素' },
        isVegan: true,
        isVegetarian: true,
        allergens: [],
        contraindications: ['G6PD'],
        benefits: ['digestion', 'skin_health']
      },
      { 
        name: { en: 'Aged tangerine peel', zh: '陳皮' }, 
        benefit: { en: 'Strengthens the spleen and regulates Qi to reduce bloating', zh: '健脾理氣，能燥濕化痰，讓脾胃運作更順暢' },
        isVegan: true,
        isVegetarian: true,
        allergens: [],
        contraindications: [],
        benefits: ['digestion']
      }
    ]
  },
  peeled: {
    id: 'peeled',
    name: { en: 'Peeled / No Coating', zh: '舌苔剝落 / 無苔' },
    desc: { en: 'Stomach yin deficiency, qi deficiency, general weakness', zh: '胃陰虛、氣虛、身體較虛弱' },
    quote: { en: 'Running low? Time to recharge with rest and nutrients 💧', zh: '最近有點累過頭，記得放慢腳步，補充營養💧' },
    advice: { en: 'A peeled tongue coating is often related to stomach yin deficiency. Gentle, yin-nourishing foods are ideal.', zh: '舌苔剝落多與胃陰不足有關，適合滋陰養胃、溫和補養的食物' },
    foods: [
      { 
        name: { en: 'Snow pear', zh: '雪梨' }, 
        benefit: { en: 'Generates body fluids and moistens dryness to relieve thirst', zh: '生津潤燥，潤肺止咳，是補足身體水分的佳品' },
        isVegan: true,
        isVegetarian: true,
        allergens: [],
        contraindications: [],
        benefits: ['skin_health', 'general_wellness']
      },
      { 
        name: { en: 'Fresh lily bulbs', zh: '鮮百合' }, 
        benefit: { en: 'Nourishes Yin and moistens the lungs for deeper hydration', zh: '養陰潤肺，口感更潤，能清心除煩並滋潤呼吸道' },
        isVegan: true,
        isVegetarian: true,
        allergens: [],
        contraindications: [],
        benefits: ['sleep_quality', 'general_wellness']
      },
      { 
        name: { en: 'Millet porridge', zh: '小米粥' }, 
        benefit: { en: 'Strengthens the spleen and nourishes the stomach for easy digestion', zh: '健脾養胃，極易消化，是病後或脾胃虛弱者的補品' },
        isVegan: true,
        isVegetarian: true,
        allergens: ['Gluten'],
        contraindications: [],
        benefits: ['digestion', 'sleep_quality']
      }
    ]
  },
  teeth_marks: {
    id: 'teeth_marks',
    name: { en: 'Teeth Marks (Scalloped)', zh: '舌有齒痕' },
    desc: { en: 'Spleen deficiency, edema, internal dampness', zh: '脾虛、水腫、體內濕氣' },
    quote: { en: 'Stress shows — sleep early and cut the salt 🌙', zh: '壓力太大會水腫喔，早睡和少鹽可以幫你消腫🌙' },
    advice: { en: 'Teeth marks on the tongue are often related to spleen deficiency and excess dampness. Foods that strengthen the spleen and drain dampness are beneficial.', zh: '有齒痕多與脾虛、體內濕氣重有關，適合健脾利濕的食物。' },
    foods: [
      { 
        name: { en: "Job's tears", zh: '薏仁' }, 
        benefit: { en: 'Drains dampness and promotes urination to reduce swelling', zh: '利水滲濕，有助於排除體內多餘水分，消除浮腫' },
        isVegan: true,
        isVegetarian: true,
        allergens: ['Gluten'],
        contraindications: [],
        benefits: ['digestion', 'general_wellness']
      },
      { 
        name: { en: 'Red beans', zh: '紅豆' }, 
        benefit: { en: 'Strengthens the spleen and removes dampness from the body', zh: '健脾祛濕，側重於補血與代謝下肢水腫' },
        isVegan: true,
        isVegetarian: true,
        allergens: [],
        contraindications: [],
        benefits: ['digestion', 'general_wellness']
      },
      { 
        name: { en: 'Fresh ginger', zh: '生薑' }, 
        benefit: { en: 'Warms the middle burner and expels dampness and cold', zh: '溫中祛濕，透過溫熱性質發汗散寒，驅除體內寒濕' },
        isVegan: true,
        isVegetarian: true,
        allergens: [],
        contraindications: [],
        benefits: ['digestion', 'fatigue_relief']
      }
    ]
  },
  cracked: {
    id: 'cracked',
    name: { en: 'Cracked Tongue', zh: '舌有裂紋' },
    desc: { en: 'Fluid deficiency, stress-related heat or internal heat', zh: '體液不足、壓力大或內熱' },
    quote: { en: 'Your tongue tells what your heart hides — be kind to yourself 💬', zh: '你內心的疲憊悄悄顯現在舌頭上，該好好愛自己了💬' },
    advice: { en: 'A cracked tongue is often associated with yin deficiency or lack of body fluids. Choose yin-nourishing and fluid-generating foods.', zh: '舌有裂紋多與陰虛或體液不足有關，適合滋陰養津的食物' },
    foods: [
      { 
        name: { en: 'Black sesame', zh: '黑芝麻' }, 
        benefit: { en: 'Nourishes Yin and moistens dryness for skin and hair health', zh: '滋陰潤燥，能潤腸通便並滋養頭髮與肌膚' },
        isVegan: true,
        isVegetarian: true,
        allergens: ['Nuts'],
        contraindications: [],
        benefits: ['skin_health', 'general_wellness']
      },
      { 
        name: { en: 'White fungus', zh: '銀耳' }, 
        benefit: { en: 'Nourishes Yin and generates fluids to replenish collagen-like moisture', zh: '養陰生津，含有豐富膠質，能滋潤全身乾燥組織' },
        isVegan: true,
        isVegetarian: true,
        allergens: [],
        contraindications: [],
        benefits: ['skin_health', 'sleep_quality']
      },
      { 
        name: { en: 'Sugarcane juice', zh: '甘蔗汁' }, 
        benefit: { en: 'Clears heat and generates fluids to rapidly hydrate the body', zh: '清熱生津，能快速補給水分並緩解口乾舌燥' },
        isVegan: true,
        isVegetarian: true,
        allergens: [],
        contraindications: ['Diabetes'],
        benefits: ['general_wellness']
      }
    ]
  },
  no_tongue: {
    id: 'no_tongue',
    name: { en: 'No Tongue Detected', zh: '未偵測到舌頭' },
    desc: { en: 'The system could not detect a tongue in the image.', zh: '系統在影像中未偵測到舌頭' },
    quote: { en: 'Please make sure your tongue is clearly visible in the photo.', zh: '請確保舌頭在照片中清楚可見。' },
    advice: { en: 'Try taking the photo again in good lighting, stick out your tongue naturally, and keep the camera steady.', zh: '請在光線充足的環境下重新拍攝，自然伸出舌頭並保持相機穩定。' },
    foods: [
      { 
        name: { en: '', zh: '' }, 
        benefit: { en: '', zh: '' },
        isVegan: true,
        isVegetarian: true,
        allergens: [],
        contraindications: [],
        benefits: []
      }
    ]
  },
};

export const getTongueData = (type: TongueType): TongueData => {
  return TONGUE_DATA[type];
};

export const getAllTongueTypes = (): TongueType[] => {
  return Object.keys(TONGUE_DATA) as TongueType[];
};

