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
} from "@/components/ui/carousel"
function BookAppointment() {
    const [hovered, setHovered] = useState<string | null>(null);
    const [ischeck, setIsCheck] = useState(1);
    const [date, setDate] = React.useState<Date | undefined>(new Date())
    const [selected, setSelected] = React.useState<Date>()
    const getButtonStyle = (button: string) => ({
        backgroundColor: hovered === button ? "#E3E4E5" : "#ededed",

    });


    return (
        <>
            <div className='flex flex-row overflow-hidden  lg:pr-48 md:pr-0 sm:pr-0'>
                <div className=" rounded-md border border-1 shadow-md solid-gray content-center p-4">
                    <div className='ml-2 mr-4'>
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
                            {/* <p className='pb-1'>Tues, Oct 29-Mon, Nov 11</p> */}
                            <div>
                                 {/* <Calendar
                                    mode="single"
                                    selected={selected}
                                    onSelect={setSelected}
                                    className="rounded-md border"
                                  
                                    footer={
                                        selected
                                          ? `You picked ${selected.toLocaleDateString()}.`
                                          : "Please pick a date."
                                      }
                                    
                                />  */}
                       
                                <Carousel
                                    opts={{
                                        align: "start",
                                    }}
                                    className="w-full max-w-sm"
                                >
                                    <CarouselContent>
                                        {Array.from({ length: 5 }).map((_, index) => (
                                            <CarouselItem key={index} className="md:basis-1/2 lg:basis-2/5">
                                                <div className="p-1">
                                                    <Card>
                                                        <CardContent className="flex aspect-square items-center justify-center p-6">
                                                            <span className="text-3xl font-semibold">{selected?.toDateString()}</span>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            </CarouselItem>

                                        ))}
                                    </CarouselContent>
                                    <CarouselPrevious />
                                    <CarouselNext />
                                </Carousel>
                            </div>
                            {/* <p > Next Available Mon, Nov 4</p> */}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default BookAppointment
