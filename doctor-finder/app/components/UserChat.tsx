// UserChat.tsx
'use client';

import { useEffect, useState } from "react";
import { db2 as firestore } from "../authcontext"; // omg confusing
import { collection, onSnapshot, query, addDoc, serverTimestamp, where, getDocs, orderBy, doc, writeBatch, getDoc } from 'firebase/firestore';
import UsersCard from "./UsersCard";
import { Timestamp } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Trash2, Edit2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";


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
  selectedChatroomId?: string;
}

const formatMessageTime = (timestamp: Timestamp | null): string => {
  if (!timestamp) return "N/A";
  
  const messageDate = timestamp.toDate();
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - messageDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // if same day, show time
  if (diffDays === 0) {
    return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // if yesterday
  if (diffDays === 1) {
    return 'Yesterday';
  }
  
  // if within a week
  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }
  
  // if within a month
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  }
  
  // if more than a month
  const months = Math.floor(diffDays / 30);
  return `${months} ${months === 1 ? 'month' : 'months'} ago`;
};

const truncateMessage = (message: string | null, maxLength: number = 30): string => {
  if (!message) return "No messages yet";
  return message.length > maxLength ? `${message.substring(0, maxLength)}...` : message;
};

function UserChat({ userData, setSelectedChatroom, selectedChatroomId }: UserChatProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);
  const [userChatrooms, setUserChatrooms] = useState<Chatroom[]>([]);
  const [localSelectedId, setLocalSelectedId] = useState<string | undefined>(selectedChatroomId);
  
  // filter users based on search query
  const filteredUsers = users.filter(user => 
    user.id !== userData?.id && 
    (user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
     user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
     user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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

    const chatroomsQuery = query(
      collection(firestore, 'chatrooms'),
      where('users', 'array-contains', userData.id),
      orderBy('timestamp', 'desc')  // most recent chats appear at the top
    );

    const unsubscribeChatrooms = onSnapshot(chatroomsQuery, async (snapshot) => {
      // get all unique user IDs from chatrooms
      const userIds = new Set<string>();
      snapshot.docs.forEach(doc => {
        const chatroom = doc.data();
        chatroom.users.forEach((userId: string) => {
          if (userId !== userData.id) {
            userIds.add(userId);
          }
        });
      });

      // fetch latest user data for all users
      const usersData: Record<string, UserData> = {};
      await Promise.all(Array.from(userIds).map(async (userId) => {
        const userDoc = await getDoc(doc(firestore, 'users', userId));
        if (userDoc.exists()) {
          usersData[userId] = { id: userDoc.id, ...userDoc.data() } as UserData;
        }
      }));

      // update chatrooms with latest user data
      const chatrooms = snapshot.docs.map((doc) => {
        const data = doc.data();
        const updatedUsersData = { ...data.usersData };
        
        // replace with latest user data
        data.users.forEach((userId: string) => {
          if (usersData[userId]) {
            updatedUsersData[userId] = usersData[userId];
          }
        });
        
        return { 
          id: doc.id, 
          ...data,
          usersData: updatedUsersData 
        } as Chatroom;
      });
      
      setLoading(false);
      setUserChatrooms(chatrooms);
    });

    return () => unsubscribeChatrooms();
  }, [userData]);

  // update local state when prop changes
  useEffect(() => {
    setLocalSelectedId(selectedChatroomId);
  }, [selectedChatroomId]);

  useEffect(() => {
    // check for openNewChat flag and selected chat ID first
    const shouldOpenNewChat = localStorage.getItem('openNewChat');
    const selectedChatId = localStorage.getItem('selectedChatId');

    // don't proceed if we don't have chatrooms loaded yet and we're looking for a specific chat
    if (userChatrooms.length === 0 && selectedChatId) {
      return;
    }

    if (shouldOpenNewChat === 'true') {
      setIsDialogOpen(true);
      localStorage.removeItem('openNewChat');
    } else if (selectedChatId && userChatrooms.length > 0) {
      // find the chatroom with this user
      const chatroom = userChatrooms.find(room => 
        room.users.includes(selectedChatId)
      );

      if (chatroom) {
        const otherData = chatroom.usersData[selectedChatId];
        setSelectedChatroom({
          id: chatroom.id,
          myData: userData,
          otherData,
        });
      }
      localStorage.removeItem('selectedChatId');
    } else if (userChatrooms.length > 0 && !selectedChatId) {
      const newestChatroom = userChatrooms[0];
      const otherUserId = newestChatroom.users.find(id => id !== userData.id);
      if (otherUserId) {
        const otherData = newestChatroom.usersData[otherUserId];
        setSelectedChatroom({
          id: newestChatroom.id,
          myData: userData,
          otherData,
        });
      }
    }
  }, [userChatrooms, userData, isDialogOpen]);

  // Create a new chatroom with a user
  const createChat = async (user: UserData) => {
    // check if chatroom already exists
    const existingChatroomsQuery1 = query(
      collection(firestore, 'chatrooms'),
      where('users', 'in', [[userData.id, user.id], [user.id, userData.id]])
    );

    try {
      const existingChatroomsSnapshot = await getDocs(existingChatroomsQuery1);

      if (existingChatroomsSnapshot.docs.length > 0) {
        // instead of showing toast, navigate to existing chat
        const existingChatroom = existingChatroomsSnapshot.docs[0];
        setLocalSelectedId(existingChatroom.id);
        setSelectedChatroom({
          id: existingChatroom.id,
          myData: userData,
          otherData: user,
        });
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
      
      // automatically select the new chatroom
      setLocalSelectedId(chatroomRef.id);
      setSelectedChatroom({
        id: chatroomRef.id,
        myData: userData,
        otherData: user,
      });

    } catch (err) {
      console.error('Error creating or checking chatroom:', err);
    }
  };

  // Open chatroom when clicking on a chatroom
  const openChat = async (chatroom: Chatroom) => {
    const otherUserId = chatroom.users.find((id) => id !== userData.id);
    const otherData = chatroom.usersData[otherUserId as string];

    setLocalSelectedId(chatroom.id); // update local state immediately
    setSelectedChatroom({
      id: chatroom.id,
      myData: userData,
      otherData,
    });
  };

  // add delete chat function
  const deleteChat = async (chatroomId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent chat opening when clicking delete
    try {
      const batch = writeBatch(firestore);
      
      // get all messages for this chatroom
      const messagesQuery = query(
        collection(firestore, 'messages'),
        where('chatRoomId', '==', chatroomId)
      );
      const messagesSnapshot = await getDocs(messagesQuery);
      
      // add all message deletions to batch
      messagesSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      // add chatroom deletion to batch
      batch.delete(doc(firestore, 'chatrooms', chatroomId));
      
      // execute all deletions
      await batch.commit();
      
      // if the deleted chat was selected
      if (chatroomId === selectedChatroomId) {
        // find the next most recent chatroom
        const nextChatroom = userChatrooms
          .filter(chatroom => chatroom.id !== chatroomId)[0];

        if (nextChatroom) {
          // get the other user's data
          const otherUserId = nextChatroom.users.find(id => id !== userData.id);
          const otherData = nextChatroom.usersData[otherUserId as string];

          // switch to the next chatroom
          setSelectedChatroom({
            id: nextChatroom.id,
            myData: userData,
            otherData
          });
        } else {
          // if no other chatrooms exist, clear the selection
          setSelectedChatroom({
            id: '',
            myData: userData,
            otherData: {} as UserData
          });
        }
      }

      toast({
        title: "Success",
        description: "Chat deleted successfully",
        className: "bg-primary text-white",
      });
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete chat",
      });
    }
  };

  return (
    <div className='h-screen overflow-auto mb-20 border-r border-gray-300 dark:border-zinc-800'>
      <div className="p-4 flex gap-2">
        <Button 
          variant="outline"
          className="flex-1"
          onClick={() => setIsDialogOpen(true)}
        >
          <Edit2 className="text-primary w-4 h-4 mr-2" />
          <span className="text-zinc-700 dark:text-zinc-400">New Message</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => setIsEditDialogOpen(true)}
        >
          <span className="text-zinc-700 dark:text-zinc-400">Edit</span>
        </Button>
      </div>

      {/* add edit dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Chats</DialogTitle>
          </DialogHeader>
          
          <div className="max-h-[60vh] overflow-y-auto">
            {userChatrooms.map((chatroom, index) => {
              const otherUser = chatroom.usersData[chatroom.users.find((id) => id !== userData.id) as string];
              return (
                <div 
                  key={chatroom.id}
                  className={`flex items-center justify-between p-4 ${index < userChatrooms.length - 1 ? 'border-b border-gray-200 dark:border-zinc-800' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={otherUser.profileImage || "/profpic.png"} 
                      alt={otherUser.firstName}
                      className="w-10 h-10 rounded-full"
                    />
                    <span>{`${otherUser.firstName} ${otherUser.lastName}`}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700 hover:bg-red-100"
                    onClick={(e) => deleteChat(chatroom.id, e)}
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* search dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
          </DialogHeader>
          
          <Input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />
          
          <div className="max-h-[60vh] overflow-y-auto">
            {loading2 ? (
              <p>Loading...</p>
            ) : (
              filteredUsers.map((user) => (
                <div 
                  key={user.id} 
                  onClick={() => {
                    createChat(user);
                    setIsDialogOpen(false);
                    setSearchQuery('');
                  }}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-3 py-2 dark:bg-zinc-950 p-2 rounded-sm hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors border-b border-gray-300 dark:border-zinc-800">
                    <img 
                      src={user.profileImage || "/profpic.png"} 
                      alt={user.firstName}
                      className="w-10 h-10 rounded-full"
                    />
                    <span>{`${user.firstName} ${user.lastName}`}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* existing chatrooms list */}
      <div>
        {userChatrooms.map((chatroom, index) => (
          <div 
            key={chatroom.id} 
            onClick={() => openChat(chatroom)}
            className={`cursor-pointer transition-colors ${
              index === 0 ? 'border-t border-gray-300 dark:border-zinc-800' : ''
            } ${
              localSelectedId === chatroom.id 
                ? 'bg-zinc-200 dark:bg-zinc-800' 
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-900'
            }`}
          >
            <UsersCard
              name={`${chatroom.usersData[chatroom.users.find((id) => id !== userData.id) as string].firstName} ${chatroom.usersData[chatroom.users.find((id) => id !== userData.id) as string].lastName}`}
              avatarUrl={chatroom.usersData[chatroom.users.find((id) => id !== userData.id) as string].profileImage}
              latestMessage={truncateMessage(chatroom.lastMessage)}
              time={formatMessageTime(chatroom.timestamp)}
              type="chat"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserChat;
