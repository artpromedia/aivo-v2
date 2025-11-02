import { create } from 'zustand';
import { Lesson, Progress, Assessment } from '../types';

interface LessonState {
  lessons: Lesson[];
  currentLesson: Lesson | null;
  lessonProgress: Progress[];
  loading: boolean;
  error: string | null;
  
  setLessons: (lessons: Lesson[]) => void;
  setCurrentLesson: (lesson: Lesson | null) => void;
  updateLessonProgress: (progress: Progress) => void;
  getLessonProgress: (lessonId: string) => Progress | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useLessonStore = create<LessonState>((set, get) => ({
  lessons: [],
  currentLesson: null,
  lessonProgress: [],
  loading: false,
  error: null,

  setLessons: (lessons) => set({ lessons }),

  setCurrentLesson: (lesson) => set({ currentLesson: lesson }),

  updateLessonProgress: (progress) => {
    const { lessonProgress } = get();
    const existingIndex = lessonProgress.findIndex(p => 
      p.lessonId === progress.lessonId && p.userId === progress.userId
    );

    let updatedProgress;
    if (existingIndex >= 0) {
      updatedProgress = [...lessonProgress];
      updatedProgress[existingIndex] = progress;
    } else {
      updatedProgress = [...lessonProgress, progress];
    }

    set({ lessonProgress: updatedProgress });
  },

  getLessonProgress: (lessonId) => {
    const { lessonProgress } = get();
    return lessonProgress.find(p => p.lessonId === lessonId) || null;
  },

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error })
}));

interface AssessmentState {
  assessments: Assessment[];
  currentAssessment: Assessment | null;
  assessmentProgress: Record<string, any>;
  results: Record<string, any>[];
  loading: boolean;
  error: string | null;

  setAssessments: (assessments: Assessment[]) => void;
  setCurrentAssessment: (assessment: Assessment | null) => void;
  updateAssessmentProgress: (assessmentId: string, progress: any) => void;
  addResult: (result: any) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAssessmentStore = create<AssessmentState>((set, get) => ({
  assessments: [],
  currentAssessment: null,
  assessmentProgress: {},
  results: [],
  loading: false,
  error: null,

  setAssessments: (assessments) => set({ assessments }),

  setCurrentAssessment: (assessment) => set({ currentAssessment: assessment }),

  updateAssessmentProgress: (assessmentId, progress) => {
    const { assessmentProgress } = get();
    set({
      assessmentProgress: {
        ...assessmentProgress,
        [assessmentId]: progress
      }
    });
  },

  addResult: (result) => {
    const { results } = get();
    set({ results: [...results, result] });
  },

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error })
}));