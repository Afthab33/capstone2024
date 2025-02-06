import React from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from "framer-motion";

interface DateRangeHeaderProps {
  weekOffset: number;
  dates: Date[];
  onPrevious: () => void;
  onNext: () => void;
  isLargeScreen: boolean;
}

const DateRangeHeader: React.FC<DateRangeHeaderProps> = React.memo(({ 
  weekOffset,
  dates,
  onPrevious,
  onNext,
  isLargeScreen
}) => (
  <div className="flex justify-between items-center mb-2">
    <AnimatePresence mode="wait">
      <motion.h2
        key={weekOffset}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="text-lg"
      >
        {format(dates[0], 'EEE, MMM d')} - {
          format(dates[isLargeScreen ? 9 : 5], 'EEE, MMM d')
        }
      </motion.h2>
    </AnimatePresence>
    
    <div className="flex items-center">
      <button
        onClick={onPrevious}
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
        onClick={onNext}
        className="p-2 hover:bg-gray-100 rounded-full"
        aria-label="Next week"
      >
        →
      </button>
    </div>
  </div>
), (prevProps, nextProps) => {
  return (
    prevProps.weekOffset === nextProps.weekOffset &&
    prevProps.isLargeScreen === nextProps.isLargeScreen &&
    prevProps.dates[0].getTime() === nextProps.dates[0].getTime()
  );
});

DateRangeHeader.displayName = 'DateRangeHeader';

export default DateRangeHeader;

