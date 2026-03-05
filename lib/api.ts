import { TongueType, getAllTongueTypes } from './tongue-data';

export interface AnalyzeResponse {
  result_code: TongueType;
  confidence: number;
}

export interface AnalyzeError {
  error: string;
  error_code: string;
  message: string;
}

/**
 * 分析舌頭圖片（Mock 模式或真實 API）
 */
export async function analyzeTongue(imageFile: File): Promise<AnalyzeResponse> {
  const useMockMode = process.env.NEXT_PUBLIC_USE_MOCK_MODE === 'true';
  
  if (useMockMode) {
    // Mock 模式：等待 3 秒後返回隨機結果
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const types = getAllTongueTypes();
    const randomType = types[Math.floor(Math.random() * types.length)];
    
    return {
      result_code: randomType,
      confidence: 0.85 + Math.random() * 0.1, // 0.85 - 0.95
    };
  }
  
  // 真實 API 模式 - 使用 Next.js API Route
  const formData = new FormData();
  formData.append('image', imageFile);
  
  const apiUrl = '/api/analyze';
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const error: AnalyzeError = await response.json().catch(() => ({
      error: 'Unknown error',
      error_code: 'API_ERROR',
      message: 'Failed to analyze image',
    }));
    
    throw new Error(error.message || 'Analysis failed');
  }
  
  return response.json();
}

