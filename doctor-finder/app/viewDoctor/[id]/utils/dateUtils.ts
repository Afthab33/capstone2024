import { addDays } from 'date-fns';

let initialFirstAvailableDate: Date | null = null;

export const getVisibleDates = (
  currentTime: Date, 
  weekOffset: number, 
  isLargeScreen: boolean,
  availabilityData: { [key: string]: string[] } = {}
) => {
  const datesNeeded = isLargeScreen ? 10 : 6; // 10 dates for large screens, 6 for small screens
  
  if (!initialFirstAvailableDate) {
    // if there is availability data, get the first available date
    if (Object.keys(availabilityData).length > 0) {
      const availableDates = Object.entries(availabilityData)
        .filter(([_, slots]) => slots.length > 0)
        .map(([date]) => date)
        .sort();

      // if there are available dates, set the initial first available date to the first available date
      if (availableDates.length > 0) {
        const firstAvailableDate = new Date(availableDates[0]);
        
        initialFirstAvailableDate = firstAvailableDate; 
      }
    }
    
    // if no initial first available date, set it to the current time
    if (!initialFirstAvailableDate) {
      initialFirstAvailableDate = currentTime;
    }
  }

  const dates: Date[] = [];
  const startDate = addDays(initialFirstAvailableDate, weekOffset * datesNeeded);

  // add the dates to the array
  for (let i = 0; i < datesNeeded; i++) {
    const date = addDays(startDate, i);
    dates.push(date);
  }

  return dates;
};

export const resetVisibleDates = () => {
  initialFirstAvailableDate = null;
};

export const formatDisplayName = (doctor: any) => {
  return `${doctor?.degree === 'MD' ? 'Dr. ' : ''}${doctor?.firstName} ${doctor?.lastName}${doctor?.degree ? `, ${doctor?.degree}` : ''}`;
};