
'use client';   //client component 

import { useEffect, useState } from 'react';

interface Doctor {
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
}

const ViewAllDoctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch('/api/doctors'); // Call API route
        if (!response.ok) {
          throw new Error('Failed to fetch doctors');
        }
        const data = await response.json();
        setDoctors(data); // Populate the state with the fetched doctors
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError(error.message); // Use error.message if it is an Error instance
        } else {
          setError('An unknown error occurred'); // Fallback for unknown types
        }
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchDoctors();
  }, []);

  if (loading) return <div>Loading...</div>; // Loading state
  if (error) return <div>Error: {error}</div>; // Error state

  return (
    <div>
      <h1>View All Doctors</h1>
      <ul>
        {doctors.map((doctor) => (
          <li key={doctor.id}>
            <h2>{doctor.name}</h2>
            <p>Degree: {doctor.degree}</p>
            <p>Clinic Name: {doctor.clinicName}</p>
            <p>Address: {doctor.streetAddress}, {doctor.city}, {doctor.state} {doctor.zipCode}</p>
            <p>Specialty: {doctor.specialty}</p>
            <p>Accepted Insurances: {doctor.acceptedInsurances.join(', ')}</p>
            <p>Spoken Languages: {doctor.spokenLanguages.join(', ')}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ViewAllDoctors;
