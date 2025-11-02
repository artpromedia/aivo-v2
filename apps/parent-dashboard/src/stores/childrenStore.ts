import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Child, LearningGoal, ScreenTimeData, AISuggestion } from '../types';

interface ChildrenState {
  children: Child[];
  selectedChildId: string | null;
  selectedChild: Child | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setChildren: (children: Child[]) => void;
  addChild: (child: Child) => void;
  updateChild: (childId: string, updates: Partial<Child>) => void;
  removeChild: (childId: string) => void;
  selectChild: (childId: string) => void;
  
  // Learning Goals
  addLearningGoal: (childId: string, goal: LearningGoal) => void;
  updateLearningGoal: (childId: string, goalId: string, updates: Partial<LearningGoal>) => void;
  completeLearningGoal: (childId: string, goalId: string) => void;
  
  // Screen Time
  updateScreenTime: (childId: string, screenTime: Partial<ScreenTimeData>) => void;
  
  // AI Suggestions
  addAISuggestion: (childId: string, suggestion: AISuggestion) => void;
  respondToAISuggestion: (childId: string, suggestionId: string, response: 'accept' | 'reject' | 'modify', modifications?: any) => void;
  
  // Utilities
  getChildById: (childId: string) => Child | undefined;
  getChildrenByAgeGroup: (ageGroup: 'k5' | 'middle' | 'high') => Child[];
  getActiveChildren: () => Child[];
}

export const useChildrenStore = create<ChildrenState>()(
  persist(
    (set, get) => ({
      children: [],
      selectedChildId: null,
      selectedChild: null,
      isLoading: false,
      error: null,

      setChildren: (children: Child[]) => {
        set({ children });
        const { selectedChildId } = get();
        if (selectedChildId) {
          const selectedChild = children.find((child: Child) => child.id === selectedChildId);
          set({ selectedChild: selectedChild || null });
        }
      },

      addChild: (child: Child) => {
        set((state: ChildrenState) => ({
          children: [...state.children, child]
        }));
      },

      updateChild: (childId: string, updates: Partial<Child>) => {
        set((state: ChildrenState) => ({
          children: state.children.map((child: Child) =>
            child.id === childId ? { ...child, ...updates, updatedAt: new Date() } : child
          ),
          selectedChild: state.selectedChild?.id === childId 
            ? { ...state.selectedChild, ...updates, updatedAt: new Date() }
            : state.selectedChild
        }));
      },

      removeChild: (childId: string) => {
        set((state: ChildrenState) => ({
          children: state.children.filter((child: Child) => child.id !== childId),
          selectedChildId: state.selectedChildId === childId ? null : state.selectedChildId,
          selectedChild: state.selectedChild?.id === childId ? null : state.selectedChild
        }));
      },

      selectChild: (childId: string) => {
        const { children } = get();
        const selectedChild = children.find((child: Child) => child.id === childId);
        set({
          selectedChildId: childId,
          selectedChild: selectedChild || null
        });
      },

      addLearningGoal: (childId: string, goal: LearningGoal) => {
        set((state: ChildrenState) => ({
          children: state.children.map((child: Child) =>
            child.id === childId
              ? { ...child, learningGoals: [...child.learningGoals, goal] }
              : child
          ),
          selectedChild: state.selectedChild?.id === childId
            ? { ...state.selectedChild, learningGoals: [...state.selectedChild.learningGoals, goal] }
            : state.selectedChild
        }));
      },

      updateLearningGoal: (childId: string, goalId: string, updates: Partial<LearningGoal>) => {
        set((state: ChildrenState) => ({
          children: state.children.map((child: Child) =>
            child.id === childId
              ? {
                  ...child,
                  learningGoals: child.learningGoals.map((goal: LearningGoal) =>
                    goal.id === goalId ? { ...goal, ...updates } : goal
                  )
                }
              : child
          ),
          selectedChild: state.selectedChild?.id === childId
            ? {
                ...state.selectedChild,
                learningGoals: state.selectedChild.learningGoals.map((goal: LearningGoal) =>
                  goal.id === goalId ? { ...goal, ...updates } : goal
                )
              }
            : state.selectedChild
        }));
      },

      completeLearningGoal: (childId: string, goalId: string) => {
        const { updateLearningGoal } = get();
        updateLearningGoal(childId, goalId, {
          status: 'completed',
          completedAt: new Date(),
          currentValue: get().children.find((c: Child) => c.id === childId)?.learningGoals.find((g: LearningGoal) => g.id === goalId)?.targetValue || 0
        });
      },

      updateScreenTime: (childId: string, screenTime: Partial<ScreenTimeData>) => {
        set((state: ChildrenState) => ({
          children: state.children.map((child: Child) =>
            child.id === childId
              ? { ...child, screenTime: { ...child.screenTime, ...screenTime } }
              : child
          ),
          selectedChild: state.selectedChild?.id === childId
            ? { ...state.selectedChild, screenTime: { ...state.selectedChild.screenTime, ...screenTime } }
            : state.selectedChild
        }));
      },

      addAISuggestion: (childId: string, suggestion: AISuggestion) => {
        set((state: ChildrenState) => ({
          children: state.children.map((child: Child) =>
            child.id === childId
              ? { ...child, aiSuggestions: [...child.aiSuggestions, suggestion] }
              : child
          ),
          selectedChild: state.selectedChild?.id === childId
            ? { ...state.selectedChild, aiSuggestions: [...state.selectedChild.aiSuggestions, suggestion] }
            : state.selectedChild
        }));
      },

      respondToAISuggestion: (childId: string, suggestionId: string, response: 'accept' | 'reject' | 'modify', modifications?: any) => {
        set((state: ChildrenState) => ({
          children: state.children.map((child: Child) =>
            child.id === childId
              ? {
                  ...child,
                  aiSuggestions: child.aiSuggestions.map((suggestion: AISuggestion) =>
                    suggestion.id === suggestionId
                      ? {
                          ...suggestion,
                          status: response === 'accept' ? 'accepted' : response === 'reject' ? 'rejected' : 'modified',
                          parentResponse: {
                            action: response,
                            modifications: modifications,
                            feedback: undefined,
                            reason: undefined
                          },
                          respondedAt: new Date(),
                          implementedAt: response === 'accept' ? new Date() : undefined
                        }
                      : suggestion
                  )
                }
              : child
          ),
          selectedChild: state.selectedChild?.id === childId
            ? {
                ...state.selectedChild,
                aiSuggestions: state.selectedChild.aiSuggestions.map((suggestion: AISuggestion) =>
                  suggestion.id === suggestionId
                    ? {
                        ...suggestion,
                        status: response === 'accept' ? 'accepted' : response === 'reject' ? 'rejected' : 'modified',
                        parentResponse: {
                          action: response,
                          modifications: modifications,
                          feedback: undefined,
                          reason: undefined
                        },
                        respondedAt: new Date(),
                        implementedAt: response === 'accept' ? new Date() : undefined
                      }
                    : suggestion
                )
              }
            : state.selectedChild
        }));
      },

      getChildById: (childId: string) => {
        return get().children.find((child: Child) => child.id === childId);
      },

      getChildrenByAgeGroup: (ageGroup: 'k5' | 'middle' | 'high') => {
        return get().children.filter((child: Child) => child.ageGroup === ageGroup);
      },

      getActiveChildren: () => {
        return get().children.filter((child: Child) => child.isActive);
      }
    }),
    {
      name: 'children-storage',
      partialize: (state) => ({
        children: state.children,
        selectedChildId: state.selectedChildId
      })
    }
  )
);