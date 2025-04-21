import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../authcontext';
import { MessageCircleWarning, Users } from 'lucide-react';

interface ActionButtonsProps {
  onReportClick: () => void;
  onCompareClick: (doctorId: string) => void;
  currentDoctorId: string;
}

const ActionButtons: React.FC<ActionButtonsProps> = React.memo(({ onReportClick, currentDoctorId }) => {
const [doctors, setDoctors] = useState<{ id: string; name: string }[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
      const fetchDoctors = async () => {
        try {
          const firestore = db(); 
          const doctorsCollection = collection(firestore, 'doctors'); 
          const doctorsSnapshot = await getDocs(doctorsCollection);
          const doctorsList = doctorsSnapshot.docs.map((doc) => ({
            id: doc.id,
            name: `${doc.data().firstName} ${doc.data().lastName}`,
            ...doc.data(),
          })) as { id: string; name: string }[];
          console.log('Fetched doctors from Firestore:', doctorsList); 
          setDoctors(doctorsList);
        } catch (error) {
          console.error('Failed to fetch doctors from Firestore:', error);
        }
      };
  
      fetchDoctors();
    }, []);
  
    const handleModalToggle = () => {
      setModalOpen((prev) => !prev);
    };
  
    const handleDoctorSelect = (doctorId: string) => {
      setModalOpen(false);
      router.push(`/compare?doctor1=${currentDoctorId}&doctor2=${doctorId}`);
    };
  
  
  
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
      <button
        onClick={handleModalToggle}
        className="flex-1 inline-flex items-center justify-center gap-3 px-6 py-2.5 text-gray-500 bg-gray-100 dark:bg-zinc-900 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_6px_rgba(0,0,0,0.1)]"
      >
        <Users className="w-6 h-6 md:w-6 md:h-6 lg:w-6 lg:h-6" />
        <span className="text-base text-gray-500 dark:text-gray-400 font-medium">Comparee Doctors</span>
      </button>

      {modalOpen && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 pointer-events-auto">
    <div
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
    ></div>
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg w-full max-w-lg p-6 relative pointer-events-auto">
      <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Select a Doctor</h3>
      <button
        onClick={handleModalToggle}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        ✕
      </button>
      <div className="max-h-64 overflow-y-auto">
        {doctors.length > 0 ? (
          <ul className="space-y-2">
            {doctors.map((doctor) => (
              <li key={doctor.id}>
                <button
                  onClick={() => handleDoctorSelect(doctor.id)}
                  className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-zinc-800 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  {doctor.name}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No doctors available</p>
        )}
      </div>
    </div>
  </div>
)}
    </div>
  );
});

ActionButtons.displayName = 'ActionButtons';

export default ActionButtons;
