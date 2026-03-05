"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOnboardingStore } from "@/store/use-onboarding-store";
import { useSession } from "next-auth/react";
import { useLanguageStore } from "@/store/use-language-store";
import { onboardingText } from "@/lib/onboarding-i18n";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import Q1BasicProfile from "@/components/onboarding/Q1BasicProfile";
import Q2HealthGoals from "@/components/onboarding/Q2HealthGoals";
import Q3Lifestyle from "@/components/onboarding/Q3Lifestyle";
import Q4DietaryRestrictions from "@/components/onboarding/Q4DietaryRestrictions";

export const dynamic = 'force-dynamic';

export default function OnboardingPage() {
  const router = useRouter();
  const {
    currentStep,
    isCompleted,
    isStepValid,
    nextStep,
    prevStep,
    completeOnboarding,
    setStep,
    // Q1
    gender,
    ageGroup,
    // Q2
    primaryGoals,
    // Q3
    sleepHabit,
    stressLevel,
    // Q4
    allergies,
    dietType,
    medicalConditions,
    customAllergy,
    customDietType,
    customMedicalCondition,
  } = useOnboardingStore();

  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const { language } = useLanguageStore();

  useEffect(() => {
    if (status !== "loading" && !isLoggedIn) {
      router.push("/");
    }
  }, [isLoggedIn, status, router]);

  useEffect(() => {
    if (isCompleted) {
      const isEditing = sessionStorage.getItem("editing_profile");
      if (!isEditing) {
        router.push("/home");
      }
    }
  }, [isCompleted, router]);

  const handleNext = () => {
    if (isStepValid(currentStep)) {
      nextStep();
    }
  };

  const handleComplete = async () => {
    if (!isStepValid(4)) return;

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gender,
          ageGroup,
          primaryGoals,
          sleepHabit,
          stressLevel,
          allergies,
          dietType,
          medicalConditions,
          customAllergy,
          customDietType,
          customMedicalCondition,
        }),
      });

      console.log("PUT status:", res.status); // ← 加這行
      const data = await res.json();
      console.log("PUT response:", data); // ← 加這行

      if (!res.ok) {
        console.error("Failed to save profile to DB");
      }
    } catch (err) {
      console.error("Error saving profile:", err);
    }

    completeOnboarding();

    const isEditing = sessionStorage.getItem("editing_profile");
    sessionStorage.removeItem("editing_profile");

    if (isEditing) {
      router.push("/profile");
    } else {
      router.push("/home");
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Q1BasicProfile />;
      case 2:
        return <Q2HealthGoals />;
      case 3:
        return <Q3Lifestyle />;
      case 4:
        return <Q4DietaryRestrictions />;
      default:
        return null;
    }
  };

  const canProceed = isStepValid(currentStep);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              {onboardingText.progress[language](currentStep, 4)}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round((currentStep / 4) * 100)}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-all ${
              currentStep === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <ArrowLeft size={20} />
            <span>{onboardingText.back[language]}</span>
          </button>

          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed}
              className={`px-6 py-3 rounded-full font-semibold flex items-center space-x-2 transition-all ${
                canProceed
                  ? "bg-brand text-white hover:opacity-90"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              <span>{onboardingText.next[language]}</span>
              <ArrowRight size={20} />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={!canProceed}
              className={`px-6 py-3 rounded-full font-semibold flex items-center space-x-2 transition-all ${
                canProceed
                  ? "bg-brand text-white hover:opacity-90"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Check size={20} />
              <span>{onboardingText.complete[language]}</span>
            </button>
          )}
        </div>

        {/* Step Dots */}
        <div className="flex justify-center items-center space-x-2 mt-6">
          {[1, 2, 3, 4].map((step) => (
            <button
              key={step}
              onClick={() => {
                if (step <= currentStep || isStepValid(step - 1)) {
                  setStep(step);
                }
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                step === currentStep
                  ? "w-8 bg-brand"
                  : step < currentStep
                    ? "bg-brand/50"
                    : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// 'use client';

// import { useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { useOnboardingStore } from '@/store/use-onboarding-store';
// // import { useAuthStore } from '@/store/use-auth-store';
// import { useSession } from "next-auth/react";
// import { useLanguageStore } from '@/store/use-language-store';
// import { onboardingText } from '@/lib/onboarding-i18n';
// import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
// import Q1BasicProfile from '@/components/onboarding/Q1BasicProfile';
// import Q2HealthGoals from '@/components/onboarding/Q2HealthGoals';
// import Q3Lifestyle from '@/components/onboarding/Q3Lifestyle';
// import Q4DietaryRestrictions from '@/components/onboarding/Q4DietaryRestrictions';

// export default function OnboardingPage() {
//   const router = useRouter();
//   const { currentStep, isCompleted, isStepValid, nextStep, prevStep, completeOnboarding, setStep } = useOnboardingStore();
//   const { data: session, status } = useSession();
//   const isLoggedIn = status === 'authenticated';
//   const { language } = useLanguageStore();

//   // Redirect if not logged in
//   useEffect(() => {
//     if (!isLoggedIn) {
//       router.push('/');
//     }
//   }, [isLoggedIn, router]);

//   // Redirect if already completed (unless editing)
//   useEffect(() => {
//     if (isCompleted && currentStep === 1) {
//       // Allow re-entry if coming from edit button
//       const isEditing = sessionStorage.getItem('editing_profile');
//       if (!isEditing) {
//         router.push('/home');
//       }
//     }
//   }, [isCompleted, currentStep, router]);

//   const handleNext = () => {
//     if (isStepValid(currentStep)) {
//       nextStep();
//     }
//   };

//   const handleComplete = () => {
//     if (isStepValid(4)) {
//       completeOnboarding();

//       // 檢查是否為編輯模式
//       const isEditing = sessionStorage.getItem('editing_profile');
//       sessionStorage.removeItem('editing_profile');

//       // 如果是編輯模式，回到個人中心；否則回到首頁
//       if (isEditing) {
//         router.push('/profile');
//       } else {
//         // Mark that user has chosen auth type (completed registration)
//         localStorage.setItem('auth_type_chosen', 'register');
//         router.push('/home');
//       }
//     }
//   };

//   const renderStep = () => {
//     switch (currentStep) {
//       case 1:
//         return <Q1BasicProfile />;
//       case 2:
//         return <Q2HealthGoals />;
//       case 3:
//         return <Q3Lifestyle />;
//       case 4:
//         return <Q4DietaryRestrictions />;
//       default:
//         return null;
//     }
//   };

//   const canProceed = isStepValid(currentStep);

//   return (
//     <div className="min-h-screen bg-surface py-8 px-4">
//       <div className="max-w-2xl mx-auto">
//         {/* Progress Bar */}
//         <div className="mb-8">
//           <div className="flex items-center justify-between mb-2">
//             <span className="text-sm font-medium text-gray-600">
//               {onboardingText.progress[language](currentStep, 4)}
//             </span>
//             <span className="text-sm text-gray-500">
//               {Math.round((currentStep / 4) * 100)}%
//             </span>
//           </div>
//           <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
//             <div
//               className="h-full bg-brand transition-all duration-300"
//               style={{ width: `${(currentStep / 4) * 100}%` }}
//             />
//           </div>
//         </div>

//         {/* Step Content */}
//         <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
//           {renderStep()}
//         </div>

//         {/* Navigation Buttons */}
//         <div className="flex items-center justify-between gap-4">
//           {/* Back Button */}
//           <button
//             onClick={prevStep}
//             disabled={currentStep === 1}
//             className={`px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-all ${
//               currentStep === 1
//                 ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
//                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//             }`}
//           >
//             <ArrowLeft size={20} />
//             <span>{onboardingText.back[language]}</span>
//           </button>

//           {/* Next / Complete Button */}
//           {currentStep < 4 ? (
//             <button
//               onClick={handleNext}
//               disabled={!canProceed}
//               className={`px-6 py-3 rounded-full font-semibold flex items-center space-x-2 transition-all ${
//                 canProceed
//                   ? 'bg-brand text-white hover:opacity-90'
//                   : 'bg-gray-100 text-gray-400 cursor-not-allowed'
//               }`}
//             >
//               <span>{onboardingText.next[language]}</span>
//               <ArrowRight size={20} />
//             </button>
//           ) : (
//             <button
//               onClick={handleComplete}
//               disabled={!canProceed}
//               className={`px-6 py-3 rounded-full font-semibold flex items-center space-x-2 transition-all ${
//                 canProceed
//                   ? 'bg-brand text-white hover:opacity-90'
//                   : 'bg-gray-100 text-gray-400 cursor-not-allowed'
//               }`}
//             >
//               <Check size={20} />
//               <span>{onboardingText.complete[language]}</span>
//             </button>
//           )}
//         </div>

//         {/* Step Dots Indicator */}
//         <div className="flex justify-center items-center space-x-2 mt-6">
//           {[1, 2, 3, 4].map((step) => (
//             <button
//               key={step}
//               onClick={() => {
//                 // Allow jumping to completed steps
//                 if (step <= currentStep || isStepValid(step - 1)) {
//                   setStep(step);
//                 }
//               }}
//               className={`w-2 h-2 rounded-full transition-all ${
//                 step === currentStep
//                   ? 'w-8 bg-brand'
//                   : step < currentStep
//                   ? 'bg-brand/50'
//                   : 'bg-gray-300'
//               }`}
//             />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }
