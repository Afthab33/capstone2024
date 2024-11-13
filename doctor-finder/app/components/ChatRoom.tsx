'use client';

import React,{useState,useEffect,useRef} from 'react';
import MessageCard from './MessageCard';
import MessageInput from './MessageInput';
import { addDoc, collection,doc, serverTimestamp,onSnapshot,query,where,orderBy,updateDoc } from 'firebase/firestore';
// import { firestore } from '@/lib/firebase';
import { db2 as firestore} from "../authcontext"; // omg confusing

function ChatRoom({ user, selectedChatroom }) {
    // messages feature
    const me = selectedChatroom?.myData;
    const other = selectedChatroom?.otherData;
    const chatRoomId = selectedChatroom?.id;

    // Check if `me` and `chatRoomId` are defined before proceeding, works don't delete
    if (!me || !chatRoomId) {
      return <div>Loading...</div>;
    }

    // messaging feature
    const [message, setMessage] = useState([]);
    const [messages, setMessages] = useState([]);
    const messagesContainerRef = useRef(null);
    
    // image attachment feature
    const [image, setImage] = useState(null);

    /* Hardcoded messages
    const messages = [ 
      {
        id: 1,
        sender:"Elite Hacker",
        avatarUrl:"https://i.pinimg.com/736x/ef/cd/09/efcd09ee321f51424c99890c73557c8c--pokemon-pikachu-screensaver.jpg",
        content:"Hey, how are you",
        time:"2 hours ago"
      },
      {
        id: 2,
        sender:"Trung Du",
        avatarUrl:"https://th.bing.com/th/id/OIP.HsRS97pdiTGR5gobxacKjgHaH4?pid=ImgDet&w=200&h=213&c=7&dpr=1.3",
        content:"Hey, how are you",
        time:"2 hours ago"
      }
    ]
    */

    /*
    useEffect(() => {
      // Scroll to the bottom when messages change
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    }, [messages]);
  */

  // get messages 
  useEffect(() => {
    if(!chatRoomId) return;

    const unsubscribe = onSnapshot(
      query(collection(firestore, 'messages'),where("chatRoomId","==",chatRoomId),orderBy('time', 'asc')),
      (snapshot) => {
        const messages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // console.log(messages);
        setMessages(messages);
      }
    );
  
    return unsubscribe;
  }, [chatRoomId]);

  const sendMessage = async () => {
    const messageCollection = collection(firestore, 'messages');

    // if msg is empty don't send to firebase
    if (message.trim() === '' && !image) {
      return;
    }

    try {
      const messageData = {
        chatRoomId,
        senderId: me.id,
        content: message,
        time: serverTimestamp(),
        image: image,
      };

      await addDoc(messageCollection, messageData);
      setMessage('');
      setImage(null);
      
      // update chatroom last message
      const chatroomRef = doc(firestore, 'chatrooms', chatRoomId);
      
      await updateDoc(chatroomRef, {
        lastMessage:message ? message : "Image",
      });

    } catch(err) {
      console.error(err);
    }
  }

    // Current log in user
    return (
      <div className='flex flex-col h-screen'>
        <div className='flex-1 overflow-y-auto p-10'>
          {/* Messages container with overflow and scroll */}
          {messages?.map((message) => (
            <MessageCard key={message.id} message={message} me={me} other={other}/>
          ))}
        </div>
  
        {/* Input box at the bottom*/}
        <MessageInput sendMessage={sendMessage} message={message} setMessage={setMessage} 
        image={image} setImage={setImage} />
      </div>
    );
  }
  
  export default ChatRoom;