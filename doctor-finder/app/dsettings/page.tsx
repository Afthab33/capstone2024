'use client';

import { useAuth } from "../authcontext";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db as getFirebaseDb } from "../authcontext";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import DoctorProfileCard from "../components/DoctorProfileCard";
import { useDropzone } from 'react-dropzone';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";
import AvailabilityCard from "../components/AvailabilityCard";
import { addDays, format, isBefore, startOfDay } from 'date-fns';
import { motion, AnimatePresence } from "framer-motion";
import TimeSlotSelector from "../components/TimeSlotSelector";

interface userData {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    sex: string;
    birthday: string;
    clinicName?: string;
    streetAddress?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    specialty?: string;
    degree?: string;
    acceptedInsurances?: string[];
    spokenLanguages?: string[];
    profileImage?: string;
    rating?: number;
    reviewCount?: number;
    availability?: {
        [date: string]: string[]; // date is in format yyyy-MM-dd
    };
}

// check if a date is fully past
const isDateFullyPast = (date: Date, availabilityData: { [key: string]: string[] }) => {
  const now = new Date();
  const dateKey = format(date, 'yyyy-MM-dd');
  const timeSlots = availabilityData[dateKey] || [];
  
  // if the date is before today, it's fully past
  if (isBefore(startOfDay(date), startOfDay(now))) {
    return true;
  }
  
  // if the date is today, check if all time slots are past
  if (format(date, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')) {
    return timeSlots.every(timeStr => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const slotTime = new Date(date);
      slotTime.setHours(hours, minutes);
      return isBefore(slotTime, now);
    });
  }
  
  return false;
};

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState<userData | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [toBeRemoved, setToBeRemoved] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimes, setSelectedTimes] = useState<Date[]>([]);
  const [availabilityData, setAvailabilityData] = useState<{ [key: string]: string[] }>({});  // date -> array of time slots

  const goToPreviousWeek = () => setWeekOffset(prev => Math.max(prev - 1, 0));
  const goToNextWeek = () => setWeekOffset(prev => prev + 1);

  const fetchUserData = useCallback(async () => {
    try {
      if (!user) return;
      const db = getFirebaseDb();
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        setUserData(userDoc.data() as userData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }, [user]);

  const fetchAvailability = useCallback(async () => {
    if (!user) return;
    try {
      const db = getFirebaseDb();
      const availabilityRef = doc(db, 'availability', user.uid);  // availability data is stored in a doc with the user's uid
      const availabilityDoc = await getDoc(availabilityRef);  // get the availability doc
      
      if (availabilityDoc.exists()) {
        type AvailabilityData = { [key: string]: string[] };
        const data = availabilityDoc.data() as AvailabilityData;
        const now = new Date();
        
        // filtered data will be the data we save to the database
        const filteredData: AvailabilityData = {};
        let hasChanges = false;
        
        // iterate through all dates in the availability data
        for (const [dateStr, timeSlots] of Object.entries(data)) {
          const [year, month, day] = dateStr.split('-').map(Number);
          const currentDate = new Date(year, month - 1, day);
          const isToday = format(currentDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
          
          // for today, filter out past time slots
          if (isToday) {
            const validTimeSlots = timeSlots.filter((timeStr: string) => {
              const [hours, minutes] = timeStr.split(':').map(Number);
              const slotTime = new Date(year, month - 1, day, hours, minutes);
              const isPast = isBefore(slotTime, now);
              return !isPast;
            });
            
            // if there are any valid time slots, add them to the filtered data
            if (validTimeSlots.length > 0) {
              filteredData[dateStr] = validTimeSlots;
            } else {
              hasChanges = true;
            }
            
            // if the number of valid time slots is different from the number of time slots, there are changes
            if (validTimeSlots.length !== timeSlots.length) {
              hasChanges = true;
            }
          } else if (isBefore(currentDate, startOfDay(now))) {
            // if the date is before today, we need to remove it from the filtered data
            hasChanges = true;
            continue;
          } else {
            // if the date is in the future, keep all time slots
            filteredData[dateStr] = timeSlots;
          }
        }
        
        // update firebase if there are any changes
        if (hasChanges) {
          if (Object.keys(filteredData).length === 0) {
            await deleteDoc(availabilityRef);
          } else {
            await setDoc(availabilityRef, filteredData);
          }
        }
        
        setAvailabilityData(filteredData); // update local state
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/');
        return;
      }
      
      fetchUserData();
      fetchAvailability();
    }
  }, [user, authLoading, router, fetchUserData, fetchAvailability]);

  const onDrop = async (acceptedFiles: File[]) => {
    if (!acceptedFiles[0]) return;
    
    const file = acceptedFiles[0];
    setSelectedFile(file);
    
    // create preview url
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
    
    // close the dialog
    setIsDialogOpen(false);
  };

  const handleSave = async () => {
    if (!user) return;
    
    try {
      setUploading(true);
      const db = getFirebaseDb();

      if (toBeRemoved) { // if the profile picture is to be removed
        await updateDoc(doc(db, 'users', user.uid), {
          profileImage: null
        });
      } else if (selectedFile) { // if a new profile picture is to be uploaded
        const storage = getStorage();
        const storageRef = ref(storage, `doctor-profiles/${user.uid}/${selectedFile.name}`);
        
        await uploadBytes(storageRef, selectedFile);
        const downloadURL = await getDownloadURL(storageRef);
        
        await updateDoc(doc(db, 'users', user.uid), {
          profileImage: downloadURL
        });
      }
      
      await fetchUserData();
      handleCancel(); // clear the preview state
    } catch (error) {
      console.error('Error updating profile picture:', error);
    } finally {
      setUploading(false);
      setToBeRemoved(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setToBeRemoved(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']  // only accept jpeg, jpg, and png files
    },
    maxFiles: 1
  });

  // handle date selection
  const handleDateSelect = (date: Date) => {
    // if the date is before today, do nothing
    if (isBefore(startOfDay(date), startOfDay(new Date()))) {
      return;
    }

    // if the date is already selected, clear the selected date and times
    if (selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')) {
      setSelectedDate(null);
      setSelectedTimes([]);
    } else { // otherwise, set the selected date and times
      setSelectedDate(date);
      const dateKey = format(date, 'yyyy-MM-dd');
      const existingSlots = availabilityData[dateKey] || [];
      const now = new Date();
      
      const initialTimes = existingSlots
        .map(timeStr => { // convert time strings to dates
          const [hours, minutes] = timeStr.split(':').map(Number);
          const timeDate = new Date(date);
          timeDate.setHours(hours, minutes);
          return timeDate;
        })
        .filter(time => !isBefore(time, now)); // filter out past times
        
      setSelectedTimes(initialTimes); // update local state
    }
  };

  const handleTimeSelect = (time: Date) => {
    setSelectedTimes(prev => {
      const timeString = format(time, 'HH:mm');
      const exists = prev.some(t => format(t, 'HH:mm') === timeString);
      
      if (exists) { // if the time is already selected, remove it
        return prev.filter(t => format(t, 'HH:mm') !== timeString);
      } else { // otherwise, add the time
        return [...prev, time]; // update local state
      }
    });
  };

  const handleSelectAll = () => {
    if (!selectedDate) return; // if no date is selected, do nothing
    
    const allTimes: Date[] = [];
    let hour = 8;
    let minute = 30;
    const now = new Date();
    
    while (hour < 17 || (hour === 17 && minute === 0)) { // while the hour is less than 5pm
      const time = new Date(selectedDate);
      time.setHours(hour, minute);
      
      if (!isBefore(time, now)) { // if the time is not in the past
        allTimes.push(time);
      }
      
      minute += 30; // increment the minute by 30
      if (minute >= 60) { // if the minute is 60 or more, increment the hour
        hour += 1;
        minute = 0;
      }
    }
    
    setSelectedTimes(allTimes); // update local state
  };

  // handle deselecting all times
  const handleDeselectAll = () => {
    setSelectedTimes([]);
  };

  // handle canceling availability changes
  const handleCancelAvailability = () => {
    setSelectedDate(null);
    setSelectedTimes([]);
  };

  const handleSaveAvailability = async () => {
    if (!user || !selectedDate) return;
    
    try {
      const db = getFirebaseDb();
      const dateKey = format(selectedDate, 'yyyy-MM-dd');
      const timeStrings = selectedTimes.map(time => format(time, 'HH:mm'));

      // update local state so no freaky flickering
      const updatedAvailability = { ...availabilityData };
      
      if (timeStrings.length === 0) { // if no times are selected, remove the date
        delete updatedAvailability[dateKey];
      } else {
        updatedAvailability[dateKey] = timeStrings; // otherwise, update the date with the selected times
      }
      
      setAvailabilityData(updatedAvailability);
      setSelectedDate(null);
      setSelectedTimes([]);

      // after updating local state, update firebase
      const availabilityRef = doc(db, 'availability', user.uid);
      if (Object.keys(updatedAvailability).length === 0) {
        await deleteDoc(availabilityRef);
      } else {
        await setDoc(availabilityRef, updatedAvailability);
      }
      
    } catch (error) {
      console.error('Error saving availability:', error);
    }
  };

  const getVisibleDates = () => {
    const now = new Date();
    const startDate = addDays(now, weekOffset * 14);
    const dates: Date[] = [];
    let daysToAdd = 0;

    // generate the initial 14 days
    while (dates.length < 14) {
      const currentDate = addDays(startDate, daysToAdd);
      if (!isDateFullyPast(currentDate, availabilityData)) { // if the date is not fully past
        dates.push(currentDate);
      }
      daysToAdd++;
    }

    return dates;
  };

  return (
    <div className="flex flex-col h-screen mx-4 sm:mx-20 lg:mx-48">
      {authLoading || !userData ? (
        <div className="pt-10">
          <Skeleton className="w-36 h-8 mb-8" /> {/* "Your Availability" title */}
          
          <div className="flex justify-between items-center mt-8">
            <Skeleton className="w-64 h-6" /> {/* date range text */}
            <div className="flex gap-2">
              <Skeleton className="w-8 h-8 rounded-full" /> {/* prev button */}
              <Skeleton className="w-8 h-8 rounded-full" /> {/* next button */}
            </div>
          </div>

          {/* date cards skeleton */}
          <div className="mt-4 flex gap-4 overflow-x-auto pb-4">
            {[...Array(14)].map((_, index) => (
              <div key={index} className="flex-shrink-0 w-[100px]">
                <Skeleton className="w-[100px] h-[120px] rounded-lg" />
              </div>
            ))}
          </div>

          <Skeleton className="w-36 h-8 mt-10 mb-8" /> {/* "Your Profile" title */}
          
          <Card>
            <CardContent className="p-2 sm:p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {/* profile image skeleton */}
                <Skeleton className="w-32 h-32 rounded-full" />

                {/* doctor info skeleton */}
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="w-64 h-7" /> {/* name */}
                    <Skeleton className="w-48 h-5" /> {/* specialty */}
                  </div>

                  <div className="space-y-2">
                    <Skeleton className="w-72 h-5" /> {/* address */}
                    <Skeleton className="w-80 h-5" /> {/* insurance */}
                    <Skeleton className="w-56 h-5" /> {/* languages */}
                  </div>

                  <div className="flex items-center gap-2">
                    <Skeleton className="w-32 h-5" /> {/* rating */}
                    <Skeleton className="w-40 h-5" /> {/* review count */}
                  </div>
                </div>
              </div>

              <hr className="my-4" />

              <div className="mt-4 flex flex-col sm:flex-row justify-end gap-2">
                <Skeleton className="w-full sm:w-40 h-10" /> {/* remove button */}
                <Skeleton className="w-full sm:w-24 h-10" /> {/* cancel button */}
                <Skeleton className="w-full sm:w-32 h-10" /> {/* save button */}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="relative pb-20">
          <h1 className="text-2xl font-semibold text-left pt-10">
            Your Availability
          </h1>

          <div className="flex justify-between items-center mt-4">
            <AnimatePresence mode="wait">
              <motion.h2
                key={weekOffset}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="text-lg text-muted-foreground"
              >
                {format(getVisibleDates()[0], 'EEE, MMM d')} - {format(getVisibleDates()[13], 'EEE, MMM d')}
              </motion.h2>
            </AnimatePresence>
            
            <div className="flex items-center">
              <button
                onClick={goToPreviousWeek}
                className={`p-2 rounded-full ${
                  weekOffset === 0 
                    ? 'text-gray-300' 
                    : 'hover:bg-gray-100'
                }`}
                disabled={weekOffset === 0}
                aria-label="Previous week"
              >
                ←
              </button>
              
              <button
                onClick={goToNextWeek}
                className="p-2 hover:bg-gray-100 rounded-full"
                aria-label="Next week"
              >
                →
              </button>
            </div>
          </div>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={weekOffset}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="mt-4 flex gap-4 overflow-x-auto pb-4"
              >
                {getVisibleDates().map((date, index) => {
                  const dateKey = format(date, 'yyyy-MM-dd');
                  const slotsCount = availabilityData[dateKey]?.length || 0;
                  
                  return (
                    <div key={dateKey} className="flex-shrink-0 w-[100px]">
                      <AvailabilityCard
                        date={date}
                        isSelected={selectedDate ? format(selectedDate, 'yyyy-MM-dd') === dateKey : false}
                        onSelect={handleDateSelect}
                        availableSlots={slotsCount}
                      />
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>

            <div className="relative mt-0">
              <AnimatePresence>
                {selectedDate && (
                  <TimeSlotSelector 
                    selectedDate={selectedDate}
                    selectedTimes={selectedTimes}
                    existingTimeSlots={availabilityData[format(selectedDate, 'yyyy-MM-dd')] || []}
                    onTimeSelect={handleTimeSelect}
                    onSelectAll={handleSelectAll}
                    onDeselectAll={handleDeselectAll}
                    onCancel={handleCancelAvailability}
                    onSave={handleSaveAvailability}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-left pt-10">
            Your Profile
          </h1>
          
          <div className="mt-8">
            <Card>
              <CardContent className="p-2 sm:p-4">
                <div>
                  <DoctorProfileCard
                    name={`${userData.firstName} ${userData.lastName}`}
                    degree={userData.degree}
                    specialty={userData.specialty || ''}
                    streetAddress={userData.streetAddress || ''}
                    city={userData.city || ''}
                    state={userData.state || ''}
                    zipCode={userData.zipCode || ''}
                    acceptedInsurances={userData.acceptedInsurances || []}
                    spokenLanguages={userData.spokenLanguages || []}
                    previewImage={toBeRemoved ? null : (previewUrl || userData.profileImage)}
                    rating={userData.rating || 0}
                    reviewCount={userData.reviewCount || 0}
                    setIsDialogOpen={setIsDialogOpen}
                  />
                </div>

                <hr className="my-4" />

                <div className="mt-4 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                  {userData.profileImage && (
                    <Button
                      variant="destructive"
                      onClick={() => setToBeRemoved(true)}
                      disabled={uploading || toBeRemoved || selectedFile !== null}
                      className="w-full sm:w-auto"
                    >
                      Remove profile picture
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={uploading || (!selectedFile && !toBeRemoved)}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={uploading || (!selectedFile && !toBeRemoved)}
                    className="w-full sm:w-auto"
                  >
                    {uploading ? 'Saving...' : 'Save changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="top-[35%] sm:top-1/4 sm:max-w-[425px] w-[90vw] max-w-[90vw] rounded-lg">
                <DialogHeader>
                  <DialogTitle>Update Profile Picture</DialogTitle>
                  <DialogDescription>
                    Upload a new profile picture
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {/* preview section */}
                  <div className="flex justify-center">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden">
                      <Image
                        src={previewUrl || (toBeRemoved ? '/profpic.png' : userData.profileImage) || '/profpic.png'}
                        alt="Profile Preview"
                        fill
                        className="object-cover"
                        unoptimized={previewUrl ? true : false}
                      />
                    </div>
                  </div>

                  {/* upload section */}
                  <div
                    {...getRootProps()}
                    tabIndex={-1}
                    className={`p-8 border-2 border-dashed rounded-lg cursor-pointer
                      ${isDragActive 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 bg-gray-50'
                      }
                      hover:border-blue-500 hover:bg-blue-50 transition-colors`}
                  >
                    <input {...getInputProps()} />
                    {uploading ? (
                      <p className="text-center text-gray-500">Uploading...</p>
                    ) : isDragActive ? (
                      <p className="text-center text-blue-500">Drop the file here...</p>
                    ) : (
                      <p className="text-center text-gray-500">
                        Drag and drop your profile picture here, or click to select
                      </p>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}
    </div>
  );
}
