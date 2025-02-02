"use client";

import { use, useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db as getFirebaseDb } from '../../authcontext';
import { useAuth } from '../../authcontext'; // Use the auth context
import { Button } from '@/components/ui/button';
import { Star, Shield, MessageCircle, User, EllipsisVertical, MessageCircleWarning } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import BookAppointment from '@/app/components/BookAppointment';

interface ViewDoctorProps {
  params: Promise<{
    id: string;
  }>;
}

const ViewDoctor = ({ params }: ViewDoctorProps) => {
  const { id } = use(params); // unwrap 'promise'
  const [doctor, setDoctor] = useState<any>(null);
  const { user } = useAuth(); // Use auth context to get the current user
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctor = async () => {
      const db = getFirebaseDb(); // firestore instance
      const doctorRef = doc(db, 'users', id); // reference doctor based on primary key(id)
      try {
        const doctorSnap = await getDoc(doctorRef);
        if (doctorSnap.exists()) {
          setDoctor(doctorSnap.data());
        } else {
          console.error(`No doctor found with id: ${id}`);      // debug, remove later
          setError('Doctor not found');
        }
      } catch (err) {
        console.error('Error fetching doctor:', err);
        setError('Failed to fetch doctor');
      }
      setLoading(false);
    };

    if (user) {
      fetchDoctor(); // Only fetch if the user is authenticated
    } else {
      setLoading(false); // Set loading to false if user is not logged in
    }
  }, [id, user]); // Depend on ID and user state

  const { firstName, lastName, degree, specialty, streetAddress, city, state, zipCode, acceptedInsurances= doctor?.acceptedInsurances || [], spokenLanguages = doctor?.spokenLanguages || [], previewImage, rating, reviewCount } = doctor || {};

  const displayName = `${degree === 'MD' ? 'Dr. ' : ''}${firstName + ' ' + lastName}${degree ? `, ${degree}` : ''}`;

  const displayInsurances = acceptedInsurances.length > 4
    ? `${acceptedInsurances.slice(0, 4).join(', ')} `
    : doctor?.acceptedInsurances.join(', ');

  const remainingCount = acceptedInsurances.length > 4
    ? acceptedInsurances.length - 4
    : 0;

    const [hovered, setHovered] = useState<string | null>(null);
    const TwoPeopleSeparated = () => (
        <div className=' flex item-center'>
            <User />
            <EllipsisVertical />
            <User />
        </div>
    );

    const getButtonStyle = (button: string) => ({
        backgroundColor: hovered === button ? "#E3E4E5" : "#ededed",
    });

  const ReportDoctor = () => (
    <div className='flex items-center' >
        <User />
        <MessageCircleWarning className='w-5 h-5' />
    </div>
);

  const fillStars = () => {
    const starMap = new Map();
    starMap.set(1, <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />);
    starMap.set(2, <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />);
    starMap.set(3, <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />);
    starMap.set(4, <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />);
    starMap.set(5, <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />);
    for (let index = 5; index > rating; index--) {
      starMap.delete(index);
    }
    return <div className='flex flex-row gap-1 items-center'>{Array.from(starMap.values(), (star, index) => <div key={index}>{star}</div>)}</div>;
  };

  return (
    <div className="flex items-center flex-wrap md:flex-nowrap p-8">
       <div className="  ">
                <div className="content-center lg:pl-48 md:pl-0 sm:pl-0">
                    <div className='flex flex-row ml-24 '>
                        <div className="profile-image mb-4 sm:mb-0">
                            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 relative">
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
                                            src="/profpic.png"
                                            alt="Profile placeholder"
                                            fill
                                            className="object-cover"
                                        />

                                    </div>
                                )}
                            </div>
                        </div>
                        <div className='flex flex-col space-x-6  '>
                            <h3 className="flex justify-start  text-xl font-semibold text-gray-800 mt-4 ml-6 "> {displayName}</h3>
                            <h3 className="text-gray-500 text-lg 1px  ">{specialty}</h3>
                            <div > {streetAddress}, {city}, {state} {zipCode}</div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 text-sm sm:text-base mt-6 mr-20 ml-20 ">
                        <div className='flex items-stretch gap-5 rounded-lg  '
                            style={{
                                backgroundColor: "#ededed"
                            }}>
                            <div className="flex items-center gap-2 flex-row">
                                <div className="flex flex-col items-center  text-lg font-semibold text-gray-800 ml-4">
                                    <span className="text-5xl font-semibold ">
                                        {rating}
                                    </span>

                                    <div className='flex flex-row gap-1 items-center '>
                                        {fillStars()}
                                    </div>
                                </div>
                            </div>
                            <div className='border border-left 5px solid-gray'> </div>
                            <div className="flex justify-between items-end flex-col pl-4 pb-4  text-clip overflow-hidden ">
                                <div className=" text-gray-500 text-sm 1px mb-2 pt-4 pr-2">

                                    Lorem ipsum dolor sit ameue idil fugiat iusto quibusdam nisi exercitationem dolore. Ducimus deleniti sapiente sit quae?
                                </div>
                                <div className='font-semibold text-sm text-gray-800 pr-4 underline underline-offset-4'>

                                    <Link href=''>
                                        See all {reviewCount} reviews
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                            <Shield className="w-4 h-4 sm:w-10 sm:h-10 text-blue-500 mb-4" />
                            <div className='flex flex-col '>
                                <span className="text-lg font-semibold text-gray-800 ">
                                    Accepted Insurances
                                    {remainingCount > 0 && <span className="font-semibold">+ {remainingCount} more</span>}
                                </span>
                                <h3 className="text-gray-500 text-sm 1px mb-2  ">{displayInsurances}</h3>
                            </div>
                        </div>
                        <hr className="border-gray-200 mb-2" />
                        <div className="flex items-center gap-2 ">
                            <MessageCircle className="w-4 h-4 sm:w-10 sm:h-10 text-black-500 mb-4" />
                            <div className='flex flex-col'>
                                <span className="text-lg font-semibold text-gray-800">
                                    Spoken Languages
                                </span>
                                <h3 className="text-gray-500 text-sm 1px mb-2  ">{spokenLanguages.join(', ')}</h3>
                            </div>
                        </div>
                        <div className='flex flex-col'>
                            <hr className="border-gray-200 mb-4" />
                            <div className='flex gap-4'>
                                <div>
                                    <Popover >
                                        <PopoverTrigger asChild >
                                            <Button className=" shadow-md text-gray-400 w-50 h-12" style={getButtonStyle("Report Profile")}
                                                onMouseEnter={() => setHovered("Report Profile")}
                                                onMouseLeave={() => setHovered(null)}
                                            >
                                                <div className='flex items-center gap-2 text-gray-400 font-semibold mr-12 '>
                                                    <ReportDoctor />
                                                    Report Profile
                                                </div>
                                            </Button>
                                        </PopoverTrigger >
                                        <PopoverContent className=" w-[32rem] h-[20rem] relative left-1/4 md:left-3/4 "
                                        >
                                            <div className="grid gap-4">
                                                <div className="space-y-1">
                                                    <h4 className="font-medium leading-none ">Report Abuse</h4>
                                                    <p className="text-sm  text-muted-foreground">
                                                        Click all that apply
                                                    </p>
                                                </div>
                                                <div className="grid gap-2">
                                                    <div className="items-top flex space-x-2">
                                                        <Checkbox id="msg1" />
                                                        <div className="grid gap-1.5 leading-none">
                                                            <label
                                                                htmlFor="msg1"
                                                                className="text-sm  text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                            >
                                                                Multiple account listings
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className="items-top flex space-x-2">
                                                        <Checkbox id="msg2" />
                                                        <div className="grid gap-1.5 leading-none">
                                                            <label
                                                                htmlFor="msg2"
                                                                className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                            >
                                                                Invalid doctor information
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className="items-top flex space-x-2">
                                                        <Checkbox id="msg3" />
                                                        <div className="grid gap-1.5 leading-none">
                                                            <label
                                                                htmlFor="msg3"
                                                                className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                            >
                                                                Doctor did not offer that type of service
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="grid col-span w-full gap-6 ">
                                                    <Label htmlFor="reason" />
                                                    <Textarea placeholder="Other reason write here..." id="reason" />
                                                    <Button>Submit</Button>
                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div>
                                    <Button className=" shadow-md text-gray-400 w-50 h-12 " style={getButtonStyle("Compare Doctors")}
                                        onMouseEnter={() => setHovered("Compare Doctors")}
                                        onMouseLeave={() => setHovered(null)}>
                                        <div className='flex items-center gap-2 text-gray-400 font-semibold  '>
                                            <TwoPeopleSeparated />
                                            Compare Doctors
                                        </div>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          <div>
            <BookAppointment />
          </div>
    </div>
  );
}  

export default ViewDoctor;
