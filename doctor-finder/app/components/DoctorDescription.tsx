'use client';

import { Button } from '@/components/ui/button';
import { Star, Shield, MessageCircle, User, EllipsisVertical, MessageCircleWarning } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';



interface DoctorProfile {
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

export default function DoctorProfile({
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
}: DoctorProfile) {
    const displayName = `${degree === 'MD' ? 'Dr. ' : ''}${name}${degree ? `, ${degree}` : ''}`;

    const displayInsurances = acceptedInsurances.length > 4
        ? `${acceptedInsurances.slice(0, 4).join(', ')} `
        : acceptedInsurances.join(', ');

    const remainingCount = acceptedInsurances.length > 4
        ? acceptedInsurances.length - 4
        : 0;

    const TwoPeopleSeparated = () => (
        <div className=' flex item-center'>
            <User />
            <EllipsisVertical />
            <User />
        </div>
    );
    const ReportDoctor = () => (
        <div className='flex items-center' >

            <User />
            <MessageCircleWarning className='w-5 h-5' />
        </div>
    );
    return (
        <>
            <div className="flex items-center justify-between w-full p-4 bg-white rounded-lg ">
                <div className="flex flex-col sm:flex-row items-start sm:items-center sm:space-x-6 w-full">

                    <div className="w-full">
                        <div className='flex flex-row ml-20 mt-10'>
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
                                <h3 className="flex justify-start  text-xl font-semibold text-gray-800 mt-8 ml-6 "> {displayName}</h3>
                                <h3 className="text-gray-500 text-lg 1px  ">{specialty}</h3>
                                <div className='pt-0' > {streetAddress}, {city}, {state} {zipCode}</div>  {/*add distance*/}

                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-col gap-2 text-sm sm:text-base mt-8 mr-20 ml-20">
                            <div className='flex items-stretch gap-5 rounded-lg  '
                                style={{
                                    backgroundColor: "#ededed"
                                }}>
                                <div className="flex items-center gap-2 ">
                                    <div className="flex flex-col items-center text-lg font-semibold text-gray-800">
                                        <span className="text-2xl font-semibold ">
                                            {rating}
                                        </span>

                                        <div className='flex flex-row gap-1 items-center ml-5 '>

                                            {/* going to be function */}
                                            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 " />
                                            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 " />
                                            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 " />
                                            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 " />
                                            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 " />

                                        </div>

                                    </div>
                                </div>
                                <div className='border border-left 4px solid-gray'></div>
                                <div className="flex justify-between items-end flex-col pl-4 pb-4 ">
                                    <div className="text-gray-500 text-sm 1px mb-2 ">

                                        Lorem ipsum dolor sit ameue idil fugiat iusto quibusdam nisi exercitationem dolore. Ducimus deleniti sapiente sit quae?
                                    </div>
                                    <div className='font-semibold text-sm text-gray-800 pr-4 underline underline-offset-4'>

                                        <Link href=''>
                                            See all {reviewCount} reviews
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 pt-10">
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
                            <hr className="border-gray-200 " />
                        </div>
                    </div>
                </div>
            </div>
            <div className='flex justify-center gap-6'>
                <div>
                    <Link href="/appoinments">
                        <Button className=" mb-2 mt-4 text-gray-400 h-12" style={{
                            backgroundColor: "#E3E4E5",
                            width: "275px",

                        }} >
                            <div className='flex items-center gap-4 text-gray-400 font-semibold mr-8 '>
                                <ReportDoctor />
                                Report Profile</div>
                        </Button>
                    </Link>
                </div>
                <div>
                    <Button className="mb-2 mt-4 text-gray-400  h-12" style={{
                        // backgroundColor: "#E3E4E5",
                        backgroundColor: "#EDEDED",
                        width: "275px",

                    }}>
                        <div className='flex items-center gap-4 text-gray-400 font-semibold  '>
                            <TwoPeopleSeparated />
                            Compare Doctors
                        </div>
                    </Button>
                </div>
            </div>

        </>
    );
}



