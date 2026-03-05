import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Gender = 'Male' | 'Female' | 'Other';
export type AgeGroup = 'Under_20' | '21_25' | '26_30' | '31_35' | '36_40' | '41_45' | '46_50' | '51_65' | 'Over_65';
export type HealthGoal = 'sleep_quality' | 'digestion' | 'fatigue_relief' | 'skin_health' | 'general_wellness';
export type SleepHabit = 'Regular' | 'Late_night' | 'Insufficient';
export type DietType = 'General' | 'Vegetarian' | 'Vegan' | 'No_Beef' | 'No_Pork' | 'Other';
export type Allergy = 'Seafood' | 'Nuts' | 'Gluten' | 'Dairy' | 'Soy' | 'Eggs' | 'None' | 'Other';
export type MedicalCondition = 'G6PD' | 'Diabetes' | 'Hypertension' | 'Kidney_Disease' | 'None' | 'Other';

export interface OnboardingProfile {
  // Q1: Basic Profile
  gender: Gender | null;
  ageGroup: AgeGroup | null;
  
  // Q2: Health Goals (max 2)
  primaryGoals: HealthGoal[];
  
  // Q3: Lifestyle
  sleepHabit: SleepHabit | null;
  stressLevel: number; // 1-5
  
  // Q4: Dietary Restrictions
  allergies: Allergy[];
  dietType: DietType;
  medicalConditions: MedicalCondition[];
  
  // Q4: Custom inputs for "Other" options
  customAllergy: string;
  customDietType: string;
  customMedicalCondition: string;
}

interface OnboardingState extends OnboardingProfile {
  // State management
  currentStep: number; // 1-4
  isCompleted: boolean;
  
  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateProfile: (data: Partial<OnboardingProfile>) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  
  // Validation
  isStepValid: (step: number) => boolean;
}

const initialProfile: OnboardingProfile = {
  gender: null,
  ageGroup: null,
  primaryGoals: [],
  sleepHabit: null,
  stressLevel: 3,
  allergies: [],
  dietType: 'General',
  medicalConditions: [],
  customAllergy: '',
  customDietType: '',
  customMedicalCondition: '',
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      ...initialProfile,
      currentStep: 1,
      isCompleted: false,
      
      setStep: (step) => set({ currentStep: step }),
      
      nextStep: () => {
        const { currentStep, isStepValid } = get();
        if (currentStep < 4 && isStepValid(currentStep)) {
          set({ currentStep: currentStep + 1 });
        }
      },
      
      prevStep: () => {
        const { currentStep } = get();
        if (currentStep > 1) {
          set({ currentStep: currentStep - 1 });
        }
      },
      
      updateProfile: (data) => set((state) => ({ ...state, ...data })),
      
      completeOnboarding: () => {
        const state = get();
        // Validate all steps before completing
        if (state.isStepValid(1) && state.isStepValid(2) && 
            state.isStepValid(3) && state.isStepValid(4)) {
          set({ isCompleted: true });
        }
      },
      
      resetOnboarding: () => set({
        ...initialProfile,
        currentStep: 1,
        isCompleted: false,
      }),
      
      isStepValid: (step) => {
        const state = get();
        
        switch (step) {
          case 1: // Q1: Basic Profile
            return state.gender !== null && state.ageGroup !== null;
          
          case 2: // Q2: Health Goals
            return state.primaryGoals.length >= 1 && state.primaryGoals.length <= 2;
          
          case 3: // Q3: Lifestyle
            return state.sleepHabit !== null && state.stressLevel >= 1 && state.stressLevel <= 5;
          
          case 4: // Q4: Dietary Restrictions
            // Check if "Other" is selected and custom input is filled
            const hasOtherAllergy = state.allergies.includes('Other');
            const hasOtherDiet = state.dietType === 'Other';
            const hasOtherMedical = state.medicalConditions.includes('Other');
            
            // If "Other" is selected, custom input must be filled
            if (hasOtherAllergy && !state.customAllergy.trim()) {
              return false;
            }
            if (hasOtherDiet && !state.customDietType.trim()) {
              return false;
            }
            if (hasOtherMedical && !state.customMedicalCondition.trim()) {
              return false;
            }
            
            return true;
          
          default:
            return false;
        }
      },
    }),
    {
      name: 'onboarding-data',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
