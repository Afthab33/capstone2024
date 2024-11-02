import AppointmentsCard from "../components/AppointmentsCard"
export default function AppointmentsPage() {
  return (
    <>
      <div className="flex justify-center p-4">
        <AppointmentsCard specialty={""} nextAvailable={""} />
      </div>
    </>
  )
}