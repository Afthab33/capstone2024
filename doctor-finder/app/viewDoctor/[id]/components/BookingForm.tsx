import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import AvailabilityCard from '@/app/components/AvailabilityCard';
import ReasonSelect from './ReasonSelect';
import InsuranceSelect from './InsuranceSelect';
import PatientTypeSelector from './PatientTypeSelector';
import DateRangeHeader from './DateRangeHeader';

interface BookingFormProps {
  bookingPrereqs: {
    reason: string;
    insurance: string;
    patientType: 'new' | 'returning' | null;
  };
  incompleteFields: { reason: boolean; insurance: boolean; patientType: boolean; };
  userSymptoms: string[];
  doctor: any;
  onReasonChange: (value: string) => void;
  onInsuranceChange: (value: string) => void;
  onPatientTypeSelect: (type: 'new' | 'returning') => void;
  selectedDate: Date | null;
  weekOffset: number;
  isLargeScreen: boolean;
  getVisibleDates: () => Date[];
  goToPreviousWeek: () => void;
  goToNextWeek: () => void;
  handleDateSelect: (date: Date) => void;
  availabilityData: { [key: string]: string[] };
  currentTime: Date;
  findNextAvailableSlot: (availabilityData: { [key: string]: string[] }, currentTime: Date) => string;
  visibleDates: Date[];
}

const BookingForm: React.FC<BookingFormProps> = React.memo(({ 
  bookingPrereqs,
  incompleteFields,
  userSymptoms,
  doctor,
  onReasonChange,
  onInsuranceChange,
  onPatientTypeSelect,
  selectedDate,
  weekOffset,
  isLargeScreen,
  goToPreviousWeek,
  goToNextWeek,
  handleDateSelect,
  availabilityData,
  currentTime,
  findNextAvailableSlot,
  visibleDates,
}) => {
  const memoizedHandlers = useMemo(() => ({ // memoize handlers to prevent re-renders
    onPrevious: goToPreviousWeek,
    onNext: goToNextWeek
  }), [goToPreviousWeek, goToNextWeek]);

  return (
    <Card className="mb-8 dark:bg-zinc-900">
      <CardContent className="p-4 sm:p-6 lg:px-12">
        <h1 className="text-2xl font-semibold mb-2 pt-4">Book an Appointment Today</h1>
        <h2 className="text-md font-regular text-gray-400 mb-4">Reason for Visit</h2>
        <div className="flex flex-col gap-4">
          <ReasonSelect
            onValueChange={onReasonChange}
            showError={incompleteFields.reason}
            userSymptoms={userSymptoms}
            value={bookingPrereqs.reason}
          />

          <InsuranceSelect
            onValueChange={onInsuranceChange}
            showError={incompleteFields.insurance}
            value={bookingPrereqs.insurance}
            acceptedInsurances={doctor?.acceptedInsurances}
          />

          <PatientTypeSelector 
            patientType={bookingPrereqs.patientType}
            onSelect={onPatientTypeSelect}
            showError={incompleteFields.patientType}
          />

          <div className="mt-2">
            <DateRangeHeader
              weekOffset={weekOffset}
              dates={visibleDates}
              onPrevious={memoizedHandlers.onPrevious}
              onNext={memoizedHandlers.onNext}
              isLargeScreen={isLargeScreen}
            />

            <div className="space-y-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`row1-${weekOffset}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="grid grid-cols-3 2xl:grid-cols-5 gap-2"
                >
                  {visibleDates
                    .slice(0, isLargeScreen ? 5 : 3)
                    .map((date) => {
                      const dateKey = format(date, 'yyyy-MM-dd');
                      const slotsCount = availabilityData[dateKey]?.length || 0;
                      
                      return (
                        <div key={date.toISOString()} className="w-full">
                          <AvailabilityCard
                            date={date}
                            isSelected={selectedDate?.toDateString() === date.toDateString()}
                            onSelect={() => handleDateSelect(date)}
                            availableSlots={slotsCount}
                            currentTime={currentTime}
                            disabled={slotsCount === 0}
                            disabledReason={slotsCount === 0 ? 'No available slots' : undefined}
                          />
                        </div>
                      );
                    })}
                </motion.div>
              </AnimatePresence>

              <AnimatePresence mode="wait">
                <motion.div
                  key={`row2-${weekOffset}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="grid grid-cols-3 2xl:grid-cols-5 gap-2"
                >
                  {visibleDates
                    .slice(isLargeScreen ? 5 : 3, isLargeScreen ? 10 : 6)
                    .map((date) => {
                      const dateKey = format(date, 'yyyy-MM-dd');
                      const slotsCount = availabilityData[dateKey]?.length || 0;
                      
                      return (
                        <div key={date.toISOString()} className="w-full">
                          <AvailabilityCard
                            date={date}
                            isSelected={selectedDate?.toDateString() === date.toDateString()}
                            onSelect={() => handleDateSelect(date)}
                            availableSlots={slotsCount}
                            currentTime={currentTime}
                            disabled={slotsCount === 0}
                            disabledReason={slotsCount === 0 ? 'No available slots' : undefined}
                          />
                        </div>
                      );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>
            
            <p className="text-sm text-muted-foreground mt-4">
              Next available: {findNextAvailableSlot(availabilityData, currentTime)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

BookingForm.displayName = 'BookingForm';

export default BookingForm;