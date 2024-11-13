'use client';

import { useEffect, useState } from "react";
// import { firestore,app } from '@/lib/firebase';
import { app, db2 as firestore} from "../authcontext"; // omg confusing
import { collection, onSnapshot, query, addDoc, serverTimestamp,where,getDocs} from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import UsersCard from "./UsersCard";
import { useRouter } from "next/navigation";
import { toast } from 'react-hot-toast';
import moment from "moment";

function UserChat({ userData, setSelectedChatroom }) {
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

  // get all users from Firebase: users DEBUG later if just want query the doctors
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

    // get user chatrooms
    useEffect(() => {
      setLoading(true);
      if(!userData?.id) return;

      const chatroomsQuery = query(collection(firestore, 'chatrooms'), where('users', 'array-contains', userData?.id));

      const unsubscribeChatrooms = onSnapshot(chatroomsQuery, (snapshot) => {
        const chatrooms = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setLoading(false);
        setUserChatrooms(chatrooms);
      });
  
      // Cleanup function for chatrooms
      return () => unsubscribeChatrooms();
    }, [userData]);

  
  // Create a chatroom, sends a message to Firebase
  const createChat = async (user) => {
    // Check if a chatroom already exists for these users
    const existingChatroomsQuery = query(collection(firestore, 'chatrooms'), where('users', '==', [userData.id, user.id]));
  
    try {
      const existingChatroomsSnapshot = await getDocs(existingChatroomsQuery);
  
      if (existingChatroomsSnapshot.docs.length > 0) {
        // Chatroom already exists, handle it accordingly (e.g., show a message)
        toast.error(<>'Chatroom already exists for users.<br />  Click "Chatrooms"'</>);
        return;
      }
  
      // Chatroom doesn't exist, proceed to create a new one on Firebase
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
      toast.error(err.message);
    }
  };
  
  
  // open chatroom when click on user from the chatroom
  const openChat = async (chatroom) => {
      const data = {
        id: chatroom.id,
        myData: userData,
        otherData: chatroom.usersData[chatroom.users.find((id) => id !== userData.id)],
      }
      setSelectedChatroom(data);
  }

  // format time out
  const formatTimeAgo = (timestamp) => {
    const date = timestamp?.toDate();
    return date ? moment(date).fromNow() : '';
  };

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

      {/* Need to get info from Firebase DB later*/}
      <div>
        {
          activeTab === 'chatrooms' && (<>
            <h1 className='px-4 text-white font-semibold bg-blue-500 rounded-lg hover:bg-blue-700 text-center'>Chatrooms</h1>
                {
                  userChatrooms.map((chatroom) => (
                    <div key={chatroom.id} onClick={()=>{openChat(chatroom)}}>
                      <UsersCard
                        name={(chatroom.usersData[chatroom.users.find((id) => id !== userData?.id)].firstName) + " " +
                          (chatroom.usersData[chatroom.users.find((id) => id !== userData?.id)].lastName)
                        }
                        avatarUrl={chatroom.usersData[chatroom.users.find((id) => id !== userData?.id)].profileImage}

                        latestMessage={chatroom.lastMessage}
                        time={formatTimeAgo(chatroom.timestamp)}   // hope this works ... DEBUG
                        type={"chat"}
                      />
                    </div>
                  ))
                }
                {/* Hardcoded must delete the old firebase to get images to work properly
                <UsersCard
                  name="Trung Du"
                  latestMessage="How are you?"
                  type={"chat"}
                  time="2 h ago"
                  avatarUrl="https://th.bing.com/th/id/OIP.XXYciyj8hfEBpdnQixUcOwAAAA?w=206&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7"
                />
                */}
          </>)
        }
      </div>

      {/* Need to get info from Firebase DB later (success), prob need change time if want later make user.name*/}
      {/* Right now this gets all users from the database*/}
      <div>
        {
          activeTab === 'users' && (<>
            <h1 className='px-4 text-white font-semibold bg-blue-500 rounded-lg hover:bg-blue-700 text-center'>Users</h1>
            {
              loading2 ? <p>Loading. . .</p> :
              users.map((user) => (
                user.id !== userData?.id &&
                <div key={user.id} onClick={()=>{createChat(user)}}>
                  <UsersCard
                    key={user.id}
                    name={user.firstName + " " + user.lastName}
                    email={user.email}
                    avatarUrl={user.profileImage}
                    time={"Doesn't matter not going be displayed"}
                    type={"users"}
                  />
                </div>
              ))
            }
          </>)
        }
      </div>
  </div>
  )
}

export default UserChat;