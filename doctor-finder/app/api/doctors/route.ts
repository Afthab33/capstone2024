import { NextResponse } from 'next/server';
import { fetchDoctorsFromFirestore } from '../../../lib/firestore';
import { db as getFirebaseDb } from '../../authcontext';

export async function GET() {
  try {
    const db = getFirebaseDb();
    const doctors = await fetchDoctorsFromFirestore(db); // Pass db to fetch function
    return NextResponse.json(doctors);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch doctors' }, { status: 500 });
  }
}
