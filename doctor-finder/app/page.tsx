'use client';

import { useEffect, useState } from 'react';
import { Skeleton } from "@/components/ui/skeleton"
import { stateAbbreviations } from './components/states';

export default function Home() {
  const [mapsKey, setMapsKey] = useState('');
  const [userCity, setUserCity] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    async function fetchMapsKey() {
      const response = await fetch('/api/firebase-config');
      const config = await response.json();
      setMapsKey(config.mapsKey);
    }
    fetchMapsKey();

    // check the local storage for the user's location
    const cachedLocation = localStorage.getItem('userLocation');
    if (cachedLocation) {
      setUserCity(cachedLocation);
      setIsLoading(false);
    } else {
      // get the user's location and city
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // use open street map to get the city and state
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`);
            const data = await response.json();
            const city = data.address.city || data.address.town || data.address.village || '';
            const state = data.address.state || '';
            const stateAbbr = stateAbbreviations[state as keyof typeof stateAbbreviations] || '';
            const locationString = `${city}, ${stateAbbr}`;
            setUserCity(locationString);
            localStorage.setItem('userLocation', locationString); // cache the location
          } catch (error) {
            console.error('Error fetching location:', error);
          } finally {
            setIsLoading(false);
          }
        });
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  return (
    <div className="container max-w-full flex flex-col min-h-screen">
      <div className="hero-section bg-background text-white py-20">
        <h1 className="text-5xl text-center font-semibold">Find the best doctor near you.</h1>
      </div>
      <div className="flex flex-1">
        <div className="w-[70%] pl-20 pt-10">
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-44" />
              <Skeleton className="h-8 w-32" />
            </div>
          ) : (
            userCity && <p className="text-left text-2xl">Top-rated doctors in <span className="underline decoration-primary underline-offset-4">{userCity}</span></p>
          )}
        </div>
        <div className="w-[30%] pr-20 pl-10 pt-10 relative">
          {isLoading ? (
            <Skeleton className="w-full h-full" />
          ) : (
            <div className="w-full h-full bg-gray-100 relative">
              {mapsKey && (
                <iframe
                  src={`https://www.google.com/maps/embed/v1/search?key=${mapsKey}&q=doctors+in+${encodeURIComponent(userCity || 'your area')}`}
                  className={`w-full h-full absolute top-0 left-0 transition-opacity duration-300 ${mapLoaded ? 'opacity-100' : 'opacity-0'}`}
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  onLoad={() => setMapLoaded(true)}
                ></iframe>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
