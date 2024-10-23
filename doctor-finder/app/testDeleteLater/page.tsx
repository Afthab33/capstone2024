'use client';

import { useEffect, useState } from 'react';    // need use client if use this
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../authcontext';       // need to check if log in or not

export default function UserList() {
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const { user } = useAuth(); // check if the user is logged in

  useEffect(() => {
    const fetchUsers = async () => {
      const db = getFirestore();
      // get whole db
      const usersCollection = collection(db, 'users');
      
      // IMPORTANT: this searches your DB for what you want DU, in this case finds all doctor accounts
      const usersQuery = query(usersCollection, where("role", "==", "doctor"));
      // const usersQuery = query(usersCollection, where("role", "==", "doctor"), where("spokenLanguages", "array-contains", "English"));    // DEBUG

      try {
        // const userSnapshot = await getDocs(usersCollection);           // DEBUG
        const userSnapshot = await getDocs(usersQuery);
        const userList = userSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(userList);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to fetch users.');
      }
    };

    if (user) { // Ensure user is logged in
      fetchUsers();
    }
  }, [user]);

  return (
    <div>
      <h5>Users List:</h5>
      {error && <p className="text-red-500">{error}</p>}
      <ul>
        {users.map(user => (
          <li key={user.id}>
            <br />
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
            {/* ugly DU since these are arrays the bottom fix is better when map out in JS
            <p><strong>Accepted Insurance:</strong> {user.acceptedInsurances}</p>
            <p><strong>Spoken Languages:</strong> {user.spokenLanguages}</p>
            */}
            <p><strong>Accepted Insturances:</strong></p>
            <ul>
              {user.acceptedInsurances && user.acceptedInsurances.map((insurance: string, index: number) => (
                <li key={index}>{insurance}</li>
              ))}
            </ul>
            <p><strong>Spoken Languages:</strong></p>
            <ul>
              {user.spokenLanguages && user.spokenLanguages.map((language: string, index: number) => (
                <li key={index}>{language}</li>
              ))}
            </ul>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Rating:</strong> {user.rating}</p>
            {/* Remove the stuff you not need DU */}
          </li>
        ))}
      </ul>
    </div>
  );
}
