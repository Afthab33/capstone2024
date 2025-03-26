'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { useAuth, auth as getFirebaseAuth, clearUserCache, db as getFirebaseDb } from "../authcontext";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { useTheme } from "next-themes";                     // Dark/Light Mode
import { Moon, Sun } from "lucide-react";                   // Dark/Light Mode

interface UserData {
  role?: string;
}

const Navbar = () => {
  const { user, loading } = useAuth(); // get user and loading state from authcontext
  const pathname = usePathname(); // get pathname from next/navigation
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { theme, setTheme } = useTheme();
  
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

  return (
    <nav className="bg-background border-b border-gray-200 relative z-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center lg:pl-10">
            <div className="flex-shrink-0 flex items-center pr-5">
              <Link href="/" className="flex items-center">
                <Image
                  src="/logonew.svg"
                  alt="Doctor Finder Logo"
                  width={95}
                  height={95}
                  className="pt-2"
                  priority
                />
              </Link>
            </div>

            {/*search bar here*/}
            <form onSubmit={handleSearch} className="hidden sm:flex items-center border rounded-lg overflow-hidden">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search doctors..."
                className="px-3 py-2 w-64 border-none focus:ring-0 focus:outline-none"
              />
            </form>


            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {
                user ? (<Link href="/visits" className="text-gray-900 inline-flex items-center px-1 pt-1 hover:text-gray-600 relative group">
                  <span className="relative">
                    Visits
                    <span className="absolute left-0 bottom-0 w-full h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                  </span>
                </Link>) : <></>
              } 
              <Link href="/viewall" className="text-gray-900 inline-flex items-center px-1 pt-1 hover:text-gray-600 relative group">
             
                <span className="relative">
                  View All Doctors
                  <span className="absolute left-0 bottom-0 w-full h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                </span>
              </Link>
              <Link href="/aboutus" className="text-gray-900 inline-flex items-center px-1 pt-1 hover:text-gray-600 relative group">
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
                  <Link href="/DoctorChat" className="text-gray-900 inline-flex items-center px-1 pt-1 hover:text-gray-600 relative group">
                    <span className="relative">
                      Messenger
                      <span className="absolute left-0 bottom-0 w-full h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                    </span>
                  </Link>
              ) : <></>
            }
            {
                user ?(
                  <Link href="/Help" className="text-gray-900 inline-flex items-center px-1 pt-1 hover:text-gray-600 relative group">
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
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition p-2"
            >
              {theme === "dark" ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-gray-800" />}
            </Button>
          </>
            {loading ? (
              <>
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-20" />
              </>
            ) : user ? (
              <>
                <Link href={getSettingsRoute()}>
                  <Image
                    src="/settings2.png"
                    alt="Settings"
                    width={40}
                    height={40}
                    className="cursor-pointer hover:opacity-80 shadow-[0_0_3px_rgba(0,0,0,0.3)] rounded-full p-0.5"
                  />
                </Link>
                <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>Log Out</Button>
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
