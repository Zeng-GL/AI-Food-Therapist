/**
 * 壓縮圖片
 * @param file 原始圖片檔案
 * @param maxWidth 最大寬度（預設 1920px）
 * @param maxSizeMB 目標檔案大小（MB，預設 2MB）
 * @param quality 初始 JPEG 品質（預設 0.85）
 * @returns 壓縮後的 Blob
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxSizeMB: number = 2,
  quality: number = 0.85
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // 調整尺寸
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // 嘗試壓縮，如果檔案仍過大則降低品質
        const tryCompress = (currentQuality: number): void => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }
              
              const sizeMB = blob.size / (1024 * 1024);
              
              // 如果檔案仍過大且品質可以再降低
              if (sizeMB > maxSizeMB && currentQuality > 0.5) {
                tryCompress(currentQuality - 0.1);
              } else {
                resolve(blob);
              }
            },
            'image/jpeg',
            currentQuality
          );
        };
        
        tryCompress(quality);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * 將 Blob 轉換為 File
 */
export function blobToFile(blob: Blob, fileName: string): File {
  return new File([blob], fileName, { type: blob.type });
}

/**
 * 驗證圖片格式
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: '圖片格式不支援，請使用 JPEG 或 PNG 格式',
    };
  }
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: '圖片檔案過大，請選擇較小的圖片或重新拍攝',
    };
  }
  
  return { valid: true };
}

