'use client';

import { useEffect, useState } from "react";
// import { firestore,app } from '@/lib/firebase';
import { app, db2 as firestore} from "../authcontext"; // omg confusing
import { collection, onSnapshot, query, addDoc, serverTimestamp,where,getDocs} from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import UsersCard from "./UsersCard";
import { useRouter } from "next/navigation";
import { toast } from 'react-hot-toast';

function UserChat({ userData,setSelectedChatroom }) {
  const [activeTab, setActiveTab] = useState('chatrooms');
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [users, setUsers] = useState([]);
  const [userChatrooms, setUserChatrooms] = useState([]);
  const router = useRouter();
  const auth = getAuth(app);
  

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  //get all users
  useEffect(() => {
    setLoading2(true);
    const tasksQuery = query(collection(firestore, 'users'));
    
    const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
      const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(users);
      setLoading2(false);
    });
    return () => unsubscribe();
  }, []);

  //get chatrooms
  useEffect(() => {
    setLoading(true);
    if(!userData?.id) return;
    const chatroomsQuery = query(collection(firestore, 'chatrooms'), where('users', 'array-contains', userData.id));
    const unsubscribeChatrooms = onSnapshot(chatroomsQuery, (snapshot) => {
      const chatrooms = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setLoading(false);
      setUserChatrooms(chatrooms);
    
    });

    // Cleanup function for chatrooms
    return () => unsubscribeChatrooms();
  }, [userData]);


// Create a chatroom
const createChat = async (user) => {
  // Check if a chatroom already exists for these users
  const existingChatroomsQuery = query(collection(firestore, 'chatrooms'), where('users', '==', [userData.id, user.id]));

  try {
    const existingChatroomsSnapshot = await getDocs(existingChatroomsQuery);

    if (existingChatroomsSnapshot.docs.length > 0) {
      // Chatroom already exists, handle it accordingly (e.g., show a message)
      toast.error('Chatroom already exists for these users.');
      return;
    }

    // Chatroom doesn't exist, proceed to create a new one
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
  } catch (error) {
    console.error('Error creating or checking chatroom:', error);
  }
};

//open chatroom
const openChat = async (chatroom) => {
    const data = {
      id: chatroom.id,
      myData: userData,
      otherData: chatroom.usersData[chatroom.users.find((id) => id !== userData.id)],
    }
    setSelectedChatroom(data);
}

  return (
    <div className='shadow-lg h-screen overflow-auto mt-4 mb-20'>
      <div className="flex flex-col lg:flex-row justify-between p-4 space-y-4 lg:space-y-0">
      <button className={`py-2 px-4 rounded-lg border-2 ${activeTab === 'users' ? 'bg-blue-500 text-white' : 'bg-transparent border-2 border-blue-500 text-blue-500'} hover:bg-blue-700 hover:text-white`}
          onClick={() => handleTabClick('users')}
        >
          Users
        </button>

        <button className={`py-2 px-4 rounded-lg border-2 ${activeTab === 'chatrooms' ? 'bg-blue-500 text-white' : 'bg-transparent border-blue-500 text-blue-500'} hover:bg-blue-700 hover:text-white transition-colors`}
          onClick={() => handleTabClick('chatrooms')}
        >
          Chatrooms
        </button>
      </div>

      <div>
        {
          activeTab === 'chatrooms' && (<>
            <h1 className='px-4 text-white font-semibold bg-blue-500 rounded-lg hover:bg-blue-700 text-center'>Chatrooms</h1>
                <UsersCard
                  name="Elite Hacker"
                  latestMessage="Last Message"
                  type={"chat"}
                  time=""
                  avatarUrl="https://i.pinimg.com/736x/ef/cd/09/efcd09ee321f51424c99890c73557c8c--pokemon-pikachu-screensaver.jpg"
                />
                <UsersCard
                  name="Trung Du"
                  latestMessage="Howdy Alien"
                  type={"chat"}
                  time="2 h ago"
                  avatarUrl="https://freepngimg.com/download/twitter/10-2-twitter-download-png.png"
                />
          </>)
        }
      </div>

      <div>
        {
          activeTab === 'users' && (<>
            <h1 className='px-4 text-white font-semibold bg-blue-500 rounded-lg hover:bg-blue-700 text-center'>Users</h1>
                <UsersCard
                  name="Elite Hacker"
                  latestMessage=""
                  type={"users"}
                  time="2 hr ago"
                  avatarUrl="https://i.pinimg.com/736x/ef/cd/09/efcd09ee321f51424c99890c73557c8c--pokemon-pikachu-screensaver.jpg"
                />
          </>)
        }
      </div>
  </div>
  )
}

export default UserChat;