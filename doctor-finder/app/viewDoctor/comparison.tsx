import React, { useEffect, useState } from "react";
import DoctorComparison from "@/components/DoctorComparison";
import { fetchDoctorsFromFirestore } from "@/lib/firestore";
import { useRouter } from "next/router";

const CompareDoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [doctor1, setDoctor1] = useState(null);
  const [doctor2, setDoctor2] = useState(null);
  const router = useRouter();
  const { doctorId1, doctorId2 } = router.query; // getting doctor

  useEffect(() => {
    fetchDoctorsFromFirestore()
      .then((allDoctors) => {
        setDoctors(allDoctors);

        // finding doctor
        const doc1 = allDoctors.find((doc) => doc.id === doctorId1);
        const doc2 = allDoctors.find((doc) => doc.id === doctorId2);

        setDoctor1(doc1 || null);
        setDoctor2(doc2 || null);
      })
      .catch((err) => console.error("Error fetching doctors:", err));
  }, [doctorId1, doctorId2]);

  if (!doctor1 || !doctor2) return <p>Loading doctors for comparison...</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Compare Doctors</h1>
      <DoctorComparison doctor1={doctor1} doctor2={doctor2} />
    </div>
  );
};

export default CompareDoctorsPage;
