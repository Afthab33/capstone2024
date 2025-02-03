'use client'
import { useEffect, useState, Suspense } from "react";
import { getFirestore, collection, getDocs, query, where, doc } from 'firebase/firestore';
import { useAuth } from '../authcontext';
import DoctorDescription from "../components/DoctorDescription";
import BookAppointment from "../components/BookAppointment";
import { useSearchParams } from "next/navigation";


interface Doctor {
    nextAvailable: string;
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

    const DoctorDescriptionWrapper = () => {
        const searchParams = useSearchParams();
        
        try {
            const filteredDoctors = doctors.filter((doctor) =>
                doctor.firstName == searchParams.get('firstName') &&
                doctor.lastName == searchParams.get('lastName') &&
                doctor.specialty === searchParams.get('specialty') &&
                doctor.degree === searchParams.get('degree') &&
                doctor.streetAddress == searchParams.get('streetAddress') &&
                doctor.zipCode === searchParams.get('zipCode')
            );
            
            return (
                filteredDoctors.map((doctor, i) => (
                    <div key={i} className="">
                        <DoctorDescription
                            firstName={doctor.firstName}
                            lastName={doctor.lastName}
                            specialty={doctor.specialty}
                            degree={doctor.degree}
                            streetAddress={doctor.streetAddress}
                            city={doctor.city}
                            state={doctor.state}
                            zipCode={doctor.zipCode}
                            acceptedInsurances={doctor.acceptedInsurances}
                            spokenLanguages={doctor.spokenLanguages}
                            previewImage={doctor.previewImage}
                            rating={doctor.rating}
                            reviewCount={doctor.reviewCount}
                        />
                    </div>
                ))
            );
        } catch (error) {
            console.error('Error fetching description:', error);
            setError('Failed to fetch description.');
            return null;
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="flex justify-center items-center gap-x-[25rem] pt-12">
            <Suspense fallback={<div>Loading...</div>}>
                <div>
                    <DoctorDescriptionWrapper />
                </div>
                <div>
                    <BookAppointment />
                </div>
            </Suspense>
        </div>
    );
}
