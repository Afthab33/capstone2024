import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db as getFirebaseDb } from '../authcontext';

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
}

interface DoctorSelectionModalProps {
  //doctors: Doctor[]
  onClose: () => void;
  onSelectDoctor: (doctor: Doctor) => void;
}

const DoctorSelectionModal: React.FC<DoctorSelectionModalProps> = ({ onClose, onSelectDoctor }) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      const db = getFirebaseDb();
      const doctorsCollection = collection(db, 'users');
      const doctorsSnapshot = await getDocs(doctorsCollection);
      const doctorsList = doctorsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Doctor[];
      setDoctors(doctorsList);
    };

    fetchDoctors();
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60">
      <div className="modal-content">
        <h2>Select a Doctor for Comparison</h2>
        <select
          value={selectedDoctor?.id || ''}
          onChange={(e) => {
            const doctor = doctors.find((d) => d.id === e.target.value);
            setSelectedDoctor(doctor || null);
          }}
        >
          <option value="">Select a doctor</option>
          {doctors.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.firstName} {doctor.lastName}
            </option>
          ))}
        </select>
        <button onClick={() => selectedDoctor && onSelectDoctor(selectedDoctor)}>Compare</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default DoctorSelectionModal;