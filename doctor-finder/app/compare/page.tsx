'use client';

import React, { useEffect, useState } from "react";
import DoctorComparison from "../components/DoctorComparison";
import { collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore';
import { initializeFirebase, db as getFirebaseDb } from '../authcontext';

interface Doctor {
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
  rating?: number;
  reviewCount?: number;
  profileImage?: string;
  availability?: {
    [date: string]: string[];
  };
}


export default function CompareDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctor1, setDoctor1] = useState<Doctor | null>(null);
  const [doctor2, setDoctor2] = useState<Doctor | null>(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      const db = getFirebaseDb();
      const doctorsCollection = collection(db, 'doctors');
      const querySnapshot = await getDocs(doctorsCollection);
      const doctors = querySnapshot.docs.map((doc) => doc.data() as Doctor);
      setDoctors(doctors);
    };
    fetchDoctors();
    if (doctors.length > 0) {
      setDoctor1(doctors[0]);
      setDoctor2(doctors[1]);
    }
  }, [doctors]);

  return (
    <div>
      <h1>Doctor Comparisons soon.</h1>
      {doctor1 && doctor2 && (
        <DoctorComparison doctor1={doctor1} doctor2={doctor2} />
      )}
    </div>
  );
}

