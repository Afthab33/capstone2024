'use client';

import { useEffect, useState } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import DoctorProfileCard from '../components/DoctorProfileCard';
import { collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore';
import { initializeFirebase, db as getFirebaseDb } from '../authcontext';

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
}

export default function LocationSearch() {
  const [mapsKey, setMapsKey] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [hoveredDoctorId, setHoveredDoctorId] = useState<string | null>(null);

  // create map url for hover and default state
  const createMapUrl = (doctors: Doctor[], hoveredId: string | null) => {
    if (hoveredId) {
      const hoveredDoctor = doctors.find(d => d.id === hoveredId);
      if (hoveredDoctor) {
        const location = `${hoveredDoctor.streetAddress},${hoveredDoctor.city},${hoveredDoctor.state},${hoveredDoctor.zipCode}`;
        return `https://www.google.com/maps/embed/v1/place?key=${mapsKey}&q=${encodeURIComponent(location)}&zoom=15`;
      }
    }
    
    const locations = doctors.map(doctor => 
      `${doctor.streetAddress},${doctor.city},${doctor.state},${doctor.zipCode}`
    ).join('|');
    
    return `https://www.google.com/maps/embed/v1/search?key=${mapsKey}&q=${encodeURIComponent(locations)}`;
  };

  useEffect(() => {
    async function initialize() {
      try {
        // get Maps API key
        const response = await fetch('/api/firebase-config');
        const config = await response.json();
        setMapsKey(config.mapsKey);
        
        // initialize Firebase and fetch doctors
        await initializeFirebase();
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
        setIsLoading(false);
      } catch (error) {
        console.error('Error during initialization:', error);
        setIsLoading(false);
      }
    }

    initialize();
  }, []);

  return (
    <div className="flex min-h-screen">
      <div className="w-full lg:w-[60%] px-4">
        {isLoading ? (
          <div className="space-y-4 pb-6">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="mt-4">
                <div className="flex flex-col sm:flex-row w-full p-4 bg-white rounded-lg">
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
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4 pb-6">
            {doctors.map((doctor, index) => (
              <div 
                key={doctor.id}
                onMouseEnter={() => setHoveredDoctorId(doctor.id)}
                onMouseLeave={() => setHoveredDoctorId(null)}
                className={`transition-all duration-200 mt-4 ${
                  hoveredDoctorId === doctor.id 
                    ? '[&_.doctor-name]:relative [&_.doctor-name]:after:scale-x-100' 
                    : '[&_.doctor-name]:relative [&_.doctor-name]:after:scale-x-0'
                }`}
              >
                <div 
                  onClick={() => window.location.href = `/viewDoctor/${doctor.id}`}
                  className="cursor-pointer [&_.doctor-name]:after:absolute [&_.doctor-name]:after:left-0 [&_.doctor-name]:after:bottom-0 [&_.doctor-name]:after:w-full [&_.doctor-name]:after:h-0.5 [&_.doctor-name]:after:bg-primary [&_.doctor-name]:after:transform [&_.doctor-name]:after:transition-transform [&_.doctor-name]:after:origin-left"
                >
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
                  />
                </div>
                {index < doctors.length - 1 && (
                  <div className="border-b border-gray-200 mt-4" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="w-full lg:w-1/2">
        {isLoading ? (
          <Skeleton className="w-full h-screen" />
        ) : (
          <div className="w-full h-screen sticky top-0 bg-gray-200 z-0">
            {mapsKey && doctors.length > 0 && (
              <div className="w-full h-full">
                <div className="absolute inset-0 bg-gray-200">
                  <iframe
                    src={createMapUrl(doctors, hoveredDoctorId)}
                    className={`w-full h-full transition-opacity duration-300 ${mapLoaded ? 'opacity-100' : 'opacity-0'}`}
                    style={{ border: 0 }}
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
  );
}