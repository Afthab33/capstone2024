'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { useAuth, auth as getFirebaseAuth, clearUserCache, db as getFirebaseDb } from "../authcontext";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, orderBy, limit, where, getDocs } from 'firebase/firestore';
import { useTheme } from "next-themes";                     // Dark/Light Mode
import { Moon, Sun, ChevronRight, Edit2 } from "lucide-react";                   // Dark/Light Mode
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface UserData {
  role?: string;
  profileImage?: string;
}

const Navbar = () => {
  const { user, loading } = useAuth(); // get user and loading state from authcontext
  const pathname = usePathname(); // get pathname from next/navigation
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState<{
    senderId: string;
    content: string;
    senderName: string;
    time: any;
    senderProfileImage?: string;
  }[]>([]);
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      try {
        const db = getFirebaseDb();
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  useEffect(() => {
    const fetchRecentMessages = async () => {
      if (!user) return;
      
      try {
        const chatroomsQuery = query(
          collection(getFirebaseDb(), 'chatrooms'),
          where('users', 'array-contains', user.uid)
        );
        
        const chatroomDocs = await getDocs(chatroomsQuery);
        const chatroomIds = chatroomDocs.docs.map(doc => doc.id);
        
        const recentMessages: any[] = [];
        
        for (const chatroomId of chatroomIds) {
          const messagesQuery = query(
            collection(getFirebaseDb(), 'messages'),
            where('chatRoomId', '==', chatroomId),
            where('senderId', '!=', user.uid),
            orderBy('senderId'),
            orderBy('time', 'desc'),
            limit(1)
          );
          
          const messagesDocs = await getDocs(messagesQuery);
          
          if (!messagesDocs.empty) {
            const messageDoc = messagesDocs.docs[0];
            const messageData = messageDoc.data();
            
            const chatroomData = chatroomDocs.docs.find(doc => doc.id === chatroomId)?.data();
            const senderId = messageData.senderId;
            const senderData = chatroomData?.usersData[senderId];
            
            // Format the sender's name with their title
            const senderTitle = senderData.role === 'doctor' 
              ? `Dr. ${senderData.firstName} ${senderData.lastName}${senderData.degree ? `, ${senderData.degree}` : ''}`
              : `${senderData.firstName} ${senderData.lastName}`;
            
            recentMessages.push({
              senderId: senderId,
              content: messageData.content || (messageData.image ? "Sent an image" : ""),
              senderName: senderTitle,
              time: messageData.time,
              senderProfileImage: senderData.profileImage || '/profpic.png'
            });
          }
        }
        
        recentMessages.sort((a, b) => b.time - a.time);
        setNotifications(recentMessages.slice(0, 3));
        
      } catch (error) {
        console.error('Error fetching recent messages:', error);
      }
    };

    fetchRecentMessages();
  }, [user]);

  const getSettingsRoute = () => {
    if (!user || !userData) return '/login';
    return userData.role === 'doctor' ? '/dsettings' : '/psettings';
  };

  const handleLogout = () => {
    clearUserCache(); // clear user cache
    getFirebaseAuth().signOut(); // sign out user
    console.log('User logged out');
    setUserData(null); // reset user data
    setIsLogoutDialogOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() !== "") {
      router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleNotificationClick = (notification: any) => {
    localStorage.setItem('selectedChatId', notification.senderId);
    
    if (pathname === '/DoctorChat') {
      window.location.reload();
    } else {
      router.push('/DoctorChat');
    }
  };

  const handleNewMessageClick = () => {
    localStorage.setItem('openNewChat', 'true');
    
    if (pathname === '/DoctorChat') {
      window.location.reload();
    } else {
      router.push('/DoctorChat');
    }
  };

  return (
    <nav className="bg-background border-b border-gray-200 dark:border-zinc-800 relative z-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center lg:pl-10">
            <div className="flex-shrink-0 flex items-center pr-5">
              <Link href="/" className="flex items-center">
                <Image
                  src={"/logonew.svg"}
                  alt="Doctor Finder Logo"
                  width={95}
                  height={95}
                  className="pt-2 dark:hidden"
                  priority
                />
                <Image
                  src={"/logodark.svg"}
                  alt="Doctor Finder Logo"
                  width={95}
                  height={95}
                  className="pt-2 hidden dark:block"
                  priority
                />
              </Link>
            </div>

            {/*search bar here - hidden on index page*/}
            {pathname !== '/' && (
              <form onSubmit={handleSearch} className="hidden sm:flex items-center border rounded-lg overflow-hidden dark:bg-zinc-900">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search doctors..."
                  className="px-3 py-2 w-64 border-none focus:ring-0 focus:outline-none dark:bg-zinc-900 dark:text-white"
                />
              </form>
            )}

            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {
                user ? (<Link href="/visits" className="text-foreground inline-flex items-center px-1 pt-1 hover:text-gray-600 dark:hover:text-gray-300 relative group">
                  <span className="relative">
                    Visits
                    <span className="absolute left-0 bottom-0 w-full h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                  </span>
                </Link>) : <></>
              } 
              <Link href="/viewall" className="text-foreground inline-flex items-center px-1 pt-1 hover:text-gray-600 dark:hover:text-gray-300 relative group">
             
                <span className="relative">
                  View All Doctors
                  <span className="absolute left-0 bottom-0 w-full h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                </span>
              </Link>
              <Link href="/aboutus" className="text-foreground inline-flex items-center px-1 pt-1 hover:text-gray-600 dark:hover:text-gray-300 relative group">
                <span className="relative">
                  About Us
                  <span className="absolute left-0 bottom-0 w-full h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                </span>
              </Link>
              {/* Du comment this out no longer needed, reactivated to test code */}
                {/*
                  user ?(
                    <Link href="/testDeleteLater" className="text-gray-900 inline-flex items-center px-1 pt-1 hover:text-gray-600 relative group">
                      <span className="relative">
                        DU testing query
                        <span className="absolute left-0 bottom-0 w-full h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                      </span>
                    </Link>
                  ) : <></>
                */}
              {/* Du comment this out no longer needed
                {
                  user ?(
                    <Link href="/testadd" className="text-gray-900 inline-flex items-center px-1 pt-1 hover:text-gray-600 relative group">
                      <span className="relative">
                        DU testing add
                        <span className="absolute left-0 bottom-0 w-full h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                      </span>
                    </Link>
                  ) : <></>
                }
              */}
              {
                user ?(
                  <Link href="/DoctorChat" className="text-foreground inline-flex items-center px-1 pt-1 hover:text-gray-600 dark:hover:text-gray-300 relative group">
                    <span className="relative">
                      Messenger
                      <span className="absolute left-0 bottom-0 w-full h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                    </span>
                  </Link>
              ) : <></>
            }
            {
                user ?(
                  <Link href="/Help" className="text-foreground inline-flex items-center px-1 pt-1 hover:text-gray-600 dark:hover:text-gray-300 relative group">
                    <span className="relative">
                      Help
                      <span className="absolute left-0 bottom-0 w-full h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                    </span>
                  </Link>
              ) : <></>
            }
            </div>
          </div>
          <div className="flex items-center space-x-4 lg:pr-10">
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full hover:opacity-80 transition p-0.5 h-10 w-10"
            >
              <Sun className="h-5 w-5 text-yellow-500 dark:hidden" />
              <Moon className="h-5 w-5 text-primary hidden dark:block" />
            </Button>
          </>
            {loading ? (
              <>
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-20" />
              </>
            ) : user ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div>
                      <Image
                        src="/notifications.svg"
                        alt="Notifications"
                        width={40}
                        height={40}
                        className='cursor-pointer hover:opacity-80 shadow-[0_0_3px_rgba(0,0,0,0.3)] rounded-full p-0.5 dark:hidden'
                      />
                      <Image
                        src="/notificationsdark.svg"
                        alt="Notifications"
                        width={40}
                        height={40}
                        className='cursor-pointer bg-zinc-800 hover:opacity-80 shadow-[0_0_3px_rgba(0,0,0,0.3)] rounded-full p-0.5 hidden dark:block'
                      />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[300px]">
                    {notifications.length > 0 ? (
                      notifications.map((notification, index) => (
                        <div key={index}>
                          <DropdownMenuItem 
                            className="cursor-pointer py-3"
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="flex items-center w-full">
                              <div className="flex-shrink-0 mr-3">
                                <Image
                                  src={notification.senderProfileImage || '/profpic.png'}
                                  alt="Profile"
                                  width={40}
                                  height={40}
                                  className="rounded-full object-cover w-10 h-10"
                                />
                              </div>
                              <div className="flex flex-col flex-1 min-w-0">
                                <span className="font-medium truncate">{notification.senderName}</span>
                                <span className="text-sm text-muted-foreground break-words overflow-hidden text-ellipsis line-clamp-2">{notification.content}</span>
                              </div>
                              <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
                            </div>
                          </DropdownMenuItem>
                          {index < notifications.length - 1 && (
                            <div className="h-px bg-border mx-2" />
                          )}
                        </div>
                      ))
                    ) : (
                      <DropdownMenuItem>
                        <div className="text-center w-full text-muted-foreground">
                          No new messages
                        </div>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      className="cursor-pointer py-2 mt-2 border border-gray-200 dark:border-zinc-800" 
                      onClick={handleNewMessageClick}
                    >
                      <div className="flex items-center justify-center w-full text-primary dark:text-secondary">
                        <Edit2 className="mr-2 h-4 w-4" />
                        <span className='text-muted-foreground'>New Message</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Link href={getSettingsRoute()}>
                  <Image
                    src="/settings2.png"
                    alt="Settings"
                    width={40}
                    height={40}
                    className='cursor-pointer hover:opacity-80 shadow-[0_0_3px_rgba(0,0,0,0.3)] rounded-full p-0.5 dark:hidden'
                  />
                  <Image
                    src="/settings2dark.svg"
                    alt="Settings"
                    width={40}
                    height={40}
                    className='cursor-pointer bg-zinc-800 hover:opacity-80 shadow-[0_0_3px_rgba(0,0,0,0.3)] rounded-full p-0.5 hidden dark:block'
                  />
                </Link>
                <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="dark:text-black">Log Out</Button>
                  </DialogTrigger>
                  <DialogContent className="top-1/4 sm:max-w-[425px] w-[90vw] max-w-[90vw] rounded-lg">
                    <DialogHeader>
                      <DialogTitle>Confirm Logout</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to log out?
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-end flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-2">
                      <Button onClick={handleLogout} className="w-full sm:w-auto">Log Out</Button>
                      <Button variant="outline" onClick={() => setIsLogoutDialogOpen(false)} className="w-full sm:w-auto">Cancel</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            ) : (
              <>
                {pathname !== '/login' && (
                  <Link href="/login"><Button variant="outline">Login</Button></Link>
                )}
                {pathname !== '/signup' && (
                  <Link href="/signup"><Button>Sign Up</Button></Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
