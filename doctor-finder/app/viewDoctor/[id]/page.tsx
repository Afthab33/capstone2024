"use client";

import { use, useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db as getFirebaseDb } from '../../authcontext';
import { useAuth } from '../../authcontext'; // Use the auth context

interface ViewDoctorProps {
  params: Promise<{
    id: string;
  }>;
}

const ViewDoctor = ({ params }: ViewDoctorProps) => {
  const { id } = use(params); // unwrap 'promise'
  const [doctor, setDoctor] = useState<any>(null);
  const { user } = useAuth(); // Use auth context to get the current user
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctor = async () => {
      const db = getFirebaseDb(); // firestore instance
      const doctorRef = doc(db, 'users', id); // reference doctor based on primary key
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
