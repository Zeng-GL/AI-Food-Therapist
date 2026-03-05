import { Language } from './i18n';
import { Gender, AgeGroup, HealthGoal, SleepHabit, Allergy, DietType, MedicalCondition } from '@/store/use-onboarding-store';

export const onboardingText = {
  // Progress
  progress: {
    en: (current: number, total: number) => `${current} of ${total}`,
    zh: (current: number, total: number) => `${current} / ${total}`,
  },
  
  // Navigation
  next: { en: 'Next', zh: '下一步' },
  back: { en: 'Back', zh: '上一步' },
  complete: { en: 'Complete Setup', zh: '完成設定' },
  skip: { en: 'Skip', zh: '跳過' },
  
  // Q1: Basic Profile
  q1: {
    title: { en: 'Tell us about yourself', zh: '關於您的基本資訊' },
    subtitle: { en: 'This helps us personalize your experience', zh: '這能幫助我們提供個人化建議' },
    
    genderLabel: { en: 'Gender', zh: '性別' },
    genderOptions: {
      Male: { en: 'Male', zh: '男性' },
      Female: { en: 'Female', zh: '女性' },
      Other: { en: 'Other', zh: '其他' },
    } as Record<Gender, { en: string; zh: string }>,
    
    ageLabel: { en: 'Age Group', zh: '年齡範圍' },
    ageOptions: {
      Under_20: { en: 'Under 20', zh: '20歲以下' },
      '21_25': { en: '21-25', zh: '21-25歲' },
      '26_30': { en: '26-30', zh: '26-30歲' },
      '31_35': { en: '31-35', zh: '31-35歲' },
      '36_40': { en: '36-40', zh: '36-40歲' },
      '41_45': { en: '41-45', zh: '41-45歲' },
      '46_50': { en: '46-50', zh: '46-50歲' },
      '51_65': { en: '51-65', zh: '51-65歲' },
      Over_65: { en: 'Over 65', zh: '65歲以上' },
    } as Record<AgeGroup, { en: string; zh: string }>,
    
    validation: { en: 'Please select both gender and age group', zh: '請選擇性別與年齡範圍' },
  },
  
  // Q2: Health Goals
  q2: {
    title: { en: 'What are your health priorities?', zh: '您最在意的健康目標？' },
    subtitle: { en: 'Select up to 2 goals', zh: '最多選擇 2 項' },
    selected: { en: (count: number) => `${count}/2 selected`, zh: (count: number) => `已選擇 ${count}/2` },
    
    options: {
      sleep_quality: { en: 'Improve Sleep Quality', zh: '改善睡眠品質' },
      digestion: { en: 'Digestive Health', zh: '消化系統健康' },
      fatigue_relief: { en: 'Energy & Fatigue Relief', zh: '提升精力、緩解疲勞' },
      skin_health: { en: 'Skin Health', zh: '皮膚健康' },
      general_wellness: { en: 'Overall Wellness', zh: '整體健康' },
    } as Record<HealthGoal, { en: string; zh: string }>,
    
    validation: { en: 'Please select at least 1 health goal', zh: '請至少選擇 1 項健康目標' },
    maxReached: { en: 'You can only select up to 2 goals', zh: '最多只能選擇 2 項目標' },
  },
  
  // Q3: Lifestyle
  q3: {
    title: { en: 'Your lifestyle habits', zh: '您的生活型態' },
    subtitle: { en: 'Help us understand your daily routine', zh: '幫助我們了解您的作息' },
    
    sleepLabel: { en: 'How would you describe your sleep?', zh: '您的睡眠狀況如何？' },
    sleepOptions: {
      Regular: { en: 'Regular & Sufficient', zh: '規律充足' },
      Late_night: { en: 'Often Stay Up Late', zh: '經常晚睡' },
      Insufficient: { en: 'Insufficient Sleep', zh: '睡眠不足' },
    } as Record<SleepHabit, { en: string; zh: string }>,
    sleepSubtitle: {
      Regular: { en: '7-8 hours per night', zh: '每晚 7-8 小時' },
      Late_night: { en: 'After midnight', zh: '超過 12 點' },
      Insufficient: { en: 'Less than 6 hours', zh: '少於 6 小時' },
    } as Record<SleepHabit, { en: string; zh: string }>,
    
    stressLabel: { en: 'How stressed do you feel recently?', zh: '近期壓力程度？' },
    stressLevels: {
      1: { en: 'Very Relaxed', zh: '很放鬆' },
      2: { en: 'Relaxed', zh: '放鬆' },
      3: { en: 'Moderate', zh: '普通' },
      4: { en: 'Stressed', zh: '有壓力' },
      5: { en: 'Very Stressed', zh: '壓力很大' },
    },
    
    validation: { en: 'Please complete all questions', zh: '請完成所有問題' },
  },
  
  // Q4: Dietary Restrictions
  q4: {
    title: { en: 'Dietary preferences & restrictions', zh: '飲食偏好與禁忌' },
    subtitle: { en: 'Help us recommend safe foods for you', zh: '幫助我們推薦安全的食物' },
    
    allergiesLabel: { en: 'Food Allergies', zh: '食物過敏' },
    allergiesOptions: {
      Seafood: { en: 'Seafood', zh: '海鮮' },
      Nuts: { en: 'Nuts', zh: '堅果' },
      Gluten: { en: 'Gluten', zh: '麩質' },
      Dairy: { en: 'Dairy', zh: '乳製品' },
      Soy: { en: 'Soy', zh: '大豆' },
      Eggs: { en: 'Eggs', zh: '雞蛋' },
      None: { en: 'None', zh: '無過敏' },
      Other: { en: 'Other', zh: '其他' },
    } as Record<Allergy, { en: string; zh: string }>,
    allergiesPlaceholder: { en: 'Please specify your allergy... *', zh: '請輸入過敏原... *' },
    
    dietLabel: { en: 'Diet Type', zh: '飲食類型' },
    dietOptions: {
      General: { en: 'General', zh: '一般飲食' },
      Vegetarian: { en: 'Vegetarian', zh: '素食（可食蛋奶）' },
      Vegan: { en: 'Vegan', zh: '純素' },
      No_Beef: { en: 'No Beef', zh: '不吃牛肉' },
      No_Pork: { en: 'No Pork', zh: '不吃豬肉' },
      Other: { en: 'Other', zh: '其他' },
    } as Record<DietType, { en: string; zh: string }>,
    dietPlaceholder: { en: 'Please specify your diet type... *', zh: '請輸入飲食類型... *' },
    
    medicalLabel: { en: 'Health Conditions', zh: '健康狀況' },
    medicalOptions: {
      G6PD: { en: 'G6PD Deficiency', zh: '蠶豆症' },
      Diabetes: { en: 'Diabetes', zh: '糖尿病' },
      Hypertension: { en: 'Hypertension', zh: '高血壓' },
      Kidney_Disease: { en: 'Kidney Disease', zh: '腎臟疾病' },
      None: { en: 'None', zh: '無特殊狀況' },
      Other: { en: 'Other', zh: '其他' },
    } as Record<MedicalCondition, { en: string; zh: string }>,
    medicalPlaceholder: { en: 'Please specify your health condition... *', zh: '請輸入健康狀況... *' },
    
    optional: { en: 'Optional - but recommended for better results', zh: '選填 - 但建議填寫以獲得更準確的建議' },
  },
};

export function getText(path: string, lang: Language = 'en'): string {
  const keys = path.split('.');
  let value: any = onboardingText;
  
  for (const key of keys) {
    value = value?.[key];
  }
  
  return value?.[lang] || value || '';
}
