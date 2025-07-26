import { create } from 'zustand';

type ActiveContextType = 'task' | 'user' | 'note' | 'project' | null;

interface WorkspaceContextState {
  activeContextType: ActiveContextType;
  activeEntityId: string | null;
  setActiveContext: (type: ActiveContextType, id: string | null) => void;
  clearActiveContext: () => void;
}

export const useWorkspaceContextStore = create<WorkspaceContextState>((set) => ({
  activeContextType: null,
  activeEntityId: null,
  setActiveContext: (type, id) => set({ activeContextType: type, activeEntityId: id }),
  clearActiveContext: () => set({ activeContextType: null, activeEntityId: null }),
}));
