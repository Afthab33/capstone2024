'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import {  initializeFirebase, db as getFirebaseDb } from '../authcontext';
import { getApp, initializeApp } from 'firebase/app';

const SearchPage = () => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('query');

  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (searchQuery) {
      const fetchDoctors = async () => {
        setLoading(true);
        setError('');

        try {

          await initializeFirebase();   // err getting db if this is removed

          const db = getFirebaseDb();

          console.log("Search Query:", searchQuery);    // debug

          console.log("DB instance:", db);    // debug

          const doctorsRef = collection(db, 'users');

          //const q = query(doctorsRef, where('firstName', '==', searchQuery));

          const q = query(
            doctorsRef,
            where('firstName', '>=', searchQuery),
            where('firstName', '<=', searchQuery + '\uf8ff') 
          );        // add more wheres 

          const querySnapshot = await getDocs(q);

          const doctorData = querySnapshot.docs.map(doc => doc.data());
          
          setDoctors(doctorData);
        } catch (err) {
          setError('Error fetching doctors.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchDoctors();
    }
  }, [searchQuery]); // Rerun when searchQuery changes

  return (
    <div>
      <h1>Search Results</h1>

      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {doctors.length === 0 && !loading && <p>No doctors found.</p>}

      <ul>
        {doctors.map((doctor, index) => (
          <li key={index}>{doctor.firstName}</li>
        ))}
      </ul>
    </div>
  );
};

export default SearchPage;
