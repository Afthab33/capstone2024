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
import { Skeleton } from "@/components/ui/skeleton";

// Firebase imports for dynamic
import { onAuthStateChanged, User as FirebaseUser, getAuth } from 'firebase/auth';
import { doc, getDoc, Firestore, collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';

// add firebase initialization imports
import { initializeApp, getApps } from 'firebase/app';

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
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [selectedChatroom, setSelectedChatroom] = useState<Chatroom | null>(null);
  const [selectedChatroomId, setSelectedChatroomId] = useState<string | undefined>(undefined);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Note: this was change to fix npm run build error to make static->dynamic
  useEffect(() => {
    let unsubscribeAuth: (() => void) | undefined;

    async function initializeAuth() {
      try {
        // first, fetch firebase config from api
        const configResponse = await fetch('/api/firebase-config');
        const firebaseConfig = await configResponse.json();
        
        // initialize firebase if not already initialized
        if (getApps().length === 0) {
          initializeApp(firebaseConfig);
        }

        // now get auth and firestore after initialization
        const auth2 = getAuth();
        const { getFirestore } = await import('firebase/firestore');
        const db2 = getFirestore();
        
        setAuth(auth2);
        setFirestore(db2);

        unsubscribeAuth = onAuthStateChanged(auth2, async (firebaseUser: FirebaseUser | null) => {
          if (firebaseUser) {
            try {
              const docRef = doc(db2, 'users', firebaseUser.uid);
              const docSnap = await getDoc(docRef);
              if (docSnap.exists()) {
                const data = { id: docSnap.id, ...docSnap.data() } as User;
                setUser(data);
              } else {
                console.log('No such document!');
                router.push('/');
              }
            } catch (error) {
              console.error('Error fetching user data:', error);
              router.push('/');
            }
          } else {
            setUser(null);
            router.push('/');
          }
          setLoading(false);
        });
      } catch (error) {
        console.error('Error initializing auth:', error);
        setLoading(false);
      }
    }

    initializeAuth();

    return () => {
      if (unsubscribeAuth) {
        unsubscribeAuth();
      }
    };
  }, [router]);

  // initial chatroom selection
  useEffect(() => {
    if (!firestore || !user || initialLoadComplete) return;

    const chatroomsQuery = query(
      collection(firestore, 'chatrooms'),
      where('users', 'array-contains', user.id),
      orderBy('timestamp', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(chatroomsQuery, (snapshot) => {
      if (!snapshot.empty) {
        const chatroom = snapshot.docs[0];
        const chatroomData = chatroom.data();
        const otherUserId = chatroomData.users.find((id: string) => id !== user.id);
        const otherData = chatroomData.usersData[otherUserId];

        setSelectedChatroom({
          id: chatroom.id,
          myData: user,
          otherData: otherData,
        });
        setSelectedChatroomId(chatroom.id);
      }
      setInitialLoadComplete(true);
    });

    return () => unsubscribe();
  }, [firestore, user, initialLoadComplete]);

  // show loading state while authentication is being checked
  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] overflow-hidden">
        <div className="flex-shrink-0 w-3/12 border-r border-gray-300 dark:border-zinc-800">
          {/* sidebar loading state */}
          <div className="p-4 flex gap-2">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-10" />
          </div>
          {/* chat list loading state */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 border-b border-gray-200 dark:border-zinc-800">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[160px]" />
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* main chat area loading state */}
        <div className="flex-grow w-9/12 p-4">
          <div className="flex flex-col h-full">
            <Skeleton className="h-12 w-[200px] mb-8" />
            <div className="flex-1 space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start gap-2 ${i % 2 === 0 ? 'flex-row-reverse' : 'flex-row'}`}>
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-10 w-[250px] rounded-full" />
                  </div>
                </div>
              ))}
            </div>
            <Skeleton className="h-12 w-full mt-8 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  // show nothing if user is null (redirect will happen)
  if (user === null) return null;

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      <div className="flex-shrink-0 w-3/12">
        <UserChat 
          userData={user} 
          setSelectedChatroom={(chatroom) => {
            setSelectedChatroom(chatroom);
            setSelectedChatroomId(chatroom.id);
          }} 
          selectedChatroomId={selectedChatroomId}
        />
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