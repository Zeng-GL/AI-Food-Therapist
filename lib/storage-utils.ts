import { TongueType } from './tongue-data';

export interface GuestHistoryItem {
  id: string;
  imageUrl: string; // Base64 or Blob URL
  resultCode: TongueType;
  timestamp: number;
}

const GUEST_HISTORY_KEY = 'tongue_diagnosis_guest_history';
const MAX_GUEST_HISTORY = 5;

/**
 * 儲存 Guest 用戶的檢測記錄到 localStorage
 */
export function saveGuestHistory(item: GuestHistoryItem): void {
  if (typeof window === 'undefined') return;
  
  const history = getGuestHistory();
  history.unshift(item); // 新增到最前面
  
  // 只保留最近 5 筆
  const limitedHistory = history.slice(0, MAX_GUEST_HISTORY);
  
  try {
    localStorage.setItem(GUEST_HISTORY_KEY, JSON.stringify(limitedHistory));
  } catch (error) {
    console.error('Failed to save guest history:', error);
  }
}

/**
 * 取得 Guest 用戶的檢測記錄
 */
export function getGuestHistory(): GuestHistoryItem[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(GUEST_HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to get guest history:', error);
    return [];
  }
}

/**
 * 清除 Guest 用戶的檢測記錄
 */
export function clearGuestHistory(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(GUEST_HISTORY_KEY);
  } catch (error) {
    console.error('Failed to clear guest history:', error);
  }
}

/**
 * 刪除單筆 Guest 記錄
 */
export function deleteGuestHistoryItem(id: string): void {
  if (typeof window === 'undefined') return;
  
  const history = getGuestHistory();
  const filtered = history.filter(item => item.id !== id);
  
  try {
    localStorage.setItem(GUEST_HISTORY_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete guest history item:', error);
  }
}

