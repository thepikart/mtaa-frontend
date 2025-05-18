import { create } from 'zustand';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEventStore } from './eventStore';
import Toast from 'react-native-toast-message';
import Constants from "expo-constants";
const { googleMapsApiKey } = Constants.expoConfig!.extra as { googleMapsApiKey: string };
const GoogleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || googleMapsApiKey;

type Mode = 'light' | 'dark';

type OfflineAction = {
  action: string;
  params: any;
}

type SystemState = {
  mode: Mode;
  setMode: (mode: Mode) => void;
  connected: boolean;
  setConnected: (connected: boolean) => void;
  offlineQueue: OfflineAction[];
  setOfflineQueue: () => Promise<void>;
  addToOfflineQueue: (action: string, params: any) => Promise<void>;
  syncOfflineQueue: () => Promise<void>;
  isSyncing: boolean;
};

export const useSystemStore = create<SystemState>((set) => ({
  mode: 'light',
  setMode: (mode) => set({ mode: mode }),
  connected: true,
  setConnected: (connected) => set({ connected: connected }),
  offlineQueue: [],
  isSyncing: false,
  setOfflineQueue: async () => {
    const storedQueue = await AsyncStorage.getItem('offlineQueue');
    if (storedQueue) {
      const queue = JSON.parse(storedQueue);
      set({ offlineQueue: queue });
    }
  },
  addToOfflineQueue: async (action, params) => {
    const currentQueue = useSystemStore.getState().offlineQueue;
    const updatedQueue = [...currentQueue, { action, params }];
    set({ offlineQueue: updatedQueue });
    await AsyncStorage.setItem('offlineQueue', JSON.stringify(updatedQueue));
  },
  syncOfflineQueue: async () => {
    const { offlineQueue, isSyncing } = useSystemStore.getState();
    if (isSyncing || offlineQueue.length === 0) return;
    if (offlineQueue.length > 0) {
      set({ isSyncing: true });
      for (const action of offlineQueue) {
        let success = false;

        if (action.action === 'createEvent') {
          const raw = action.params.data;
          const data = new FormData();

          if (!raw.latitude || !raw.longitude) {
            try {
              const place = raw.place;
              const res = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(place)}&key=${GoogleMapsApiKey}`
              );
              const json = await res.json();
              if (json.status === 'OK' && json.results.length) {
                const lat = String(json.results[0].geometry.location.lat);
                const lon = String(json.results[0].geometry.location.lng);

                data.append('title', raw.title);
                data.append('place', raw.place);
                data.append('latitude', lat);
                data.append('longitude', lon);
                data.append('date', raw.date);
                data.append('category', raw.category);
                data.append('description', raw.description);
                data.append('price', raw.price);
              
                if (raw.photoUri) {
                  const filename = raw.photoUri.split('/').pop()!;
                  const match = /\.(\w+)$/.exec(filename);
                  const type = match ? `image/${match[1]}` : `image`;
                  data.append('photo', {
                    uri: raw.photoUri,
                    name: filename,
                    type,
                  } as any);
                }
              }
              else {
                Toast.show({
                  type: 'error',
                  text1: `Failed to geocode: ${place}`,
                });
                continue;
              }
            }
            catch (err) {
              Toast.show({
                type: 'error',
                text1: `Network error when geocoding`,
              });
              continue;
            }
          }
          const response = await useEventStore.getState().createEvent(data);
          success = response?.success;
          if (success) {
            Toast.show({
              type: 'success',
              text1: `Event "${raw.title}" created successfully!`,
            });
          }
          else {
            Toast.show({
              type: 'error',
              text1: `Failed to create event "${raw.title}".`,
            });
          }
        }
        else if (action.action === 'createComment') {
          const { eventId, data } = action.params;
          const response = await useEventStore.getState().createComment(eventId, data);
          success = response?.success;
          if (success) {
            Toast.show({
              type: 'success',
              text1: 'Comment added successfully!',
            });
          } else {
            Toast.show({
              type: 'error',
              text1: 'Failed to add comment. Will retry later.',
            });
          }
        }

      }
      await AsyncStorage.removeItem('offlineQueue');
      set({ offlineQueue: [] });
      set({ isSyncing: false });
    }
  }
}));

NetInfo.addEventListener(state => {
  useSystemStore.getState().setConnected(state.isConnected ?? false);

  if (state.isConnected) {
    useSystemStore.getState().syncOfflineQueue();
  }
});