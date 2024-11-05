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
              <div className="flex items-center space-x-6">
                {/* profile image skeleton */}
                <Skeleton className="w-32 h-32 rounded-full" />
                
                <div className="flex-1">
                  {/* name and specialty skeletons */}
                  <Skeleton className="w-64 h-6 mb-2" />
                  <Skeleton className="w-48 h-4 mb-4" />
                  
                  {/* icon and text row skeletons */}
                  <div className="flex space-x-4">
                    <div className="w-5">
                      <Skeleton className="w-5 h-5" />
                    </div>
                    <Skeleton className="w-48 h-4 mb-2" />
                  </div>
                  <div className="flex space-x-4">
                    <div className="w-5">
                      <Skeleton className="w-5 h-5" />
                    </div>
                    <Skeleton className="w-64 h-4 mb-2" />
                  </div>
                  <div className="flex space-x-4">
                    <div className="w-5">
                      <Skeleton className="w-5 h-5" />
                    </div>
                    <Skeleton className="w-56 h-4 mb-2" />
                  </div>
                  <div className="flex space-x-4">
                    <div className="w-5">
                      <Skeleton className="w-5 h-5" />
                    </div>
                    <Skeleton className="w-40 h-4 mb-2" />
                  </div>
                </div>
              </div>

              {/* upload area skeleton */}
              <div className="mt-6">
                <Skeleton className="w-full h-32" />
              </div>

              {/* buttons skeleton */}
              <div className="flex justify-end space-x-2 mt-4">
                <Skeleton className="w-20 h-10" />
                <Skeleton className="w-20 h-10" />
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
                    />
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center space-x-4">
                      <div
                        {...getRootProps()}
                        className={`p-8 border-2 border-dashed rounded-lg cursor-pointer flex-1
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
                          <p className="text-center text-gray-500 text-sm sm:text-base">
                            Upload a new profile picture here, or click to select
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
                    {userData.profileImage && (
                      <Button
                        variant="destructive"
                        onClick={() => setToBeRemoved(true)}
                        disabled={uploading || toBeRemoved}
                        className="w-full sm:w-auto"
                      >
                        Remove current picture
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
                      {uploading ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
