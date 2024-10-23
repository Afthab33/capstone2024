import AppointmentsCard from "../components/AppointmentsCard"
 
export default function AppointmentsPage() {

  
    
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <AppointmentsCard  specialty={""} nextAvailable={""}  location={"Texas" } />
    </div>
  )
}