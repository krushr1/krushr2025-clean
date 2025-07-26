/**
 * UI State Store
 * Global UI state management for modals, panels, and other UI elements
 */

import { create } from 'zustand'

interface UIState {
  // Task Creation Modal
  showTaskCreationModal: boolean
  taskCreationColumnId?: string
  taskCreationKanbanId?: string
  
  // Command Palette
  showCommandPalette: boolean
  
  // Layout Manager
  showLayoutManager: boolean
  layoutManagerMode?: 'save' | 'load'
  
  // Note Creation
  shouldCreateNote: boolean
  
  // Focus Mode
  focusMode: boolean
  focusedPanelId?: string
  
  // Methods
  openTaskCreationModal: (options?: { columnId?: string; kanbanId?: string }) => void
  closeTaskCreationModal: () => void
  toggleCommandPalette: () => void
  setCommandPalette: (show: boolean) => void
  openLayoutManager: (mode?: 'save' | 'load') => void
  closeLayoutManager: () => void
  triggerNoteCreation: () => void
  clearNoteCreation: () => void
  toggleFocusMode: (panelId?: string) => void
  exitFocusMode: () => void
}

export const useUIStore = create<UIState>((set) => ({
  // Initial state
  showTaskCreationModal: false,
  taskCreationColumnId: undefined,
  taskCreationKanbanId: undefined,
  showCommandPalette: false,
  showLayoutManager: false,
  layoutManagerMode: undefined,
  shouldCreateNote: false,
  focusMode: false,
  focusedPanelId: undefined,
  
  // Methods
  openTaskCreationModal: (options) => set({
    showTaskCreationModal: true,
    taskCreationColumnId: options?.columnId,
    taskCreationKanbanId: options?.kanbanId,
  }),
  
  closeTaskCreationModal: () => set({
    showTaskCreationModal: false,
    taskCreationColumnId: undefined,
    taskCreationKanbanId: undefined,
  }),
  
  toggleCommandPalette: () => set((state) => ({
    showCommandPalette: !state.showCommandPalette,
  })),
  
  setCommandPalette: (show) => set({ showCommandPalette: show }),
  
  openLayoutManager: (mode) => set({
    showLayoutManager: true,
    layoutManagerMode: mode || 'save',
  }),
  
  closeLayoutManager: () => set({
    showLayoutManager: false,
    layoutManagerMode: undefined,
  }),
  
  triggerNoteCreation: () => set({ shouldCreateNote: true }),
  
  clearNoteCreation: () => set({ shouldCreateNote: false }),
  
  toggleFocusMode: (panelId) => set((state) => {
    // If no panelId provided (keyboard shortcut), toggle focus mode
    if (!panelId) {
      return {
        focusMode: !state.focusMode,
        focusedPanelId: state.focusMode ? undefined : state.focusedPanelId,
      }
    }
    
    // If we're already in focus mode and clicking the same panel, exit focus mode
    if (state.focusMode && state.focusedPanelId === panelId) {
      return {
        focusMode: false,
        focusedPanelId: undefined,
      }
    }
    
    // If we're not in focus mode, or switching to a different panel
    return {
      focusMode: true,
      focusedPanelId: panelId,
    }
  }),
  
  exitFocusMode: () => set({
    focusMode: false,
    focusedPanelId: undefined,
  }),
}))