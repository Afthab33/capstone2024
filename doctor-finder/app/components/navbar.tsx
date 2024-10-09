'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { useAuth, auth as getFirebaseAuth, clearUserCache } from "../authcontext";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useState } from 'react';

const Navbar = () => {
  const { user, loading } = useAuth(); // get user and loading state from authcontext
  const pathname = usePathname(); // get pathname from next/navigation
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const handleLogout = () => {
    clearUserCache(); // clear user cache
    getFirebaseAuth().signOut(); // sign out user
    console.log('User logged out');
    setIsLogoutDialogOpen(false);
  };

  return (
    <nav className="bg-background border-b border-gray-200">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center lg:pl-10">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo.svg"
                  alt="Doctor Finder Logo"
                  width={95}
                  height={95}
                />
              </Link>
            </div>
            <div className="hidden pl-5 sm:ml-6 sm:flex sm:space-x-8">
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
            </div>
          </div>
          <div className="flex items-center space-x-4 lg:pr-10">
            {loading ? (
              <>
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-20" />
              </>
            ) : user ? (
              <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
                <DialogTrigger asChild>
                  <Button>Log Out</Button>
                </DialogTrigger>
                <DialogContent className="top-1/4">
                  <DialogHeader>
                    <DialogTitle>Confirm Logout</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to log out?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsLogoutDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleLogout}>Log Out</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
