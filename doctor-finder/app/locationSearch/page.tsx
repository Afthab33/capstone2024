'use client';

import { useEffect, useState, memo, Fragment } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import DoctorProfileCard from '../components/DoctorProfileCard';
import { collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore';
import { initializeFirebase, db as getFirebaseDb } from '../authcontext';
import { CircleArrowRight } from 'lucide-react';

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

// memoized doctor card component
const MemoizedDoctorCard = memo(({ doctor, isHovered, onHover }: {
  doctor: Doctor;
  isHovered: boolean;
  onHover: (id: string | null) => void;
}) => (
  <div 
    onMouseEnter={() => onHover(doctor.id)}
    onMouseLeave={() => onHover(null)}
    className="transition-all duration-200"
  >
    <div 
      onClick={() => window.location.href = `/viewDoctor/${doctor.id}`}
      className={`cursor-pointer ${
        isHovered 
          ? 'bg-gray-100 dark:bg-gray-900' 
          : 'bg-white dark:bg-black'
      } transition-colors duration-200 [&_.doctor-name]:after:absolute [&_.doctor-name]:after:left-0 [&_.doctor-name]:after:bottom-0 [&_.doctor-name]:after:w-full [&_.doctor-name]:after:h-0.5 [&_.doctor-name]:after:bg-primary [&_.doctor-name]:after:transform [&_.doctor-name]:after:transition-transform [&_.doctor-name]:after:origin-left [&_.doctor-name]:relative ${
        isHovered 
          ? '[&_.doctor-name]:after:scale-x-100' 
          : '[&_.doctor-name]:after:scale-x-0'
      }`}
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
        coordinates={doctor.coordinates}
      />
    </div>
  </div>
));
MemoizedDoctorCard.displayName = 'MemoizedDoctorCard';

export default function LocationSearch() {
  const [mapsKey, setMapsKey] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [hoveredDoctorId, setHoveredDoctorId] = useState<string | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [lastHoveredDoctorId, setLastHoveredDoctorId] = useState<string | null>(null);
  const [isMouseInDoctorList, setIsMouseInDoctorList] = useState(false);
  const [isMouseOverMap, setIsMouseOverMap] = useState(false);
  const [shouldShowFocused, setShouldShowFocused] = useState(false);

  const createMapUrl = (doctors: Doctor[], hoveredId: string | null) => {
    if ((isMouseOverMap || isMouseInDoctorList) && (hoveredId || lastHoveredDoctorId)) {
      const activeId = hoveredId || lastHoveredDoctorId;
      const activeDoctor = doctors.find(d => d.id === activeId);
      if (activeDoctor) {
        const location = `${activeDoctor.streetAddress},${activeDoctor.city},${activeDoctor.state},${activeDoctor.zipCode}`;
        return `https://www.google.com/maps/embed/v1/place?key=${mapsKey}&q=${encodeURIComponent(location)}&zoom=15`;
      }
    }
    
    // default state - show all doctors
    const locations = doctors.map(doctor => 
      `${doctor.streetAddress},${doctor.city},${doctor.state},${doctor.zipCode}`
    ).join('|');
    
    return `https://www.google.com/maps/embed/v1/search?key=${mapsKey}&q=${encodeURIComponent(locations)}`;
  };

  useEffect(() => {
    if (!isMouseOverMap && !isMouseInDoctorList) {
      setShowOverlay(false);
      setLastHoveredDoctorId(null);
      setShouldShowFocused(false);
    } else if (hoveredDoctorId) {
      setShowOverlay(true);
      setLastHoveredDoctorId(hoveredDoctorId);
    }
  }, [hoveredDoctorId, isMouseOverMap, isMouseInDoctorList]);

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
      <div 
        className="w-full lg:w-[60%] px-4"
        onMouseEnter={() => setIsMouseInDoctorList(true)}
        onMouseLeave={() => setIsMouseInDoctorList(false)}
      >
        {isLoading ? (
          <div className="space-y-4 pb-6">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="mt-4">
                <div className="flex flex-col sm:flex-row w-full p-4 rounded-lg">
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
          <div className="">
            {doctors.map((doctor, index) => (
              <Fragment key={doctor.id}>
                <MemoizedDoctorCard
                  doctor={doctor}
                  isHovered={hoveredDoctorId === doctor.id}
                  onHover={setHoveredDoctorId}
                />
                {index < doctors.length - 1 && (
                  <div className="border-b border-gray-200 dark:border-gray-800" />
                )}
              </Fragment>
            ))}
          </div>
        )}
      </div>
      
      <div className="w-full lg:w-1/2">
        {isLoading ? (
          <Skeleton className="w-full h-screen" />
        ) : (
          <div 
            className="w-full h-screen sticky top-0 bg-gray-200 z-0"
            onMouseEnter={() => setIsMouseOverMap(true)}
            onMouseLeave={() => {
              setIsMouseOverMap(false);
              if (!isMouseInDoctorList) {
                setHoveredDoctorId(null);
              }
            }}
          >
            {mapsKey && doctors.length > 0 && (
              <div className="w-full h-full relative">
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
                
                {/* clinic information overlay */}
                <div className={`absolute top-2 left-2 bg-background px-4 py-4 text-sm rounded-md shadow-lg max-w-md transition-transform duration-300 ease-out z-10 ${
                  showOverlay && (hoveredDoctorId || lastHoveredDoctorId) && mapLoaded
                    ? 'translate-y-0 pointer-events-auto'
                    : '-translate-y-0 pointer-events-none'
                }`}>
                  {hoveredDoctorId || lastHoveredDoctorId ? (
                    // existing doctor detail overlay
                    doctors.map(doctor => (doctor.id === (hoveredDoctorId || lastHoveredDoctorId)) && (
                      <div key={doctor.id} className="flex items-center gap-3">
                        {doctor.profileImage && (
                          <img 
                            src={doctor.profileImage} 
                            alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <h3 className="text-sm font-semibold">
                            {doctor.degree === 'MD' ? 'Dr.' : ''} {doctor.firstName} {doctor.lastName}
                          </h3>
                          <h3 className="text-sm">
                            {doctor.clinicName || `${doctor.degree === 'MD' ? 'Dr.' : ''} ${doctor.firstName} ${doctor.lastName}'s Clinic`}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300">
                            {doctor.streetAddress}
                          </p>
                          <p className="text-gray-600 dark:text-gray-300">
                            {doctor.city}, {doctor.state} {doctor.zipCode}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 ml-3">
                          <div className="h-16 w-px bg-gray-200 dark:bg-gray-800"></div>
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                              `${doctor.streetAddress}, ${doctor.city}, ${doctor.state} ${doctor.zipCode}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center justify-center p-2 hover:bg-gray-100 rounded-md transition-colors"
                          > 
                            <CircleArrowRight className="w-7 h-7 text-primary" />
                            <span className="text-sm text-primary mt-1">Directions</span>
                          </a>
                        </div>
                      </div>
                    ))
                  ) : (
                    // default overlay showing doctor count
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                      <h3 className="text-gray-600 dark:text-gray-200">
                        Showing {doctors.length} {doctors.length === 1 ? 'Doctor' : 'Doctors'}
                      </h3>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}