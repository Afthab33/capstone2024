'use client';

import { Button } from '@/components/ui/button';
import { Star, Shield, MessageCircle, MapPin } from 'lucide-react';
import { useState } from 'react';
//name specialty available location language reviews medicare plans
interface AppointmentsCardProps {
  specialty: string;
  nextAvailable: string;
}

function AppointmentsCard({ specialty, nextAvailable }: AppointmentsCardProps) {
  return (
    <>

      <div className="flex items-center justify-between w-full max-w p-4 bg-white rounded-lg ">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            {/* Placeholder for 's image */}
          </div>
          <div>
            <div className='flex justify-left text-gray-500 mb-2' style={{ position: "relative", right: "80px", fontSize: "15px" }}>
              Tuesday, November 26, 2024 [temp]
            </div>
            <span className="text-lg font-semibold text-gray-800">DR Bob Ross, MD</span>
            <h3 className="text-gray-500 text-sm 1px mb-2">{specialty}</h3>
            <div className="flex flex-col items-left text-sm mb-2"  >

              <Star className="w-5 h-5 text-yellow-400 fill-current mb-2" />
              <MapPin className="w-5 h-5 text-black-500 mb-2" />
              <Shield className="w-5 h-5 text-blue-500 mb-2" />
              <MessageCircle className="w-5 h-5 text-black-500 mb-2" />

            </div>
            <div className='flex flex-col mb-2 space-y-1' style={{ position: "relative", top: "-122px", left: "25px", marginRight: "175px" , marginBottom: "-110px"}}>

              <div >5 · 144 reviews</div>
              <div >1.3mi · 301 Maple St, Denton, Tx 75601</div>
              <div >Accepts, Tricare, Blue Cross, Shield, Humana +12 more</div>
              <div >Speaks English</div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex flex-col items-end">
            <p className="text-sm text-gray-500 mb-2 ">Next available: {nextAvailable}</p>
            <Button className=" mb-2" style={{
              width: 175
            }}>
              Book Again
            </Button>

            <div>
              <Button className="mb-2 " style={{
                backgroundColor: "#829eb5",
                width: 175
              }}>
                Leave a Review
              </Button>
            </div>
          </div>
        </div>
      </div>
      <hr style={{ border: '1px solid gray-200' }} />
    </>
  );
}

export default function AppointmentsPage({ }: AppointmentsCardProps) {

  const [appointments] = useState<AppointmentsCardProps[]>([
    { specialty: 'Internal Medicine', nextAvailable: 'Tue, Nov 26' },
    { specialty: 'Cardiology', nextAvailable: 'Wed, Nov 27' },
    { specialty: 'Pediatrics', nextAvailable: 'Thu, Nov 28' },
    { specialty: 'Dermatology', nextAvailable: 'Fri, Nov 29' },
    { specialty: 'Orthopedics', nextAvailable: 'Mon, Dec 2' },
    { specialty: 'Neurology', nextAvailable: 'Tue, Dec 3' },
    { specialty: 'Ophthalmology', nextAvailable: 'Wed, Dec 4' },
    { specialty: 'Psychiatry', nextAvailable: 'Thu, Dec 5' },
  ]);

  return (<>

    <div className="flex justify-center items-start min-h-screen p-5 flex grow">
      <div className="w-100rem">
        <h1 className="text-2xl font-bold mb-4 text-left">Appointments History </h1>
        <div className="overflow-y-auto max-h-[calc(100vh-8rem)] pr-2">
          {appointments.map((appointment, index) => (
            <AppointmentsCard key={index} {...appointment} />
          ))}
        </div>
      </div>
    </div>
  </>
  );
}
