import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Check, Shield } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Card } from "@/components/ui/card"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/calendarCarousel"
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import dayjs from 'dayjs'
import { addDays, eachDayOfInterval, getDate, getDaysInMonth, getYear } from "date-fns";
import { getFirestore, collection, getDocs, query, where, Timestamp,serverTimestamp , addDoc, documentId    } from 'firebase/firestore';
import {  db as getFirebaseDb } from '../authcontext';
import { useAuth } from '../authcontext';


interface BookAppointmentProps {
    firstName: string;
    lastName: string;
    nextAvailable: string;
    id: string;
    degree: string;
    clinicName: string;
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
    specialty: string;
    acceptedInsurances: string[];
    spokenLanguages: string[];
    rating?: number;
    reviewCount?: number;
}
function BookAppointment({
    firstName,
    lastName,
    specialty,
    degree,
    id,
    nextAvailable,
    streetAddress,
    clinicName,
    city,
    state,
    zipCode,
    acceptedInsurances,
    spokenLanguages,
    rating = 0,
    reviewCount = 0,
}: BookAppointmentProps
) {
    // efffect for previous switch patient layout
    // const [hovered, setHovered] = useState<string | null>(null);
    // const [ischeck, setIsCheck] = useState(1);  
    // const getButtonStyle = (button: string) => ({
    //     backgroundColor: hovered === button ? "#E3E4E5" : "#ededed",
    // });

    const [selected, setSelected] = useState<Date>()
    const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
    const today = new Date;
    const month = dayjs().month();
    const year = dayjs().year()
    const [open, setOpen] = useState(false)
    const [appointments, setAppointments] = useState<BookAppointmentProps[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const [booked, setBooked] =useState('')
    const [onSubmit,setOnSubmit]=useState()

    //amount of time slot for patient to book appointments
    const years = 1;
    //get start time 
    const dayOfMonth = getDate(today);
    //get end date
    const nextYear = dayjs().add(years, 'year').get('year');
    const endDate = new Date(nextYear, month, dayOfMonth);

    //Calulate 1 year interval for future appointments
    const bookingInterval = eachDayOfInterval({
        start: today,
        end: endDate
    })

    const formatDate = (mth: number, date: number) => {
        const day = weekday[Number(selected?.getDay())]
        const month = months[Number(selected?.getMonth())]
        const daysInmonth = selected?.getDate().valueOf()
        const futureDate = addDays(new Date(year, mth, date), 4)
        const dim = getDaysInMonth(new Date(year, futureDate.getMonth()))
        const newDay = futureDate.getDay()
        const newMonth = futureDate.getMonth()
        const newDate = futureDate.getDate()
        
        console.log("testing ", "day", day, "after added", newDay, "Month ", newMonth, "date", newDate, "day in month", dim)
        return (<div>
            {selected != null ? <p className='pb-1 text-md font-semibold'>
                {day},  {month}  {daysInmonth}  -  {weekday[newDay]}, {months[newMonth]}  {newDate}
            </p> : <p
                className='pb-1 text-md font-semibold'>{weekday[Number(today.getDay())]},  {months[Number(today.getMonth())]}  {today.getDate().valueOf()}  - {weekday[Number(today.getDay())]},  {months[Number(today.getMonth())]}  {today.getDate().valueOf()}
            </p>}
        </div>)

    }
    function appointmentDate(day: number, month: number, date: number) {
        const d = weekday[day];
        const mth = months[month]
        const dim = date
        const bookedDate = d + ", " + mth + " " + dim
        console.log("date concate:", bookedDate)
       
        return (<div>{bookedDate} {addToAppointmentHistory(bookedDate)}</div>)
    }
    const addToAppointmentHistory =(appoinment: string)=>{
        //if(  set appointment ==  current time ) send to appointment history
       
 
        return(
            
             <div 
             >{open?
             <div className='bg-white shadow-md rounded-lg border border-1 absolute flex justify-center items-center lg:left-1/3 top-64 h-64 w-96'>

               
               <div>{appoinment}</div>
               <Button className='bg-sky-800 hover:bg-sky-500 m-2'  onClick={handleAppointment} disabled={loading} > Schedule </Button>
                
               <p className='flex justify-start p-2'><Button onClick={()=>setOpen(false)}> close</Button></p>
                
            
                </div>:<></>}
               
            </div>
            
        )
       
    }
   const handleAppointment = async () => {
   
    
    const schMth = Number(selected?.getMonth())
    const schDate = Number(selected?.getDate())
     const schYear = getYear(new Date)
    console.log("schedule test" ,schYear)
    
    const noteDate = Timestamp.fromDate(new Date( schYear,schMth, schDate));

     setLoading(true);
     try {
       const db = getFirebaseDb();
       const docRef = await addDoc(collection(db, 'appointmentsTest'), {
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
        reviewCount ,
       scheduled:  noteDate,  
       });
       setBooked(`Document added with ID: ${docRef.id}`);
       console.log(booked)
     } catch (error) {
         console.error('Error fetching appointment data:', error);
     } finally {
       setLoading(false);
     }
   };
    useEffect(() => {
        const fetchDoctors = async () => {

            const db2 = getFirestore();
            //find info
            //search db for all doctors
      
            // const appointmentsQuery = query(collection(db2,'testing'),where('doctorId','==',doc_id), where ('clinicName','==',clinic));

            const doctorQuery = query(collection(db2, 'appointmentHistory'));

            try {
                const userSnapshot = await getDocs(doctorQuery);
                const userList: BookAppointmentProps[] = userSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data() as Omit<BookAppointmentProps, 'id'>  // ensure data matches the doctor interface
                  
                }));

                setAppointments(userList);
            }
            catch (err) {
                console.error('Error fetching users:', err);
                setError('Failed to fetch users.');
            }
            finally {
                setLoading(false);// set loading to false after fetching
            }
        }
        if (user) {
            fetchDoctors();//verify user logged in
        }
        else {
            setLoading(false);
        }
    }, [user]);

    
    if (loading) return <div>Loding...</div>
    if (error) return <div>Error: {error} </div>



    return (
        <>
        
            <div className='flex overflow-hidden w-[30rem]'>
                <div className=" rounded-md border border-1 shadow-md solid-gray content-center p-6">
                    <div className='flex flex-col'>
                        <h1 className='text-xl font-semibold mb-1'>Book an appointment today</h1>
                        <h3 className='text-sm font-semibold text-gray-400 mb-4'>Reason for visit</h3>
                        <div className='flex flex-col items-start gap-2 pb-1'>
                            <div className='flex flex-col items-center gap-2 '>
                                <Select >
                                    <SelectTrigger className="w-[362px] md:w-[420px] shadow-sm ">
                                        <SelectValue placeholder="Diagnosis for new issue" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Diagnosis for new issue</SelectLabel>
                                            <SelectItem value="option1">option1</SelectItem>
                                            <SelectItem value="option2">option2</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <Select>
                                    <SelectTrigger className=" w-[362px] md:w-[420px] shadow-sm "  >
                                        <div className="flex justify-start gap-2">
                                            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 " />
                                            <SelectValue placeholder="I'll Chose an insurance later " />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent >
                                        <SelectGroup>
                                            <SelectLabel >I'll Chose an insurance later</SelectLabel>
                                            <SelectItem value="option1">option1</SelectItem>
                                            <SelectItem value="option2" >option2</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className='flex items-center gap-4 pt-2 pb-2'>
                                <Switch id="New Patient" />
                                <Label htmlFor='New Patient'>New Patient</Label>
                            </div>
                            {/* 
                            Previous switch layout
                            <div className='flex flex-wrap md:flex-nowrap items-center pt-6 pb-2'>
                                <Button className='text-gray-400 h-20 w-52 shadow-md  gap-2 ' style={getButtonStyle("New Patient")}
                                    onMouseEnter={() => setHovered("New Patient")}
                                    onMouseLeave={() => setHovered(null)}
                                    onClick={() => setIsCheck(1)}
                                >
                                    {ischeck == 1 ? <Check></Check> : null}
                                    New Patient
                                </Button>
                                <Button className='text-gray-400 h-20 w-52 shadow-md gap-2 ' style={getButtonStyle("Returning Patient")}
                                    onMouseEnter={() => setHovered("Returning Patient")}
                                    onMouseLeave={() => setHovered(null)}
                                    onClick={() => setIsCheck(0)}
                                >
                                    {ischeck == 0 ? <Check></Check> : null}
                                    Returning Patient
                                </Button>
                            </div>
                            */}
                             {formatDate(Number(selected?.getMonth()), Number(selected?.getDate()))}
                                 <div >
                                    <div className="mx-auto max-w-xs">
                                        <Carousel className="w-full max-w-sm"
                                            opts={{
                                                align: "start",
                                                skipSnaps: true,
                                                slidesToScroll: 5,
                                            }}
                                        >
                                              <CarouselContent className='-ml-2'>
                                                {bookingInterval.map((interval, index) => (

                                                    <CarouselItem key={index} className=" flex basis-1/5 pl-1 "
                                                        onClick={() => setSelected(interval)}
                                                    >
                                                        
                                                   <div className='p-1'>
                                                                 
                                                                <Card onClick={() => setOpen(show => !show)}
                                                                    className='flex flex-col justify-center w-14 h-24 gap-1 text-sm text-gray-500 hover:text-white hover:bg-[#74beec] drop-shadow-sm '
                                                                >


                                                                    <div className='flex flex-col pl-1 '>
                                                                        <span >{weekday[interval.getDay()]}</span>
                                                                        <span>{months[interval.getMonth()]} {interval.getDate()} </span>
                                                                    </div>
                                                                    <div className='flex flex-col pl-1'>
                                                                        <span>No</span>
                                                                        <span>appts</span>
                                                                    </div>
                                                                </Card>
                                                             </div>
 
                                                    </CarouselItem>
                                                ))}
                                            </CarouselContent>
                                            <CarouselPrevious />
                                            <CarouselNext />
                                        </Carousel>
                                    </div>
                                </div>
                              
                                  
                                        
                             Next Available {appointmentDate(Number(selected?.getDay()), Number(selected?.getMonth()), Number(selected?.getDate()))}
                           
                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}

export default BookAppointment
 