import React, { useEffect, useState } from "react";
import DoctorComparison from "@/components/DoctorComparison";
import { fetchDoctorsFromFirestore } from "@/lib/firestore";
import { useRouter } from "next/router";

const CompareDoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [doctor1, setDoctor1] = useState(null);
  const [doctor2, setDoctor2] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { doctorId1, doctorId2 } = router.query;

  useEffect(() => {
    if (doctorId1 && doctorId2) {
      fetchDoctorsFromFirestore()
        .then((allDoctors) => {
          setDoctors(allDoctors);

          const doc1 = allDoctors.find((doc) => doc.id === doctorId1);
          const doc2 = allDoctors.find((doc) => doc.id === doctorId2);

          setDoctor1(doc1 || null);
          setDoctor2(doc2 || null);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching doctors:", err);
          setError("Failed to fetch doctors. Please try again later.");
          setLoading(false);
        });
    }
  }, [doctorId1, doctorId2]);

  if (loading) return <p>Loading doctors for comparison...</p>;
  if (error) return <p>{error}</p>;
  if (!doctor1 || !doctor2) return <p>Doctors not found for comparison.</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Compare Doctors</h1>
      <DoctorComparison doctor1={doctor1} doctor2={doctor2} />
    </div>
  );
};

export default CompareDoctorsPage;
