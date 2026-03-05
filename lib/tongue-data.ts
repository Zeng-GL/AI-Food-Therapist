export type TongueType = 'red' | 'pale' | 'white_thick' | 'yellow_thick' | 'peeled' | 'teeth_marks' | 'cracked';

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
        benefit: { en: 'Calm the mind and reduce internal heat', zh: '清心安神，降內火' },
        isVegan: true,
        isVegetarian: true,
        allergens: [],
        contraindications: [],
        benefits: ['sleep_quality', 'general_wellness']
      },
      { 
        name: { en: 'Lily bulbs', zh: '百合' }, 
        benefit: { en: 'Nourish yin and moisten dryness', zh: '滋陰潤燥' },
        isVegan: true,
        isVegetarian: true,
        allergens: [],
        contraindications: [],
        benefits: ['sleep_quality', 'skin_health']
      },
      { 
        name: { en: 'Mung bean soup', zh: '綠豆湯' }, 
        benefit: { en: 'Clear heat and detoxify', zh: '清熱解毒' },
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
        benefit: { en: 'Tonify qi and nourish blood', zh: '補氣養血' },
        isVegan: true,
        isVegetarian: true,
        allergens: [],
        contraindications: ['Diabetes'],
        benefits: ['fatigue_relief', 'general_wellness']
      },
      { 
        name: { en: 'Goji berries', zh: '枸杞' }, 
        benefit: { en: 'Nourish the liver and improve vision', zh: '養肝明目' },
        isVegan: true,
        isVegetarian: true,
        allergens: [],
        contraindications: [],
        benefits: ['fatigue_relief', 'general_wellness']
      },
      { 
        name: { en: 'Chinese yam', zh: '山藥' }, 
        benefit: { en: 'Strengthen spleen and kidney', zh: '健脾補腎' },
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
        benefit: { en: 'Drain dampness and promote urination', zh: '利水滲濕' },
        isVegan: true,
        isVegetarian: true,
        allergens: ['Gluten'],
        contraindications: [],
        benefits: ['digestion', 'general_wellness']
      },
      { 
        name: { en: 'White radish', zh: '白蘿蔔' }, 
        benefit: { en: 'Aid digestion', zh: '助消化' },
        isVegan: true,
        isVegetarian: true,
        allergens: [],
        contraindications: [],
        benefits: ['digestion']
      },
      { 
        name: { en: 'Winter melon', zh: '冬瓜' }, 
        benefit: { en: 'Clear heat and promote urination', zh: '清熱利尿' },
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
        benefit: { en: 'Clears heat and relieves summer heat', zh: '清熱解暑' },
        isVegan: true,
        isVegetarian: true,
        allergens: [],
        contraindications: ['Diabetes'],
        benefits: ['digestion', 'general_wellness']
      },
      { 
        name: { en: 'Mung beans', zh: '綠豆' }, 
        benefit: { en: 'Clear heat and detoxify', zh: '清熱解毒' },
        isVegan: true,
        isVegetarian: true,
        allergens: [],
        contraindications: ['G6PD'],
        benefits: ['digestion', 'skin_health']
      },
      { 
        name: { en: 'Aged tangerine peel', zh: '陳皮' }, 
        benefit: { en: 'Strengthen spleen and regulate qi', zh: '健脾理氣' },
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
        benefit: { en: 'Generate fluids and moisten dryness', zh: '生津潤燥' },
        isVegan: true,
        isVegetarian: true,
        allergens: [],
        contraindications: [],
        benefits: ['skin_health', 'general_wellness']
      },
      { 
        name: { en: 'Fresh lily bulbs', zh: '鮮百合' }, 
        benefit: { en: 'Nourish yin and moisten lungs', zh: '養陰潤肺' },
        isVegan: true,
        isVegetarian: true,
        allergens: [],
        contraindications: [],
        benefits: ['sleep_quality', 'general_wellness']
      },
      { 
        name: { en: 'Millet porridge', zh: '小米粥' }, 
        benefit: { en: 'Strengthen spleen and nourish stomach', zh: '健脾養胃' },
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
        benefit: { en: 'Drain dampness', zh: '利水滲濕' },
        isVegan: true,
        isVegetarian: true,
        allergens: ['Gluten'],
        contraindications: [],
        benefits: ['digestion', 'general_wellness']
      },
      { 
        name: { en: 'Red beans', zh: '紅豆' }, 
        benefit: { en: 'Strengthen spleen and remove dampness', zh: '健脾祛濕' },
        isVegan: true,
        isVegetarian: true,
        allergens: [],
        contraindications: [],
        benefits: ['digestion', 'general_wellness']
      },
      { 
        name: { en: 'Fresh ginger', zh: '生薑' }, 
        benefit: { en: 'Warm the middle and expel dampness', zh: '溫中祛濕' },
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
        benefit: { en: 'Nourish yin and moisten dryness', zh: '滋陰潤燥' },
        isVegan: true,
        isVegetarian: true,
        allergens: ['Nuts'],
        contraindications: [],
        benefits: ['skin_health', 'general_wellness']
      },
      { 
        name: { en: 'White fungus', zh: '銀耳' }, 
        benefit: { en: 'Nourish yin and generate fluids', zh: '養陰生津' },
        isVegan: true,
        isVegetarian: true,
        allergens: [],
        contraindications: [],
        benefits: ['skin_health', 'sleep_quality']
      },
      { 
        name: { en: 'Sugarcane juice', zh: '甘蔗汁' }, 
        benefit: { en: 'Clear heat and generate fluids', zh: '清熱生津' },
        isVegan: true,
        isVegetarian: true,
        allergens: [],
        contraindications: ['Diabetes'],
        benefits: ['general_wellness']
      }
    ]
  }
};

export const getTongueData = (type: TongueType): TongueData => {
  return TONGUE_DATA[type];
};

export const getAllTongueTypes = (): TongueType[] => {
  return Object.keys(TONGUE_DATA) as TongueType[];
};

