'use client';

import { Star, Shield, MessageCircle, MapPin } from 'lucide-react';
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
            <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 relative">
              {previewImage ? (
                <Image 
                  src={previewImage} 
                  alt="Profile" 
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center relative">
                  <Image
                    src="https://firebasestorage.googleapis.com/v0/b/dfdatabase-c1532.appspot.com/o/profpic.svg?alt=media&token=2b600d7a-bd04-4da4-8e71-f77a7c562182"
                    alt="Profile placeholder"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="w-full">
            <span className="text-base sm:text-lg font-semibold text-gray-800">{displayName}</span>
            <h3 className="text-xs sm:text-sm text-gray-500 mb-2">{specialty}</h3>
            <div className="flex flex-col sm:flex-col gap-2 text-sm sm:text-base">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
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
      <hr className="border-gray-200" />
    </>
  );
}
