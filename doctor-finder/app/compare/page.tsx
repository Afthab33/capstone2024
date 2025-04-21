'use client';

import React, { useEffect, useState } from "react";
import { useSearchParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../authcontext';
interface Doctor {
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
  rating: number;
  reviewCount?: number;
  profileImage?: string;
}

const CompareDoctorsPage = () => {
  const searchParams = useSearchParams();
  const doctor1Id = searchParams.get('doctor1');
  const doctor2Id = searchParams.get('doctor2');

  const [doctor1, setDoctor1] = useState<Doctor | null>(null);
  const [doctor2, setDoctor2] = useState<Doctor | null>(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      if (!doctor1Id || !doctor2Id) return;

      const firestore = db();
      const doc1Snap = await getDoc(doc(firestore, 'doctors', doctor1Id));
      const doc2Snap = await getDoc(doc(firestore, 'doctors', doctor2Id));

      setDoctor1(doc1Snap.exists() ? (doc1Snap.data() as Doctor) : null);
      setDoctor2(doc2Snap.exists() ? (doc2Snap.data() as Doctor) : null);
    };

    fetchDoctors();
  }, [doctor1Id, doctor2Id]);

  return (
    <div className="container mx-auto px-4 pt-8">
      <h1 className="text-2xl font-bold mb-4">Compare Doctors</h1>
      {doctor1 && doctor2 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[doctor1, doctor2].map((doc, idx) => (
            <div key={idx} className="p-4 bg-gray-100 dark:bg-zinc-800 rounded-lg">
              <h2 className="text-xl font-semibold">
                Dr. {doc.firstName} {doc.lastName}, {doc.degree}
              </h2>
              <p>Clinic: {doc.clinicName}</p>
              <p>Address: {doc.streetAddress}, {doc.city}, {doc.state} {doc.zipCode}</p>
              <p>Specialty: {doc.specialty}</p>
              <p>Rating: {doc.rating} ({doc.reviewCount || 0} reviews)</p>
              <p>Accepted Insurances: {doc.acceptedInsurances?.join(', ')}</p>
              <p>Spoken Languages: {doc.spokenLanguages?.join(', ')}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>Loading doctors...</p>
      )}
    </div>
  );
};

export default CompareDoctorsPage;
