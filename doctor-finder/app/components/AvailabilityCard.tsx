import { format } from 'date-fns';
import { Card, CardContent } from "@/components/ui/card";

interface AvailabilityCardProps {
  date: Date;
  isSelected: boolean;
  onSelect: (date: Date) => void;
  availableSlots?: number;
}

export default function AvailabilityCard({ 
  date, 
  isSelected, 
  onSelect,
  availableSlots = 0
}: AvailabilityCardProps) {
  return (
    <Card 
      className={`min-w-[70px] sm:min-w-[100px] h-[130px] sm:h-[130px] cursor-pointer transition-colors duration-200 select-none
        ${isSelected ? 'bg-primary hover:bg-primary/90' : 'hover:bg-gray-50'}`}
      onClick={() => onSelect(date)}
    >
      <CardContent className="h-full py-2 px-0">
        <div className="flex flex-col items-left justify-between h-full pl-2">
          <div className="space-y-[0px] sm:space-y-[-6px]">
            <span className={`text-lg sm:text-lg font-medium leading-none
              ${isSelected ? 'text-primary-foreground' : 'text-black'}`}>
              {format(date, 'EEE')}
            </span>
            <div className={`text-lg sm:text-lg font-medium leading-none
              ${isSelected ? 'text-primary-foreground' : 'text-black'}`}>
              {format(date, 'MMM d')}
            </div>
          </div>
          
          <div className="text-lg sm:text-xl">
            {availableSlots > 0 ? (
              <span className={isSelected ? 'text-primary-foreground' : 'text-primary'}>
                {availableSlots} slots
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
  );
}