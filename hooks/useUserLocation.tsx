import { useEffect, useState, useCallback } from 'react';
import * as Location from 'expo-location';

export interface UserCoords {
  latitude: number;
  longitude: number;
}

export const useUserLocation = () => {
  const [coords, setCoords] = useState<UserCoords | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const askPermissionAndFetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setError('Bez povolenia polohy sa nedajú vyhľadať eventy v okolí.');
      setLoading(false);
      return;
    }

    try {
      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setCoords({ latitude: coords.latitude, longitude: coords.longitude });
    } catch (e) {
      setError('Nepodarilo sa získať polohu používateľa.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { askPermissionAndFetch(); }, []);

  return { coords, loading, error, refresh: askPermissionAndFetch };
};
