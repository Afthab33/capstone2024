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

    if (loading) return <div>Loding...</div>
    if (error) return <div>Error: {error}</div>


    const bookedCardAnddescription = () => {
        const searchParams = useSearchParams();

        // filter doctors to find match from list 
        const filteredDoctors = doctors.filter((doctor) =>
            doctor.id === doctor.id &&
            doctor.firstName == searchParams.get('firstName') &&
            doctor.lastName == searchParams.get('lastName') &&
            doctor.specialty === searchParams.get('specialty') &&
            doctor.degree === searchParams.get('degree') &&
            doctor.streetAddress == searchParams.get('streetAddress') &&
            //  doctor.city == searchParams.get('city') &&
            // doctor.state === searchParams.get('state')&& 
            doctor.zipCode === searchParams.get('zipCode')
        )
        return (
            filteredDoctors.map((doctor, i) => {
                return (<div key={i} className="flex justify-center items-center gap-x-[25rem] pt-12">
                    {/* set doctor description appointment */}
                    <div>
                    <DoctorDescription
                        firstName={doctor.firstName}
                        lastName={doctor.lastName}
                        specialty={doctor.specialty}
                        degree={doctor.degree}
                        streetAddress={doctor.streetAddress}
                        city={doctor.city} state={doctor.state}
                        zipCode={doctor.zipCode}
                        acceptedInsurances={doctor.acceptedInsurances}
                        spokenLanguages={doctor.spokenLanguages}
                        previewImage={doctor.previewImage}
                        rating={doctor.rating}
                        reviewCount={doctor.reviewCount}

                    />
                    </div>
                    <div>
                    <BookAppointment
                        firstName={doctor.firstName}
                        lastName={doctor.lastName}
                        specialty={doctor.specialty}
                        degree={doctor.degree}
                        streetAddress={doctor.streetAddress}
                        city={doctor.city} state={doctor.state}
                        zipCode={doctor.zipCode}
                        acceptedInsurances={doctor.acceptedInsurances}
                        spokenLanguages={doctor.spokenLanguages}
                        // previewImage={doctor.previewImage}
                        rating={doctor.rating}
                        reviewCount={doctor.reviewCount} 
                        nextAvailable={""} 
                        id={doctor.id} 
                        clinicName={doctor.clinicName}
                    />
                    </div>

                </div>)
            })
        )
    }

    

    return (
        <>


            <div>
                {bookedCardAnddescription()}
            </div>
              
        </>
    )
}
