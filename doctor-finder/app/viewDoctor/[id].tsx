import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import DoctorComparison from "../../components/DoctorComparison";
import { fetchDoctorsFromFirestore } from "../../lib/firestore";

const DoctorDetailsPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [doctor1, setDoctor1] = useState(null);
  const [doctor2, setDoctor2] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (router.isReady && id) {
      fetchDoctorsFromFirestore()
        .then((doctors) => {
          const selectedDoctor = doctors.find((doc) => doc.id === id);
          setDoctor1(selectedDoctor);

          const randomDoctor = doctors.find((doc) => doc.id !== id);
          setDoctor2(randomDoctor);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching doctors:", err);
          setError("Failed to fetch doctors. Please try again later.");
          setLoading(false);
        });
    }
  }, [router.isReady, id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!doctor1 || !doctor2) return <p>Doctors not found for comparison.</p>;

  return (
    <div>
      <h1>Doctor Details</h1>
      <h2>{doctor1?.name}</h2>
      <p>Specialty: {doctor1?.specialty}</p>

      <Link href={`/viewDoctor/comparison?doctorId1=${doctor1.id}&doctorId2=${doctor2.id}`}>
        <button className="bg-blue-500 text-white px-4 py-2 rounded">
          Compare Doctors
        </button>
      </Link>

      {doctor1 && doctor2 && <DoctorComparison doctor1={doctor1} doctor2={doctor2} />}
    </div>
  );
};

export default DoctorDetailsPage;
