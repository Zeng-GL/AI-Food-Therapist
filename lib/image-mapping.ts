import { TongueType, getTongueData } from './tongue-data';

/**
 * 根據診斷結果的文字名稱匹配舌頭圖片
 * 圖片文件名應該與診斷結果的英文名稱對應
 */
const TONGUE_IMAGE_MAP: Record<string, string> = {
  // 英文名稱映射
  'Red Tongue': '/assets/images/Tongues/Red Tongue.png',
  'Pale Tongue': '/assets/images/Tongues/Pale Tongue.png',
  'Thick White Coating': '/assets/images/Tongues/White Coating Tongue.png',
  'White Coating Tongue': '/assets/images/Tongues/White Coating Tongue.png',
  'Thick Yellow Coating': '/assets/images/Tongues/Yellow Coating Tongue.png',
  'Yellow Coating Tongue': '/assets/images/Tongues/Yellow Coating Tongue.png',
  'Peeled / No Coating': '/assets/images/Tongues/Peeled Tongue.png',
  'Peeled Tongue': '/assets/images/Tongues/Peeled Tongue.png',
  'Teeth Marks (Scalloped)': '/assets/images/Tongues/Scalloped Tongue.png',
  'Scalloped Tongue': '/assets/images/Tongues/Scalloped Tongue.png',
  'Cracked Tongue': '/assets/images/Tongues/Cracked Tongue.png',
  'No Tongue Detected':'/assets/images/Tongues/No Tongue.png',
  
  // 中文名稱映射
  '舌紅': '/assets/images/Tongues/Red Tongue.png',
  '舌淡白': '/assets/images/Tongues/Pale Tongue.png',
  '舌苔白厚': '/assets/images/Tongues/White Coating Tongue.png',
  '舌苔黃厚': '/assets/images/Tongues/Yellow Coating Tongue.png',
  '舌苔剝落 / 無苔': '/assets/images/Tongues/Peeled Tongue.png',
  '舌苔剝落': '/assets/images/Tongues/Peeled Tongue.png',
  '舌有齒痕': '/assets/images/Tongues/Scalloped Tongue.png',
  '舌有裂紋': '/assets/images/Tongues/Cracked Tongue.png',
  '未偵測到舌頭':'/assets/images/Tongues/No Tongue.png'
};

/**
 * 舊的映射方式（基於 result_code）- 保留作為備用
 */
export const TONGUE_IMAGES: Record<TongueType, string> = {
  red: '/assets/images/Tongues/Red Tongue.png',
  pale: '/assets/images/Tongues/Pale Tongue.png',
  white_thick: '/assets/images/Tongues/White Coating Tongue.png',
  yellow_thick: '/assets/images/Tongues/Yellow Coating Tongue.png',
  peeled: '/assets/images/Tongues/Peeled Tongue.png',
  teeth_marks: '/assets/images/Tongues/Scalloped Tongue.png',
  cracked: '/assets/images/Tongues/Cracked Tongue.png',
  no_tongue: '/assets/images/Tongues/No Tongue.png'
};

/**
 * 食物圖片映射
 * 根據食物名稱匹配圖片（支援中英文，根據實際文件名匹配）
 */
export const FOOD_IMAGES: Record<string, string> = {
  // Red Tongue 推薦食物
  'Lotus seeds': '/assets/images/Foods/1. Lotus.png',
  '蓮子': '/assets/images/Foods/1. Lotus.png',
  'Lily bulbs': '/assets/images/Foods/2. Lily.png',
  '百合': '/assets/images/Foods/2. Lily.png',
  'Mung bean soup': '/assets/images/Foods/3. Mung bean soup.png',
  '綠豆湯': '/assets/images/Foods/3. Mung bean soup.png',
  
  // Pale Tongue 推薦食物
  'Red dates': '/assets/images/Foods/4. Red dates.png',
  '紅棗': '/assets/images/Foods/4. Red dates.png',
  'Goji berries': '/assets/images/Foods/5. Goji berries.png',
  '枸杞': '/assets/images/Foods/5. Goji berries.png',
  'Chinese yam': '/assets/images/Foods/6. Chinese yam.png',
  '山藥': '/assets/images/Foods/6. Chinese yam.png',
  
  // White Thick / Teeth Marks 推薦食物
  "Job's tears": "/assets/images/Foods/7. Job's tears.png",
  '薏仁': "/assets/images/Foods/7. Job's tears.png",
  'White radish': '/assets/images/Foods/8. White radish.png',
  '白蘿蔔': '/assets/images/Foods/8. White radish.png',
  'Winter melon': '/assets/images/Foods/9. Winter melon.png',
  '冬瓜': '/assets/images/Foods/9. Winter melon.png',
  
  // Yellow Thick 推薦食物
  'Bitter melon': '/assets/images/Foods/10. Bitter melon.png',
  '苦瓜': '/assets/images/Foods/10. Bitter melon.png',
  'Mung beans': '/assets/images/Foods/11. Mung beans.png',
  '綠豆': '/assets/images/Foods/11. Mung beans.png',
  'Aged tangerine peel': '/assets/images/Foods/12. Aged tangerine peel.png',
  '陳皮': '/assets/images/Foods/12. Aged tangerine peel.png',
  
  // Peeled 推薦食物
  'Snow pear': '/assets/images/Foods/13. Snow pear.png',
  '雪梨': '/assets/images/Foods/13. Snow pear.png',
  'Fresh lily bulbs': '/assets/images/Foods/14. Fresh lily bulbs.png',
  '鮮百合': '/assets/images/Foods/14. Fresh lily bulbs.png',
  'Millet porridge': '/assets/images/Foods/15. Millet porridge.png',
  '小米粥': '/assets/images/Foods/15. Millet porridge.png',
  
  // Teeth Marks 推薦食物（部分與 White Thick 重複）
  'Red beans': '/assets/images/Foods/17. Red beans.png',
  '紅豆': '/assets/images/Foods/17. Red beans.png',
  'Fresh ginger': '/assets/images/Foods/18. Fresh ginger.png',
  '生薑': '/assets/images/Foods/18. Fresh ginger.png',
  
  // Cracked 推薦食物
  'Black sesame': '/assets/images/Foods/19. Black sesame.png',
  '黑芝麻': '/assets/images/Foods/19. Black sesame.png',
  'White fungus': '/assets/images/Foods/20. White fungus.png',
  '銀耳': '/assets/images/Foods/20. White fungus.png',
  'Sugarcane juice': '/assets/images/Foods/21. Sugarcane juice.png',
  '甘蔗汁': '/assets/images/Foods/21. Sugarcane juice.png',
};

