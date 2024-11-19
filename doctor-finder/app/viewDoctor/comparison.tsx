/*import React, { useEffect, useState } from "react";
import DoctorComparison from "../components/DoctorComparison";
import { fetchDoctorsFromFirestore } from "../../lib/firestore";
import { db } from "../../lib/firebase";

const CompareDoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [doctor1, setDoctor1] = useState(null);
  const [doctor2, setDoctor2] = useState(null);

  useEffect(() => {
    // getting doctors
    fetchDoctorsFromFirestore(db)
      .then((allDoctors) => {
        setDoctors(allDoctors);

        // getting doctors by specilization
        const doc1 = allDoctors.find((doc) => doc.id === "doctor-1"); // replace doctor-1 with an actual doctor
        const doc2 = allDoctors.find((doc) => doc.id === "doctor-2"); // replace doctor-2 with an actual doctor  

        setDoctor1(doc1 || null);
        setDoctor2(doc2 || null);
      })
      .catch((err) => console.error("There was an error receiving doctors:", err));
  }, []);

  if (!doctor1 || !doctor2) return <p>Loading...</p>;

  return (
    <div>
      <h1>Doctor Comparison</h1>
      <DoctorComparison doctor1={doctor1} doctor2={doctor2} />
    </div>
  );
};

export default CompareDoctorsPage;
*/
