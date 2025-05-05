import { create } from 'zustand';

type Mode = 'light' | 'dark' ;

type ModeState = {
  mode: Mode;
  setMode: (mode: Mode) => void;
};

export const useSystemStore = create<ModeState>((set) => ({
  mode: 'light',
  setMode: (mode) => set({ mode: mode }),
}));
