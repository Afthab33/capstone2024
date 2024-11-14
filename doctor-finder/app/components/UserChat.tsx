// UserChat.tsx
'use client';

import { useEffect, useState } from "react";
import { db2 as firestore } from "../authcontext"; // omg confusing
import { collection, onSnapshot, query, addDoc, serverTimestamp, where, getDocs } from 'firebase/firestore';
import UsersCard from "./UsersCard";
import { toast } from 'react-hot-toast';
import { Timestamp } from 'firebase/firestore';

// Define types for user data and chatroom data
interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage: string;
}

interface Chatroom {
  id: string;
  users: string[];
  usersData: Record<string, UserData>;
  lastMessage: string | null;

  timestamp: Timestamp; // Timestamp type from Firestore
}

interface UserChatProps {
  userData: UserData;
  setSelectedChatroom: (data: { id: string; myData: UserData; otherData: UserData }) => void;
}

function UserChat({ userData, setSelectedChatroom }: UserChatProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'chatrooms'>('chatrooms');
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);
  const [userChatrooms, setUserChatrooms] = useState<Chatroom[]>([]);
  
  const handleTabClick = (tab: 'users' | 'chatrooms') => {
    setActiveTab(tab);
  };

  // Get all users from Firebase
  useEffect(() => {
    setLoading2(true);
    const tasksQuery = query(collection(firestore, 'users'));
    
    const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
      const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as UserData[];
      setUsers(users);
      setLoading2(false);
    });

    return () => unsubscribe();
  }, []);

  // Get user chatrooms
  useEffect(() => {
    setLoading(true);
    if (!userData?.id) return;

    const chatroomsQuery = query(collection(firestore, 'chatrooms'), where('users', 'array-contains', userData?.id));

    const unsubscribeChatrooms = onSnapshot(chatroomsQuery, (snapshot) => {
      const chatrooms = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Chatroom[];
      setLoading(false);
      setUserChatrooms(chatrooms);
    });

    return () => unsubscribeChatrooms();
  }, [userData]);

  // Create a new chatroom with a user
  const createChat = async (user: UserData) => {
    const existingChatroomsQuery = query(collection(firestore, 'chatrooms'), where('users', '==', [userData.id, user.id]));

    try {
      const existingChatroomsSnapshot = await getDocs(existingChatroomsQuery);

      if (existingChatroomsSnapshot.docs.length > 0) {
        toast.error('Chatroom already exists for these users. Click "Chatrooms".');
        return;
      }

      const usersData = {
        [userData.id]: userData,
        [user.id]: user,
      };

      const chatroomData = {
        users: [userData.id, user.id],
        usersData,
        timestamp: serverTimestamp(),
        lastMessage: null,
      };

      const chatroomRef = await addDoc(collection(firestore, 'chatrooms'), chatroomData);
      console.log('Chatroom created with ID:', chatroomRef.id);
      setActiveTab("chatrooms");
    } catch (err) {
      console.error('Error creating or checking chatroom:', err);
    }
  };

  // Open chatroom when clicking on a chatroom
  const openChat = async (chatroom: Chatroom) => {
    const otherUserId = chatroom.users.find((id) => id !== userData.id);
    const otherData = chatroom.usersData[otherUserId as string];

    setSelectedChatroom({
      id: chatroom.id,
      myData: userData,
      otherData,
    });
  };

  return (
    <div className='shadow-lg h-screen overflow-auto mt-4 mb-20'>
      <div className="flex flex-col lg:flex-row justify-between p-4 space-y-4 lg:space-y-0">
        <button 
          className={`py-2 px-4 rounded-lg border-2 ${activeTab === 'users' ? 'bg-blue-500 text-white' : 'bg-transparent border-2 border-blue-500 text-blue-500'} hover:bg-blue-700 hover:text-white`}
          onClick={() => handleTabClick('users')}
        >
          Users
        </button>

        <button 
          className={`py-2 px-4 rounded-lg border-2 ${activeTab === 'chatrooms' ? 'bg-blue-500 text-white' : 'bg-transparent border-blue-500 text-blue-500'} hover:bg-blue-700 hover:text-white transition-colors`}
          onClick={() => handleTabClick('chatrooms')}
        >
          Chatrooms
        </button>
      </div>

      <div>
        {activeTab === 'chatrooms' && (
          <>
            <h1 className='px-4 text-white font-semibold bg-blue-500 rounded-lg hover:bg-blue-700 text-center'>
              Chatrooms
            </h1>
            {userChatrooms.map((chatroom) => (
              <div key={chatroom.id} onClick={() => openChat(chatroom)}>
                <UsersCard
                  name={`${chatroom.usersData[chatroom.users.find((id) => id !== userData.id) as string].firstName} ${chatroom.usersData[chatroom.users.find((id) => id !== userData.id) as string].lastName}`}
                  avatarUrl={chatroom.usersData[chatroom.users.find((id) => id !== userData.id) as string].profileImage}
                  latestMessage={chatroom.lastMessage}
                  // time={String(Timestamp)} // Hope this works prob need fix this later it the last time chatroom created
                  time={chatroom.timestamp?.toDate().toLocaleString() || "N/A"} // Format the timestamp
                  type="chat"
                />
              </div>
            ))}
          </>
        )}
      </div>

      <div>
        {activeTab === 'users' && (
          <>
            <h1 className='px-4 text-white font-semibold bg-blue-500 rounded-lg hover:bg-blue-700 text-center'>
              Users
            </h1>
            {loading2 ? (
              <p>Loading...</p>
            ) : (
              users.map((user) => (
                user.id !== userData?.id && (
                  <div key={user.id} onClick={() => createChat(user)}>
                    <UsersCard
                      key={user.id}
                      name={`${user.firstName} ${user.lastName}`}
                      email={user.email}
                      avatarUrl={user.profileImage}
                      time={undefined}
                      type="users"
                    />
                  </div>
                )
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default UserChat;
