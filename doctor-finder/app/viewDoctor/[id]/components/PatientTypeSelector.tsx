import React from 'react';

interface PatientTypeSelectorProps {
  patientType: 'new' | 'returning' | null;
  onSelect: (type: 'new' | 'returning') => void;
  showError: boolean;
}

const PatientTypeSelector: React.FC<PatientTypeSelectorProps> = React.memo(({ 
  patientType, 
  onSelect, 
  showError 
}) => {
  return (
    <div className="relative">
      <div className={`mt-4 grid grid-cols-2 bg-gray-100 dark:bg-zinc-800 rounded-lg overflow-hidden ${
        showError ? 'border-red-300 dark:border-red-800 border-2' : ''
      }`}>
        <button 
          onClick={() => onSelect('new')}
          className={`py-4 md:py-6 lg:py-12 px-4 sm:px-6 transition-colors flex items-center justify-center border-r border-gray-200 dark:border-zinc-700 ${
            patientType === 'new' ? 'bg-gray-200 dark:bg-zinc-700' : 'hover:bg-gray-200 dark:hover:bg-zinc-700'
          } ${showError ? 'border-red-300 dark:border-red-800' : ''}`}
        >
          <div className="flex items-center gap-3 sm:gap-4">
            {patientType === 'new' && (
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 dark:text-gray-400 flex-shrink-0" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M5 13l4 4L19 7"></path>
              </svg>
            )}
            <div className={`font-medium text-center ${patientType === 'new' ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
              <span className="block xl:inline">New</span>
              <span className="block xl:inline xl:ml-1">Patient</span>
            </div>
          </div>
        </button>
        <button 
          onClick={() => onSelect('returning')}
          className={`py-4 md:py-6 lg:py-12 px-4 sm:px-6 transition-colors flex items-center justify-center ${
            patientType === 'returning' ? 'bg-gray-200 dark:bg-zinc-700' : 'hover:bg-gray-200 dark:hover:bg-zinc-700'
          } ${showError ? 'border-red-300 dark:border-red-800' : ''}`}
        >
          <div className="flex items-center gap-3 sm:gap-4">
            {patientType === 'returning' && (
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 dark:text-gray-400 flex-shrink-0" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M5 13l4 4L19 7"></path>
              </svg>
            )}
            <div className={`font-medium text-center ${patientType === 'returning' ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
              <span className="block xl:inline">Returning</span>
              <span className="block xl:inline xl:ml-1">Patient</span>
            </div>
          </div>
        </button>
      </div>
      {showError && (
        <span className="absolute -right-4 top-3 text-red-500 dark:text-red-800 text-lg">*</span>
      )}
    </div>
  );
});

PatientTypeSelector.displayName = 'PatientTypeSelector';

export default PatientTypeSelector;