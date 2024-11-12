'use client';

import { useAuth } from "../authcontext";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db as getFirebaseDb } from "../authcontext";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import DoctorProfileCard from "../components/DoctorProfileCard";
import { useDropzone } from 'react-dropzone';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";

interface userData {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    sex: string;
    birthday: string;
    clinicName?: string;
    streetAddress?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    specialty?: string;
    degree?: string;
    acceptedInsurances?: string[];
    spokenLanguages?: string[];
    profileImage?: string;
    rating?: number;
    reviewCount?: number;
}

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState<userData | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [toBeRemoved, setToBeRemoved] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchUserData = useCallback(async () => {
    try {
      if (!user) return;
      const db = getFirebaseDb();
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        setUserData(userDoc.data() as userData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/');
        return;
      }
      
      fetchUserData();
    }
  }, [user, authLoading, router, fetchUserData]);

  const onDrop = async (acceptedFiles: File[]) => {
    if (!acceptedFiles[0]) return;
    
    const file = acceptedFiles[0];
    setSelectedFile(file);
    
    // create preview url
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
    
    // close the dialog
    setIsDialogOpen(false);
  };

  const handleSave = async () => {
    if (!user) return;
    
    try {
      setUploading(true);
      const db = getFirebaseDb();

      if (toBeRemoved) {
        await updateDoc(doc(db, 'users', user.uid), {
          profileImage: null
        });
      } else if (selectedFile) {
        const storage = getStorage();
        const storageRef = ref(storage, `doctor-profiles/${user.uid}/${selectedFile.name}`);
        
        await uploadBytes(storageRef, selectedFile);
        const downloadURL = await getDownloadURL(storageRef);
        
        await updateDoc(doc(db, 'users', user.uid), {
          profileImage: downloadURL
        });
      }
      
      await fetchUserData();
      handleCancel(); // clear the preview state
    } catch (error) {
      console.error('Error updating profile picture:', error);
    } finally {
      setUploading(false);
      setToBeRemoved(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setToBeRemoved(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1
  });

  return (
    <div className="flex flex-col h-screen mx-4 sm:mx-20 lg:mx-48">
      {authLoading || !userData ? (
        <div className="pt-10">
          <Skeleton className="w-36 h-8 mb-8" /> {/* title skeleton */}
          <Card>
            <CardContent className="p-2 sm:p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center sm:space-x-6">
                {/* profile image skeleton */}
                <div className="mb-4 sm:mb-0">
                  <Skeleton className="w-32 h-32 rounded-full" />
                </div>

                {/* doctor info skeleton */}
                <div className="flex-1 pt-4">
                  <div className="space-y-3">
                    {/* name and specialty */}
                    <Skeleton className="w-64 h-7" />
                    <Skeleton className="w-48 h-5" />
                    
                    {/* address */}
                    <div className="flex items-center space-x-2">
                      <Skeleton className="w-4 h-4" />
                      <Skeleton className="w-72 h-5" />
                    </div>

                    {/* insurance */}
                    <div className="flex items-center space-x-2">
                      <Skeleton className="w-4 h-4" />
                      <Skeleton className="w-80 h-5" />
                    </div>

                    {/* languages */}
                    <div className="flex items-center space-x-2">
                      <Skeleton className="w-4 h-4" />
                      <Skeleton className="w-56 h-5" />
                    </div>

                    {/* rating */}
                    <div className="flex items-center space-x-2">
                      <Skeleton className="w-4 h-4" />
                      <Skeleton className="w-32 h-5" />
                    </div>
                  </div>
                </div>
              </div>

              <Skeleton className="my-4 h-px" />

              {/* buttons skeleton */}
              <div className="mt-4 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                <Skeleton className="w-full sm:w-40 h-10" />
                <Skeleton className="w-full sm:w-24 h-10" />
                <Skeleton className="w-full sm:w-32 h-10" />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-semibold text-left pt-10">
            {userData.role === 'doctor' ? 'Your Profile' : 'Settings'}
          </h1>
          
          {userData.role === 'doctor' && (
            <div className="mt-8">
              <Card>
                <CardContent className="p-2 sm:p-4">
                  <div>
                    <DoctorProfileCard
                      name={`${userData.firstName} ${userData.lastName}`}
                      degree={userData.degree}
                      specialty={userData.specialty || ''}
                      streetAddress={userData.streetAddress || ''}
                      city={userData.city || ''}
                      state={userData.state || ''}
                      zipCode={userData.zipCode || ''}
                      acceptedInsurances={userData.acceptedInsurances || []}
                      spokenLanguages={userData.spokenLanguages || []}
                      previewImage={toBeRemoved ? null : (previewUrl || userData.profileImage)}
                      rating={userData.rating || 0}
                      reviewCount={userData.reviewCount || 0}
                      setIsDialogOpen={setIsDialogOpen}
                    />
                  </div>

                  <hr className="my-4" />

                  {/* buttons */}
                  <div className="mt-4 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                    {userData.profileImage && (
                      <Button
                        variant="destructive"
                        onClick={() => setToBeRemoved(true)}
                        disabled={uploading || toBeRemoved || selectedFile !== null}
                        className="w-full sm:w-auto"
                      >
                        Remove profile picture
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={uploading || (!selectedFile && !toBeRemoved)}
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={uploading || (!selectedFile && !toBeRemoved)}
                      className="w-full sm:w-auto"
                    >
                      {uploading ? 'Saving...' : 'Save changes'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="top-[35%] sm:top-1/4 sm:max-w-[425px] w-[90vw] max-w-[90vw] rounded-lg">
                  <DialogHeader>
                    <DialogTitle>Update Profile Picture</DialogTitle>
                    <DialogDescription>
                      Upload a new profile picture
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* preview section */}
                    <div className="flex justify-center">
                      <div className="relative w-32 h-32 rounded-full overflow-hidden">
                        <Image
                          src={previewUrl || (toBeRemoved ? '/profpic.png' : userData.profileImage) || '/profpic.png'}
                          alt="Profile Preview"
                          fill
                          className="object-cover"
                          unoptimized={previewUrl ? true : false}
                        />
                      </div>
                    </div>

                    {/* upload section */}
                    <div
                      {...getRootProps()}
                      tabIndex={-1}
                      className={`p-8 border-2 border-dashed rounded-lg cursor-pointer
                        ${isDragActive 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-300 bg-gray-50'
                        }
                        hover:border-blue-500 hover:bg-blue-50 transition-colors`}
                    >
                      <input {...getInputProps()} />
                      {uploading ? (
                        <p className="text-center text-gray-500">Uploading...</p>
                      ) : isDragActive ? (
                        <p className="text-center text-blue-500">Drop the file here...</p>
                      ) : (
                        <p className="text-center text-gray-500">
                          Drag and drop your profile picture here, or click to select
                        </p>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </>
      )}
    </div>
  );
}
