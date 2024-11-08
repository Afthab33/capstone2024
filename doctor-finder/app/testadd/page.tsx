'use client';

import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db as getFirebaseDb } from '../authcontext';

export default function TestAdd() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Function to add a new user to Firestore
  const handleAddUser = async () => {
    setLoading(true);
    try {
      const db = getFirebaseDb();
      const docRef = await addDoc(collection(db, 'testing'), {
        sender: 'Trung',
        receiver: 'LostHospital',
        datetime: new Date(),
      });
      setMessage(`Document added with ID: ${docRef.id}`);
    } catch (error) {
        console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Have to be log in to send or get error due to Firebase Rule I set</h1>
      <h1>Check Firebase db: testing</h1>
      <br />
      <h2>Trung Du</h2>
      <button onClick={handleAddUser} disabled={loading} className="text-red-500">
        {loading ? 'Adding...' : 'Click Me to Add User'}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}
