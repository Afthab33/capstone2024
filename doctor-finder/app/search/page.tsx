'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { initializeFirebase, db as getFirebaseDb } from '../authcontext';
import DoctorProfileCard from '../components/DoctorProfileCard';
import { Button } from '@/components/ui/button';
import { SortAsc } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Check, ChevronDown, Filter, X } from "lucide-react"
import useUserLocation from '../hooks/useUserLocation';
import { isAfter } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";

interface Doctor {
  key: string;
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
  profileImage: string;
  acceptedInsurances: string[];
  spokenLanguages: string[]; 
  rating?: number;
  reviewCount?: number;
  availability?: {
    [date: string]: string[];
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
  sex?: string;
}

interface FilterOption {
  type: "specialty" | "insurance" | "language" | "sex" | "availability"
  value: string
  label: string
}

type SortOption = "distance" | "rating" | "nextAvailable" | "default";

// create separate component for search functionality
const SearchContent = () => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('query');

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { coordinates: userCoords } = useUserLocation();
  const [activeFilters, setActiveFilters] = useState<FilterOption[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [availableFilterOptions, setAvailableFilterOptions] = useState<{
    specialty: string[];
    insurance: string[];
    language: string[];
    sex: string[];
    availability: string[];
  }>({
    specialty: [],
    insurance: [],
    language: [],
    sex: [],
    availability: ["Has Appointments"]
  });

  const allFilterOptions = {
    specialty: ["Family Medicine", "Pediatrics", "Internal Medicine", "Obstetrics and Gynecology (OB/GYN)", "Cardiology", "Dermatology", "Psychiatry", "Neurology", "General Surgery", "Physical Therapy", "Sports Medicine"],
    insurance: ["UnitedHealthcare", "Blue Cross Blue Shield (BCBS)", "Aetna", "Cigna", "Humana", "Anthem", "Kaiser Permanente", "Centene", "Molina Healthcare", "Health Net", "WellCare", "Amerigroup", "Medicaid", "Medicare", "Tricare", "CareSource", "Oscar Health", "EmblemHealth", "Highmark", "Ambetter"],
    language: ["English", "Spanish", "Mandarin", "French", "Arabic", "Hindi", "Bengali", "Portuguese", "Russian", "Japanese", "German", "Korean", "Vietnamese", "Italian", "Turkish"],
    sex: ["Male", "Female"],
    availability: ["Has Appointments"]
  };

  const filterLabels = {
    specialty: "Specialty",
    insurance: "Insurance",
    language: "Language",
    sex: "Gender",
    availability: "Availability"
  };

  const sortOptions: {label: string, value: SortOption}[] = [
    { label: "Default", value: "default" },
    { label: "Distance", value: "distance" },
    { label: "Next Available Appointment", value: "nextAvailable" },
    { label: "Highest Rated", value: "rating" }
  ];

  // get the next available appointment date for a doctor
  const getNextAvailableDate = (doctor: Doctor): Date | null => {
    if (!doctor.availability) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const availableDates = Object.keys(doctor.availability)
      .filter(dateStr => {
        const date = new Date(dateStr);
        return isAfter(date, today) && doctor.availability![dateStr].length > 0;
      })
      .sort();

    return availableDates.length > 0 ? new Date(availableDates[0]) : null;
  };

  // check if a doctor has any available appointments
  const hasAvailableAppointments = (doctor: Doctor): boolean => {
    if (!doctor.availability) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return Object.keys(doctor.availability).some(dateStr => {
      const date = new Date(dateStr);
      return isAfter(date, today) && doctor.availability![dateStr].length > 0;
    });
  };

  const toggleFilter = (filter: FilterOption) => {
    const filterToApply = {
      ...filter,
      value: filter.type === "sex" ? filter.value.toLowerCase() : filter.value,
    }

    const filterExists = activeFilters.some((f) => f.type === filterToApply.type && f.value === filterToApply.value)

    let newFilters: FilterOption[]
    if (filterExists) {
      newFilters = activeFilters.filter((f) => !(f.type === filterToApply.type && f.value === filterToApply.value))
    } else {
      newFilters = [...activeFilters, filterToApply]
    }

    setActiveFilters(newFilters)
  }

  // check if a filter is active
  const isFilterActive = (filter: FilterOption) => {
    const valueToCheck = filter.type === "sex" ? filter.value.toLowerCase() : filter.value;
    return activeFilters.some(
      f => f.type === filter.type && f.value === valueToCheck
    );
  };

  // clear all filters
  const clearFilters = () => {
    setActiveFilters([]);
    setSortBy("default");
    setFilteredDoctors(doctors);
  };

  // determine available filter options based on doctors list
  const updateAvailableFilterOptions = (doctorsList: Doctor[]) => {
    if (!doctorsList.length) return;
    
    const specialties = new Set<string>();
    const insurances = new Set<string>();
    const languages = new Set<string>();
    const sexes = new Set<string>();
    
    doctorsList.forEach(doctor => {
      if (doctor.specialty) {
        specialties.add(doctor.specialty);
      }
      
      if (doctor.acceptedInsurances && doctor.acceptedInsurances.length) {
        doctor.acceptedInsurances.forEach(insurance => insurances.add(insurance));
      }
      
      if (doctor.spokenLanguages && doctor.spokenLanguages.length) {
        doctor.spokenLanguages.forEach(language => languages.add(language));
      }
      
      if (doctor.sex) {
        sexes.add(doctor.sex.charAt(0).toUpperCase() + doctor.sex.slice(1));
      }
    });
    
    // only include filter options that match at least one doctor
    setAvailableFilterOptions({
      specialty: allFilterOptions.specialty.filter(s => specialties.has(s)),
      insurance: allFilterOptions.insurance.filter(i => insurances.has(i)),
      language: allFilterOptions.language.filter(l => languages.has(l)),
      sex: allFilterOptions.sex.filter(s => sexes.has(s.charAt(0).toUpperCase() + s.slice(1))),
      availability: allFilterOptions.availability
    });
  };

  // helper function to calculate distance (used for sorting)
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 3958.8; // Earth radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c * 10) / 10; // round to 1 decimal place
  };

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      await initializeFirebase(); // err if removed idk why 
      const db = getFirebaseDb();
      const doctorsRef = collection(db, 'users');

