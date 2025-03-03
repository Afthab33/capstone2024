import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import DoctorComparison from "../../components/DoctorComparison"; 
//import { fetchDoctorsFromFirestore } from "../../lib/firestore"; 

const DoctorDetailsPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [doctor1, setDoctor1] = useState(null);
  const [doctor2, setDoctor2] = useState(null);

  useEffect(() => {
    if (id) {
      fetchDoctorsFromFirestore().then((doctors) => {
        
        const selectedDoctor = doctors.find((doc) => doc.id === id);
        setDoctor1(selectedDoctor);

        // Second Doctor
        const randomDoctor = doctors.find((doc) => doc.id !== id);
        setDoctor2(randomDoctor);
      });
    }
  }, [id]);

  if (!doctor1 || !doctor2) return <p>Loading...</p>;

  return (
    <div>
      <h1>Doctor Details</h1>
      <h2>{doctor1?.name}</h2>
      <p>Specialty: {doctor1?.specialty}</p>

      {/* Doctor Comparison */}
      {doctor1 && doctor2 && <DoctorComparison doctor1={doctor1} doctor2={doctor2} />}
    </div>
  );
};

export default DoctorDetailsPage;
