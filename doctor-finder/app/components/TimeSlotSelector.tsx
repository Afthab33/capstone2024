import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState } from 'react';
import { isBefore, startOfDay } from 'date-fns';

interface TimeSlotSelectorProps {
  selectedDate: Date;
  selectedTimes: Date[];
  existingTimeSlots?: string[];
  onTimeSelect: (time: Date) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onCancel: () => void;
  onSave: () => void;
}

export default function TimeSlotSelector({ 
  selectedDate, 
  selectedTimes, 
  existingTimeSlots = [],
  onTimeSelect,
  onSelectAll,
  onDeselectAll,
  onCancel,
  onSave
}: TimeSlotSelectorProps) {
  const [isSaving, setIsSaving] = useState(false);

  // check if time is selected
  const isTimeSelected = (time: Date) => {
    if (isSaving) return false;
    const timeString = format(time, 'HH:mm');
    return selectedTimes.some(selectedTime => 
      format(selectedTime, 'HH:mm') === timeString
    );
  };

  // check if there are any changes
  const hasChanges = () => {
    const selectedTimeStrings = selectedTimes
      .map(time => format(time, 'HH:mm'))
      .sort();
    const sortedExistingSlots = [...existingTimeSlots].sort();

    if (selectedTimeStrings.length !== sortedExistingSlots.length) return true;
    
    return selectedTimeStrings.some((time, index) => time !== sortedExistingSlots[index]);
  };

  // generate time slots from 8:30 AM to 5:00 PM
  const generateTimeSlots = () => {
    const slots: Date[] = [];
    let hour = 8;
    let minute = 30;
    
    while (hour < 17 || (hour === 17 && minute === 0)) {
      const time = new Date(selectedDate);
      time.setHours(hour, minute);
      slots.push(time);
      
      minute += 30;
      if (minute >= 60) {
        hour += 1;
        minute = 0;
      }
    }
    
    // organize slots into columns (3 for mobile, 6 for larger screens)
    const numColumns = window.innerWidth < 640 ? 3 : 6;
    const columnLength = Math.ceil(slots.length / numColumns);
    const columns: Date[][] = Array.from({ length: numColumns }, (_, colIndex) =>
      slots.filter((_, index) => Math.floor(index / columnLength) === colIndex)
    );
    
    return columns;
  };

  const isTimeDisabled = (time: Date) => {
    const now = new Date();
    return isBefore(time, now);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="bg-background pt-4 z-10"
    >
      <h2 className="text-md mt-2 font-medium mb-4">
        {format(selectedDate, 'EEEE, MMMM d yyyy')}
      </h2>
      
      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1 sm:gap-2 mb-6 max-h-[60vh] overflow-y-auto">
        {generateTimeSlots().map((column, colIndex) => (
          <div key={colIndex} className="flex flex-col gap-1 sm:gap-2">
            {column.map((time) => (
              <Button
                key={time.toISOString()}
                variant={isTimeSelected(time) ? "default" : "outline"}
                className="w-full text-sm sm:text-sm py-1 h-8 sm:h-10"
                onClick={() => onTimeSelect(time)}
                disabled={isTimeDisabled(time)}
              >
                {format(time, 'h:mm a')}
              </Button>
            ))}
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 sm:gap-0 mt-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onDeselectAll}
            className="text-xs sm:text-sm flex-1 sm:flex-none"
          >
            Deselect All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onSelectAll}
            className="text-xs sm:text-sm flex-1 sm:flex-none"
          >
            Select All
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="text-xs sm:text-sm flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setIsSaving(true);
              onSave();
            }}
            disabled={!hasChanges()}
            className="text-xs sm:text-sm flex-1 sm:flex-none"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </motion.div>
  );
}