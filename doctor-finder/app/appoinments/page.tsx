'use client'
import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs, query, where, doc } from 'firebase/firestore';
import { useAuth } from '../authcontext';
import DoctorDescription from "../components/DoctorDescription";
import BookAppointment from "../components/BookAppointment";

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

    const description = () => {
        {

            const filteredDoctors = doctors.filter((doctor) =>
                doctor.id === doctor.id &&
                doctor.firstName == "Doctor" &&
                doctor.lastName == "Ellison" &&
                doctor.specialty === "Psychiatry" &&
                doctor.degree === "MD" &&
                doctor.streetAddress === "515 Cattail Circle" &&
                doctor.city === "Harker Heights" &&
                doctor.state === "TX" &&
                doctor.zipCode === "76548"
            )
            return (

                filteredDoctors.map((doctor, i) => {
                    return (<div key={i} className="">
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
                            previewImage={''}
                            rating={doctor.rating}
                            reviewCount={doctor.reviewCount}

                        />
                    </div>)
                })
            )
        }
    }


    return (
        <>


            <div className="flex items-center flex-wrap md:flex-nowrap p-8">
                <div >
                    {description()}
                </div>
                <div >
                    <BookAppointment />
                </div>
            </div>
        </>
    )
}
