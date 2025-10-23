import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Text,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import MapView, { Marker, Polyline, MapPressEvent } from 'react-native-maps';
import { Searchbar, Provider as PaperProvider, Button } from 'react-native-paper';
import { locations, Location } from './data/locations';
import * as LocationLib from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { getDistance } from 'geolib';

const BACKGROUND_LOCATION_TASK = 'background-location-task';

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error('Background location error:', error);
    return;
  }
  if (data) {
    const { locations } = data as { locations: LocationLib.LocationObject[] };
    const location = locations[0];
    if (location) {
      console.log('📍 Background location update:', location.coords);
    }
  }
});

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showHome, setShowHome] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [destination, setDestination] = useState<Location | { latitude: number; longitude: number; title?: string } | null>(null);
  const [routeCoords, setRouteCoords] = useState<{ latitude: number; longitude: number }[]>([]);
  const [instructions, setInstructions] = useState<string[]>([]);
  const mapRef = useRef<MapView | null>(null);

  // --- Campus bounds computed from known locations ---
  const campusBounds = React.useMemo(() => {
    const pad = 0.0008; // ~80m padding
    const lats = locations.map(l => l.latitude);
    const lngs = locations.map(l => l.longitude);
    const minLat = Math.min(...lats) - pad;
    const maxLat = Math.max(...lats) + pad;
    const minLng = Math.min(...lngs) - pad;
    const maxLng = Math.max(...lngs) + pad;
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    const latitudeDelta = Math.max(0.0025, (maxLat - minLat) * 1.4);
    const longitudeDelta = Math.max(0.0025, (maxLng - minLng) * 1.4);
    return { minLat, maxLat, minLng, maxLng, centerLat, centerLng, latitudeDelta, longitudeDelta };
  }, []);

  const isWithinBounds = (lat: number, lng: number) => {
    return lat >= campusBounds.minLat && lat <= campusBounds.maxLat && lng >= campusBounds.minLng && lng <= campusBounds.maxLng;
  };

  const onChangeSearch = (query: string) => setSearchQuery(query);

  // Foreground + Background location tracking (only after leaving Home)
  useEffect(() => {
    if (showHome) return;
    let foregroundSub: LocationLib.LocationSubscription | null = null;

    (async () => {
      const { status } = await LocationLib.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please enable location access in settings.');
        return;
      }

      // Background location in Expo Go is limited; only request when task manager supports it
      const taskSupported = await TaskManager.isAvailableAsync();
      if (taskSupported) {
        const { status: bgStatus } = await LocationLib.requestBackgroundPermissionsAsync();
        if (bgStatus !== 'granted') {
          Alert.alert('Background permission denied', 'Location will only update while app is open.');
        }
      }

      foregroundSub = await LocationLib.watchPositionAsync(
        {
          accuracy: LocationLib.Accuracy.Balanced,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (location) => {
          const coords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          setUserLocation(coords);

          // Only re-center to user if they are within campus bounds
          if (isWithinBounds(coords.latitude, coords.longitude)) {
            mapRef.current?.animateToRegion({
              ...coords,
              latitudeDelta: campusBounds.latitudeDelta,
              longitudeDelta: campusBounds.longitudeDelta,
            });
          }

          if (destination) fetchRoute(destination.latitude, destination.longitude);
        }
      );

      if (taskSupported) {
        const hasStarted = await LocationLib.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
        if (!hasStarted) {
          await LocationLib.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
            accuracy: LocationLib.Accuracy.Balanced,
            timeInterval: 10000,
            distanceInterval: 15,
            showsBackgroundLocationIndicator: true,
            foregroundService: {
              notificationTitle: 'COOU_Nav is tracking your location',
              notificationBody: 'Your location updates as you move.',
            },
          });
        }
      }
    })();

    return () => {
      if (foregroundSub) foregroundSub.remove();
    };
  }, [destination, showHome]);

  // --- Home screen renderer ---
  const renderHome = () => (
    <View style={styles.homeContainer}>
      <View style={styles.heroCard}>
        <Image source={require('./assets/uni_logo.jpeg')} style={styles.heroLogo} resizeMode="cover" />
        <Text style={styles.heroTitle}>Chukwuemeka Odumegwu Ojukwu University</Text>
        <View style={styles.chip}><Text style={styles.chipText}>Uli Campus</Text></View>
        <Text style={styles.heroDescription}>
          Navigate the campus with building markers, powerful search, and turn‑by‑turn directions.
        </Text>
        <Button
          mode="contained"
          onPress={() => setShowHome(false)}
          style={styles.primaryButton}
          contentStyle={{ paddingVertical: 10 }}
        >
          Open Campus Map
        </Button>
      </View>
    </View>
  );

  // 🧭 Fetch route from OpenRouteService
  const fetchRoute = async (destinationLat: number, destinationLng: number) => {
    if (!userLocation) return;

    const API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImUyN2NjNjVhZTdjMDQ0Njc4MjI0YjdjYmRmNDBjOWVjIiwiaCI6Im11cm11cjY0In0=";
    const start = `${userLocation.longitude},${userLocation.latitude}`;
    const end = `${destinationLng},${destinationLat}`;
    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${API_KEY}&start=${start}&end=${end}&instructions_format=text`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data?.features?.length > 0) {
        const coords = data.features[0].geometry.coordinates.map(([lng, lat]: [number, number]) => ({
          latitude: lat,
          longitude: lng,
        }));
        setRouteCoords(coords);

        const steps = data.features[0].properties.segments[0].steps.map(
          (step: any) => `${step.instruction} (${(step.distance / 1000).toFixed(2)} km)`
        );
        setInstructions(steps);
      }
    } catch (err) {
      console.error("Route fetch error:", err);
    }
  };

  // 🔍 Filter search results
  const filteredLocations = locations.filter((loc) =>
    loc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 🏷️ Custom marker icons
  const getIconForType = (type: Location['type']) => {
    switch (type) {
      case 'faculty':
        return require('./assets/icons/faculty.png');
      case 'clinic':
        return require('./assets/icons/clinic.png');
      case 'hostel':
        return require('./assets/icons/hostel.png');
      case 'library':
        return require('./assets/icons/library.png');
      default:
        return require('./assets/icons/faculty.png');
    }
  };

  // 🖱️ Tap on map to set destination (clamped to campus)
  const handleMapPress = (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    const clampedLat = Math.min(Math.max(latitude, campusBounds.minLat), campusBounds.maxLat);
    const clampedLng = Math.min(Math.max(longitude, campusBounds.minLng), campusBounds.maxLng);
    const newDestination = { latitude: clampedLat, longitude: clampedLng, title: 'Selected point' };
    setDestination(newDestination);
    fetchRoute(newDestination.latitude, newDestination.longitude);
  };

  const distanceInMeters =
    userLocation && destination
      ? getDistance(userLocation, {
          latitude: destination.latitude,
          longitude: destination.longitude,
        })
      : 0;

  const distanceInKm = (distanceInMeters / 1000).toFixed(2);

  return (
    <PaperProvider>
      {showHome ? (
        renderHome()
      ) : (
        <View style={styles.container}>
          <Searchbar
            placeholder="Search for a location..."
            onChangeText={onChangeSearch}
            value={searchQuery}
            style={styles.searchBar}
          />

          {searchQuery.length > 0 && filteredLocations.length > 0 && (
            <View style={styles.resultsContainer}>
              {filteredLocations.map((loc, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.resultItem}
                  onPress={() => {
                    mapRef.current?.animateToRegion(
                      {
                        latitude: loc.latitude,
                        longitude: loc.longitude,
                        latitudeDelta: campusBounds.latitudeDelta,
                        longitudeDelta: campusBounds.longitudeDelta,
                      },
                      1000
                    );
                    setDestination(loc);
                    setSearchQuery('');
                    fetchRoute(loc.latitude, loc.longitude);
                  }}
                >
                  <Text>{loc.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <MapView
            ref={mapRef}
            style={styles.map}
            showsUserLocation={true}
            followsUserLocation={false}
            onPress={handleMapPress}
            initialRegion={{
              latitude: campusBounds.centerLat,
              longitude: campusBounds.centerLng,
              latitudeDelta: campusBounds.latitudeDelta,
              longitudeDelta: campusBounds.longitudeDelta,
            }}
            onRegionChangeComplete={(region) => {
              // If user pans outside bounds, gently bring them back inside
              const { latitude, longitude, latitudeDelta, longitudeDelta } = region;
              if (!isWithinBounds(latitude, longitude)) {
                const clampedLat = Math.min(Math.max(latitude, campusBounds.minLat), campusBounds.maxLat);
                const clampedLng = Math.min(Math.max(longitude, campusBounds.minLng), campusBounds.maxLng);
                mapRef.current?.animateToRegion({
                  latitude: clampedLat,
                  longitude: clampedLng,
                  latitudeDelta,
                  longitudeDelta,
                }, 250);
              }
            }}
          >
            {locations.map((loc, index) => (
              <Marker
                key={index}
                coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
                title={loc.title}
                description={loc.description}
                onPress={() => {
                  setDestination(loc);
                  mapRef.current?.animateToRegion({
                    latitude: loc.latitude,
                    longitude: loc.longitude,
                    latitudeDelta: campusBounds.latitudeDelta,
                    longitudeDelta: campusBounds.longitudeDelta,
                  }, 600);
                  fetchRoute(loc.latitude, loc.longitude);
                }}
              >
                <Image
                  source={getIconForType(loc.type)}
                  style={{ width: 32, height: 32 }}
                  resizeMode="contain"
                />
              </Marker>
            ))}

            {destination && (
              <Marker
                coordinate={{
                  latitude: destination.latitude,
                  longitude: destination.longitude,
                }}
                title={destination.title || 'Selected Destination'}
                pinColor="red"
              />
            )}

            {routeCoords.length > 0 && (
              <Polyline coordinates={routeCoords} strokeColor="blue" strokeWidth={4} />
            )}
          </MapView>

          {userLocation && destination && (
            <View style={styles.infoBox}>
              <Text style={{ fontWeight: 'bold' }}>
                Distance to {destination.title || 'Selected Point'}: {distanceInKm} km
              </Text>
            </View>
          )}

          {instructions.length > 0 && (
            <ScrollView style={styles.directionsBox}>
              {instructions.map((step, index) => (
                <Text key={index} style={styles.directionText}>
                  {index + 1}. {step}
                </Text>
              ))}
            </ScrollView>
          )}
        </View>
      )}
    </PaperProvider>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1 },
  homeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#f5f7fb',
  },
  heroCard: {
    width: '92%',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  heroLogo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e6e9f2',
    overflow: 'hidden',
  },
  heroTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  chip: {
    marginTop: 6,
    marginBottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#eef2ff',
  },
  chipText: { color: '#3b5bfd', fontWeight: '600' },
  heroDescription: { fontSize: 14, textAlign: 'center', color: '#444', marginBottom: 20 },
  primaryButton: { width: '70%', borderRadius: 999 },
  searchBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 10,
    right: 10,
    zIndex: 10,
    elevation: 5,
  },
  resultsContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 110 : 90,
    left: 10,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    zIndex: 10,
    elevation: 5,
    paddingHorizontal: 10,
    maxHeight: 200,
  },
  resultItem: { paddingVertical: 10, borderBottomColor: '#ccc', borderBottomWidth: 1 },
  map: { flex: 1 },
  infoBox: {
    position: 'absolute',
    bottom: 130,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    elevation: 3,
    alignItems: 'center',
  },
  directionsBox: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: 120,
    backgroundColor: '#fff',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  directionText: {
    fontSize: 14,
    marginBottom: 5,
  },
});