/**
 * 獲取舌頭圖片路徑
 * 優先根據診斷結果的文字名稱匹配，如果找不到則使用 result_code
 */
export const getTongueImage = (type: TongueType, tongueName?: { en?: string; zh?: string }): string => {
  // 如果提供了文字名稱，優先使用文字匹配
  if (tongueName) {
    if (tongueName.en && TONGUE_IMAGE_MAP[tongueName.en]) {
      return TONGUE_IMAGE_MAP[tongueName.en];
    }
    if (tongueName.zh && TONGUE_IMAGE_MAP[tongueName.zh]) {
      return TONGUE_IMAGE_MAP[tongueName.zh];
    }
  }
  
  // 備用：使用 result_code 映射
  return TONGUE_IMAGES[type];
};

/**
 * 獲取食物圖片路徑
 * @param foodName 食物名稱（支援中英文）
 * @returns 圖片路徑，如果沒有對應圖片則返回 null
 */
export const getFoodImage = (foodName: string): string | null => {
  if (!foodName) return null;
  
  // 直接匹配
  if (FOOD_IMAGES[foodName]) {
    return FOOD_IMAGES[foodName];
  }
  
  // 嘗試去除首尾空格後匹配
  const trimmedName = foodName.trim();
  if (trimmedName !== foodName && FOOD_IMAGES[trimmedName]) {
    return FOOD_IMAGES[trimmedName];
  }
  
  // 標準化字符串：統一處理不同類型的引號和空格
  const normalizeString = (str: string): string => {
    return str
      .trim()
      .replace(/[''']/g, "'") // 統一所有類型的單引號為標準單引號 (U+0027)
      .replace(/["""]/g, '"') // 統一所有類型的雙引號為標準雙引號
      .toLowerCase();
  };
  
  // 嘗試標準化後匹配（不區分大小寫）
  const normalizedInput = normalizeString(foodName);
  for (const [key, value] of Object.entries(FOOD_IMAGES)) {
    if (normalizeString(key) === normalizedInput) {
      return value;
    }
  }
  
  // 嘗試部分匹配（用於處理 "Job's tears" 這種情況）
  // 移除所有標點符號和空格後比較
  const removePunctuation = (str: string): string => {
    return str.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]/g, '');
  };
  
  const normalizedInputNoPunct = removePunctuation(foodName);
  for (const [key, value] of Object.entries(FOOD_IMAGES)) {
    if (removePunctuation(key) === normalizedInputNoPunct) {
      return value;
    }
  }
  
  // 調試：輸出所有可用的鍵（開發環境）
  if (typeof window !== 'undefined') {
    const matchingKeys = Object.keys(FOOD_IMAGES).filter(k => {
      const normalizedKey = normalizeString(k);
      const normalizedKeyNoPunct = removePunctuation(k);
      return normalizedKey === normalizedInput || 
             normalizedKeyNoPunct === normalizedInputNoPunct ||
             k.toLowerCase().includes(foodName.toLowerCase()) || 
             foodName.toLowerCase().includes(k.toLowerCase());
    });
    console.log('Food not found:', {
      input: foodName,
      normalized: normalizedInput,
      normalizedNoPunct: normalizedInputNoPunct,
      matchingKeys: matchingKeys,
      allKeys: Object.keys(FOOD_IMAGES)
    });
  }
  
  return null;
};

