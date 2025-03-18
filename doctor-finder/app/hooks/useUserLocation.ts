import { useState, useEffect } from 'react';
import { stateAbbreviations } from '../components/states';

// make sure we only fetch once per session
let isFetchingCoordinates = false;

interface UserLocation {
  coordinates: { lat: number, lng: number } | null;
  locationString: string;
  isLoading: boolean;
}

export default function useUserLocation(): UserLocation {
  const [userLocation, setUserLocation] = useState<UserLocation>({
    coordinates: null,
    locationString: '',
    isLoading: true
  });

  useEffect(() => {
    async function getLocation() {
      try {
        // check for cached data first
        const cachedLocation = localStorage.getItem('userLocation');
        const cachedCoordinates = localStorage.getItem('userCoordinates');
        
        if (cachedLocation && cachedCoordinates) {
          setUserLocation({
            coordinates: JSON.parse(cachedCoordinates),
            locationString: cachedLocation,
            isLoading: false
          });
          return;
        }
        
        // if another component is already fetching, wait for that to complete
        if (isFetchingCoordinates) {
          const checkCache = setInterval(() => {
            const newCachedLocation = localStorage.getItem('userLocation');
            const newCachedCoordinates = localStorage.getItem('userCoordinates');
            
            if (newCachedLocation && newCachedCoordinates) {
              setUserLocation({
                coordinates: JSON.parse(newCachedCoordinates),
                locationString: newCachedLocation,
                isLoading: false
              });
              clearInterval(checkCache);
            }
          }, 200);
          return;
        }
        
        // set flag to prevent duplicate fetches
        isFetchingCoordinates = true;
        
        // fetch location data
        const geoResponse = await fetch('/api/geo');
        const data = await geoResponse.json();
        
        const city = data.city || '';
        const fullState = data.state_prov || '';
        const stateAbbr = stateAbbreviations[fullState as keyof typeof stateAbbreviations] || fullState;
        const locationString = `${city}, ${stateAbbr}`;
        
        let coordinates = null;
        if (data.latitude && data.longitude) {
          coordinates = { 
            lat: parseFloat(data.latitude), 
            lng: parseFloat(data.longitude) 
          };
          localStorage.setItem('userCoordinates', JSON.stringify(coordinates));
        }
        
        localStorage.setItem('userLocation', locationString);
        
        setUserLocation({
          coordinates,
          locationString,
          isLoading: false
        });
        
        // reset flag
        isFetchingCoordinates = false;
      } catch (error) {
        console.error('Error fetching user location:', error);
        setUserLocation({
          coordinates: null,
          locationString: '',
          isLoading: false
        });
        isFetchingCoordinates = false;
      }
    }

    getLocation();
  }, []);

  return userLocation;
} 