'use client';

import { useOnboardingStore, SleepHabit } from '@/store/use-onboarding-store';
import { useLanguageStore } from '@/store/use-language-store';
import { onboardingText } from '@/lib/onboarding-i18n';

export default function Q3Lifestyle() {
  const { sleepHabit, stressLevel, updateProfile } = useOnboardingStore();
  const { language } = useLanguageStore();
  const q3 = onboardingText.q3;
  
  const sleepHabits: SleepHabit[] = ['Regular', 'Late_night', 'Insufficient'];
  const stressEmojis = ['😌', '😊', '😐', '😟', '😰'];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-800">
          {q3.title[language]}
        </h2>
        <p className="text-gray-600">
          {q3.subtitle[language]}
        </p>
      </div>

      {/* Sleep Habit */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700">
          {q3.sleepLabel[language]}
        </label>
        <div className="space-y-2">
          {sleepHabits.map((habit) => (
            <button
              key={habit}
              onClick={() => updateProfile({ sleepHabit: habit })}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                sleepHabit === habit
                  ? 'border-brand bg-brand/10 text-brand-muted'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
              style={
                sleepHabit === habit
                  ? { borderColor: '#6C9A5D', backgroundColor: 'rgba(108,154,93,0.1)', color: '#6C9A5D' }
                  : {}
              }
            >
              <div className="font-medium">
                {q3.sleepOptions[habit][language]}
              </div>
              <div className="text-sm opacity-70 mt-1">
                {q3.sleepSubtitle[habit][language]}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Stress Level */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700">
          {q3.stressLabel[language]}
        </label>
        
        {/* Stress Level Buttons */}
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((level) => (
            <button
              key={level}
              onClick={() => updateProfile({ stressLevel: level })}
              className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center space-y-1 ${
                stressLevel === level
                  ? 'border-brand bg-brand/10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              style={
                stressLevel === level
                  ? { borderColor: '#6C9A5D', backgroundColor: 'rgba(108,154,93,0.1)' }
                  : {}
              }
            >
              <span className="text-2xl">{stressEmojis[level - 1]}</span>
              <span className="text-xs text-gray-600">{level}</span>
            </button>
          ))}
        </div>
        
        {/* Stress Level Label */}
        <div className="flex justify-between text-xs text-gray-500 px-1">
          <span>{q3.stressLevels[1][language]}</span>
          <span>{q3.stressLevels[5][language]}</span>
        </div>
      </div>
    </div>
  );
}
