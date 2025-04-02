'use client';

import { Star, Shield, MessageCircle, MapPin, Pencil } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import useUserLocation from '../hooks/useUserLocation';

type DistanceCache = {
  [key: string]: number;
};
const distanceCache: DistanceCache = {};

interface DoctorProfileCardProps {
  id?: string;
  name: string;
  specialty: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  acceptedInsurances: string[];
  spokenLanguages: string[];
  previewImage?: string | null;
  rating?: number;
  reviewCount?: number;
  degree?: string;
  setIsDialogOpen?: (open: boolean) => void;
  availability?: {
    [date: string]: string[];
  };
  // Make distance optional - we'll calculate it if not provided
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export default function DoctorProfileCard({
  id,
  name,
  degree,
  specialty,
  streetAddress,
  city,
  state,
  zipCode,
  acceptedInsurances,
  spokenLanguages,
  previewImage,
  rating = 0,
  reviewCount = 0,
  setIsDialogOpen,
  availability,
  coordinates,
}: DoctorProfileCardProps) {
  const [isCalendlyLoaded, setIsCalendlyLoaded] = useState(false);
  const [loadCalendly, setLoadCalendly] = useState(false);
  const { coordinates: userCoords } = useUserLocation();
  const [distance, setDistance] = useState<number | null>(null);

  // calculate distance when coordinates change
  useEffect(() => {
    if (!userCoords || !coordinates) return;
    
    // create a cache key from both coordinates
    const cacheKey = `${userCoords.lat},${userCoords.lng}-${coordinates.lat},${coordinates.lng}`;
    
    // check if we already calculated this distance
    if (distanceCache[cacheKey] !== undefined) {
      setDistance(distanceCache[cacheKey]);
      return;
    }
    
    // calculate and cache the distance
    const calculatedDistance = calculateDistance(
      userCoords.lat,
      userCoords.lng,
      coordinates.lat,
      coordinates.lng
    );
    
    distanceCache[cacheKey] = calculatedDistance;
    setDistance(calculatedDistance);
  }, [userCoords, coordinates]);

  // calculate distance
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 3958.8; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c * 10) / 10; 
  };

  const displayName = `${degree === 'MD' ? 'Dr. ' : ''}${name}${degree ? `, ${degree}` : ''}`;

  const displayInsurances = acceptedInsurances.length > 3 
    ? `${acceptedInsurances.slice(0, 3).join(', ')} `
    : acceptedInsurances.join(', ');

  const remainingInsuranceCount = acceptedInsurances.length > 3 
    ? acceptedInsurances.length - 3 
    : 0;

  const displayLanguages = spokenLanguages.length > 3
    ? `${spokenLanguages.slice(0, 3).join(', ')} `
    : spokenLanguages.join(', ');

  const remainingLanguageCount = spokenLanguages.length > 3
    ? spokenLanguages.length - 3
    : 0;

  const getNextAvailable = () => {
    if (!availability) return null;

    const now = new Date();
    const today = format(now, 'yyyy-MM-dd');
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const isAfterWorkday = currentHour >= 17; // 5 PM 
    
    // sort dates
    const dates = Object.keys(availability).sort();
    
    for (const date of dates) {
      // skip dates before today
      if (date < today) continue;
      
      const times = availability[date];
      
      // if it's today and after work hours, skip today entirely
      if (date === today && isAfterWorkday) {
        continue;
      }
      
      // if it's today, filter out past times
      if (date === today) {
        const validTimes = times.filter(time => {
          const [hours, minutes] = time.split(':').map(Number);
          return hours > currentHour || (hours === currentHour && minutes > currentMinute);
        });
        if (validTimes.length > 0) {
          return { date, time: validTimes[0] };
        }
      } else {
        // for future dates, return first available time
        if (times.length > 0) {
          return { date, time: times[0] };
        }
      }
    }
    return null;
  };

  const nextAvailable = getNextAvailable();
  const nextAvailableText = nextAvailable 
    ? format(new Date(`${nextAvailable.date}T${nextAvailable.time}`), 'EEE, MMM d')
    : 'No availability';

  return (
    <>
      <div className="flex flex-col sm:flex-row w-full p-4 rounded-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center sm:space-x-6 w-full">
          <div className="profile-image mb-4 sm:mb-0">
            <div className="relative group">
              <div 
                className={`w-28 h-28 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden transition-opacity duration-200 ${setIsDialogOpen ? 'cursor-pointer group-hover:opacity-75' : ''}`}
                onClick={() => setIsDialogOpen && setIsDialogOpen(true)}
              >
                {previewImage ? (
                  <div className="relative w-full h-full rounded-full overflow-hidden">
                    <Image 
                      src={previewImage} 
                      alt="Profile" 
                      fill
                      sizes="112px"
                      quality={95}
                      className="object-cover rounded-full"
                      priority
                    />
                  </div>
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center relative rounded-full overflow-hidden">
                    <Image
                      src="/profpic.png"
                      alt="Profile placeholder"
                      fill
                      sizes="112px"
                      quality={95}
                      className="object-cover rounded-full"
                      priority
                    />
                  </div>
                )}
              </div>
              {setIsDialogOpen && (
                <div 
                  className="absolute top-0 right-0 p-2 bg-primary rounded-full shadow-lg cursor-pointer transition-transform duration-200 group-hover:scale-110"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDialogOpen(true);
                  }}
                >
                  <Pencil className="w-5 h-5 text-white dark:text-black" />
                </div>
              )}
            </div>
          </div>
          <div className="w-full relative">
            <div>
              <span className="doctor-name text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200">{displayName}</span>
              <h3 className="text-md sm:text-md text-gray-500 mb-1 dark:text-gray-400">
                {specialty}
              </h3>
            </div>
            
            <div className="flex flex-col sm:flex-col gap-1 text-sm sm:text-base">
              <div className="flex items-center">
                <div className="flex items-center gap-2 cursor-pointer">
                  <Star className="min-w-5 min-h-5 w-5 h-5 text-yellow-400" />
                  <span>
                    {rating > 0 ? rating.toFixed(1) : '0'}
                    <span className="font-semibold hover:text-gray-700 dark:hover:text-gray-300" onClick={() => {
                      if (id) {
                        window.location.href = `/viewDoctor/${id}?openReviews=true`;
                      }
                    }}> · {reviewCount} reviews</span>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="min-w-5 min-h-5 w-5 h-5 text-black-500" />
                <span className="flex-wrap">
                  {distance !== null ? `${distance} mi · ` : ''}
                  {streetAddress}, {city}, {state} {zipCode}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="min-w-5 min-h-5 w-5 h-5 text-blue-500" />
                <span className="flex-wrap">
                  Accepts {displayInsurances}
                  {remainingInsuranceCount > 0 && <span className="font-semibold">+ {remainingInsuranceCount} more</span>}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="min-w-5 min-h-5 w-5 h-5 text-black-500" />
                <span className="flex-wrap">
                  Speaks {displayLanguages}
                  {remainingLanguageCount > 0 && (
                    <span className="font-semibold">+ {remainingLanguageCount} more</span>
                  )}
                </span>
              </div>
            </div>

            {/* button section */}
            {id && (
              <div className="xl:absolute relative mt-4 xl:mt-0 xl:right-0 xl:top-0">
                {/* hide on mobile/tablet, show on desktop */}
                <div className="hidden xl:block text-sm text-gray-500 mb-3 text-center dark:text-gray-400">
                  Next available: {nextAvailableText}
                </div>
                <Link 
                  href={`/viewDoctor/${id}`}
                  className="inline-flex w-full xl:w-auto items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 min-w-[200px]"
                >
                  Book Online
                </Link>
                {/* show on mobile/tablet, hide on desktop */}
                <div className="xl:hidden text-xs text-gray-500 mt-2 text-center dark:text-gray-400">
                  Next available: {nextAvailableText}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
