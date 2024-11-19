'use client'
import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../authcontext';
import DoctorDescription from "../components/DoctorDescription";
import BookAppointment from "../components/BookAppointment";

interface Doctor {
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
    previewImage?: string | null;
    rating?: number;
    reviewCount?: number;
}

export default function Appointments() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
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
                const userList: Doctor[] = userSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data() as Omit<Doctor, 'id'> // ensure data matches the doctor interface
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



            <div className="flex  justify-center items-stretch gap-2 col ">
                <div className="w-full">
                    <DoctorDescription
                        name={"Bob Ross"}
                        specialty={"Art"}
                        degree="MD"
                        streetAddress={"301 Maple St"}
                        city={"Denton"} state={" Tx"}
                        zipCode={"75906"}
                        acceptedInsurances={['xyy']}
                        spokenLanguages={['abc']}
                        previewImage={''}
                        rating={4.95}
                        reviewCount={144}

                    />
                </div>


                <div className="w-full">
                    
                        <BookAppointment />
                    
                </div>
            </div>
        </>
    )
}
