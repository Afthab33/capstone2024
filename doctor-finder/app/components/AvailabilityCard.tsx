import { format } from 'date-fns';
import { Card, CardContent } from "@/components/ui/card";
import { startOfDay } from 'date-fns';

interface AvailabilityCardProps {
  date: Date;
  isSelected: boolean;
  onSelect?: (date: Date) => void;
  availableSlots: number;
  currentTime: Date;
  disabled?: boolean;
  disabledReason?: string;
}

export default function AvailabilityCard({ 
  date, 
  isSelected, 
  onSelect,
  availableSlots = 0,
  currentTime,
  disabled = false,
  disabledReason
}: AvailabilityCardProps) {
  const isPast = startOfDay(date) < startOfDay(currentTime);

  return (
    <div className="relative group w-full">
      <Card 
        className={`w-full h-[100px] sm:h-[130px] transition-colors duration-200 select-none
          ${isSelected ? 'bg-primary hover:bg-primary/90' : 'hover:bg-gray-50'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={() => !disabled && onSelect?.(date)}
      >
        <CardContent className="h-full p-2 sm:p-4">
          <div className="flex flex-col items-left justify-between h-full">
            <div className="">
              <span className={`text-md sm:text-lg lg:text-base xl:text-lg font-medium leading-none
                ${isSelected ? 'text-primary-foreground' : 'text-black'}`}>
                {format(date, 'EEE')}
              </span>
              <div className={`-mt-1 text-md sm:text-lg lg:text-base xl:text-lg font-medium leading-none
                ${isSelected ? 'text-primary-foreground' : 'text-black'}`}>
                {format(date, 'MMM d')}
              </div>
            </div>
            
            <div className="text-md sm:text-lg lg:text-base xl:text-lg">
              {availableSlots > 0 ? (
                <span 
                  className={
                    isSelected 
                      ? 'text-primary-foreground' 
                      : isPast 
                        ? 'text-gray-600' 
                        : 'text-primary'
                  }
                >
                  {availableSlots} {availableSlots === 1 ? 'slot' : 'slots'}
                </span>
              ) : (
                <span className={isSelected ? 'text-primary-foreground' : 'text-gray-600'}>
                  Not set
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {disabled && disabledReason && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
          {disabledReason}
        </div>
      )}
    </div>
  );
}