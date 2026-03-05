import { useOnboardingStore } from '@/store/use-onboarding-store';

export function useSaveProfile() {
  const store = useOnboardingStore();

  const saveProfile = async (overrides?: Partial<typeof store>) => {
    // 合併 store 現有資料 + 本次更新的欄位
    const data = { ...store, ...overrides };

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gender: data.gender,
          ageGroup: data.ageGroup,
          primaryGoals: data.primaryGoals,
          sleepHabit: data.sleepHabit,
          stressLevel: data.stressLevel,
          allergies: data.allergies,
          dietType: data.dietType,
          medicalConditions: data.medicalConditions,
          customAllergy: data.customAllergy,
          customDietType: data.customDietType,
          customMedicalCondition: data.customMedicalCondition,
        }),
      });

      if (!res.ok) {
        console.error('Failed to save profile to DB');
        return false;
      }
      return true;
    } catch (err) {
      console.error('Error saving profile:', err);
      return false;
    }
  };

  return { saveProfile };
}