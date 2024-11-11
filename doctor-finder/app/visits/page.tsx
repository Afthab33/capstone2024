'use client'
import { useEffect, useState } from "react";
import AppointmentsCard from "../components/AppointmentsCard";
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../authcontext';


interface Appointments {
  nextAvailable: string;
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

export default function AppointmentsHistory() {
  const [appointments, setAppointments] = useState<Appointments[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  useEffect(() => {
    const fetchDoctors = async () => {

      const db = getFirestore();
      //search db for all doctors
      const doctorsQuery = query(collection(db, 'users'), where('role', '==', 'doctor'));

      try {
        const userSnapshot = await getDocs(doctorsQuery);
        const userList: Appointments[] = userSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data() as Omit<Appointments, 'id'> // ensure data matches the doctor interface
        }));
        setAppointments(userList);
      }
      catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to fetch users.');
      }
      finally {
        setLoading(false);// set loading to false after fetching
      }
    }
    if (user) {
      fetchDoctors();//verify user logged in
    }
    else {
      setLoading(false);
    }
  }, [user]);

  if (loading) return <div>Loding...</div>
  if (error) return <div>Error: {error}</div>


  return (
    <>
     
        
      <div className="flex justify-center p-20 ">
        <div className="w-full max-w-7xl mx-auto px-36  ">
        <h1 className="text-2xl font-bold mb-4 text-left">Appointments History </h1>
        <div className="space-y-4">
            {appointments.map((appointment, index) => (
              <AppointmentsCard
                key={index}
                name={appointment.name}
                specialty={appointment.specialty}
                streetAddress={appointment.streetAddress}
                nextAvailable={appointment.nextAvailable}
                city={appointment.streetAddress}
                state={appointment.streetAddress}
                zipCode={appointment.zipCode}
                acceptedInsurances={appointment.acceptedInsurances}
                spokenLanguages={appointment.spokenLanguages}

              />

            ))}
          </div>
        </div>
      </div>

    </>
  )
}
