import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Check, Shield } from 'lucide-react'
import React, { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
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
import { addDays, eachDayOfInterval, getDate, getMonth } from "date-fns";

interface Appointment {
    appointment: string;
}
function BookAppointment() {
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
    

    function futureDate(day:number,month:number, date:number){
        //get day as num
        
        //add 1 
       const newDay =dayjs().day(day)
       const d =  newDay.add(2,'day')
       const newDate = dayjs().date(date)
        const D = newDate.add(2,'days')
       const newMonth = dayjs().month(month)
        const m =( date>D.date())?newMonth.add(1,'month'): dayjs().month(month)
        
       
        //return
        console.log("day", day,"after added",d.day(), "Month ",m.month(), "date",D.date())
            return( <span> {weekday[d.day()]}, {months[m.month()]}  {D.date()}  </span>)
    }

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
                            </div> */}
                            {selected!=null?<p className='pb-1 text-md font-semibold'> {weekday[Number(selected?.getDay())]},  {months[Number(selected?.getMonth())]}  {selected?.getDate().valueOf()}  - {futureDate(Number(selected?.getDay()),Number(selected?.getMonth()),Number(selected?.getDate()))}

                            </p>:<p>Error showing dates</p>}
                            <div >
                                <div className="mx-auto max-w-xs">
                                    <Carousel className="w-full max-w-sm">
                                        <CarouselContent className='-ml-1'>
                                            {bookingInterval.map((interval, index) => (
                                                <CarouselItem key={index} className=" flex basis-auto pl-2 "
                                                onClick={()=>setSelected(interval)}
                                                >
                                                    <div className='p-2'>
                                                        <Card className='flex flex-col justify-center pt-4 pb-4 w-20 h-28 text-gray-500 hover:text-white hover:bg-blue-400 '>
                                                            <div className='flex flex-col pt-1 pl-2 mb-2 '>
                                                                <span >{weekday[interval.getDay()]}</span>
                                                                <span>{months[interval.getMonth()]} {interval.getDate()} </span>

                                                            </div>
                                                            <div className='flex flex-col pb-1 pl-2 '>
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
                                    <div className="py-2 text-center text-sm text-muted-foreground">
                                    </div>

                                </div>
                            </div>
                            <p > Next Available {weekday[Number(selected?.getDay())]},  {months[Number(selected?.getMonth())]}  {selected?.getDate().valueOf()} </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default BookAppointment
