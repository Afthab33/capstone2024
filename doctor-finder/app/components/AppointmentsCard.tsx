
import { Button } from '@/components/ui/button';
import { Star, Shield, MessageCircle, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';

import { use, useCallback, useMemo, useState } from 'react';
import { collection, addDoc, getFirestore, Timestamp, serverTimestamp, CollectionReference, DocumentData, getDoc, doc, documentId } from 'firebase/firestore';
import { db as getFirebaseDb, useAuth } from '../authcontext';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';

interface AppointmentsCardProps {
  firstName: string;
  lastName: string;
  specialty: string;
  degree: string;
  id: string;
  streetAddress: string;
  clinicName:string;
  city: string;
  state: string;
  zipCode: string;
  acceptedInsurances: string[];
  spokenLanguages: string[];
  rating?: number;
  reviewCount?: number;
  scheduled: Timestamp;
  availability?: {
    [date: string]: string[];
  };
  previewImage?: string | null;

}

// interface AppointmentProps {
//   id: string;
//   doctorId: string;
//   patientId: string;
//   datetime: Timestamp;
//   status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
//   visitDetails: {
//     reason: string;
//     insurance: string;
//     patientType: 'new' | 'returning';
//     notes?: string;
//   };
//   doctorInfo: {
//     name: string;
//     specialty: string;
//     degree: string;
//     location: string;
//   };
//   patientInfo: {
//     name: string;
//     email: string;
//   };
//   createdAt: Timestamp;
//   updatedAt: Timestamp;
// }


export default function AppointmentsCard({
  firstName,
  lastName,
  specialty,
  degree,
  id,
  streetAddress,
  clinicName,
  city,
  state,
  zipCode,
  acceptedInsurances,
  spokenLanguages,
  rating = 0,
  reviewCount = 0,
  scheduled,
  availability,
  previewImage
}: AppointmentsCardProps) {

  const weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const day = weekday[scheduled.toDate().getDay()];
  const month = months[scheduled.toDate().getMonth()];
  const date = scheduled.toDate().getDate();
  const year = scheduled.toDate().getFullYear();
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState('');
  const [open, setOpen] = useState(false);
  const [starCount, setStarCount] = useState(0);
  const [review, setReview] = useState('');
  const { user, loading: authLoading } = useAuth();
  const [doctor, setDoctor] = useState<any>(null);
  const { toast } = useToast();

  const displayName = `${degree === 'MD' ? 'Dr. ' : ''}${firstName + ' ' + lastName}${degree ? `, ${degree}` : ''}`;

  const displayInsurances = acceptedInsurances.length > 4
    ? `${acceptedInsurances.slice(0, 4).join(', ')} `
    : acceptedInsurances.join(', ');

  const remainingCount = acceptedInsurances.length > 4
    ? acceptedInsurances.length - 4
    : 0;


  const getVisits = async () => {
    const db = getFirestore()
    try {
      const docRef = doc(db, "appointmentHistory", "docId");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists())
        console.log("document data", docSnap.data())
      else console.log("No such document")
    } catch (error) {
      console.log(error)
    }

  }
  // const getAppointmentVisit = async () => {

  //   try {
  //     // const db = getFirebaseDb();
  //     // const appointmentsRef = collection(db, 'appointments');
  //     // const userDoc = await getDoc(doc(db, 'users', user!.uid));
  //     // const userData = userDoc.data();
  //     // const patientName = userData ?
  //     //   `${userData.firstName} ${userData.lastName}` :
  //     //   'Unknown';
  //   } catch (error) {
  //     console.error('Error retrieving appiontments:', error);
  //     // });
  //   }
  // }
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
    const nextAvailableAppointment = getNextAvailable();
    const nextAvailableText = nextAvailableAppointment 
      ? format(new Date(`${nextAvailableAppointment.date}T${nextAvailableAppointment.time}`), 'EEE, MMM d')
      : 'No availability';

  // const appointmentData: Omit<Appointment, 'id'> = {
  // doctorId: id,
  //   patientId: user!.uid,
  //   datetime: Timestamp.fromDate(appointmentDate),
  //   status: 'scheduled',
  //   visitDetails: {
  //     reason: bookingPrereqs.reason,
  //     insurance: bookingPrereqs.insurance,
  //     patientType: bookingPrereqs.patientType as 'new' | 'returning',
  //     ...(appointmentNotes.trim() && { notes: appointmentNotes.trim() })
  //   },
  //   doctorInfo: {
  //     name: displayName,
  //     specialty: doctor?.specialty,
  //     degree: doctor?.degree,
  //     location: `${doctor?.streetAddress}, ${doctor?.city}, ${doctor?.state} ${doctor?.zipCode}`
  //   },
  //   patientInfo: {
  //     name: patientName,
  //     email: user?.email || 'Unknown'
  //   },
  //   createdAt: Timestamp.now(),
  //   updatedAt: Timestamp.now()
  // };
  // const newAppointmentRef = doc(appointmentsRef);

  const handleReviewSubmit = async () => {
    if (review.length === 0 && starCount === 0) {
      return;
    }


    try {
      const db = getFirebaseDb();
      const reviewsRef = collection(db, 'reviews');

      await addDoc(reviewsRef, {
        rating: starCount,
        review: review.trim(),
        doctorId: id,
        doctorName: displayName,
        reviewedBy: user?.uid,
        reviewerEmail: user?.email,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      toast({
        title: "Review Submitted",
        description: "Thank you for your review.",
        className: "bg-primary text-white",
      });

      setOpen(false);
      setReview('');
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        variant: "destructive",
        title: "Review Failed",
        description: "There was a problem submitting your review. Please try again.",
      });
    }
  };
  // Function to a appointment to history Firestore
  const handleAppointment = async () => {
    getVisits();
    setLoading(true);
    try {
      const db = getFirebaseDb();
      const docRef = await addDoc(collection(db, 'appointmentHistory'), {
        firstName,
        lastName,
        specialty,
        degree,
        id,
        //  nextAvailable,
        clinicName,
        streetAddress,
        city,
        state,
        zipCode,
        acceptedInsurances,
        spokenLanguages,
        rating,
        reviewCount,
      }
      );

      setBooked(`Document added with ID: ${docRef.id}`);
    } catch (error) {
      console.error('Error fetching appointment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fillStars = () => {
    const starMap = new Map();
    //unfill stars
    for(let i =1; i<=5; i++){
    starMap.set(i, <Star className="w-2 h-2 sm:w-14 sm:h-14 text-blue-400 unfill-current " strokeWidth={1.5}/>);
    }
    //add fill stars
    for (let index = 1; index <= starCount; index++) {
      starMap.set(index, <Star className="w-4 h-4 sm:w-14 sm:h-14 text-blue-400 fill-current" />);
    }
    console.log(starCount, booked);

    return <>
      <div className='flex flex-row gap-4 items-center'>
        {
          Array.from(starMap.values(), (star, index: number) =>
            <div key={index}> <button onClick={() => setStarCount(index + 1)}> {star}</button></div>,
          )
        }
      </div>
    </>
  }
  return (
    <>

      <div className="flex items-center justify-between w-full max-w p-4 bg-white rounded-lg ">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 relative">
            {/* Placeholder for 's image */}
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
          <div>
            <div className='flex justify-left text-gray-500 mb-2' style={{ position: "relative", right: "80px", fontSize: "15px" }}>
              {day}, {month} {date} {year}
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

              <div > {rating} · {reviewCount} · Reviews</div>  {/*add distance*/}
              <div > {streetAddress}, {city}, {state} {zipCode}</div>  {/*add distance*/}
              <div >Accepts {acceptedInsurances.join(', ')} </div>
              <div >Speaks {spokenLanguages.join(', ')}</div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex flex-col items-end">
            <p className="text-sm text-gray-500 mb-2 ">Next available: {nextAvailableText}</p>

            {/* <Link href={{
              pathname: "/appointments",
              query: {
                id,
                firstName,
                lastName,
                specialty,
                degree,
                streetAddress,
                city,
                state,
                zipCode,
              }
            }}> */}
            {/* </Link >  */}

            <Link href={`/viewDoctor/${id}`}>
              <Button className=" mb-2" style={{
                width: 175
              }} 
              // onClick={handleAppointment} disabled={loading} 
              >
                Book Again
              </Button>
            </Link>


            <Dialog
              open={open}
              onOpenChange={(open) => {
                setOpen(open);
                if (!open) {
                  setReview('');
                  setStarCount(0);
                  console.log(open);
                }
              }}
            >
              <Button onClick={() => setOpen(!open)} className="mb-2 " style={{
                backgroundColor: "#829eb5",
                width: 175
              }} >
                Leave a Review
              </Button>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Write a review</DialogTitle>

                  <div className='flex flex-row '>
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

                  <hr className="border-gray-200 mb-2" />

                </DialogHeader>
                <div className='flex justify-center'>{fillStars()}</div>
                <div>
                  <textarea
                    className="w-full min-h-[100px] p-3 rounded-md border border-gray-200 focus:outline-none focus:border-gray-300"
                    placeholder="Reviews write here..."
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                  />
                  <Button
                    className="w-full"
                    onClick={handleReviewSubmit}
                    disabled={review.length == 0 && starCount == 0}
                  >
                    Submit
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div >
      <hr style={{ border: '1px solid gray-200' }} />
    </>
  )
}


