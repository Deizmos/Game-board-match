import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { User, Location } from '@/types';

interface MapViewComponentProps {
  users: User[];
  currentLocation: Location | null;
  onUserSelect?: (user: User) => void;
  selectedUser?: User | null;
}

export default function MapViewComponent({
  users,
  currentLocation,
  onUserSelect,
  selectedUser,
}: MapViewComponentProps) {
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      });
    }
  }, [currentLocation]);

  const handleMarkerPress = (user: User) => {
    if (onUserSelect) {
      onUserSelect(user);
    }
  };

  if (!currentLocation) {
    return (
      <View style={styles.container}>
        <View style={styles.placeholder}>
          {/* Placeholder для случая, когда геолокация недоступна */}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        showsUserLocation
        showsMyLocationButton
      >
        {/* Маркер текущего местоположения */}
        <Marker
          coordinate={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
          }}
          title="Вы здесь"
          pinColor="blue"
        />

        {/* Маркеры других пользователей */}
        {users.map((user) => (
          <Marker
            key={user.id}
            coordinate={{
              latitude: user.location.latitude,
              longitude: user.location.longitude,
            }}
            title={user.name}
            description={`${user.age} лет, ${user.location.city || 'Неизвестно'}`}
            onPress={() => handleMarkerPress(user)}
            pinColor={selectedUser?.id === user.id ? 'red' : 'green'}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
