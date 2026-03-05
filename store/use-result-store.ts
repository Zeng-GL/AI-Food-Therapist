import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface HealthState {
  analysisResult: string;
  imageUrl: string;
  setAnalysisData: (result: any, url: string) => void;
  clearData: () => void;
}

export const useResultStore = create<HealthState>()(
  persist(
    (set) => ({
      analysisResult: '',
      imageUrl: '',
      setAnalysisData: (result: any, url: string) =>
        set({ analysisResult: JSON.stringify(result), imageUrl: url }),
      clearData: () => set({ analysisResult: '', imageUrl: '' }),
    }),
    {
      name: 'health-storage',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? sessionStorage : localStorage
      ),
      skipHydration: true, // ← server side 不嘗試讀取 storage
    }
  )
);

// import { create } from 'zustand';
// import { persist, createJSONStorage } from 'zustand/middleware';

// interface HealthState {
//   analysisResult: string;
//   imageUrl: string;
//   setAnalysisData: (result: string, url: string) => void;
//   clearData: () => void;
// }

// export const useResultStore = create<HealthState>()(
//   persist(
//     (set) => ({
//       analysisResult: '',
//       imageUrl: '',
//       setAnalysisData: (result: any, url: string) => set({ analysisResult: JSON.stringify(result), imageUrl: url }),
//       clearData: () => set({ analysisResult: '', imageUrl: '' }),
//     }),
//     {
//       name: 'health-storage', // 儲存在 localStorage 的 key
//       storage: createJSONStorage(() => sessionStorage),
//     }
//   )
// );