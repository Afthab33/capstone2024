'use client';

import { Star, Shield, MessageCircle, MapPin, Pencil } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';

interface DoctorProfileCardProps {
  id?: string;
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
  availability?: {
    [date: string]: string[];
  };
}

export default function DoctorProfileCard({
  id,
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
  availability,
}: DoctorProfileCardProps) {
  const displayName = `${degree === 'MD' ? 'Dr. ' : ''}${name}${degree ? `, ${degree}` : ''}`;

  const displayInsurances = acceptedInsurances.length > 3 
    ? `${acceptedInsurances.slice(0, 3).join(', ')} `
    : acceptedInsurances.join(', ');

  const remainingInsuranceCount = acceptedInsurances.length > 3 
    ? acceptedInsurances.length - 3 
    : 0;

  const displayLanguages = spokenLanguages.length > 3
    ? `${spokenLanguages.slice(0, 3).join(', ')} `
    : spokenLanguages.join(', ');

  const remainingLanguageCount = spokenLanguages.length > 3
    ? spokenLanguages.length - 3
    : 0;

  const getNextAvailable = () => {
    if (!availability) return null;

    const now = new Date();
    const today = format(now, 'yyyy-MM-dd');
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const isAfterWorkday = currentHour >= 17; // 5 PM 
    
    // sort dates
    const dates = Object.keys(availability).sort();
    
    for (const date of dates) {
      // skip dates before today
      if (date < today) continue;
      
      const times = availability[date];
      
      // if it's today and after work hours, skip today entirely
      if (date === today && isAfterWorkday) {
        continue;
      }
      
      // if it's today, filter out past times
      if (date === today) {
        const validTimes = times.filter(time => {
          const [hours, minutes] = time.split(':').map(Number);
          return hours > currentHour || (hours === currentHour && minutes > currentMinute);
        });
        if (validTimes.length > 0) {
          return { date, time: validTimes[0] };
        }
      } else {
        // for future dates, return first available time
        if (times.length > 0) {
          return { date, time: times[0] };
        }
      }
    }
    return null;
  };

  const nextAvailable = getNextAvailable();
  const nextAvailableText = nextAvailable 
    ? format(new Date(`${nextAvailable.date}T${nextAvailable.time}`), 'EEE, MMM d')
    : 'No availability';

  return (
    <>
      <div className="flex flex-col sm:flex-row w-full p-4 bg-white rounded-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center sm:space-x-6 w-full">
          <div className="profile-image mb-4 sm:mb-0">
            <div className="relative group">
              <div 
                className={`w-28 h-28 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden transition-opacity duration-200 ${setIsDialogOpen ? 'cursor-pointer group-hover:opacity-75' : ''}`}
                onClick={() => setIsDialogOpen && setIsDialogOpen(true)}
              >
                {previewImage ? (
                  <div className="relative w-full h-full rounded-full overflow-hidden">
                    <Image 
                      src={previewImage} 
                      alt="Profile" 
                      fill
                      sizes="112px"
                      quality={95}
                      className="object-cover rounded-full"
                      priority
                    />
                  </div>
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center relative rounded-full overflow-hidden">
                    <Image
                      src="/profpic.png"
                      alt="Profile placeholder"
                      fill
                      sizes="112px"
                      quality={95}
                      className="object-cover rounded-full"
                      priority
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
          <div className="w-full relative">
            <div>
              <span className="doctor-name text-base sm:text-lg font-semibold text-gray-800">{displayName}</span>
              <h3 className="text-md sm:text-md text-gray-500 mb-1">
                {specialty}
              </h3>
            </div>
            
            <div className="flex flex-col sm:flex-col gap-1 text-sm sm:text-base">
              <div className="flex items-center">
                <div className="flex items-center gap-2">
                  <Star className="min-w-5 min-h-5 w-5 h-5 text-yellow-400" />
                  <span>
                    {rating}
                    <span className="font-semibold"> · {reviewCount} reviews</span>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="min-w-5 min-h-5 w-5 h-5 text-black-500" />
                <span className="flex-wrap">{streetAddress}, {city}, {state} {zipCode}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="min-w-5 min-h-5 w-5 h-5 text-blue-500" />
                <span className="flex-wrap">
                  Accepts {displayInsurances}
                  {remainingInsuranceCount > 0 && <span className="font-semibold">+ {remainingInsuranceCount} more</span>}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="min-w-5 min-h-5 w-5 h-5 text-black-500" />
                <span className="flex-wrap">
                  Speaks {displayLanguages}
                  {remainingLanguageCount > 0 && (
                    <span className="font-semibold">+ {remainingLanguageCount} more</span>
                  )}
                </span>
              </div>
            </div>

            {/* button section */}
            {id && (
              <div className="xl:absolute relative mt-4 xl:mt-0 xl:right-0 xl:top-0">
                {/* hide on mobile/tablet, show on desktop */}
                <div className="hidden xl:block text-sm text-gray-500 mb-3 text-center">
                  Next available: {nextAvailableText}
                </div>
                <Link 
                  href={`/viewDoctor/${id}`}
                  className="inline-flex w-full xl:w-auto items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 min-w-[200px]"
                >
                  Book Online
                </Link>
                {/* show on mobile/tablet, hide on desktop */}
                <div className="xl:hidden text-xs text-gray-500 mt-2 text-center">
                  Next available: {nextAvailableText}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
