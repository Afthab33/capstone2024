
'use client';

// add onsnapshot for realtime updates 

import { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, query, where} from 'firebase/firestore';
import { useAuth } from '../authcontext';
import DoctorCard from '../components/doctorCard';

interface Doctor {
  id: string;
  name: string;
  degree: string;
  clinicName: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  specialty: string;
  acceptedInsurances: string[];
  spokenLanguages: string[]; 
}

const ViewAllDoctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();  // check if the user is logged in 

  useEffect(() => {

    const fetchDoctors = async () => {

      const db = getFirestore();
      // search db for all doctors
      const doctorsQuery = query(collection(db, 'users'), where("role", "==", "doctor"));

      try {
        const userSnapshot = await getDocs(doctorsQuery);
        const userList: Doctor[] = userSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data() as Omit<Doctor, 'id'>, // ensure data matches the Doctor interface
        }));
        setDoctors(userList);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to fetch users.');
      }finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    if (user) {
      fetchDoctors(); // verify user is logged in
    } else {
      setLoading(false); // Set loading to false if user is not logged in
    }

  }, [user]);

  if (loading) return <div>Loading...</div>; // Loading state
  if (error) return <div>Error: {error}</div>; // Error state


  return (
    <div className="flex justify-center">
      <div className="w-full max-w-7xl mx-auto px-36">
        <h1 className="text-2xl font-bold mb-4 text-center">View All Doctors</h1>
        <div className="space-y-4">
          {doctors.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              name={doctor.name}
              specialty={doctor.specialty}
              nextAvailable="Next available date here"  // add doctors next available date
              clinicName={doctor.clinicName}
              streetAddress={doctor.streetAddress}
              city={doctor.city}
              state={doctor.state}
              zipCode={doctor.zipCode}
              acceptedInsurances={doctor.acceptedInsurances}
              spokenLanguages={doctor.spokenLanguages}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViewAllDoctors;
