/*import React, { useEffect, useState } from "react";
import DoctorComparison from "../components/DoctorComparison";
import { getDoctorById } from "../../lib/firestore";

const DoctorDetailsPage = () => {
  const [doctor1, setDoctor1] = useState(null);
  const [doctor2, setDoctor2] = useState(null);

  useEffect(() => {
    // Replace these IDs with actual doctor IDs or dynamic selections
    getDoctorById("doctor1-id").then(setDoctor1);
    getDoctorById("doctor2-id").then(setDoctor2);
  }, []);

  if (!doctor1 || !doctor2) return <p>Loading...</p>;

  return (
    <div>
      <h1>Doctor Comparison</h1>
      <DoctorComparison doctor1={doctor1} doctor2={doctor2} />
    </div>
  );
};

export default DoctorDetailsPage;
*/
