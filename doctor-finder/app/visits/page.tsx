'use client'
import { useEffect, useState } from "react";
import AppointmentsCard from "../components/AppointmentsCard";
import { getFirestore, collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { useAuth } from '../authcontext';
 
interface AppointmentHistoryprops {
  firstName: string;
  lastName: string;
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
  rating?: number;
  reviewCount?: number;
  scheduled:Timestamp;
}

export default function AppointmentsHistory() {
  const [appointments, setAppointments] = useState<AppointmentHistoryprops[]>([]);
  const [doctors, setDoctors] = useState<AppointmentHistoryprops[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();



  useEffect(() => {
    const fetchAppointments = async () => {
      
      const ts = Timestamp.now();

      const db2 = getFirestore();
      
      //find doctor and clinic patient has booked 
      const appointmentsQuery = query(collection(db2, 'appointmentsTest'), where('scheduled', '<=', ts));

      try {
        const userSnapshot = await getDocs(appointmentsQuery);
        const userList: AppointmentHistoryprops[] = userSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data() as Omit<AppointmentHistoryprops, 'id'> // ensure data matches the appointments interface
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
      fetchAppointments();//verify user logged in
    }
    else {
      setLoading(false);
    }
  }, [user]);



  useEffect(() => {
    const fetchDoctors = async () => {

      const db = getFirestore();
      //search db for all doctors
      const doctorQuery = query(collection(db, 'users'), where("role", "==", "doctor"));

      try {
        const userSnapshot = await getDocs(doctorQuery);
        const userList: AppointmentHistoryprops[] = userSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data() as Omit<AppointmentHistoryprops, 'id'> // ensure data matches the doctor interface


        }));
        setDoctors(userList);
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
                id={appointment.id}
                scheduled={appointment.scheduled}
                firstName={appointment.firstName}
                lastName={appointment.lastName}
                degree={appointment.degree}
                specialty={appointment.specialty}
                clinicName={appointment.clinicName}
                streetAddress={appointment.streetAddress}
                nextAvailable={appointment.nextAvailable}
                city={appointment.streetAddress}
                state={appointment.streetAddress}
                zipCode={appointment.zipCode}
                // acceptedInsurances={[ ]}
                // spokenLanguages={[ ]}
                acceptedInsurances={appointment.acceptedInsurances}
                spokenLanguages={appointment.spokenLanguages}
                rating={appointment.rating}
                reviewCount={appointment.reviewCount}
              />

            ))}
          </div>
        </div>
      </div>

    </>
  )
}


