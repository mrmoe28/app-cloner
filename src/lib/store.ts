import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Project, AppState, AnalysisResult, GeneratedCode } from '@/types';

interface AppStore extends AppState {
  // Actions
  setCurrentProject: (project: Project | null) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setAnalysisProgress: (progress: number) => void;
  setGenerationProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  addProject: (project: Project) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;
  setProjectAnalysis: (projectId: string, analysis: AnalysisResult) => void;
  setProjectGeneratedCode: (projectId: string, generatedCode: GeneratedCode) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState: AppState = {
  currentProject: null,
  isAnalyzing: false,
  isGenerating: false,
  analysisProgress: 0,
  generationProgress: 0,
  error: null,
  projects: [],
};

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setCurrentProject: (project) =>
          set({ currentProject: project }, false, 'setCurrentProject'),

        setIsAnalyzing: (isAnalyzing) =>
          set({ isAnalyzing }, false, 'setIsAnalyzing'),

        setIsGenerating: (isGenerating) =>
          set({ isGenerating }, false, 'setIsGenerating'),

        setAnalysisProgress: (analysisProgress) =>
          set({ analysisProgress }, false, 'setAnalysisProgress'),

        setGenerationProgress: (generationProgress) =>
          set({ generationProgress }, false, 'setGenerationProgress'),

        setError: (error) =>
          set({ error }, false, 'setError'),

        addProject: (project) =>
          set(
            (state) => ({
              projects: [...state.projects, project],
              currentProject: project,
            }),
            false,
            'addProject'
          ),

        updateProject: (projectId, updates) =>
          set(
            (state) => ({
              projects: state.projects.map((p) =>
                p.id === projectId ? { ...p, ...updates } : p
              ),
              currentProject:
                state.currentProject?.id === projectId
                  ? { ...state.currentProject, ...updates }
                  : state.currentProject,
            }),
            false,
            'updateProject'
          ),

        deleteProject: (projectId) =>
          set(
            (state) => ({
              projects: state.projects.filter((p) => p.id !== projectId),
              currentProject:
                state.currentProject?.id === projectId
                  ? null
                  : state.currentProject,
            }),
            false,
            'deleteProject'
          ),

        setProjectAnalysis: (projectId, analysis) =>
          set(
            (state) => {
              const updatedProjects = state.projects.map((p) =>
                p.id === projectId
                  ? { ...p, analysis, status: 'analyzed' as const }
                  : p
              );
              
              return {
                projects: updatedProjects,
                currentProject:
                  state.currentProject?.id === projectId
                    ? { ...state.currentProject, analysis, status: 'analyzed' as const }
                    : state.currentProject,
                isAnalyzing: false,
                analysisProgress: 100,
              };
            },
            false,
            'setProjectAnalysis'
          ),

        setProjectGeneratedCode: (projectId, generatedCode) =>
          set(
            (state) => {
              const updatedProjects = state.projects.map((p) =>
                p.id === projectId
                  ? { ...p, generatedCode, status: 'generated' as const }
                  : p
              );
              
              return {
                projects: updatedProjects,
                currentProject:
                  state.currentProject?.id === projectId
                    ? { ...state.currentProject, generatedCode, status: 'generated' as const }
                    : state.currentProject,
                isGenerating: false,
                generationProgress: 100,
              };
            },
            false,
            'setProjectGeneratedCode'
          ),

        clearError: () => set({ error: null }, false, 'clearError'),

        reset: () => set(initialState, false, 'reset'),
      }),
      {
        name: 'app-cloner-store',
        partialize: (state) => ({
          projects: state.projects,
          currentProject: state.currentProject,
        }),
      }
    ),
    {
      name: 'app-cloner',
    }
  )
);

// Selectors for better performance
export const useCurrentProject = () => useAppStore((state) => state.currentProject);
export const useProjects = () => useAppStore((state) => state.projects);
export const useIsAnalyzing = () => useAppStore((state) => state.isAnalyzing);
export const useIsGenerating = () => useAppStore((state) => state.isGenerating);
export const useAnalysisProgress = () => useAppStore((state) => state.analysisProgress);
export const useGenerationProgress = () => useAppStore((state) => state.generationProgress);
export const useError = () => useAppStore((state) => state.error);