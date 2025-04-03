// ChatRoom.tsx
'use client';

import React,{useState,useEffect, useRef} from 'react';
import MessageCard from './MessageCard';
import MessageInput from './MessageInput';
import { addDoc, collection,doc, serverTimestamp,onSnapshot,query,where,orderBy,updateDoc } from 'firebase/firestore';
// import { firestore } from '@/lib/firebase';
import { db2 as firestore} from "../authcontext"; // omg confusing

interface User {
  id: string;
  firstName: string;
  lastName: string;
  profileImage: string;
  email: string;
}

interface Chatroom {
  id: string;
  myData: User;
  otherData: User;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  time: any;                    // Timestamp or string
  image: string | undefined;
}

interface ChatRoomProps {
  user: User;
  selectedChatroom: Chatroom;
}

interface MessageGroup {
  timestamp: string;
  messages: Message[];
}

interface ProcessedMessage extends Message {
  isConsecutive?: boolean;
}

function ChatRoom({ selectedChatroom }: ChatRoomProps) {
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    // messages feature
    const me = selectedChatroom?.myData;
    const other = selectedChatroom?.otherData;
    const chatRoomId = selectedChatroom?.id;

    // Check if `me` and `chatRoomId` are defined before proceeding, works don't delete
    /*
    if (!me || !chatRoomId) {
      return <div>Loading...</div>;
    }
    */

    // messaging feature
    const [message, setMessage] = useState<string>('');         // State for message
    const [messages, setMessages] = useState<Message[]>([]);    // State for messages
    
    // image attachment feature
    const [image, setImage] = useState<string | null>(null);    // State for image

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

    // get messages 
    useEffect(() => {
      if (!chatRoomId) return;
    
      const unsubscribe = onSnapshot(
        query(collection(firestore, 'messages'), where("chatRoomId", "==", chatRoomId), orderBy('time', 'asc')),
        (snapshot) => {
          const messages = snapshot.docs.map((doc) => ({
            id: doc.id,
            content: doc.data().content,
            senderId: doc.data().senderId,
            time: doc.data().time, // Ensure `time` matches the expected type (either a timestamp or string)
            image: doc.data().image || null, // Ensure `image` can be `null`
          }));
    
          setMessages(messages);
        }
      );
    
      return unsubscribe;
    }, [chatRoomId]);

    // try to auto scroll to bottom of chat
    useEffect(() => {
      if (messagesContainerRef.current) {
        // add a small delay before scrolling to the bottom
        setTimeout(() => {
          const container = messagesContainerRef.current;
          if (container) {
            container.scrollTo({
              top: container.scrollHeight,
              behavior: 'smooth'
            });
          }
        }, 300);
      }
    }, [messages]);

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
      
      const chatroomRef = doc(firestore, 'chatrooms', chatRoomId);
      await updateDoc(chatroomRef, {
        lastMessage: message ? message : "Image",
        timestamp: serverTimestamp(),
      });

      setMessage('');
      setImage(null);
    } catch(err) {
      console.error(err);
    }
    }

    const groupMessagesByTime = (messages: Message[]): MessageGroup[] => {
      const groups: MessageGroup[] = [];
      let currentGroup: Message[] = [];
      let lastTimestamp: Date | null = null;

      messages.forEach((message) => {
        const messageDate = message.time?.toDate();
        
        if (!messageDate) return;

        // start a new group if:
        // 1. this is the first message
        // 2. more than 1 hour has passed since the last message
        // 3. it's a different day than the last message
        if (!lastTimestamp || 
            (messageDate.getTime() - lastTimestamp.getTime() > 60 * 60 * 1000) ||
            !isSameDay(messageDate, lastTimestamp)) {
          
          if (currentGroup.length > 0) {
            groups.push({
              timestamp: lastTimestamp ? formatGroupTimestamp(lastTimestamp) : '',
              messages: currentGroup
            });
          }
          currentGroup = [message];
        } else {
          currentGroup.push(message);
        }
        
        lastTimestamp = messageDate;
      });

      // add the last group
      if (currentGroup.length > 0 && lastTimestamp) {
        groups.push({
          timestamp: lastTimestamp ? formatGroupTimestamp(lastTimestamp) : '',
          messages: currentGroup
        });
      }

      return groups;
    };

    const isSameDay = (date1: Date, date2: Date): boolean => {
      return date1.getDate() === date2.getDate() &&
             date1.getMonth() === date2.getMonth() &&
             date1.getFullYear() === date2.getFullYear();
    };

    const formatGroupTimestamp = (date: Date): string => {
      const now = new Date();
      const isToday = isSameDay(date, now);
      const isYesterday = isSameDay(date, new Date(now.setDate(now.getDate() - 1)));

      if (isToday) {
        return `Today at ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}`;
      } else if (isYesterday) {
        return `Yesterday at ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}`;
      } else {
        // format: "Fri, Mar 22 at 11:05 AM"
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
        const day = date.getDate();
        const time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
        
        return `${dayName}, ${monthName} ${day} at ${time}`;
      }
    };

    // process consecutive messages
    const processConsecutiveMessages = (messages: Message[]): ProcessedMessage[] => {
      return messages.map((message, index, array) => {
        // check if this message is consecutive (same sender as previous and both are text-only)
        const isConsecutive = index > 0 && 
                             message.senderId === array[index - 1].senderId && 
                             !message.image && 
                             !array[index - 1].image;
        
        return {
          ...message,
          isConsecutive
        };
      });
    };

    // Current log in user
    return (
      <div className='flex flex-col h-screen'>
        <div className='text-xl font-semibold flex items-center gap-3 py-5 pl-12 border-b border-gray-300 dark:border-zinc-800'>
          <span>{`${other.firstName} ${other.lastName}`}</span>
          </div>
        <div 
          ref={messagesContainerRef}
          className='flex-1 overflow-y-auto px-12 pt-4 max-h-[80vh] scroll-smooth'
        >
          {groupMessagesByTime(messages).map((group, groupIndex) => (
            <div key={groupIndex}>
              <div className={`flex justify-center ${groupIndex === 0 ? 'mb-4' : 'my-16'}`}>
                <span className="text-zinc-600 dark:text-zinc-400 text-sm px-4 py-1 rounded-full">
                  {group.timestamp}
                </span>
              </div>
              {processConsecutiveMessages(group.messages).map((message, messageIndex) => (
                <div key={message.id} className={message.isConsecutive ? '-mt-2' : ''}>
                  <MessageCard 
                    message={message} 
                    me={me} 
                    other={other} 
                    isConsecutive={message.isConsecutive} 
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
  
        {/* Input box at the bottom*/}
        <div className='mb-16 flex justify-center b'>
          <div className='w-[100%] max-w-6xl'>
            <MessageInput 
              sendMessage={sendMessage} 
              message={message} 
              setMessage={setMessage} 
              image={image} 
              setImage={setImage} 
            />
          </div>
        </div>
      </div>
    );
  }
  
  export default ChatRoom;