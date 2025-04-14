'use client';

import React, { useEffect, useState } from "react";

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
  rating: number;
  reviewCount?: number;
  profileImage?: string;
}

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
    profileImage: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgH...",
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
    profileImage: "",
  },
  {
    id: "testingDoctor",
    firstName: "Testing",
    lastName: "Doctor",
    degree: "MD",
    clinicName: "Testing Clinic",
    streetAddress: "600 Skinner St",
    city: "Denton",
    state: "TX",
    zipCode: "76205",
    specialty: "Dermatology",
    acceptedInsurances: ["UnitedHealthcare", "Humana", "Centene", "Health Net"],
    spokenLanguages: ["Arabic", "Spanish", "Bengali", "German"],
    rating: 3,
    reviewCount: 3,
    profileImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTghC7GVnjDEQmGyr1UaF6-ALGZucP0m0Z1Cg&s",
  },
  {
    id: "asianIntelligence",
    firstName: "Asian",
    lastName: "Intelligence",
    degree: "MD",
    clinicName: "AI Clinic",
    streetAddress: "1800 W CHESTNUT",
    city: "Denton",
    state: "TX",
    zipCode: "76203",
    specialty: "Neurology",
    acceptedInsurances: ["UnitedHealthcare", "Aetna", "Humana", "Kaiser Permanente"],
    spokenLanguages: ["English", "Arabic", "Russian", "Vietnamese", "Italian"],
    rating: 0,
    reviewCount: 0,
    profileImage: "https://firebasestorage.googleapis.com/v0/b/dfdatabase-c1532.appspot.com/o/doctor-profiles%2FGen9YWpyfdVX8Sl23GNe84f5gl72%2Fwtf2.png?alt=media&token=99734057-76e5-4df5-a80b-35ceebbc57b8",
  },
];

const CompareDoctorsPage = () => {
  const [doctor1, setDoctor1] = useState<Doctor | null>(null);
  const [doctor2, setDoctor2] = useState<Doctor | null>(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const doctor1Id = queryParams.get("doctor1");
    const doctor2Id = queryParams.get("doctor2");

    const doc1 = hardcodedDoctors.find((doc) => doc.id === doctor1Id);
    const doc2 = hardcodedDoctors.find((doc) => doc.id === doctor2Id);

    setDoctor1(doc1 || null);
    setDoctor2(doc2 || null);
  }, []);

  return (
    <div className="container mx-auto px-4 pt-8">
      <h1 className="text-2xl font-bold mb-4">Compare Doctors</h1>
      {doctor1 && doctor2 ? (
        <div className="grid grid-cols-2 gap-4">
          {/* Doctor 1 */}
          <div className="p-4 bg-gray-100 dark:bg-zinc-800 rounded-lg">
            <h2 className="text-xl font-semibold">
              Dr. {doctor1.firstName} {doctor1.lastName}, {doctor1.degree}
            </h2>
            <p>Clinic: {doctor1.clinicName}</p>
            <p>Address: {doctor1.streetAddress}, {doctor1.city}, {doctor1.state} {doctor1.zipCode}</p>
            <p>Specialty: {doctor1.specialty}</p>
            <p>Rating: {doctor1.rating} ({doctor1.reviewCount} reviews)</p>
            <p>Accepted Insurances: {doctor1.acceptedInsurances.join(", ")}</p>
            <p>Spoken Languages: {doctor1.spokenLanguages.join(", ")}</p>
          </div>

          {/* Doctor 2 */}
          <div className="p-4 bg-gray-100 dark:bg-zinc-800 rounded-lg">
            <h2 className="text-xl font-semibold">
              Dr. {doctor2.firstName} {doctor2.lastName}, {doctor2.degree}
            </h2>
            <p>Clinic: {doctor2.clinicName}</p>
            <p>Address: {doctor2.streetAddress}, {doctor2.city}, {doctor2.state} {doctor2.zipCode}</p>
            <p>Specialty: {doctor2.specialty}</p>
            <p>Rating: {doctor2.rating} ({doctor2.reviewCount} reviews)</p>
            <p>Accepted Insurances: {doctor2.acceptedInsurances.join(", ")}</p>
            <p>Spoken Languages: {doctor2.spokenLanguages.join(", ")}</p>
          </div>
        </div>
     ) : (
      <div className="grid grid-cols-2 gap-4">
      <div className="p-4 bg-gray-100 dark:bg-zinc-800 rounded-lg">
        <h2 className="text-xl font-semibold">Dr. Butt Pain, MA</h2>
        <p>Clinic: Heaven Dr</p>
        <p>Address: 501 Newton St, Denton, TX 76205</p>
        <p>Specialty: Internal Medicine</p>
        <p>Rating: 3.5 (2 reviews)</p>
        <p>Accepted Insurances: Health Net, Molina Healthcare</p>
        <p>Spoken Languages: Mandarin, Spanish, English</p>
      </div>
      <div className="p-4 bg-gray-100 dark:bg-zinc-800 rounded-lg">
        <h2 className="text-xl font-semibold">Dr. Another Ellison, MD</h2>
        <p>Clinic: Example Clinic</p>
        <p>Address: 2501 E University Dr, Denton, TX 76209</p>
        <p>Specialty: Physical Therapy</p>
        <p>Rating: 0 (0 reviews)</p>
        <p>Accepted Insurances: UnitedHealthcare, WellCare, Amerigroup, CareSource, Tricare</p>
        <p>Spoken Languages: Bengali, Japanese, Spanish, Arabic</p>
      </div>
    </div>
  )}
</div>
);
};

export default CompareDoctorsPage;
