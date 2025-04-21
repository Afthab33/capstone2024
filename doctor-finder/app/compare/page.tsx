'use client';

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../authcontext";
import { Star } from "lucide-react";

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  degree: string;
  specialty: string;
  clinicName?: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  acceptedInsurances: string[];
  spokenLanguages: string[];
  rating: number;
  reviewCount?: number;
  profileImage?: string;
}

const CompareDoctorsPage = () => {
  const [doctor1, setDoctor1] = useState<Doctor | null>(null);
  const [doctor2, setDoctor2] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const doctor1Id = searchParams.get("doctor1");
        const doctor2Id = searchParams.get("doctor2");

        if (!doctor1Id || !doctor2Id) {
          throw new Error("Missing doctor IDs in URL");
        }

        const firestore = db();
        const doctorsCollection = collection(firestore, "doctors");
        const doctorsSnapshot = await getDocs(doctorsCollection);
        
        const allDoctors = doctorsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Doctor[];

        const doc1 = allDoctors.find(doc => doc.id === doctor1Id);
        const doc2 = allDoctors.find(doc => doc.id === doctor2Id);

        if (!doc1 || !doc2) {
          throw new Error("One or both doctors not found");
        }

        setDoctor1(doc1);
        setDoctor2(doc2);
      } catch (error) {
        console.error("Error fetching doctors:", error);
        
        const fallbackDoc1 = hardcodedDoctors.find(doc => doc.id === "buttPain");
        const fallbackDoc2 = hardcodedDoctors.find(doc => doc.id === "anotherEllison");
        setDoctor1(fallbackDoc1 || null);
        setDoctor2(fallbackDoc2 || null);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [searchParams]);

  const renderRatingStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">
          ({rating.toFixed(1)})
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">Loading comparison...</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="p-6 bg-gray-100 dark:bg-zinc-800 rounded-lg animate-pulse">
              <div className="h-8 w-3/4 bg-gray-300 rounded mb-4"></div>
              <div className="space-y-3">
                {[...Array(6)].map((_, j) => (
                  <div key={j} className="h-4 bg-gray-300 rounded w-full"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!doctor1 || !doctor2) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Doctor Comparison</h1>
        <p className="text-red-500">Unable to load doctor comparison data.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Comparing Doctors</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/*First Doctor*/}
        <div className="p-6 bg-white dark:bg-zinc-800 rounded-lg shadow-md">
          <div className="flex items-start gap-4 mb-4">
            {doctor1.profileImage ? (
              <img 
                src={doctor1.profileImage} 
                alt={`${doctor1.firstName} ${doctor1.lastName}`}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-xl">
                  {doctor1.firstName.charAt(0)}{doctor1.lastName.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold">
                {doctor1.degree === 'MD' ? 'Dr.' : ''} {doctor1.firstName} {doctor1.lastName}, {doctor1.degree}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">{doctor1.specialty}</p>
              {doctor1.rating > 0 ? (
                renderRatingStars(doctor1.rating)
              ) : (
                <p className="text-gray-500 text-sm">No ratings yet</p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <h3 className="font-medium text-gray-700 dark:text-gray-300">Clinic</h3>
              <p>{doctor1.clinicName || "Not specified"}</p>
            </div>

            <div>
              <h3 className="font-medium text-gray-700 dark:text-gray-300">Address</h3>
              <p>{doctor1.streetAddress}, {doctor1.city}, {doctor1.state} {doctor1.zipCode}</p>
            </div>

            <div>
              <h3 className="font-medium text-gray-700 dark:text-gray-300">Accepted Insurances</h3>
              <p>
                {doctor1.acceptedInsurances.length > 0 
                  ? doctor1.acceptedInsurances.slice(0, 3).join(", ") + 
                    (doctor1.acceptedInsurances.length > 3 ? ` +${doctor1.acceptedInsurances.length - 3} more` : "")
                  : "Not specified"}
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-700 dark:text-gray-300">Languages</h3>
              <p>
                {doctor1.spokenLanguages.length > 0 
                  ? doctor1.spokenLanguages.slice(0, 3).join(", ") + 
                    (doctor1.spokenLanguages.length > 3 ? ` +${doctor1.spokenLanguages.length - 3} more` : "")
                  : "Not specified"}
              </p>
            </div>
          </div>
        </div>

        {/* Second Doctor*/}
        <div className="p-6 bg-white dark:bg-zinc-800 rounded-lg shadow-md">
          <div className="flex items-start gap-4 mb-4">
            {doctor2.profileImage ? (
              <img 
                src={doctor2.profileImage} 
                alt={`${doctor2.firstName} ${doctor2.lastName}`}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-xl">
                  {doctor2.firstName.charAt(0)}{doctor2.lastName.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold">
                {doctor2.degree === 'MD' ? 'Dr.' : ''} {doctor2.firstName} {doctor2.lastName}, {doctor2.degree}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">{doctor2.specialty}</p>
              {doctor2.rating > 0 ? (
                renderRatingStars(doctor2.rating)
              ) : (
                <p className="text-gray-500 text-sm">No ratings yet</p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <h3 className="font-medium text-gray-700 dark:text-gray-300">Clinic</h3>
              <p>{doctor2.clinicName || "Not specified"}</p>
            </div>

            <div>
              <h3 className="font-medium text-gray-700 dark:text-gray-300">Address</h3>
              <p>{doctor2.streetAddress}, {doctor2.city}, {doctor2.state} {doctor2.zipCode}</p>
            </div>

            <div>
              <h3 className="font-medium text-gray-700 dark:text-gray-300">Accepted Insurances</h3>
              <p>
                {doctor2.acceptedInsurances.length > 0 
                  ? doctor2.acceptedInsurances.slice(0, 3).join(", ") + 
                    (doctor2.acceptedInsurances.length > 3 ? ` +${doctor2.acceptedInsurances.length - 3} more` : "")
                  : "Not specified"}
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-700 dark:text-gray-300">Languages</h3>
              <p>
                {doctor2.spokenLanguages.length > 0 
                  ? doctor2.spokenLanguages.slice(0, 3).join(", ") + 
                    (doctor2.spokenLanguages.length > 3 ? ` +${doctor2.spokenLanguages.length - 3} more` : "")
                  : "Not specified"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


const hardcodedDoctors: Doctor[] = [
  {
    id: "buttPain",
    firstName: "Butt",
    lastName: "Pain",
    degree: "MA",
    clinicName: "Heaven Dr",
    streetAddress: "501 Newton St",
    city: "Denton",
    state: "TX",
    zipCode: "76205",
    specialty: "Internal Medicine",
    acceptedInsurances: ["Health Net", "Molina Healthcare"],
    spokenLanguages: ["Mandarin", "Spanish", "English"],
    rating: 3.5,
    reviewCount: 2,
  },
  {
    id: "anotherEllison",
    firstName: "Another",
    lastName: "Ellison",
    degree: "MD",
    clinicName: "Example Clinic",
    streetAddress: "2501 E University Dr",
    city: "Denton",
    state: "TX",
    zipCode: "76209",
    specialty: "Physical Therapy",
    acceptedInsurances: ["UnitedHealthcare", "WellCare", "Amerigroup", "CareSource", "Tricare"],
    spokenLanguages: ["Bengali", "Japanese", "Spanish", "Arabic"],
    rating: 0,
    reviewCount: 0,
  },
  
];

export default CompareDoctorsPage;