      // fetch all doctors first
      const q = query(doctorsRef, where('role', '==', 'doctor'));

      const querySnapshot = await getDocs(q);
      
      // fetch availability data for each doctor
      const doctorsPromises = querySnapshot.docs.map(async (userDoc) => {
        const availabilityRef = doc(db, 'availability', userDoc.id);
        const availabilityDoc = await getDoc(availabilityRef);
        const availability = availabilityDoc.exists() ? availabilityDoc.data() : {};
        
        return {
          id: userDoc.id,
          ...userDoc.data(),
          availability
        } as Doctor;
      });
      
      let doctorData = await Promise.all(doctorsPromises);

      // filter based on query
      doctorData = doctorData.filter(doctor => 
        (doctor.firstName?.toLowerCase().includes(searchQuery?.toLowerCase() ?? '')) ||
        (doctor.lastName?.toLowerCase().includes(searchQuery?.toLowerCase() ?? '')) ||
        (doctor.acceptedInsurances?.some((ins: string) => ins.toLowerCase().includes(searchQuery?.toLowerCase() ?? ''))) ||
        (doctor.city?.toLowerCase().includes(searchQuery?.toLowerCase() ?? '')) ||
        (doctor.clinicName?.toLowerCase().includes(searchQuery?.toLowerCase() ?? '')) ||
        (doctor.degree?.toLowerCase().includes(searchQuery?.toLowerCase() ?? '')) ||
        (doctor.specialty?.toLowerCase().includes(searchQuery?.toLowerCase() ?? '')) ||
        (doctor.spokenLanguages?.some((lang: string) => lang.toLowerCase().includes(searchQuery?.toLowerCase() ?? ''))) ||
        (doctor.state?.toLowerCase().includes(searchQuery?.toLowerCase() ?? '')) ||
        (doctor.streetAddress?.toLowerCase().includes(searchQuery?.toLowerCase() ?? '')) ||
        (doctor.zipCode?.toLowerCase().includes(searchQuery?.toLowerCase() ?? ''))
      );

