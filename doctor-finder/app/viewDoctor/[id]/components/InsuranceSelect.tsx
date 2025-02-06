import React from 'react';
import { Shield } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface InsuranceSelectProps {
  onValueChange: (value: string) => void;
  showError: boolean;
  value: string;
  acceptedInsurances?: string[];
}

const InsuranceSelect: React.FC<InsuranceSelectProps> = React.memo(({ 
  onValueChange, 
  showError, 
  value,
  acceptedInsurances 
}) => (
  <div className="relative">
    <Select 
      onValueChange={onValueChange}
      value={value}
    >
      <SelectTrigger 
        className={`${showError ? 'border-red-300 border-2' : ''}`}
        variant="grey"
      >
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-blue-500" />
          <SelectValue placeholder="Select Insurance" />
        </div>
      </SelectTrigger>
      <SelectContent variant="grey">
        <SelectItem key="choose-later" variant="grey" value="choose-later">
          I'll choose insurance later
        </SelectItem>
        {acceptedInsurances?.map((insurance: string) => (
          <SelectItem key={insurance} variant="grey" value={insurance}>
            {insurance}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    {showError && (
      <span className="absolute -right-4 top-3 text-red-500 text-lg">*</span>
    )}
  </div>
));

InsuranceSelect.displayName = 'InsuranceSelect';

export default InsuranceSelect;