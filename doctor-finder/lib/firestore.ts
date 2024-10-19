import { collection, getDocs, Firestore } from 'firebase/firestore';

interface Doctor {
    id: string;
    name: string;
    specialization: string;
  }
  
  export async function fetchDoctorsFromFirestore(db: Firestore): Promise<Doctor[]> {
    const doctorsCollection = collection(db, 'doctors'); // Reference to the 'doctors' collection in Firestore
    const snapshot = await getDocs(doctorsCollection);
    const doctors: Doctor[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Doctor[];
    return doctors;
  }