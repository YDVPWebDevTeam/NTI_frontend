import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StudentRegistrationState {
  currentStepIndex: number;
  setCurrentStepIndex: (value: number) => void;
  goToNextStep: (maxStepIndex: number) => void;
  goToPreviousStep: () => void;
  resetStep: () => void;
}

export const useStudentRegistrationStore = create<StudentRegistrationState>()(
  persist(
    (set) => ({
      currentStepIndex: 0,
      setCurrentStepIndex: (value) => set({ currentStepIndex: Math.max(0, value) }),
      goToNextStep: (maxStepIndex) =>
        set((state) => ({
          currentStepIndex: Math.min(state.currentStepIndex + 1, maxStepIndex),
        })),
      goToPreviousStep: () =>
        set((state) => ({
          currentStepIndex: Math.max(state.currentStepIndex - 1, 0),
        })),
      resetStep: () => set({ currentStepIndex: 0 }),
    }),
    {
      name: 'student-registration-step-store',
      partialize: (state) => ({
        currentStepIndex: state.currentStepIndex,
      }),
    },
  ),
);
