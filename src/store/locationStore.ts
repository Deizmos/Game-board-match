import { create } from 'zustand';
import * as Location from 'expo-location';
import { Location as LocationType } from '@/types';

interface LocationState {
  currentLocation: LocationType | null;
  isLoading: boolean;
  permissionGranted: boolean;
  error: string | null;
  getCurrentLocation: () => Promise<void>;
  requestPermission: () => Promise<boolean>;
  updateLocation: (location: LocationType) => void;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  currentLocation: null,
  isLoading: false,
  permissionGranted: false,
  error: null,

  requestPermission: async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      set({ permissionGranted: granted });
      return granted;
    } catch (error) {
      console.error('Ошибка запроса разрешения геолокации:', error);
      set({ error: 'Не удалось запросить разрешение на геолокацию' });
      return false;
    }
  },

  getCurrentLocation: async () => {
    const { permissionGranted } = get();
    
    if (!permissionGranted) {
      const granted = await get().requestPermission();
      if (!granted) {
        set({ error: 'Разрешение на геолокацию не предоставлено' });
        return;
      }
    }

    set({ isLoading: true, error: null });

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // Получаем адрес по координатам
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const address = reverseGeocode[0];
      const locationData: LocationType = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        city: address?.city || undefined,
        country: address?.country || undefined,
      };

      set({
        currentLocation: locationData,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Ошибка получения геолокации:', error);
      set({
        error: 'Не удалось получить текущее местоположение',
        isLoading: false,
      });
    }
  },

  updateLocation: (location: LocationType) => {
    set({ currentLocation: location });
  },
}));
