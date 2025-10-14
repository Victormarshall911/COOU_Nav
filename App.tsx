import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Text,
  ScrollView,
  Platform,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Searchbar, Provider as PaperProvider } from 'react-native-paper';
import { locations, Location } from './data/locations';
import * as LocationLib from 'expo-location';
import { getDistance } from 'geolib';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [routeCoords, setRouteCoords] = useState<{ latitude: number; longitude: number }[]>([]);
  const [instructions, setInstructions] = useState<string[]>([]);
  const mapRef = useRef<MapView | null>(null);

  const onChangeSearch = (query: string) => setSearchQuery(query);

  // Request user location
  useEffect(() => {
    (async () => {
      const { status } = await LocationLib.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permission to access location was denied');
        return;
      }
      const location = await LocationLib.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  // Fetch route from OpenRouteService API with step-by-step instructions
  const fetchRoute = async (destinationLat: number, destinationLng: number) => {
    if (!userLocation) return;

    const API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImUyN2NjNjVhZTdjMDQ0Njc4MjI0YjdjYmRmNDBjOWVjIiwiaCI6Im11cm11cjY0In0=";
    const start = `${userLocation.longitude},${userLocation.latitude}`;
    const end = `${destinationLng},${destinationLat}`;

    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${API_KEY}&start=${start}&end=${end}&instructions_format=text`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data && data.features && data.features.length > 0) {
        // Route coordinates for the polyline
        const coords = data.features[0].geometry.coordinates.map(([lng, lat]: [number, number]) => ({
          latitude: lat,
          longitude: lng,
        }));
        setRouteCoords(coords);

        // Step-by-step instructions
        const steps = data.features[0].properties.segments[0].steps.map(
          (step: any) => `${step.instruction} (${(step.distance / 1000).toFixed(2)} km)`
        );
        setInstructions(steps);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredLocations = locations.filter((loc) =>
    loc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  // Calculate distance
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
      <View style={styles.container}>
        {/* Search Bar */}
        <Searchbar
          placeholder="Search for a location..."
          onChangeText={onChangeSearch}
          value={searchQuery}
          style={styles.searchBar}
        />

        {/* Search Results */}
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
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    },
                    1000
                  );
                  setDestination(loc);
                  setSearchQuery('');
                  fetchRoute(loc.latitude, loc.longitude); // fetch route on selection
                }}
              >
                <Text>{loc.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Map View */}
        <MapView
          ref={mapRef}
          style={styles.map}
          showsUserLocation={true}
          initialRegion={{
            latitude: userLocation?.latitude || 5.8471,
            longitude: userLocation?.longitude || 6.8526,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
        >
          {/* Markers */}
          {locations.map((loc, index) => (
            <Marker
              key={index}
              coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
              title={loc.title}
              description={loc.description}
            >
              <Image
                source={getIconForType(loc.type)}
                style={{ width: 32, height: 32 }}
                resizeMode="contain"
              />
            </Marker>
          ))}

          {/* Polyline for the route */}
          {routeCoords.length > 0 && (
            <Polyline coordinates={routeCoords} strokeColor="blue" strokeWidth={4} />
          )}
        </MapView>

        {/* Distance Box */}
        {userLocation && destination && (
          <View style={styles.infoBox}>
            <Text style={{ fontWeight: 'bold' }}>
              Distance to {destination.title}: {distanceInKm} km
            </Text>
          </View>
        )}

        {/* Turn-by-Turn Directions */}
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
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
