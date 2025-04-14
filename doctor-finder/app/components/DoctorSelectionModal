import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db as getFirebaseDb } from '../authcontext';

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string;
  gender: string;
}

interface DoctorSelectionModalProps {
  //doctors: Doctor[]
  currentDoctor: Doctor | null; // Allow null
  selectedDoctor: Doctor | null;
  onClose: () => void;
  onSelectDoctor: (doctor: Doctor) => void;
}

const DoctorSelectionModal: React.FC<DoctorSelectionModalProps> = ({ currentDoctor, onClose, onSelectDoctor }) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);

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
    <div>
      <h2>Compare Doctors</h2>
      {currentDoctor ? (
        <div>
          <p>Current Doctor: {currentDoctor.firstName} {currentDoctor.lastName}</p>
        </div>
      ) : (
        <p>No current doctor selected.</p>
      )}
      <ul>
  {doctors.map((doctor) => (
    <li key={doctor.id}>
      <button
        onClick={() => {
          console.log("Selected doctor:", doctor); // Debugging
          onSelectDoctor(doctor);
        }}
      >
        {doctor.firstName} {doctor.lastName}
      </button>
    </li>
  ))}
</ul>
      <button onClick={onClose}>Close</button>
    </div>
  );
};
 
export default DoctorSelectionModal;
