"use client";

import { use, useEffect, useState, useCallback, useMemo } from 'react';
import { doc, getDoc, collection, addDoc, Timestamp, writeBatch, query, getDocs, where, orderBy } from 'firebase/firestore';
import { db as getFirebaseDb } from '../../authcontext';
import { useAuth } from '../../authcontext';
import { Star, Shield, MessageCircle, Clock, Users } from 'lucide-react';
import { format, isBefore, startOfDay } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"
import React from 'react';
import { useRouter } from 'next/navigation';

import DoctorProfileImage from './components/DoctorProfileImage';
import ActionButtons from './components/ActionButtons';
import BookingForm from './components/BookingForm';
import StarRating from './components/StarRating';

import ReviewsHistory from './components/Reviews';
import { getVisibleDates, formatDisplayName, resetVisibleDates } from './utils/dateUtils';
import { findNextAvailableSlot } from './utils/availabilityUtils';
import { arePrereqsComplete, validateBookingDetails } from './utils/bookingUtils';
import type { ViewDoctorProps, UserData, BookingPrereqs } from './utils/types';
import { initializeFirebase } from '../../authcontext';

interface Appointment {
  id: string;
  doctorId: string;
  patientId: string;
  datetime: Timestamp;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  visitDetails: {
    reason: string;
    insurance: string;
    patientType: 'new' | 'returning';
    notes?: string;
  };
  doctorInfo: {
    name: string;
    specialty: string;
    degree: string;
    location: string;
  };
  patientInfo: {
    name: string;
    email: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface ReviewData {
  id: string;
  reviewedBy?: string;
  doctorId: string;
  review: string;
  rating: number;
  createdAt: any;
  [key: string]: any; 
}

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialty?: string;
  gender?: string;
  profileImage?: string;
  acceptedInsurances?: string[];
  spokenLanguages?: string[];
  rating?: number;
  degree?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  role?: string;
  availability?: { [key: string]: string[] };
}

const ViewDoctor = ({ params }: ViewDoctorProps) => {
  const { id } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userSymptoms, setUserSymptoms] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const currentTime = useMemo(() => new Date(), []);
  const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null); // To store the current doctor

  const [availabilityData, setAvailabilityData] = useState<{ [key: string]: string[] }>({});
  const [weekOffset, setWeekOffset] = useState(0);
  const [bookingPrereqs, setBookingPrereqs] = useState<BookingPrereqs>({
    reason: '',
    insurance: '',
    patientType: null
  });
  const [incompleteFields, setIncompleteFields] = useState<{
    reason: boolean;
    insurance: boolean;
    patientType: boolean;
  }>({
    reason: false,
    insurance: false,
    patientType: false,
  });
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [appointmentNotes, setAppointmentNotes] = useState('');
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReasons, setReportReasons] = useState<string[]>([]);
  const [otherReportReason, setOtherReportReason] = useState('');
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [showAllTimeSlots, setShowAllTimeSlots] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const { toast } = useToast();
  const [shouldOpenReviews, setShouldOpenReviews] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showCompareDialog, setShowCompareDialog] = useState(false);
  const [doctorsToCompare, setDoctorsToCompare] = useState<Doctor[]>([]);
  const [comparisonDoctors, setComparisonDoctors] = useState<Doctor[]>([]);
  const [currentComparisonIndex, setCurrentComparisonIndex] = useState(0);
  const [loadingComparisonDoctors, setLoadingComparisonDoctors] = useState(false);

  const specialtyMatchClass = "text-primary font-medium relative inline-block after:absolute after:inset-0 after:animate-pulse after:bg-primary/30 after:-z-10 after:rounded-full after:blur-md dark:after:blur-xl  after:scale-110 z-0";

  useEffect(() => {
    const fetchCurrentDoctor = async () => {
      if (!id) {
        console.error("Doctor ID is missing from params");
        return;
      }

      try {
        await initializeFirebase();
        const db = getFirebaseDb();
        const doctorDocRef = doc(db, "users", id); // Fetch from the 'users' collection
        const doctorDoc = await getDoc(doctorDocRef);

        if (doctorDoc.exists()) {
          const doctorData = { id: doctorDoc.id, ...doctorDoc.data() } as Doctor;
          setCurrentDoctor(doctorData);
        } else {
          console.error("Doctor not found in Firestore.");
        }
      } catch (error) {
        console.error("Error fetching doctor:", error);
      }
    };

    fetchCurrentDoctor();
  }, [id]);

  const handleReportClick = useCallback(() => {
    setShowReportDialog(true);
  }, []);

  const handleCompareClick = useCallback(() => {
    if (currentDoctor) {
      setDoctorsToCompare([currentDoctor]);
      fetchComparisonDoctors(currentDoctor);
    }
    setShowCompareDialog(true);
  }, [currentDoctor]);

  const fetchComparisonDoctors = async (doctor: Doctor) => {
    if (!doctor) return;
    
    try {
      setLoadingComparisonDoctors(true);
      await initializeFirebase();
      const db = getFirebaseDb();
      
      // get all doctors
      const allDoctorsQuery = query(
        collection(db, "users"),
        where("role", "==", "doctor")
      );
      
      const querySnapshot = await getDocs(allDoctorsQuery);
      const allDoctors = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Doctor))
        .filter(d => d.id !== doctor.id); // exclude current doctor
      
      // separate doctors by specialty match
      const sameSpecialtyDoctors = allDoctors.filter(d => 
        d.specialty === doctor.specialty && doctor.specialty
      );
      const otherDoctors = allDoctors.filter(d => 
        d.specialty !== doctor.specialty || !doctor.specialty
      );
      
      // combine the arrays with specialty matches first
      const sortedDoctors = [...sameSpecialtyDoctors, ...otherDoctors];
      
      // fetch availability for each doctor
      const doctorsWithAvailability = await Promise.all(
        sortedDoctors.map(async (docItem) => {
          try {
            const availabilityRef = doc(db, 'availability', docItem.id);
            const availabilityDoc = await getDoc(availabilityRef);
            
            if (availabilityDoc.exists()) {
              return {
                ...docItem,
                availability: availabilityDoc.data() as { [key: string]: string[] }
              };
            }
            return docItem;
          } catch (error) {
            console.error(`Error fetching availability for doctor ${docItem.id}:`, error);
            return docItem;
          }
        })
      );
      
      setComparisonDoctors(doctorsWithAvailability);
      setCurrentComparisonIndex(0);
    } catch (error) {
      console.error("Error fetching comparison doctors:", error);
    } finally {
      setLoadingComparisonDoctors(false);
    }
  };
  
  const navigateComparisonDoctor = (direction: 'next' | 'prev') => {
    if (comparisonDoctors.length === 0) return;
    
    if (direction === 'next') {
      setCurrentComparisonIndex(prev => 
        prev === comparisonDoctors.length - 1 ? 0 : prev + 1
      );
    } else {
      setCurrentComparisonIndex(prev => 
        prev === 0 ? comparisonDoctors.length - 1 : prev - 1
      );
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      localStorage.setItem('redirectAfterAuth', window.location.pathname);
      router.push('/login');
    }
  }, [user, router, authLoading]);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1536);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // fetch doctor data
  useEffect(() => {
    const fetchDoctor = async () => {
      const db = getFirebaseDb();
      const doctorRef = doc(db, 'users', id);
      try {
        const doctorSnap = await getDoc(doctorRef);
        if (doctorSnap.exists()) {
          setDoctor(doctorSnap.data());
        } else {
          console.error(`No doctor found with id: ${id}`);
          setError('Doctor not found');
        }
      } catch (err) {
        console.error('Error fetching doctor:', err);
        setError('Failed to fetch doctor');
      } finally {
        setLoading(false);
      }
    };

    // if user is logged in, fetch doctor data
    if (user) {
      fetchDoctor();
    } else {
      setLoading(false);
    }
  }, [id, user]);

  // fetch user symptoms
  useEffect(() => {
    const fetchUserSymptoms = async () => {
      if (!user) return;
      const db = getFirebaseDb();
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as UserData;
          setUserSymptoms(userData.symptoms || []);
        }
      } catch (err) {
        console.error('Error fetching user symptoms:', err);
      }
    };

    fetchUserSymptoms();
  }, [user]);

  // fetch availability data
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!id) return;
      try {
        const db = getFirebaseDb();
        if (!db) {
          console.error('Firebase DB not initialized');
          return;
        }

        const availabilityRef = doc(db, 'availability', id);
        const availabilityDoc = await getDoc(availabilityRef);
        
        if (availabilityDoc.exists()) {
          const data = availabilityDoc.data() as { [key: string]: string[] };
          const filteredData: { [key: string]: string[] } = {};
          
          Object.entries(data).forEach(([dateStr, timeSlots]) => {
            const [year, month, day] = dateStr.split('-').map(Number);
            const date = new Date(year, month - 1, day);
            
            if (!isBefore(startOfDay(date), startOfDay(currentTime))) {
              if (format(date, 'yyyy-MM-dd') === format(currentTime, 'yyyy-MM-dd')) {
                const futureSlots = timeSlots.filter(timeStr => {
                  const [hours, minutes] = timeStr.split(':').map(Number);
                  const slotTime = new Date(year, month - 1, day, hours, minutes);
                  return !isBefore(slotTime, currentTime);
                });
                if (futureSlots.length > 0) {
                  filteredData[dateStr] = futureSlots;
                }
              } else {
                filteredData[dateStr] = timeSlots;
              }
            }
          });
          
          setAvailabilityData(filteredData);
        }
      } catch (error) {
        console.error('Error fetching availability:', error);
      }
    };

    if (user) {
      fetchAvailability();
    }
  }, [id, user, currentTime]);

  // fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) {
        return;
      }
      
      try {
        setReviewsLoading(true);
        const db = getFirebaseDb();
        const reviewsRef = collection(db, 'reviews');
        const q = query(
          reviewsRef,
          where('doctorId', '==', id),
          orderBy('createdAt', 'desc')
        );
        
        const reviewsSnapshot = await getDocs(q);
        
        const reviewsData = reviewsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data
          } as ReviewData;
        });
        
        // pre-fetch user data for all reviews
        const enhancedReviews = await Promise.all(
          reviewsData.map(async (review) => {
            try {
              // get the user ID from reviewedBy field
              const userId = review.reviewedBy;
              
              if (userId) {
                const userDoc = await getDoc(doc(db, 'users', userId));
                if (userDoc.exists()) {
                  const userData = userDoc.data();
                  return {
                    ...review,
                    reviewerName: `${userData.firstName} ${userData.lastName}`,
                    reviewerImage: userData.profileImage || null
                  };
                }
              }
              return review;
            } catch (error) {
              console.error('Error fetching reviewer details:', error);
              return review;
            }
          })
        );
        
        setReviews(enhancedReviews);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setReviewsLoading(false);
      }
    };

    if (user) {
      fetchReviews();
    }
  }, [id, user]);
  
  const handleDisabledDateClick = useCallback(() => {
    if (!arePrereqsComplete(bookingPrereqs)) {
      setIncompleteFields({
        reason: !bookingPrereqs.reason,
        insurance: !bookingPrereqs.insurance,
        patientType: !bookingPrereqs.patientType
      });
      
      setTimeout(() => {
        setIncompleteFields({
          reason: false,
          insurance: false,
          patientType: false
        });
      }, 2000);
    }
  }, [bookingPrereqs]);

  const goToPreviousWeek = useCallback(() => {
    setWeekOffset(prev => Math.max(prev - 1, 0));
  }, []);

  const goToNextWeek = useCallback(() => {
    setWeekOffset(prev => prev + 1);
  }, []);

  const handleDateSelect = useCallback((date: Date) => {
    if (!arePrereqsComplete(bookingPrereqs)) {
      handleDisabledDateClick();
    } else {
      const dateKey = format(date, 'yyyy-MM-dd');
      const slotsCount = availabilityData[dateKey]?.length || 0;
      
      if (slotsCount > 0) {
        setSelectedDate(date);
        setShowTimeSlots(true);
      }
    }
  }, [handleDisabledDateClick, availabilityData, bookingPrereqs]);

  const handleReasonChange = useCallback((value: string) => {
    setBookingPrereqs(prev => ({ ...prev, reason: value }));
  }, []);

  const handleInsuranceChange = useCallback((value: string) => {
    setBookingPrereqs(prev => ({ ...prev, insurance: value }));
  }, []);

  const handlePatientTypeSelect = useCallback((type: 'new' | 'returning') => {
    setBookingPrereqs(prev => ({ ...prev, patientType: type }));
  }, []);

  const handleTimeSlotSelect = (time: string) => {
    setSelectedTimeSlot(time);
  };

  const visibleDates = useMemo(() => {
    if (Object.keys(availabilityData).length > 0) {
      resetVisibleDates();
    }

    return getVisibleDates(currentTime, weekOffset, isLargeScreen, availabilityData);
  }, [currentTime, weekOffset, isLargeScreen, availabilityData]);

  const handleReportSubmit = async () => {
    if (reportReasons.length === 0 && !otherReportReason.trim()) {
      return;
    }

    try {
      const db = getFirebaseDb();
      const reportsRef = collection(db, 'reports');
      
      await addDoc(reportsRef, {
        reasons: reportReasons,
        otherReason: otherReportReason.trim(),
        doctorId: id,
        doctorName: formatDisplayName(doctor),
        reportedBy: user?.uid,
        reporterEmail: user?.email,
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      toast({
        title: "Report Submitted",
        description: "Thank you for your report. We will review it shortly.",
        className: "bg-primary text-white",
      });

      setShowReportDialog(false);
      setReportReasons([]);
      setOtherReportReason('');
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        variant: "destructive",
        title: "Report Failed",
        description: "There was a problem submitting your report. Please try again.",
      });
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const openReviews = urlParams.get('openReviews');
      if (openReviews === 'true') {
        setShouldOpenReviews(true);
        setShowReviews(true);
        
        router.replace(`/viewDoctor/${id}`);
      }
    }
  }, [id, router]);

   const getNextAvailableDate = (availability: { [key: string]: string[] } | undefined, currentTime: Date) => {
    if (!availability || Object.keys(availability).length === 0) {
      return null;
    }
    
    // sort dates chronologically
    const sortedDates = Object.keys(availability).sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateA.getTime() - dateB.getTime();
    });
    
    // find the first date that has available slots and is not in the past
    for (const dateStr of sortedDates) {
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      
      // skip dates in the past
      if (isBefore(startOfDay(date), startOfDay(currentTime))) {
        continue;
      }
      
      // for today, check if there are any slots in the future
      if (format(date, 'yyyy-MM-dd') === format(currentTime, 'yyyy-MM-dd')) {
        const futureSlots = availability[dateStr].filter(timeStr => {
          const [hours, minutes] = timeStr.split(':').map(Number);
          const slotTime = new Date(year, month - 1, day, hours, minutes);
          return !isBefore(slotTime, currentTime);
        });
        
        if (futureSlots.length > 0) {
          return date;
        }
      } else if (availability[dateStr].length > 0) {
        return date;
      }
    }
    
    return null;
  };

  if (authLoading || (!authLoading && !user)) {
    return null;
  }

  if (loading || !doctor) {
    return (
      <div className="container mx-auto px-4 xs:px-4 sm:px-4 md:px-4 lg:px-24 pt-8 lg:pt-16">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/2 lg:pr-12">
            <div className="sticky top-8">
              <div className="flex items-start space-x-4 sm:space-x-6">
                <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>

              <div className="mt-8 sm:mt-12 bg-gray-100 dark:bg-zinc-900 rounded-lg p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row">
                  <div className="w-full sm:w-1/3 flex flex-col items-center sm:items-center justify-center sm:pr-5 mb-4 sm:mb-0">
                    <div className="flex flex-row sm:flex-col items-center gap-3 sm:gap-2">
                      <Skeleton className="h-12 w-16 sm:h-12 sm:w-16" />
                      <Skeleton className="h-6 w-32 sm:h-5 sm:w-28" />
                    </div>
                    <div className="w-full h-px bg-gray-300 dark:bg-zinc-800 mt-4 mb-4 block sm:hidden" />
                  </div>
                  
                  <div className="w-full sm:w-2/3 sm:pl-5 sm:border-l border-gray-300 dark:border-zinc-800 sm:flex sm:flex-col sm:justify-between sm:min-h-[100px]">
                    <Skeleton className="h-16 w-full mb-2" />
                    <div className="text-right">
                      <Skeleton className="h-4 w-24 ml-auto" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 sm:mt-12 space-y-4 sm:space-y-6">
                <div className="space-y-1">
                  <Skeleton className="h-8 w-48 mb-2" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <hr className="border-gray-200 dark:border-zinc-800" />
                
                <div className="space-y-1">
                  <Skeleton className="h-8 w-48 mb-2" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <hr className="border-gray-200 dark:border-zinc-800" />

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Skeleton className="h-12 flex-1" />
                  <Skeleton className="h-12 flex-1" />
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/2">
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6 lg:px-12">
              <Skeleton className="h-8 w-64 mb-4" />
              <Skeleton className="h-4 w-48 mb-6" />
              
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>

              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <Skeleton className="h-6 w-48" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-3 2xl:grid-cols-5 gap-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton 
                        key={i} 
                        className={`h-[100px] sm:h-[130px] w-full rounded-lg ${
                          i >= 3 ? 'hidden 2xl:block' : ''
                        }`}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-3 2xl:grid-cols-5 gap-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton 
                        key={i + 5} 
                        className={`h-[100px] sm:h-[130px] w-full rounded-lg ${
                          i >= 3 ? 'hidden 2xl:block' : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) return <div>{error}</div>;

  const displayName = formatDisplayName(doctor);

  return (
    <div className="container mx-auto px-4 xs:px-4 sm:px-4 md:px-4 lg:px-24 pt-8 lg:pt-16">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-1/2 lg:pr-12">
          <div className="sticky top-8">
            <div className="flex items-start space-x-4 sm:space-x-6">
              <DoctorProfileImage profileImage={doctor?.profileImage} />
              <div className="mt-1 sm:mt-2">
                <h1 className="text-lg sm:text-xl font-semibold">
                  {displayName}
                </h1>
                <p className="text-gray-400 text-base sm:text-lg">
                  {doctor?.specialty}
                </p>
                
                <div className="flex items-center gap-2">
                  <span className="text-md sm:text-md">
                    {doctor?.streetAddress}, {doctor?.city}, {doctor?.state} {doctor?.zipCode}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 sm:mt-12 bg-gray-100 dark:bg-zinc-900 rounded-lg p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row">
                <div className="w-full sm:w-1/3 flex flex-col items-center sm:items-center justify-center sm:pr-5 mb-4 sm:mb-0">
                  <div className="flex flex-row sm:flex-col items-center gap-3 sm:gap-2">
                    <span className="text-5xl sm:text-6xl font-regular leading-none">
                      {doctor?.rating === 0 ? '0' : doctor?.rating?.toFixed(1)}
                    </span>
                    <div>
                      <StarRating rating={doctor?.rating ?? 0} />
                    </div>
                  </div>
                  <div className="w-full h-px bg-gray-300 dark:bg-zinc-800 mt-4 mb-4 block sm:hidden" />
                </div>
                
                <div className="w-full sm:w-2/3 sm:pl-5 sm:border-l border-gray-300 dark:border-zinc-800 sm:flex sm:flex-col sm:justify-between sm:min-h-[100px]">
                  {reviewsLoading ? (
                    <>
                      <div className="mb-2">
                        <Skeleton className="h-16 w-full" />
                      </div>
                      <div className="text-right mt-2">
                        <Skeleton className="h-4 w-24 ml-auto" />
                      </div>
                    </>
                  ) : reviews.length > 0 ? (
                    <>
                      <div className="text-gray-600 dark:text-gray-400 text-md italic mb-2">
                        "{reviews[0].review.length > 100 ? `${reviews[0].review.substring(0, 100)}...` : reviews[0].review}"
                      </div>
                      <div className="text-right mt-2 sm:mt-auto">
                        <Dialog>
                          <DialogTrigger asChild>
                            <span
                              className="font-semibold text-sm underline cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                            >
                              See all {reviews.length} reviews
                            </span>
                          </DialogTrigger>
                          <DialogContent className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[calc(100%-32px)] sm:w-[600px]">
                            <DialogHeader>
                              <DialogTitle>Reviews for {doctor?.degree === 'MD' ? 'Dr.' : ''} {doctor?.firstName} {doctor?.lastName}</DialogTitle>
                              <DialogDescription>
                                View all reviews and ratings
                              </DialogDescription>
                            </DialogHeader>
                            <ReviewsHistory doctorId={id} preloadedReviews={reviews} isLoading={reviewsLoading} doctorName={displayName} />
                          </DialogContent>
                        </Dialog>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="text-gray-500 dark:text-gray-400 text-sm text-center">
                        No reviews yet for {doctor?.degree === 'MD' ? 'Dr.' : ''} {doctor?.firstName} {doctor?.lastName}
                      </div>
                      <div className="text-gray-400 dark:text-gray-500 text-xs text-center mt-1">
                        Be the first to share your experience
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 sm:mt-12 space-y-4 sm:space-y-6">
              <div className="space-y-1 relative">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Shield className="w-8 h-8 sm:w-12 sm:h-12 text-blue-500 absolute top-1/2 -translate-y-1/2" />
                  <h3 className="text-lg sm:text-xl font-semibold ml-12 sm:ml-16">Accepted Insurance</h3>
                </div>
                <div className="ml-12 sm:ml-16">
                  <span className="text-md sm:text-md text-gray-500 dark:text-gray-400">
                    Accepts {doctor?.acceptedInsurances?.slice(0, 3).join(', ')}
                    {doctor?.acceptedInsurances?.length > 3 && (
                      <span className="text-gray-500 dark:text-gray-400"> + {doctor.acceptedInsurances.length - 3} more</span>
                    )}
                  </span>
                </div>
              </div>
              <hr className="border-gray-200 dark:border-zinc-800" />

              <div className="space-y-1 relative">
                <div className="flex items-center gap-2 sm:gap-3">
                  <MessageCircle className="w-8 h-8 sm:w-12 sm:h-12 text-black-500 absolute top-1/2 -translate-y-1/2" />
                  <h3 className="text-lg sm:text-xl font-semibold ml-12 sm:ml-16">Spoken Languages</h3>
                </div>
                <div className="ml-12 sm:ml-16">
                  <span className="text-md sm:text-md text-gray-500 dark:text-gray-400">
                    Speaks {doctor?.spokenLanguages?.slice(0, 3).join(', ')}
                    {doctor?.spokenLanguages?.length > 3 && (
                      <span className="text-gray-500 dark:text-gray-400"> + {doctor.spokenLanguages.length - 3} more</span>
                    )}
                  </span>
                </div>
              </div>
              <hr className="border-gray-200 dark:border-zinc-800" />

              <ActionButtons 
                onReportClick={handleReportClick}
                onCompareClick={handleCompareClick}
                currentDoctorId={currentDoctor?.id || ""}
              />
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2">
          <BookingForm
            bookingPrereqs={bookingPrereqs}
            incompleteFields={incompleteFields}
            userSymptoms={userSymptoms}
            doctor={doctor}
            onReasonChange={handleReasonChange}
            onInsuranceChange={handleInsuranceChange}
            onPatientTypeSelect={handlePatientTypeSelect}
            selectedDate={selectedDate}
            weekOffset={weekOffset}
            isLargeScreen={isLargeScreen}
            getVisibleDates={() => getVisibleDates(currentTime, weekOffset, isLargeScreen)}
            goToPreviousWeek={goToPreviousWeek}
            goToNextWeek={goToNextWeek}
            handleDateSelect={handleDateSelect}
            availabilityData={availabilityData}
            currentTime={currentTime}
            findNextAvailableSlot={findNextAvailableSlot}
            visibleDates={visibleDates}
          />
        </div>
      </div>

      <Dialog 
        open={showTimeSlots} 
        onOpenChange={(open) => {
          setShowTimeSlots(open);
          if (!open) {
            setSelectedDate(null);
            setSelectedTimeSlot(null);
          }
        }}
      >
        <DialogContent className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[calc(100%-32px)] sm:w-[600px] rounded-lg border border-gray-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 p-0 shadow-lg">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="mb-4 text-left">
              Confirm Appointment
            </DialogTitle>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden flex-shrink-0">
                <DoctorProfileImage profileImage={doctor?.profileImage} />
              </div>
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-semibold">
                  {displayName}
                </h3>
                <p className="text-sm sm:text-md text-gray-500">{doctor?.specialty}</p>
                <div className="text-xs sm:text-sm text-gray-500">
                  <span className="break-words">
                    {doctor?.streetAddress}, {doctor?.city}, {doctor?.state} {doctor?.zipCode}
                  </span>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6 pt-2">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="font-medium">
                {selectedDate ? format(selectedDate, 'EEEE, MMMM d') : ''}
              </span>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {selectedDate && availabilityData[format(selectedDate, 'yyyy-MM-dd')]
                  ?.sort((a, b) => {
                    const timeA = parseInt(a.replace(':', ''));
                    const timeB = parseInt(b.replace(':', ''));
                    return timeA - timeB;
                  })
                  .slice(0, showAllTimeSlots ? undefined : 6)
                  .map((time) => {
                    const [hours, minutes] = time.split(':').map(Number);
                    const timeDate = new Date(selectedDate);
                    timeDate.setHours(hours, minutes);
                    
                    if (format(selectedDate, 'yyyy-MM-dd') === format(currentTime, 'yyyy-MM-dd') &&
                        isBefore(timeDate, currentTime)) {
                      return null;
                    }

                    return (
                      <Button
                        key={time}
                        variant="outline"
                        className={`w-full ${
                          selectedTimeSlot === time 
                            ? 'bg-primary text-white hover:bg-primary hover:text-white dark:bg-primary/90 dark:hover:bg-primary/90' 
                            : 'hover:bg-gray-100 dark:hover:bg-zinc-800'
                        }`}
                        onClick={() => handleTimeSlotSelect(time)}
                      >
                        {format(timeDate, 'h:mm a')}
                      </Button>
                    );
                  })}
              </div>

              {selectedDate && availabilityData[format(selectedDate, 'yyyy-MM-dd')]?.length > 6 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAllTimeSlots(!showAllTimeSlots)}
                  className="w-full text-bold"
                >
                  {showAllTimeSlots ? "Show Less" : "More Time Slots"}
                </Button>
              )}
            </div>

            <div className="mt-6">
              <textarea
                className="w-full min-h-[100px] p-3 rounded-md border border-gray-200 dark:border-zinc-800 focus:outline-none focus:border-gray-300 dark:focus:border-zinc-700"
                placeholder={`Write any notes for ${doctor?.degree === 'MD' ? 'Dr.' : ''} ${doctor?.firstName} ${doctor?.lastName}...`}
                value={appointmentNotes}
                onChange={(e) => setAppointmentNotes(e.target.value)}
              />
            </div>

            {selectedTimeSlot && selectedDate && (
              <div className="mt-6 text-center text-sm text-muted-foreground">
                <span className="block sm:inline">Your appointment will be scheduled for:</span>{' '}
                <span className="block sm:inline sm:mt-0 underline">
                  {format(selectedDate, 'EEE, MMM d')}{' '}
                  @ {format(new Date(selectedDate).setHours(
                    parseInt(selectedTimeSlot.split(':')[0]),
                    parseInt(selectedTimeSlot.split(':')[1])
                  ), 'h:mm a')}
                </span>
              </div>
            )}

            <div className="mt-2">
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-white"
                onClick={async () => {
                  if (!validateBookingDetails(selectedDate, selectedTimeSlot, bookingPrereqs)) {
                    return;
                  }

                  try {
                    const db = getFirebaseDb();
                    const appointmentsRef = collection(db, 'appointments');
                    
                    // get current availability
                    const availabilityRef = doc(db, 'availability', id);
                    const availabilityDoc = await getDoc(availabilityRef);
                    
                    if (!availabilityDoc.exists()) {
                      throw new Error('No availability found');
                    }

                    const currentAvailability = availabilityDoc.data() as { [key: string]: string[] };
                    const dateKey = format(selectedDate!, 'yyyy-MM-dd');
                    
                    // remove the selected time slot from the availability
                    const updatedTimeSlots = currentAvailability[dateKey].filter(
                      time => time !== selectedTimeSlot
                    );

                    // update the availability document
                    const updatedAvailability = { ...currentAvailability };
                    if (updatedTimeSlots.length === 0) {
                      delete updatedAvailability[dateKey];
                    } else {
                      updatedAvailability[dateKey] = updatedTimeSlots;
                    }

                    // create a batch to update both documents atomically
                    const batch = writeBatch(db);

                    // add appointment
                    const userDoc = await getDoc(doc(db, 'users', user!.uid));
                    const userData = userDoc.data();
                    const patientName = userData ? 
                      `${userData.firstName} ${userData.lastName}` : 
                      'Unknown';
                    
                    const [hours, minutes] = selectedTimeSlot!.split(':').map(Number);
                    const appointmentDate = new Date(selectedDate!);
                    appointmentDate.setHours(hours, minutes);

                    const appointmentData: Omit<Appointment, 'id'> = {
                      doctorId: id,
                      patientId: user!.uid,
                      datetime: Timestamp.fromDate(appointmentDate),
                      status: 'scheduled',
                      visitDetails: {
                        reason: bookingPrereqs.reason,
                        insurance: bookingPrereqs.insurance,
                        patientType: bookingPrereqs.patientType as 'new' | 'returning',
                        ...(appointmentNotes.trim() && { notes: appointmentNotes.trim() })
                      },
                      doctorInfo: {
                        name: displayName,
                        specialty: doctor?.specialty,
                        degree: doctor?.degree,
                        location: `${doctor?.streetAddress}, ${doctor?.city}, ${doctor?.state} ${doctor?.zipCode}`
                      },
                      patientInfo: {
                        name: patientName,
                        email: user?.email || 'Unknown'
                      },
                      createdAt: Timestamp.now(),
                      updatedAt: Timestamp.now()
                    };
                    
                    const newAppointmentRef = doc(appointmentsRef);
                    batch.set(newAppointmentRef, appointmentData);

                    // delete availability if no more time slots are available
                    if (Object.keys(updatedAvailability).length === 0) {
                      batch.delete(availabilityRef);
                    } else {
                      batch.set(availabilityRef, updatedAvailability);
                    }

                    // commit the batch
                    await batch.commit();
                    
                    // update local state
                    setAvailabilityData(updatedAvailability);
                    
                    // reset state
                    setShowTimeSlots(false);
                    setSelectedDate(null);
                    setSelectedTimeSlot(null);
                    setAppointmentNotes('');
                    setBookingPrereqs({
                      reason: '',
                      insurance: '',
                      patientType: null
                    });
                    
                    toast({
                      title: "Appointment Confirmed",
                      description: `${format(appointmentDate, 'MMM d')} at ${format(appointmentDate, 'h:mm a')} with ${doctor?.degree === 'MD' ? 'Dr.' : ''} ${doctor?.firstName} ${doctor?.lastName}`,
                      className: "bg-primary text-white",
                      action: (
                        <ToastAction 
                          altText="View visits" 
                          onClick={() => router.push('/visits')}
                          className="text-white"
                        >
                          View visits
                        </ToastAction>
                      ),
                    });

                  } catch (error) {
                    console.error('Error creating appointment:', error);
                    toast({
                      variant: "destructive",
                      title: "Scheduling Failed",
                      description: "There was a problem scheduling your appointment. Please try again.",
                    });
                  }
                }}
                disabled={!validateBookingDetails(selectedDate, selectedTimeSlot, bookingPrereqs)}
              >
                Confirm Appointment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog 
        open={showReportDialog} 
        onOpenChange={(open) => {
          setShowReportDialog(open);
          if (!open) {
            setReportReasons([]);
            setOtherReportReason('');
          }
        }}
      >
        <DialogContent className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[calc(100%-32px)] sm:w-[600px] rounded-lg border border-gray-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 p-0 shadow-lg">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-xl font-semibold">Report Abuse</DialogTitle>
            <DialogDescription className="text-gray-500 mt-1.5 mb-0">
              Select all that apply
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 pt-2">
            <div className="space-y-4 pb-6">
              {[
                "Multiple doctor account listings",
                "Doctor doesn't offer correct service",
                "Invalid doctor information"
              ].map((reason) => (
                <div key={reason} className="flex items-center space-x-2">
                  <Checkbox
                    id={reason}
                    checked={reportReasons.includes(reason)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setReportReasons([...reportReasons, reason]);
                      } else {
                        setReportReasons(reportReasons.filter(r => r !== reason));
                      }
                    }}
                  />
                  <label
                    htmlFor={reason}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {reason}
                  </label>
                </div>
              ))}
            </div>

            <textarea
              className="w-full min-h-[100px] p-3 rounded-md border border-gray-200 dark:border-zinc-800 focus:outline-none focus:border-gray-300 dark:focus:border-zinc-700"
              placeholder="Other reasons write here..."
              value={otherReportReason}
              onChange={(e) => setOtherReportReason(e.target.value)}
            />

            <Button 
              className="w-full mt-2"
              onClick={handleReportSubmit}
              disabled={reportReasons.length === 0 && !otherReportReason.trim()}
            >
              Report
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showReviews || shouldOpenReviews}
        onOpenChange={(open) => {
          setShowReviews(open);
          setShouldOpenReviews(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reviews for {doctor?.degree === 'MD' ? 'Dr.' : ''} {doctor?.firstName} {doctor?.lastName}</DialogTitle>
            <DialogDescription>
              View all reviews and ratings
            </DialogDescription>
          </DialogHeader>
          <ReviewsHistory 
            doctorId={id} 
            preloadedReviews={reviews} 
            isLoading={reviewsLoading}
            doctorName={`${doctor?.degree === 'MD' ? 'Dr.' : ''} ${doctor?.firstName} ${doctor?.lastName}`}
          />
        </DialogContent>
      </Dialog>

      <Dialog 
        open={showCompareDialog} 
        onOpenChange={(open) => {
          setShowCompareDialog(open);
          if (!open) {
            setTimeout(() => {
              setDoctorsToCompare([]);
              setComparisonDoctors([]);
              setCurrentComparisonIndex(0);
            }, 300);
          }
        }}
      >
        <DialogContent className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[calc(100%-32px)] sm:w-[90%] max-w-[1200px] max-h-[90vh] overflow-y-auto rounded-lg border border-gray-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 p-0 shadow-lg">
          <DialogHeader className="p-6 pb-2 sticky top-0 bg-white dark:bg-zinc-950 z-10">
            <button 
              onClick={() => setShowCompareDialog(false)}
              className="absolute right-6 top-6 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              <span className="sr-only">Close</span>
            </button>
            <DialogTitle className="text-xl font-semibold">Compare Doctors</DialogTitle>
            <DialogDescription className="text-gray-500 mt-1.5 mb-0">
              Compare {doctor?.firstName} {doctor?.lastName} with other doctors
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* current doctor */}
            <div className="rounded-lg p-4">
              <div className="flex items-start space-x-4 sm:space-x-6">
                <DoctorProfileImage profileImage={doctor?.profileImage} />
                <div className="mt-1 sm:mt-2">
                  <h1 className="text-lg sm:text-xl font-semibold">
                    {displayName}
                  </h1>
                  <p className={`text-base sm:text-lg inline-block ${
                    comparisonDoctors[currentComparisonIndex]?.specialty === doctor?.specialty && doctor?.specialty
                      ? specialtyMatchClass
                      : 'text-gray-400'
                  }`}>
                    {doctor?.specialty}
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-md sm:text-md">
                      {doctor?.streetAddress}, {doctor?.city}, {doctor?.state} {doctor?.zipCode}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rating box first for consistency */}
              <div className="mt-8 sm:mt-8 bg-gray-100 dark:bg-zinc-900 rounded-lg p-4 sm:p-5">
                <div className="flex flex-col items-center justify-center">
                  <div className="flex flex-row items-center gap-3 mb-2">
                    <span className="text-5xl font-regular mt-2 leading-none">
                      {doctor?.rating === 0 ? 
                        '0' : doctor?.rating?.toFixed(1) || '0'}
                    </span>
                    <div className="h-10 w-px bg-gray-300 dark:bg-zinc-700 mx-1 mt-2"></div>
                    <div className="mt-2 sm:mt-0">
                      <StarRating rating={doctor?.rating ?? 0} />
                    </div>
                  </div>
                </div>
              </div>

              {/* availability box after rating */}
              <div className="mt-4 bg-gray-100 dark:bg-zinc-900 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    <h3 className="text-md font-medium">Next Available</h3>
                  </div>
                  {(() => {
                    const nextDate = getNextAvailableDate(availabilityData, currentTime);
                    
                    if (nextDate) {
                      return (
                        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                          {format(nextDate, 'EEE, MMM d')}
                        </span>
                      );
                    } else {
                      return (
                        <span className="text-sm text-zinc-500 dark:text-zinc-400">
                          No availability 
                        </span>
                      );
                    }
                  })()}
                </div>
              </div>

              <div className="mt-8 sm:mt-8 space-y-4 sm:space-y-6">
                <div className="space-y-1 relative">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500 absolute top-1/2 -translate-y-1/2" />
                    <h3 className="text-lg sm:text-lg font-semibold ml-12 sm:ml-14">Accepted Insurance</h3>
                  </div>
                  <div className="ml-12 sm:ml-14">
                    <span className="text-md sm:text-md text-gray-500 dark:text-gray-400 truncate block">
                      {doctor?.acceptedInsurances?.slice(0, 3).join(', ') || 'Insurance not available'}
                      {doctor?.acceptedInsurances?.length && doctor?.acceptedInsurances?.length > 3 && (
                        <span className="text-gray-500 dark:text-gray-400"> + {doctor.acceptedInsurances.length - 3} more</span>
                      )}
                    </span>
                  </div>
                </div>
                <hr className="border-gray-200 dark:border-zinc-800" />

                <div className="space-y-1 relative">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 text-black-500 absolute top-1/2 -translate-y-1/2" />
                    <h3 className="text-lg sm:text-lg font-semibold ml-12 sm:ml-14">Spoken Languages</h3>
                  </div>
                  <div className="ml-12 sm:ml-14">
                    <span className="text-md sm:text-md text-gray-500 dark:text-gray-400">
                      {doctor?.spokenLanguages?.slice(0, 3).join(', ') || 'Languages not available'}
                      {doctor?.spokenLanguages?.length && doctor?.spokenLanguages?.length > 3 && (
                        <span className="text-gray-500 dark:text-gray-400"> + {doctor.spokenLanguages.length - 3} more</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* mobile only separator */}
            <hr className="border-gray-200 dark:border-zinc-800 md:hidden mx-4" />

            {/* comparison doctor */}
            {loadingComparisonDoctors ? (
              <div className="rounded-lg p-4">
                {/* doctor info skeleton */}
                <div className="flex items-start space-x-4 sm:space-x-6">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <div className="mt-1 sm:mt-2">
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                </div>

                {/* rating box skeleton */}
                <div className="mt-8 sm:mt-12 bg-gray-100 dark:bg-zinc-900 rounded-lg p-4 sm:p-5">
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex flex-row items-center gap-3 mb-2">
                      <Skeleton className="h-12 w-12" />
                      <div className="h-10 w-px bg-gray-300 dark:bg-zinc-700 mx-1"></div>
                      <Skeleton className="h-6 w-32" />
                    </div>
                  </div>
                </div>

                {/* availability box skeleton */}
                <div className="mt-4 bg-gray-100 dark:bg-zinc-900 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-5 h-5 rounded-full" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>

                {/* info skeleton */}
                <div className="mt-8 sm:mt-8 space-y-4 sm:space-y-6">
                  <div className="space-y-1 relative">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Skeleton className="w-10 h-10 rounded-full absolute top-1/2 -translate-y-1/2" />
                      <Skeleton className="h-6 w-48 ml-14" />
                    </div>
                    <div className="ml-12 sm:ml-14">
                      <Skeleton className="h-4 w-64" />
                    </div>
                  </div>
                  <hr className="border-gray-200 dark:border-zinc-800" />

                  {/* button skeleton */}
                  <div className="space-y-1 relative">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Skeleton className="w-10 h-10 rounded-full absolute top-1/2 -translate-y-1/2" />
                      <Skeleton className="h-6 w-48 ml-14" />
                    </div>
                    <div className="ml-12 sm:ml-14">
                      <Skeleton className="h-4 w-64" />
                    </div>
                  </div>
                </div>
              </div>
            ) : comparisonDoctors.length > 0 ? (
              <div className="rounded-lg p-4">
                {/* doctor info */}
                <div className="flex items-start space-x-4 sm:space-x-6">
                  <DoctorProfileImage profileImage={comparisonDoctors[currentComparisonIndex]?.profileImage} />
                  <div className="mt-1 sm:mt-2">
                    <h1 className="text-lg sm:text-xl font-semibold">
                      {formatDisplayName(comparisonDoctors[currentComparisonIndex])}
                    </h1>
                    <p className={`text-base sm:text-lg inline-block ${
                      comparisonDoctors[currentComparisonIndex]?.specialty === doctor?.specialty && doctor?.specialty
                        ? specialtyMatchClass
                        : 'text-gray-400'
                    }`}>
                      {comparisonDoctors[currentComparisonIndex]?.specialty}
                    </p>
                    
                    <div className="flex items-center gap-2">
                    <span className="text-md sm:text-md">
                      {comparisonDoctors[currentComparisonIndex]?.streetAddress}, {comparisonDoctors[currentComparisonIndex]?.city}, {comparisonDoctors[currentComparisonIndex]?.state} {comparisonDoctors[currentComparisonIndex]?.zipCode}
                    </span>
                    </div>
                  </div>
                </div>

                {/* rating box - simple */}
                <div className="mt-8 sm:mt-8 bg-gray-100 dark:bg-zinc-900 rounded-lg p-4 sm:p-5">
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex flex-row items-center gap-3 mb-2">
                      <span className="text-5xl font-regular mt-2 leading-none">
                        {comparisonDoctors[currentComparisonIndex]?.rating === 0 ? 
                          '0' : comparisonDoctors[currentComparisonIndex]?.rating?.toFixed(1) || '0'}
                      </span>
                      <div className="h-10 w-px bg-gray-300 dark:bg-zinc-700 mx-1 mt-2"></div>
                      <div className="mt-2 sm:mt-0">
                        <StarRating rating={comparisonDoctors[currentComparisonIndex]?.rating ?? 0} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* next available appointment */}
                <div className="mt-4 mb-8 bg-gray-100 dark:bg-zinc-900 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" />
                      <h3 className="text-md font-medium">Next Available</h3>
                    </div>
                    {(() => {
                      const nextDate = getNextAvailableDate(
                        comparisonDoctors[currentComparisonIndex]?.availability,
                        currentTime
                      );
                      
                      if (nextDate) {
                        return (
                          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                            {format(nextDate, 'EEE, MMM d')}
                          </span>
                        );
                      } else {
                        return (
                          <span className="text-sm text-zinc-500 dark:text-zinc-400">
                            No availability
                          </span>
                        );
                      }
                    })()}
                  </div>
                </div>

                {/* info */}
                <div className="mt-4 sm:mt-4 space-y-4 sm:space-y-6">
                  <div className="space-y-1 relative">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500 absolute top-1/2 -translate-y-1/2" />
                      <h3 className="text-lg sm:text-lg font-semibold ml-12 sm:ml-14">Accepted Insurance</h3>
                    </div>
                    <div className="ml-12 sm:ml-14">
                      <span className="text-md sm:text-md text-gray-500 dark:text-gray-400 truncate block">
                        {comparisonDoctors[currentComparisonIndex]?.acceptedInsurances?.slice(0, 3).join(', ') || 'Insurance not available'}
                        {comparisonDoctors[currentComparisonIndex]?.acceptedInsurances?.length && comparisonDoctors[currentComparisonIndex]?.acceptedInsurances?.length > 3 && (
                          <span className="text-gray-500 dark:text-gray-400"> + {comparisonDoctors[currentComparisonIndex].acceptedInsurances.length - 3} more</span>
                        )}
                      </span>
                    </div>
                  </div>
                  <hr className="border-gray-200 dark:border-zinc-800" />

                  <div className="space-y-1 relative">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 text-black-500 absolute top-1/2 -translate-y-1/2" />
                      <h3 className="text-lg sm:text-lg font-semibold ml-12 sm:ml-14">Spoken Languages</h3>
                    </div>
                    <div className="ml-12 sm:ml-14">
                      <span className="text-md sm:text-md text-gray-500 dark:text-gray-400">
                        {comparisonDoctors[currentComparisonIndex]?.spokenLanguages?.slice(0, 3).join(', ') || 'Languages not available'}
                        {comparisonDoctors[currentComparisonIndex]?.spokenLanguages?.length && comparisonDoctors[currentComparisonIndex]?.spokenLanguages?.length > 3 && (
                          <span className="text-gray-500 dark:text-gray-400"> + {comparisonDoctors[currentComparisonIndex].spokenLanguages.length - 3} more</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-gray-300 dark:border-zinc-700 rounded-lg p-4 flex flex-col items-center justify-center">
                <Users className="w-16 h-16 text-gray-400 mb-4" />
                <p className="text-gray-500 text-center text-lg mb-6">No other doctors available for comparison</p>
                <Button 
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    setShowCompareDialog(false);
                    router.push('/viewall');
                  }}
                  className="px-8 py-6 text-base"
                >
                  Find Doctors
                </Button>
              </div>
            )}
          </div>
          
          {/* navigation arrows */}
          {loadingComparisonDoctors ? (
            <div className="p-6 pt-0 mx-4 flex justify-between items-center">
              <div className="items-center hidden md:block">
                <Skeleton className="h-5 w-20" />
              </div>
              
              <div className="flex items-center gap-4 md:w-1/2 justify-end">
                <Skeleton className="h-10 w-full max-w-[450px] rounded-md" />
                
                <div className="bg-gray-100 dark:bg-zinc-800 shadow-md rounded-full flex overflow-hidden flex-shrink-0">
                  <Skeleton className="w-10 h-10 rounded-l-full" />
                  <div className="w-px h-10 bg-gray-300 dark:bg-zinc-700 self-center"></div>
                  <Skeleton className="w-10 h-10 rounded-r-full" />
                </div>
              </div>
            </div>
          ) : comparisonDoctors.length > 0 && (
            <div className="p-6 pt-0 mx-4 flex justify-between items-center">
              <div className="items-center hidden md:block">
                <span className="text-sm text-gray-500">
                  {currentComparisonIndex + 1} of {comparisonDoctors.length}
                </span>
              </div>
              
              <div className="flex items-center gap-4 w-full md:w-1/2 justify-end">
                <Button
                  variant="default"
                  onClick={() => {
                    setShowCompareDialog(false);
                    router.push(`/viewDoctor/${comparisonDoctors[currentComparisonIndex].id}`);
                  }}
                  className="bg-primary sm:ml-6 hover:bg-primary/90 text-white w-full sm:flex-grow truncate"
                >
                  <span className="hidden sm:inline">
                    Book with {comparisonDoctors[currentComparisonIndex]?.firstName} {comparisonDoctors[currentComparisonIndex]?.lastName || 'Doctor'}
                  </span>
                  <span className="sm:hidden">
                    Book Online
                  </span>
                </Button>
                
                <div className="bg-gray-100 dark:bg-zinc-800 shadow-md rounded-full flex overflow-hidden flex-shrink-0">
                  <Button 
                    variant="ghost" 
                    onClick={() => navigateComparisonDoctor('prev')}
                    className="w-10 h-10 rounded-l-full p-0 hover:bg-gray-200 dark:hover:bg-zinc-700 focus:ring-0 focus:ring-offset-0"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="grey" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                      <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                  </Button>
                  <div className="w-px h-10 bg-gray-300 dark:bg-zinc-700 self-center"></div>
                  <Button 
                    variant="ghost" 
                    onClick={() => navigateComparisonDoctor('next')}
                    className="w-10 h-10 rounded-r-full p-0 hover:bg-gray-200 dark:hover:bg-zinc-700 focus:ring-0 focus:ring-offset-0"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="grey" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ViewDoctor;
