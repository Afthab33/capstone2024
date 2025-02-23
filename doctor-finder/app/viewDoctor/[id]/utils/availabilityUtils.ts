import { format, isBefore } from 'date-fns';

export const findNextAvailableSlot = (
  availabilityData: { [key: string]: string[] },
  currentTime: Date
) => {
  const sortedDates = Object.keys(availabilityData)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime()); // sort by year, month, day

  for (const date of sortedDates) {
    const timeSlots = availabilityData[date];
    if (!timeSlots || timeSlots.length === 0) continue; // if no time slots, skip

    const sortedTimeSlots = [...timeSlots].sort();
    
    for (const timeSlot of sortedTimeSlots) {
      const [hours, minutes] = timeSlot.split(':').map(Number);
      const [year, month, day] = date.split('-').map(Number);
      const slotDate = new Date(year, month - 1, day, hours, minutes);
      
      // if current day and after 5pm, skip
      const isCurrentDay = format(slotDate, 'yyyy-MM-dd') === format(currentTime, 'yyyy-MM-dd'); 
      const isAfter5PM = currentTime.getHours() >= 17;
      if (isCurrentDay && isAfter5PM) continue;
      
      // if slot date is before current time, skip
      if (isBefore(slotDate, currentTime)) continue;

      // if slot date is today, return 'Today'
      const isToday = format(slotDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
      const dayText = isToday ? 'Today' : format(slotDate, 'EEE, MMM d');
      const timeText = format(slotDate, 'h:mm a');
      
      return `${dayText} at ${timeText}`;
    }
  }
  return 'No availability'; // else return 'No availability'
};