'use client';

import { useEffect, useState } from 'react';
import { Skeleton } from "@/components/ui/skeleton"
import { stateAbbreviations } from './components/states';
import { collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore';
import DoctorProfileCard from './components/DoctorProfileCard';
import { initializeFirebase, db as getFirebaseDb } from './authcontext';
import Link from 'next/link';
import { Search } from 'lucide-react';
import Image from 'next/image';

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  degree: string;
  clinicName: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  specialty: string;
  acceptedInsurances: string[];
  spokenLanguages: string[];
  rating?: number;
  reviewCount?: number;
  profileImage?: string;
  availability?: {
    [date: string]: string[];
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export default function Home() {
  const [mapsKey, setMapsKey] = useState('');
  const [userCity, setUserCity] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    async function initialize() {
      try {
        // get Maps API key
        const response = await fetch('/api/firebase-config');
        const config = await response.json();
        setMapsKey(config.mapsKey);
        
        // initialize Firebase
        await initializeFirebase();

        // fetch doctors
        const doctorsQuery = query(collection(getFirebaseDb(), 'users'), where("role", "==", "doctor"));
        const userSnapshot = await getDocs(doctorsQuery);
        const doctorsPromises = userSnapshot.docs.map(async (userDoc) => {
          const availabilityRef = doc(getFirebaseDb(), 'availability', userDoc.id);
          const availabilityDoc = await getDoc(availabilityRef);
          const availability = availabilityDoc.exists() ? availabilityDoc.data() : {};

          return {
            id: userDoc.id,
            ...userDoc.data(),
            availability
          } as Doctor;
        });

        const doctorsList = await Promise.all(doctorsPromises);
        setDoctors(doctorsList);

        // handle location
        const cachedLocation = localStorage.getItem('userLocation');
        const cachedCoordinates = localStorage.getItem('userCoordinates');
        
        if (cachedLocation && cachedCoordinates) {
          setUserCity(cachedLocation);
        } else {
          const geoResponse = await fetch('/api/geo');
          const data = await geoResponse.json();
          const city = data.city || '';
          const fullState = data.state_prov || '';
          const stateAbbr = stateAbbreviations[fullState as keyof typeof stateAbbreviations] || fullState;
          const locationString = `${city}, ${stateAbbr}`;
          
          //get coordinates
          if (data.latitude && data.longitude) {
            const coordinates = { lat: parseFloat(data.latitude), lng: parseFloat(data.longitude) };
            localStorage.setItem('userCoordinates', JSON.stringify(coordinates));
          }
          
          setUserCity(locationString);
          localStorage.setItem('userLocation', locationString);
        }

        // only set loading to false after everything is loaded
        setIsLoading(false);
      } catch (error) {
        console.error('Error during initialization:', error);
        setIsLoading(false); // set loading to false even on error
      }
    }

    initialize();
  }, []);

  return (
    <div className="container max-w-full flex flex-col">
      <div className="hero-section py-16 sm:py-32 relative text-white bg-[#B5DDF8]">
        <div className="absolute inset-0 z-0 bg-[#B5DDF8]">
          <Image
            src="/hero4.png"
            alt="Doctor Finder Hero"
            fill
            priority
            sizes="100vw"
            style={{
              objectFit: 'cover',
              objectPosition: 'center',
            }}
          />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl text-center font-semibold px-4">
            Find the best doctor near you.
          </h1>
          
          {/* search bar */}
          <div className="mt-12 flex justify-center px-4">
            <form onSubmit={(e) => {
              e.preventDefault();
              const searchInput = e.currentTarget.querySelector('input') as HTMLInputElement;
              if (searchInput.value.trim()) {
                window.location.href = `/search?query=${encodeURIComponent(searchInput.value.trim())}`;
              }
            }} className="flex items-center w-full max-w-2xl border rounded-full overflow-hidden bg-white dark:bg-zinc-950">
              <div className="flex items-center justify-center pl-4">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by specialty, name, or location..."
                className="px-4 py-3 w-full border-none focus:ring-0 dark:text-white focus:outline-none dark:bg-zinc-950 text-foreground"
              />
              <button type="submit" className="bg-primary h-10 w-10 p-3 flex items-center justify-center rounded-full hover:bg-primary/90 text-white mr-1">
                <Search className="h-7 w-7" />
              </button>
            </form>
          </div>
        </div>
        {/*<div className="mt-6">
          <Link href="/compare" passHref>
            <button className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-600 transition">
              Compare Doctors
            </button>
          </Link>
        </div> */}
      </div>
    <div className="flex flex-col lg:flex-row flex-1">
        <div className="w-full lg:w-[70%] px-4 sm:px-6 lg:pl-10 xl:pl-20 pt-6 lg:pt-10">
          {isLoading ? (
            <div className="space-y-6">
              {/* location text skeleton */}
              <div className="flex items-center space-x-2">
                <Skeleton className="h-8 w-44" />
                <Skeleton className="h-8 w-32" />
              </div>

              {/* doctor card skeletons */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col sm:flex-row w-full p-4 rounded-lg">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center sm:space-x-6 w-full">
                    {/* profile image skeleton */}
                    <div className="profile-image mb-4 sm:mb-0">
                      <Skeleton className="w-28 h-28 rounded-full" />
                    </div>

                    <div className="w-full relative">
                      {/* name and specialty skeletons */}
                      <div>
                        <Skeleton className="h-6 w-48 mb-1" />
                        <Skeleton className="h-5 w-36 mb-3" />
                      </div>

                      {/* info line skeletons */}
                      <div className="flex flex-col sm:flex-col gap-1 text-sm sm:text-base">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-5 w-5" />
                          <Skeleton className="h-5 w-32" />
                        </div>
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-5 w-5" />
                          <Skeleton className="h-5 w-64" />
                        </div>
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-5 w-5" />
                          <Skeleton className="h-5 w-72" />
                        </div>
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-5 w-5" />
                          <Skeleton className="h-5 w-56" />
                        </div>
                      </div>

                      {/* button section */}
                      <div className="xl:absolute relative mt-4 xl:mt-0 xl:right-0 xl:top-0">
                        <Skeleton className="hidden xl:block h-4 w-36 mb-3 mx-auto" />
                        <Skeleton className="h-10 w-full xl:w-[200px]" />
                        <Skeleton className="xl:hidden h-4 w-36 mt-2 mx-auto" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {userCity && <p className="text-left text-xl sm:text-2xl mb-6">Top-rated doctors in <span className="underline decoration-primary underline-offset-4">{userCity}</span></p>}
              <div className="space-y-2 pb-8">
                {doctors.map((doctor, index) => (
                  <div key={doctor.id}>
                    <DoctorProfileCard
                      id={doctor.id}
                      name={`${doctor.firstName} ${doctor.lastName}`}
                      degree={doctor.degree}
                      specialty={doctor.specialty}
                      streetAddress={doctor.streetAddress}
                      city={doctor.city}
                      state={doctor.state}
                      zipCode={doctor.zipCode}
                      acceptedInsurances={doctor.acceptedInsurances}
                      spokenLanguages={doctor.spokenLanguages}
                      previewImage={doctor.profileImage}
                      rating={doctor.rating || 0}
                      reviewCount={doctor.reviewCount || 0}
                      availability={doctor.availability}
                      coordinates={doctor.coordinates} />
                    {index < doctors.length - 1 && (
                      <div className="border-b border-gray-200 dark:border-zinc-800 my-4" />
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
          </div>
        
        <div className="w-full lg:w-[30%] px-4 sm:px-6 lg:pr-10 xl:pr-20 pt-6 lg:pt-10">
          {isLoading ? (
            <Skeleton className="w-full h-[calc(100vh-2rem)]" />
          ) : (
            <div className="w-full h-[calc(100vh-2rem)] relative sticky top-4">
              {/* search by location button */}
              <div className={`absolute top-8 left-1/2 transform -translate-x-1/2 z-10 transition-opacity duration-300 hidden lg:block ${mapLoaded ? 'opacity-100' : 'opacity-0'}`}>
                <Link
                  href={'/locationSearch'}
                  className="bg-white px-3 py-2 dark:bg-zinc-950 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 flex items-center space-x-2 whitespace-nowrap text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                  <span className="text-accent dark:text-zinc-200">Search by location</span>
                </Link>
              </div>
              {mapsKey && (
                <div className="w-full h-full overflow-hidden relative">
                  <div className="absolute inset-0">
                    <iframe
                      src={`https://www.google.com/maps/embed/v1/search?key=${mapsKey}&q=${encodeURIComponent(
                        doctors.map(doctor => `${doctor.streetAddress},${doctor.city},${doctor.state},${doctor.zipCode}`
                        ).join('|')
                      )}`}
                      className={`w-full h-[calc(100%+35px)] transition-opacity duration-300 ${mapLoaded ? 'opacity-100' : 'opacity-0'}`}
                      style={{ border: 0, marginTop: '-50px' }}
                      allowFullScreen={false}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      onLoad={() => setMapLoaded(true)}
                    ></iframe>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
   );
  }
