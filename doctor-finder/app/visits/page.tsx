'use client'
import { useEffect, useState } from "react";
import AppointmentsCard from "../components/AppointmentsCard";
import { collection, getDocs, query, where, Timestamp, orderBy } from 'firebase/firestore';
import { useAuth } from '../authcontext';
import { db as getFirebaseDb } from '../authcontext';

interface AppointmentHistoryprops {
  id: string;
  doctorId: string;
  datetime: Timestamp;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
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
   coordinates?: {
    lat: number;
    lng: number;
  };
  patientInfo:{
    name:string;
    email:string;
  }
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
      ,where('patientId','==',user?.uid)
      , where('status', '==', 'scheduled')
      , where('datetime', '<=', ts)
      , orderBy('datetime', 'desc')
        
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
              <div key={index}> 
              <AppointmentsCard
                id={appointment.id}
                doctorInfo={appointment.doctorInfo}
                visitDetails={appointment.visitDetails}
                datetime={appointment.datetime}
                doctorId={appointment.doctorId}
                status={appointment.status}
                coordinates={appointment.coordinates}
                patientInfo={appointment.patientInfo}
              />
                {index < appointments.length - 1 && (
                  <div className="border-b border-gray-200 dark:border-zinc-800 my-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

    </>
  )
}



