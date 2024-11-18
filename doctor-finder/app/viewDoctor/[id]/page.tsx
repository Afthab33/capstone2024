"use client";

import { use, useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db as getFirebaseDb } from '../../authcontext'; // Import the function to get db
import { useAuth } from '../../authcontext'; // Use the auth context

interface ViewDoctorProps {
  params: Promise<{
    id: string; // Assuming the ID is a string
  }>;
}

const ViewDoctor = ({ params }: ViewDoctorProps) => {
  const { id } = use(params); // Unwrap the params promise using `use()`
  const [doctor, setDoctor] = useState<any>(null); // Use 'any' or define a specific type for doctor
  const { user } = useAuth(); // Use auth context to get the current user
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Specify error type

  useEffect(() => {
    const fetchDoctor = async () => {
      const db = getFirebaseDb(); // Call the function to get the Firestore instance
      const doctorRef = doc(db, 'users', id); // Reference the doctor document
      try {
        const doctorSnap = await getDoc(doctorRef);
        if (doctorSnap.exists()) {
          setDoctor(doctorSnap.data());
        } else {
          console.error(`No doctor found with id: ${id}`);
          setError('Doctor not found');
        }
      } catch (err) {
        console.error('Error fetching doctor:', err);
        setError('Failed to fetch doctor');
      }
      setLoading(false);
    };

    if (user) {
      fetchDoctor(); // Only fetch if the user is authenticated
    } else {
      setLoading(false); // Set loading to false if user is not logged in
    }
  }, [id, user]); // Depend on ID and user state

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>{doctor?.firstName}</h1>
      {/* Render other doctor information here */}
    </div>
  );
};

export default ViewDoctor;
