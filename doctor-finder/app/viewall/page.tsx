
'use client';

// add onsnapshot for realtime updates 

import { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, query, where} from 'firebase/firestore';
import { useAuth } from '../authcontext';
import DoctorCard from '../components/doctorCard';
import DoctorProfileImage from "../viewDoctor/[id]/components/DoctorProfileImage";
import DoctorComparison from "../components/DoctorComparison";

interface Doctor {
  key: string;
  id: string;
  firstName: string;
  lastName: string;
  degree: string;
  clinicName: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  specialty: string;
  profileImage: string;
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
    <div className="flex justify-center p-4">
      <div className="w-full max-w-7xl mx-auto px-36">
        <h1 className="text-2xl font-bold mb-4 text-center">All Doctors</h1>
        <div className="space-y-4">
          {doctors.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              id= {doctor.id}
              firstName={doctor.firstName}
              lastName={doctor.lastName}
              degree={doctor.degree}
              specialty={doctor.specialty}
              nextAvailable="Next available date here"  // add doctors next available date
              clinicName={doctor.clinicName}
              streetAddress={doctor.streetAddress}    // not used yet 
              city={doctor.city}
              state={doctor.state}
              zipCode={doctor.zipCode}
              profileImage={doctor.profileImage}
              acceptedInsurances={doctor.acceptedInsurances}
              spokenLanguages={doctor.spokenLanguages}
            />
          ))}
          </div>
        {/* the button for comparing doctors*/}
        <div className="text-center mt-6">
        <Link href="/compare" passHref>
          <button className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-600 transition">
            Compare Doctors
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ViewAllDoctors;
