'use client';

import { Button } from '@/components/ui/button';
import { Star, Shield, MessageCircle, MapPin } from 'lucide-react';
import Link from 'next/link';
//name specialty available location language reviews medicare plans
interface AppointmentsCardProps {
  firstName: string;
  lastName: string;
  specialty: string;
  degree: string;
  id: string;
  nextAvailable: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  acceptedInsurances: string[];
  spokenLanguages: string[];
  rating?: number;
  reviewCount?: number;
}

export default function AppointmentsCard({
  firstName,
  lastName,
  specialty,
  degree,
  id,
  nextAvailable,
  streetAddress,
  city,
  state,
  zipCode,
  acceptedInsurances,
  spokenLanguages,
  rating = 0,
  reviewCount = 0,
}: AppointmentsCardProps) {
  const remainingCount=0;
  return (
    <>
                                        

      <div className="flex items-center justify-between w-full max-w p-4 bg-white rounded-lg ">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 relative">
            {/* Placeholder for 's image */}
          </div>
          <div>
            <div className='flex justify-left text-gray-500 mb-2' style={{ position: "relative", right: "80px", fontSize: "15px" }}>
              Tuesday, November 26, 2024 [temp]
            </div>
            <span className="text-lg font-semibold text-gray-800">DR {firstName} {lastName}, {degree}</span>
            <h3 className="text-gray-500 text-sm 1px mb-2">{specialty}</h3>
            <div className="flex flex-col items-left text-sm mb-2"  >

              <Star className="w-5 h-5 text-yellow-400 fill-current mb-2" />
              <MapPin className="w-5 h-5 text-black-500 mb-2" />
              <Shield className="w-5 h-5 text-blue-500 mb-2" />
              <MessageCircle className="w-5 h-5 text-black-500 mb-2" />

            </div>
            <div className='flex flex-col mb-2 space-y-1 space' style={{ position: "relative", top: "-122px", left: "25px", marginRight: "175px", marginBottom: "-110px" }}>

              <div >{rating} · {reviewCount} · Reviews</div>  {/*add distance*/}
              <div >1.3mi · {streetAddress}, {city}, {state} {zipCode}</div>  {/*add distance*/}
              <div >Accepts, {acceptedInsurances.join(', ')}</div>
              <div >Speaks {spokenLanguages.join(', ')}</div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex flex-col items-end">
            <p className="text-sm text-gray-500 mb-2 ">Next available: {nextAvailable}</p>
            <Link href={`/viewDoctor/${id}`}>
              <Button className=" mb-2" style={{
                width: 175
              }} >
                Book Again
              </Button>
            </Link >

              <Link href='/appoinments'>
                <Button className="mb-2 " style={{
                  backgroundColor: "#829eb5",
                  width: 175
                }}>
                  Leave a Review
                </Button>
              </Link>
          </div>
        </div>
      </div>
      <hr style={{ border: '1px solid gray-200' }} />
    </>
  );
}

