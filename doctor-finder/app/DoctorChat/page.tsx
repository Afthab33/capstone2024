// DoctorChat/page.tsx
// Note: made dynamic so not need change .envlocal to NEXT_PUBLIC_ (pain)
// Note: made so not need change authcontext.tsx better to just make one page dynamic vs static
'use client';

import React, { useEffect, useState } from "react";
// import { app, db2 as firestore } from "../authcontext";	// omg confusing, must rm, auth 1x only
import { useRouter } from "next/navigation";
import UserChat from "../components/UserChat";	// omg can't use User/Users from lucidchart library		
import ChatRoom from "../components/ChatRoom";
// import { toast } from 'react-hot-toast';

// Firebase imports for dynamic
import { onAuthStateChanged, User as FirebaseUser, getAuth } from 'firebase/auth';
import { doc, getDoc, Firestore } from 'firebase/firestore';

// Define types for user and chatroom data
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage: string;
}

interface Chatroom {
  id: string;
  myData: User;
  otherData: User;
}

export default function DoctorChat() {
  const [user, setUser] = useState<User | null>(null);
  const [auth, setAuth] = useState<any>(null);
  const [firestore, setFirestore] = useState<Firestore | null>(null);
  const router = useRouter();
  const [selectedChatroom, setSelectedChatroom] = useState<Chatroom | null>(null);

  // Note: this was change to fix npm run build error to make static->dynamic
  useEffect(() => {
    // Dynamically import auth and firestore from authcontext
    import("../authcontext").then(({ auth2, db2 }) => {
      setAuth(auth2);
      setFirestore(db2);

      // Set up authentication listener once auth is loaded
      const unsubscribe = auth2 && onAuthStateChanged(auth2, async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          const docRef = doc(db2, 'users', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
              const data = { id: docSnap.id, ...docSnap.data() } as User;
              setUser(data);
          } else {
            console.log('No such document!');
          }
        } else {
          setUser(null);
          // DEBUG: Error w/ signout prob go away when put this as login feature only
          // OR could just remove this toast message : )
          // toast.error('Please sign in before sending a message to a doctor', { position: 'top-center' });
          router.push('/');
        }
      });

      return () => unsubscribe && unsubscribe();
    });
  }, [router]);

  if (user == null) return (<div className='text-4xl'>Loading...</div>);

  return (
    <div className="flex h-screen">
      <div className="flex-shrink-0 w-3/12">
        <UserChat userData={user} setSelectedChatroom={setSelectedChatroom} />
      </div>
      <div className="flex-grow w-9/12">
        {
          selectedChatroom ? (
            <ChatRoom user={user} selectedChatroom={selectedChatroom} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-2xl text-gray-400">Select a chatroom</div>
            </div>
          )
        }
      </div>
    </div>
  );
}