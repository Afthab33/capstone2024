// DoctorChat/page.tsx
'use client';

import React, { useEffect, useState } from "react";
import { app, db2 as firestore } from "../authcontext";	// omg confusing	
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import UserChat from "../components/UserChat";		// omg can't use User/Users from lucidchart library	
import ChatRoom from "../components/ChatRoom";
import { toast } from 'react-hot-toast';

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
  const auth = getAuth(app);
  const [user, setUser] = useState<User | null>(null); // Set user type to User | null
  const router = useRouter();
  const [selectedChatroom, setSelectedChatroom] = useState<Chatroom | null>(null); // Set selectedChatroom type to Chatroom | null
  
  useEffect(() => {
    // Use onAuthStateChanged to listen for changes in authentication state
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log(user);
        const docRef = doc(firestore, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = { id: docSnap.id, ...docSnap.data() } as User; // Cast to User type
            setUser(data);
        } else {
          console.log('No such document!');
        }
      } else {
        setUser(null);
        // DEBUG: Error w/ signout prob go away when put this as login feature only
        toast.error('Please sign in before sending a message to a doctor', {
          position: 'top-center',
        });
        router.push('/');
      }
    });
    return () => unsubscribe();
  }, [auth, router]); 
  
  if (user == null) return (<div className='text-4xl'>Loading...</div>);

  return (
    <div className="flex h-screen">
      {/* Left side users */}
      <div className="flex-shrink-0 w-3/12">
        <UserChat userData={user} setSelectedChatroom={setSelectedChatroom} />
      </div>

      {/* Right side chat room */}
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