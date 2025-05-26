import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WorkflowData, AnalysisSession } from '../types';

interface AnalysisStore {
  sessions: AnalysisSession[];
  currentSession: AnalysisSession | null;
  theme: 'light' | 'dark';
  addSession: (session: AnalysisSession) => void;
  setCurrentSession: (session: AnalysisSession | null) => void;
  toggleTheme: () => void;
  generateShareUrl: (sessionId: string) => string;
}

export const useAnalysisStore = create<AnalysisStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSession: null,
      theme: 'light',
      addSession: (session) => set((state) => ({
        sessions: [...state.sessions, session],
        currentSession: session,
      })),
      setCurrentSession: (session) => set({ currentSession: session }),
      toggleTheme: () => set((state) => ({ 
        theme: state.theme === 'light' ? 'dark' : 'light' 
      })),
      generateShareUrl: (sessionId) => {
        const session = get().sessions.find(s => s.id === sessionId);
        if (!session) return '';
        const data = btoa(JSON.stringify(session));
        return `${window.location.origin}?session=${data}`;
      },
    }),
    {
      name: 'github-actions-analysis',
    }
  )
);