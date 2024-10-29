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
      // get the user's location using ipgeolocation.io
      fetch('/api/geo')
        .then(response => response.json())
        .then(data => {
          const city = data.city || '';
          const fullState = data.state_prov || '';
          const stateAbbr = stateAbbreviations[fullState as keyof typeof stateAbbreviations] || fullState;  // convert full state name to abbreviation
          const locationString = `${city}, ${stateAbbr}`;
          setUserCity(locationString);
          localStorage.setItem('userLocation', locationString);
        })
        .catch(error => {
          console.error('Error fetching location:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, []);

  return (
    <div className="container max-w-full flex flex-col min-h-screen">
      <div className="hero-section bg-background text-white py-10 sm:py-20">
        <h1 className="text-3xl sm:text-4xl md:text-5xl text-center font-semibold px-4">Find the best doctor near you.</h1>
      </div>
      <div className="flex flex-col lg:flex-row flex-1">
        <div className="w-full lg:w-[70%] px-4 sm:px-6 lg:pl-10 xl:pl-20 pt-6 lg:pt-10">
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <Skeleton className="h-6 sm:h-8 w-32 sm:w-44" />
              <Skeleton className="h-6 sm:h-8 w-24 sm:w-32" />
            </div>
          ) : (
            userCity && <p className="text-left text-xl sm:text-2xl">Top-rated doctors in <span className="underline decoration-primary underline-offset-4">{userCity}</span></p>
          )}
        </div>
        <div className="w-full lg:w-[30%] px-4 sm:px-6 lg:pr-10 xl:pr-20 pt-6 lg:pt-10">
          {isLoading ? (
            <Skeleton className="w-full h-64 lg:h-full" />
          ) : (
            <div className="w-full h-64 lg:h-full bg-gray-100 relative">
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