      setDoctors(doctorData);
      setFilteredDoctors(doctorData);
      updateAvailableFilterOptions(doctorData);
    } catch (err) {
      setError('Error fetching doctors.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  // apply filters whenever activeFilters changes
  useEffect(() => {
    if (doctors.length === 0) return;
    
    let result = [...doctors];
    
    // apply filters
    if (activeFilters.length > 0) {
      // group filters by type
      const specialtyFilters = activeFilters.filter(f => f.type === "specialty").map(f => f.value);
      const insuranceFilters = activeFilters.filter(f => f.type === "insurance").map(f => f.value);
      const languageFilters = activeFilters.filter(f => f.type === "language").map(f => f.value);
      const sexFilters = activeFilters.filter(f => f.type === "sex").map(f => f.value);
      const availabilityFilter = activeFilters.some(f => f.type === "availability" && f.value === "Has Appointments");

      result = result.filter(doctor => {
        // If there are filters of a type, check if doctor satisfies at least one
        const matchesSpecialty = specialtyFilters.length === 0 || specialtyFilters.includes(doctor.specialty);
        const matchesInsurance = insuranceFilters.length === 0 || doctor.acceptedInsurances?.some(ins => insuranceFilters.includes(ins));
        const matchesLanguage = languageFilters.length === 0 || doctor.spokenLanguages?.some(lang => languageFilters.includes(lang));
        const matchesSex = sexFilters.length === 0 || sexFilters.includes(doctor.sex || '');
        const matchesAvailability = !availabilityFilter || hasAvailableAppointments(doctor);

        return matchesSpecialty && matchesInsurance && matchesLanguage && matchesSex && matchesAvailability;
      });
    }
    
    // apply sorting
    if (sortBy !== "default" && result.length > 0) {
      result = [...result];
      
      switch (sortBy) {
        case "distance":
          if (userCoords) {
            result.sort((a, b) => {
              // if either doctor doesn't have coordinates, put them at the end
              if (!a.coordinates) return 1;
              if (!b.coordinates) return -1;
              
              // calculate distances
              const distA = calculateDistance(
                userCoords.lat, userCoords.lng, 
                a.coordinates.lat, a.coordinates.lng
              );
              const distB = calculateDistance(
                userCoords.lat, userCoords.lng, 
                b.coordinates.lat, b.coordinates.lng
              );
              
              return distA - distB;
            });
          }
          break;
          
        case "rating":
          result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
          
        case "nextAvailable":
          result.sort((a, b) => {
            const dateA = getNextAvailableDate(a);
            const dateB = getNextAvailableDate(b);
            
            // if either doctor doesn't have availability, put them at the end
            if (!dateA && !dateB) return 0;
            if (!dateA) return 1;
            if (!dateB) return -1;
            
            return dateA.getTime() - dateB.getTime();
          });
          break;
      }
    }
    
    setFilteredDoctors(result);
  }, [activeFilters, doctors, sortBy, userCoords]);

  // search doctors based on query only, filters can be selected after
  useEffect(() => {
    if (searchQuery) {
      fetchDoctors();
    }
  }, [searchQuery, fetchDoctors]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-36">
      {loading ? (
        <div>
          <div className="mb-8 mt-4">
            {/* filter skeleton */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-36" />
            </div>
          </div>

          {/* result count skeleton */}
          <div className="mb-4 text-sm text-muted-foreground">
            <Skeleton className="h-8 w-24" />
          </div>
          
          {/* doctor card skeletons */}
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* filter and sort section */}
          <div className="mb-8 mt-4">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {/* filter dropdown menus */}
              <div className="flex flex-wrap gap-2">
                {Object.entries(availableFilterOptions).map(([type, values]) => (
                  values.length > 0 && (
                    <DropdownMenu key={type}>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-1">
                          {filterLabels[type as keyof typeof filterLabels]}
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>
                          {filterLabels[type as keyof typeof filterLabels]}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          {values.map((value) => (
                            <DropdownMenuItem
                              key={value}
                              className="flex items-center justify-between cursor-pointer group"
                              onClick={() => toggleFilter({
                                type: type as FilterOption["type"],
                                value,
                                label: value,
                              })}
                            >
                              {value}
                              {isFilterActive({
                                type: type as FilterOption["type"],
                                value,
                                label: value,
                              }) && <Check className="h-4 w-4 text-primary group-hover:text-white transition-colors" />} 
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )
                ))}
                
                {/* sort dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-1">
                      <SortAsc className="h-4 w-4 mr-1" />
                      Sort By: {sortOptions.find(option => option.value === sortBy)?.label || "Default"}
                      <ChevronDown className="h-4 w-4 opacity-50 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      {sortOptions.map((option) => (
                        <DropdownMenuItem
                          key={option.value}
                          className="flex items-center justify-between cursor-pointer group"
                          onClick={() => setSortBy(option.value)}
                        >
                          {option.label}
                          {sortBy === option.value && 
                            <Check className="h-4 w-4 text-primary group-hover:text-white transition-colors dark:text-primary" />
                          }
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* active filters display */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {activeFilters.map((filter, index) => (
                  <Badge
                    key={`${filter.type}-${filter.value}-${index}`}
                    variant="grey"
                    className="flex items-center gap-1 pl-2 pr-1 py-1"
                  >
                    <span className="text-xs font-medium text-muted-foreground dark:text-zinc-400 mr-1">
                      {filterLabels[filter.type]}:
                    </span>
                    {filter.type === "sex" 
                      ? filter.value.charAt(0).toUpperCase() + filter.value.slice(1) 
                      : filter.value}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                      onClick={() => toggleFilter(filter)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove filter</span>
                    </Button>
                  </Badge>
                ))}
                
                {sortBy !== "default" && (
                  <Badge
                    variant="grey"
                    className="flex items-center gap-1 pl-2 pr-1 py-1"
                  >
                    <span className="text-xs font-medium text-muted-foreground dark:text-zinc-400 mr-1">
                      Sort:
                    </span>
                    {sortOptions.find(option => option.value === sortBy)?.label}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                      onClick={() => setSortBy("default")}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove sort</span>
                    </Button>
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* result count */}
          {filteredDoctors.length > 0 && (
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {filteredDoctors.length} {filteredDoctors.length === 1 ? 'doctor' : 'doctors'}
              {searchQuery && ` for "${searchQuery}"`}
              {activeFilters.length > 0 && ' matching your filters'}
              {sortBy !== 'default' && `, sorted by ${sortOptions.find(option => option.value === sortBy)?.label.toLowerCase()}`}
            </div>
          )}

          {/* no results message */}
          {doctors.length > 0 && filteredDoctors.length === 0 && (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <Filter className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No doctors match your filters</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filter criteria to see more results.
              </p>
              <Button onClick={clearFilters}>Clear All Filters</Button>
            </div>
          )}

          {error && <p>{error}</p>}
          {doctors.length === 0 && !loading && !error && (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <h3 className="text-lg font-medium mb-2">No doctors found{searchQuery && ` for "${searchQuery}"`}</h3>
              <p className="text-muted-foreground mb-4">
                Try searching with different keywords or browse all available doctors.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {filteredDoctors.map((doctor, index) => (
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
                  previewImage={doctor.profileImage}
                  acceptedInsurances={doctor.acceptedInsurances}
                  spokenLanguages={doctor.spokenLanguages}
                  rating={doctor.rating || 0}
                  reviewCount={doctor.reviewCount || 0}
                  availability={doctor.availability}
                  coordinates={doctor.coordinates}
                />
                {index < filteredDoctors.length - 1 && (
                  <div className="border-b border-gray-200 dark:border-zinc-800 my-4" />
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// new SkeletonLoading component
const SkeletonLoading = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-36">
      <div className="mb-8 mt-4">
        {/* filter skeleton */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-36" />
        </div>
      </div>

      {/* result count skeleton */}
      <div className="mb-4 text-sm text-muted-foreground">
        <Skeleton className="h-8 w-24" />
      </div>
      
      {/* doctor card skeletons */}
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
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
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// main page component with suspense fallback
const SearchPage = () => {
  return (
    <Suspense fallback={<SkeletonLoading />}>
      <SearchContent />
    </Suspense>
  );
};

export default SearchPage;
