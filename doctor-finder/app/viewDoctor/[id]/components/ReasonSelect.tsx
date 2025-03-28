import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ReasonSelectProps {
  onValueChange: (value: string) => void;
  showError: boolean;
  userSymptoms: string[];
  value: string;
}

const ReasonSelect: React.FC<ReasonSelectProps> = React.memo(({ 
  onValueChange, 
  showError, 
  userSymptoms,
  value
}) => (
  <div className="relative">
    <Select onValueChange={onValueChange} value={value}>
      <SelectTrigger 
        className={`${showError ? 'border-red-300 dark:border-red-800 border-2' : ''}`}
        variant="grey"
      >
        <SelectValue placeholder="Select Reason for Visit" />
      </SelectTrigger>
      <SelectContent variant="grey">
        <SelectItem key="general-checkup" variant="grey" value="General Checkup">
          General Checkup
        </SelectItem>
        {userSymptoms.map((symptom) => (
          <SelectItem key={symptom} variant="grey" value={symptom}>
            {symptom}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    {showError && (
      <span className="absolute -right-4 top-3 text-red-500 dark:text-red-800 text-lg">*</span>
    )}
  </div>
));

ReasonSelect.displayName = 'ReasonSelect';

export default ReasonSelect;