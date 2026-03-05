'use client';

import { useOnboardingStore, HealthGoal } from '@/store/use-onboarding-store';
import { useLanguageStore } from '@/store/use-language-store';
import { onboardingText } from '@/lib/onboarding-i18n';
import { Check } from 'lucide-react';

export default function Q2HealthGoals() {
  const { primaryGoals, updateProfile } = useOnboardingStore();
  const { language } = useLanguageStore();
  const q2 = onboardingText.q2;
  
  const goals: HealthGoal[] = [
    'sleep_quality',
    'digestion',
    'fatigue_relief',
    'skin_health',
    'general_wellness'
  ];

  const toggleGoal = (goal: HealthGoal) => {
    if (primaryGoals.includes(goal)) {
      // Remove goal
      updateProfile({
        primaryGoals: primaryGoals.filter(g => g !== goal)
      });
    } else {
      // Add goal (if not at max)
      if (primaryGoals.length < 2) {
        updateProfile({
          primaryGoals: [...primaryGoals, goal]
        });
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-800">
          {q2.title[language]}
        </h2>
        <p className="text-gray-600">
          {q2.subtitle[language]}
        </p>
        <p className="text-sm text-brand-muted font-medium">
          {q2.selected[language](primaryGoals.length)}
        </p>
      </div>

      {/* Goals Selection */}
      <div className="space-y-3">
        {goals.map((goal) => {
          const isSelected = primaryGoals.includes(goal);
          const isDisabled = !isSelected && primaryGoals.length >= 2;
          
          return (
            <button
              key={goal}
              onClick={() => !isDisabled && toggleGoal(goal)}
              disabled={isDisabled}
              className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                isSelected
                  ? 'border-brand bg-brand/10 text-brand-muted'
                  : isDisabled
                  ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
              style={
                isSelected
                  ? { borderColor: '#6C9A5D', backgroundColor: 'rgba(108,154,93,0.1)', color: '#6C9A5D' }
                  : {}
              }
            >
              <span className="font-medium text-left">
                {q2.options[goal][language]}
              </span>
              {isSelected && (
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center bg-brand text-white"
                >
                  <Check size={16} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Hint */}
      {primaryGoals.length >= 2 && (
        <p className="text-sm text-center text-gray-500">
          {q2.maxReached[language]}
        </p>
      )}
    </div>
  );
}
