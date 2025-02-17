'use client';

import { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../authcontext';

export default function UserList() {
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const { user } = useAuth();                                                                   // Check if user is logged in

  // Search filter states
  const [searchSpecialty, setSearchSpecialty] = useState('');
  const [selectedInsurance, setSelectedInsurance] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  // Hardcoded options
  /* DEBUG this section later... search DEBUG on this page*/
  const insuranceOptions = ["Aetna", "BlueCross", "Cigna", "UnitedHealthcare", "Humana", "Molina Healthcare", "Health Net", "Other Asian Insurances"];
  const cityOptions = ["Denton", "Dallas", "Lewisville"];

  // Function to fetch users (triggered by button)
  const fetchUsers = async () => {
    if (!user) return;                                                                        // Ensure user is logged in

    try {
      const db = getFirestore();
      const usersCollection = collection(db, 'users');

      // Base query: Find all doctors, super important so doesn't search patients/clients
      let usersQuery = query(usersCollection, where("role", "==", "doctor"));

      // Apply filters if selected
      if (searchSpecialty.trim()) {
        usersQuery = query(usersQuery, where("speciality", "==", searchSpecialty.trim()));
      }
      if (selectedInsurance) {
        usersQuery = query(usersQuery, where("acceptedInsurances", "array-contains", selectedInsurance));
      }
      if (selectedCity) {
        usersQuery = query(usersQuery, where("city", "==", selectedCity));
      }

      // Fetch data
      const userSnapshot = await getDocs(usersQuery);
      const userList = userSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUsers(userList);
      setError('');
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users.');
    }
  };

  return (
    <div className="p-6">
      {/* Search Bar UI */}
      <div className="bg-white shadow-md p-4 mb-6 rounded-md">
        <h3 className="text-lg font-semibold mb-2">Search For Doctors Bro.... DU need decorate better checking functionality</h3>
        
        <div className="flex gap-4">
          {/* Specialty Search Input */}
          <input
            type="text"
            placeholder="Search by specialty..."
            className="border p-2 rounded-md w-1/4"
            value={searchSpecialty}
            onChange={(e) => setSearchSpecialty(e.target.value)}
          />

          {/* Insurance Dropdown */}
          <select
            className="border p-2 rounded-md w-1/4"
            value={selectedInsurance}
            onChange={(e) => setSelectedInsurance(e.target.value)}
          >
            <option value="">Choose Insurance</option>
            {insuranceOptions.map((insurance, index) => (
              <option key={index} value={insurance}>{insurance}</option>
            ))}
          </select>

          {/* City Dropdown */}
          <select
            className="border p-2 rounded-md w-1/4"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
          >
            <option value="">Choose City</option>
            {cityOptions.map((city, index) => (
              <option key={index} value={city}>{city}</option>
            ))}
          </select>

          {/* Search Button */}
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-md w-1/4"
            onClick={fetchUsers}                                                      // Trigger search manually
          >
            Search
          </button>
        </div>
      </div>

      {/* DEBUG this section later... search DEBUG on this page*/}
      {/* Display Users steal component codes from other group mates to make this look better*/}
      <h5 className="text-xl font-semibold mb-3">Users List:</h5>
      {error && <p className="text-red-500">{error}</p>}

      <ul>
        {users.map(user => (
          <li key={user.id} className="border p-4 mb-4 rounded-md shadow-sm">
            <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
            <p><strong>Sex:</strong> {user.sex}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Street Address:</strong> {user.streetAddress}</p>
            <p><strong>City:</strong> {user.city}</p>
            <p><strong>State:</strong> {user.state}</p>
            <p><strong>Zip Code:</strong> {user.zipCode}</p>
            <p><strong>Speciality:</strong> {user.speciality}</p>
            <p><strong>Degree:</strong> {user.degree}</p>
            <p><strong>Clinic Name:</strong> {user.clinicName}</p>

            <p><strong>Accepted Insurances:</strong></p>
            <ul>
              {user.acceptedInsurances?.map((insurance: string, index: number) => (
                <li key={index}>{insurance}</li>
              ))}
            </ul>

            <p><strong>Spoken Languages:</strong></p>
            <ul>
              {user.spokenLanguages?.map((language: string, index: number) => (
                <li key={index}>{language}</li>
              ))}
            </ul>

            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Rating:</strong> {user.rating}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}