import { useSystemStore } from '@/stores/systemStore';
import { darkMode, lightMode } from '@/styles/mode';

export const useMode = () => {
  const mode = useSystemStore((state) => state.mode);
  return mode === 'dark' ? darkMode : lightMode;
};
