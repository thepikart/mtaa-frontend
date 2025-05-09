import { create } from 'zustand';
import NetInfo from '@react-native-community/netinfo';

type Mode = 'light' | 'dark' ;

type ModeState = {
  mode: Mode;
  setMode: (mode: Mode) => void;
  connected: boolean;
  setConnected: (connected: boolean) => void;
};

export const useSystemStore = create<ModeState>((set) => ({
  mode: 'light',
  setMode: (mode) => set({ mode: mode }),
  connected: true,
  setConnected: (connected) => set({ connected: connected }),
}));

NetInfo.addEventListener(state => {
  useSystemStore.getState().setConnected(state.isConnected ?? false);
});