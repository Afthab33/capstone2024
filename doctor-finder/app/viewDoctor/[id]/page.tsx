"use client";

import { use, useEffect, useState, useCallback, useMemo } from 'react';
import { doc, getDoc, collection, addDoc, Timestamp, writeBatch } from 'firebase/firestore';
import { db as getFirebaseDb } from '../../authcontext';
import { useAuth } from '../../authcontext';
import { Star, Shield, MessageCircle, Clock } from 'lucide-react';
import { format, isBefore, startOfDay } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from "@/components/ui/dialog";
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
import { getVisibleDates, formatDisplayName, resetVisibleDates } from './utils/dateUtils';
import { findNextAvailableSlot } from './utils/availabilityUtils';
import { arePrereqsComplete, validateBookingDetails } from './utils/bookingUtils';
import type { ViewDoctorProps, UserData, BookingPrereqs } from './utils/types';

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
  const { toast } = useToast();

  const handleReportClick = useCallback(() => {
    setShowReportDialog(true);
  }, []);

const handleCompareClick = useCallback(() => { 

  console.log('Compare the Doctors');
              }, []); 
  
  // if user is not logged in, redirect to login page
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

  // handle disabled date click
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
                  
                  <div className="w-full sm:w-2/3 sm:pl-5 sm:border-l border-gray-300 dark:border-zinc-800">
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
                    <span className="text-5xl sm:text-6xl font-regular leading-none">{doctor?.rating}</span>
                      <div>
                        <StarRating rating={doctor?.rating ?? 0} />
                      </div>
                  </div>
                  <div className="w-full h-px bg-gray-300 dark:bg-zinc-800 mt-4 mb-4 block sm:hidden" />
                </div>
                {/* TODO: add real reviews and ratings */}
                <div className="w-full sm:w-2/3 sm:pl-5 sm:border-l border-gray-300 dark:border-zinc-800">
                  <p className="text-gray-600 dark:text-gray-400 text-md italic">
                    "Dr. {doctor?.lastName} is an exceptional physician. Their expertise and caring approach made me feel comfortable throughout my entire visit. Highly recommended!"
                  </p>
                  <div className="text-right">
                    <span className="font-semibold text-sm underline cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                      {/* link to reviews maybe? */}
                      See all {doctor?.reviewCount} reviews
                    </span>
                  </div>
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

              <ActionButtons onReportClick={handleReportClick} onCompareClick={handleCompareClick} />
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
    </div>
  );
};

export default ViewDoctor;
