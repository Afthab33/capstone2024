'use client';

import { Star, Shield, MessageCircle, MapPin, Pencil } from 'lucide-react';
import Image from 'next/image';

interface DoctorProfileCardProps {
  name: string;
  specialty: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  acceptedInsurances: string[];
  spokenLanguages: string[];
  previewImage?: string | null;
  rating?: number;
  reviewCount?: number;
  degree?: string;
  setIsDialogOpen?: (open: boolean) => void;
}

export default function DoctorProfileCard({
  name,
  degree,
  specialty,
  streetAddress,
  city,
  state,
  zipCode,
  acceptedInsurances,
  spokenLanguages,
  previewImage,
  rating = 0,
  reviewCount = 0,
  setIsDialogOpen,
}: DoctorProfileCardProps) {
  const displayName = `${degree === 'MD' ? 'Dr. ' : ''}${name}${degree ? `, ${degree}` : ''}`;

  const displayInsurances = acceptedInsurances.length > 4 
    ? `${acceptedInsurances.slice(0, 4).join(', ')} `
    : acceptedInsurances.join(', ');

  const remainingCount = acceptedInsurances.length > 4 
    ? acceptedInsurances.length - 4 
    : 0;

  return (
    <>
      <div className="flex items-center justify-between w-full p-4 bg-white rounded-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center sm:space-x-6 w-full">
          <div className="profile-image mb-4 sm:mb-0">
            <div className="relative group">
              <div 
                className={`w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden transition-opacity duration-200 ${setIsDialogOpen ? 'cursor-pointer group-hover:opacity-75' : ''}`}
                onClick={() => setIsDialogOpen && setIsDialogOpen(true)}
              >
                {previewImage ? (
                  <div className="relative w-full h-full rounded-full overflow-hidden">
                    <Image 
                      src={previewImage} 
                      alt="Profile" 
                      fill
                      className="object-cover rounded-full"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center relative rounded-full overflow-hidden">
                    <Image
                      src="/profpic.png"
                      alt="Profile placeholder"
                      fill
                      className="object-cover rounded-full"
                    />
                  </div>
                )}
              </div>
              {setIsDialogOpen && (
                <div 
                  className="absolute top-0 right-0 p-2 bg-primary rounded-full shadow-lg cursor-pointer transition-transform duration-200 group-hover:scale-110"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDialogOpen(true);
                  }}
                >
                  <Pencil className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          </div>
          <div className="w-full">
            <span className="text-base sm:text-lg font-semibold text-gray-800">{displayName}</span>
            <h3 className="text-md sm:text-md text-gray-500 mb-2">{specialty}</h3>
            <div className="flex flex-col sm:flex-col gap-2 text-sm sm:text-base">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                <span>
                  {rating}
                  <span className="font-semibold"> · {reviewCount} reviews</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-black-500" />
                <span className="flex-wrap">{streetAddress}, {city}, {state} {zipCode}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                <span className="flex-wrap">
                  Accepts {displayInsurances}
                  {remainingCount > 0 && <span className="font-semibold">+ {remainingCount} more</span>}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-black-500" />
                <span className="flex-wrap">Speaks {spokenLanguages.join(', ')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
