import { NextResponse } from 'next/server';
import { fetchDoctorsFromFirestore } from '../../../lib/firestore';
import { db as getFirebaseDb } from '../../authcontext';

export async function GET() {
  try {
    const db = getFirebaseDb();
    console.log('Fetching doctors from Firestore...');
    const doctors = await fetchDoctorsFromFirestore(db); // Pass db to fetch function
    console.log('Fetched doctors:', doctors);  // Log fetched data
    return NextResponse.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);  // Log the error
    return NextResponse.json({ error: 'Failed to fetch doctors' }, { status: 500 });
  }
}
