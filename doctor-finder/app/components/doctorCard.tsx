'use client';

import { Button } from '@/components/ui/button';
import { Star, Shield, MessageCircle, MapPin } from 'lucide-react';

interface DoctorCardProps {
    name: string;
    specialty: string;
    nextAvailable: string;
    clinicName: string;
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
    acceptedInsurances: string[];
    spokenLanguages: string[];
  }
  
  export default function DoctorCard({
    name,
    specialty,
    nextAvailable,
    //clinicName,   may use later
    streetAddress,
    city,
    state,
    zipCode,
    acceptedInsurances,
    spokenLanguages,
  }: DoctorCardProps) {
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
                <span className="text-lg font-semibold text-gray-800">{name}</span>
                <h3 className="text-gray-500 text-sm 1px mb-2">{specialty}</h3>
                <div className="flex flex-col items-left text-sm mb-2"  >
    
                  <Star className="w-5 h-5 text-yellow-400 fill-current mb-2" />
                  <MapPin className="w-5 h-5 text-black-500 mb-2" />
                  <Shield className="w-5 h-5 text-blue-500 mb-2" />
                  <MessageCircle className="w-5 h-5 text-black-500 mb-2" />
    
                </div>
                <div className='flex flex-col mb-2 space-y-1' style={{ position: "relative", top: "-122px", left: "25px", marginRight: "175px" , marginBottom: "-110px"}}>
    
                  <div >5 · 144 reviews</div>
                  <div >1.3mi · {streetAddress}, {city}, {state} {zipCode}</div>  {/*add distance*/}          
                  <div >Accepts, {acceptedInsurances.join(', ')}</div>
                  <div >Speaks {spokenLanguages.join(', ')}</div>
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
                    View
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <hr style={{ border: '1px solid gray-200' }} />
        </>
      );
  }
  