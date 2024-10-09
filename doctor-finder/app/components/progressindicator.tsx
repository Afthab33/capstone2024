import React from 'react';

interface ProgressIndicatorProps {
  totalSteps: number;
  currentStep: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ totalSteps, currentStep }) => {
  return (
    <div className="flex items-center space-x-1">
      {[...Array(totalSteps)].map((_, index) => (
        <div
          key={index}
          className={`w-2 h-2 rounded-full ${
            index < currentStep ? 'bg-primary' : 'bg-gray-300'
          }`}
        />
      ))}
    </div>
  );
};

export default ProgressIndicator;
