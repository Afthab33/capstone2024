import AppointmentsCard from "../components/appointmentsCard"
export default function AppointmentsPage() {
  return (
    <>
      <div className="flex justify-center p-4">
        <AppointmentsCard specialty={""} nextAvailable={""} />
      </div>
    </>
  )
}