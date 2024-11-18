"use client"

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db as getFirebaseDb  } from '../../authcontext'; // Import the function to get db
import { useAuth } from '../../authcontext'; // Use the auth context

interface ViewDoctorProps {
  params: {
    id: string; // Assuming the ID is a string
  };
}

const ViewDoctor = ({ params }: ViewDoctorProps) => {
  const { id } = params; // Get the doctor ID from URL params
  const [doctor, setDoctor] = useState<any>(null); // Use 'any' or define a specific type for doctor
  const { user } = useAuth(); // Use auth context to get the current user
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Specify error type

  useEffect(() => {
    const fetchDoctor = async () => {
      const db = getFirebaseDb(); // Call the function to get the Firestore instance
      const doctorRef = doc(db, 'users', id); // Reference the doctor document
      const doctorSnap = await getDoc(doctorRef); // Fetch the document

      if (doctorSnap.exists()) {
        setDoctor(doctorSnap.data()); // Store doctor data
      } else {
        setError('Doctor not found');
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
      <h1>{doctor?.name}</h1>
      {/* Render other doctor information here */}
    </div>
  );
};

export default ViewDoctor;
