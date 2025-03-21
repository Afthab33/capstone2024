'use client'
import { useEffect, useState } from "react";
import AppointmentsCard from "../components/AppointmentsCard";
import { getFirestore, collection, getDocs, query, where, Timestamp, orderBy } from 'firebase/firestore';
import { useAuth } from '../authcontext';
import { db as getFirebaseDb } from '../authcontext';


interface AppointmentHistoryprops {
  
  id: string;
  doctorId: string;
  patientId: string;
  acceptedInsurances: string[];
  spokenLanguages: string[];
  rating?: number;
  reviewCount?: number;
  datetime: Timestamp;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  availability: {
    [date: string]: string[];
  };
  doctorInfo: {
    name: string;
    specialty: string;
    degree: string;
    location: string;
  };
  visitDetails: {
    reason: string;
    insurance: string;
    patientType: 'new' | 'returning';
    notes?: string;
  };
  patientInfo: {
    name: string;
    email: string;
  };
}

export default function AppointmentsHistory() {
  const [appointments, setAppointments] = useState<AppointmentHistoryprops[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAppointments = async () => {

      const ts = Timestamp.now();

      const db = getFirebaseDb();

      //find doctor and clinic patient has booked 
      const appointmentsQuery = query(collection(db, 'appointments')
      // ,where('status','==','complete')
      ,where('status','==','scheduled') 
      ,where('datetime','<=',ts)
      ,orderBy('datetime','desc')

      );

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
                doctorInfo={appointment.doctorInfo}
                patientInfo={appointment.patientInfo}
                visitDetails={appointment.visitDetails}
                datetime={appointment.datetime}
                availability={appointment.availability}
                acceptedInsurances={appointment.acceptedInsurances}
                spokenLanguages={appointment.spokenLanguages}
                rating={appointment.rating}
                reviewCount={appointment.reviewCount}
                doctorId={appointment.doctorId}
                patientId={appointment.patientId}
                status={appointment.status}
              />

            ))}
          </div>
        </div>
      </div>

    </>
  )
}



