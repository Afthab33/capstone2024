import { BookingPrereqs } from './types';

export const arePrereqsComplete = (bookingPrereqs: BookingPrereqs) => {
  return bookingPrereqs.reason && 
         bookingPrereqs.insurance && 
         bookingPrereqs.patientType;
};

export const validateBookingDetails = (
  selectedDate: Date | null,
  selectedTimeSlot: string | null,
  bookingPrereqs: BookingPrereqs
) => {
  return selectedDate && 
         selectedTimeSlot && 
         arePrereqsComplete(bookingPrereqs);
};