import React from 'react';
import Link from 'next/link';
import { MessageCircleWarning, Users } from 'lucide-react';

interface ActionButtonsProps {
  onReportClick: () => void;
  onCompareClick: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = React.memo(({ onReportClick, onCompareClick }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
      <Link
        href="#report"
        onClick={(e) => {
          e.preventDefault();
          onReportClick();
        }}
        className="flex-1 inline-flex items-center justify-center gap-3 px-6 py-2.5 text-gray-500 bg-gray-100 dark:bg-zinc-900 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_6px_rgba(0,0,0,0.1)]"
      >
        <MessageCircleWarning className="w-6 h-6 md:w-6 md:h-6 lg:w-6 lg:h-6" />
        <span className="text-base text-gray-500 dark:text-gray-400 font-medium">Report Profile</span>
      </Link>
      <Link
       href="#compare"
       onClick={(e) => {
         e.preventDefault();
         onCompareClick();
       }}
       className="flex-1 inline-flex items-center justify-center gap-3 px-6 py-2.5 text-gray-500 bg-gray-100 dark:bg-zinc-900 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
     >
       <Users className="w-6 h-6 md:w-6 md:h-6 lg:w-6 lg:h-6" />
       <span className="text-base text-gray-500 dark:text-gray-400 font-medium">Compare Doctors</span>
      </Link>
    </div>
  );
});

ActionButtons.displayName = 'ActionButtons';

export default ActionButtons;
