'use client';

import { Star, Shield, MessageCircle, MapPin } from 'lucide-react';
import { useState } from 'react';
//name specialty available location language reviews medicare plans
interface AppointmentsCardProps {
  
  specialty: string;
  nextAvailable: string;
  location?: string;
}

function AppointmentsCard({ specialty, nextAvailable }: AppointmentsCardProps) {
  return (
    <div className="flex items-center justify-between w-full max-w-2xl p-4 bg-white rounded-lg shadow">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
          {/* Placeholder for 's image */}
          <span className="text-gray-500 text-2xl">DR</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{nextAvailable}</h3>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex flex-col items-center space-y-2">
          <Star className="w-5 h-5 text-yellow-400 fill-current" />
          <MapPin className="w-5 h-5 text-blue-500" />
          <Shield className="w-5 h-5 text-blue-500" />
          <MessageCircle className="w-5 h-5 text-blue-500" />
        </div>
        <div className="flex flex-col items-end">
          <p className="text-sm text-gray-600 mb-2">Next available:{specialty}</p>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300">
            Book Online
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AppointmentsPage({ location }: AppointmentsCardProps) {

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

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-4 text-center">Top Rated doctor's in {location} </h1>
        <div className="overflow-y-auto max-h-[calc(100vh-8rem)] pr-2">
          {appointments.map((appointment, index) => (
            <AppointmentsCard key={index} {...appointment} />
          ))}
        </div>
      </div>
    </div>
  );
}
