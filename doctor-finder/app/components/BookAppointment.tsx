import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Check } from 'lucide-react'
 import React from 'react'
 

function BookAppointment() {
  
    
    return (
        <>

            <div className='border border-1 shadow-md solid-gray p-10 mt-12 mr-14  w-18'>
                <h1 className='text-2xl font-semibold '>Book an appointment today</h1>
                <h3 className='text-sm font-semibold text-gray-400 mb-4'>Reson for visit</h3>
                <div className='flex flex-col items-center gap-4 '>
                   <div className='flex flex-col items-center gap-4 '>
                     <Select >
                        <SelectTrigger className="w-[512px] shadow-sm ">
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
                        <SelectTrigger className="w-[512px] shadow-sm ">
                            <SelectValue placeholder="I'll Chose an insurance later" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>I'll Chose an insurance later</SelectLabel>
                                <SelectItem value="option1">option1</SelectItem>
                                <SelectItem value="option2">option2</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    </div>
                    <div className='flex flex-row items-center flex-wrap pt-4'>
                        <Button className='text-gray-400 h-32 w-64 shadow-md  gap-2 '  style={{
                            backgroundColor: "#E3E4E5"                                        
                         }}
                           
                         >
                          <Check></Check>
                            New Patient 
                            </Button>
                        <Button className='text-gray-400 h-32 w-64 shadow-md ' style={{
                             backgroundColor: "#EDEDED",
                             
                        }}
                        >
                            Returning Patient
                        </Button>
                    </div>
                    <div>
                        calender function
                    </div>

                </div>
            </div>
        </>
    )
}

export default BookAppointment
