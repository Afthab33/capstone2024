'use client';

import React from "react";
// import { useAuthState } from "react-firebase-hooks/auth";
import { auth as getFirebaseAuth } from '../authcontext'; // useAuth
import { useState } from 'react';    // need use client if use this // useEffect
// import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import Message from "../components/Message";

export default function DoctorChat() {
  const [input, setInput] = useState("");
  // const [users, setUsers] = useState<any[]>([]);
  // const { user } = useAuth(); // check if the user is logged in


  // DEBUG: Marcus be readonly variables, talk with him later
  // user.displayName = "Hacker";

  // console.log(user?.displayName);

  return (
    <div>
    <div className="flex items-center justify-between p-5 shadow-lg sticky top-0 bg-white z-10">
      <div className="text-3xl font-bold text-blue-400">Doctor Finder Chat</div>
      <div onClick={() => getFirebaseAuth().signOut()}>ImageHERE(Logout)</div>
      {/*<img src={user?.photoURL} alt="profileImage" className="h-10 w-10 rounded-full-full cursor-pointer"/>*/}
    </div>

      {/* Body*/}
      <div className="max-w-2xl mx-auto mt-5">
        {/* Messages */}
        <div>
          <Message/>

        </div>
        {/* Input */}
        <div className="fixed bottom-10 w-100 flex items-center justify-between space-x-2">
          <input
            value={input} onChange={e => setInput(e.target.value)}
            type="text" 
            placeholder="Enter a message" 
            className="flex-1 outline-none bg-gray-200 rounded-lg">
          </input>
          <button className="bg-red-500 text-sm text-white font-bold p-3 rounded-lg
          hover:scale-90 transition-all duration-200 ease-in-out">Send</button>
        </div>
      </div>
    </div>
  );
}
