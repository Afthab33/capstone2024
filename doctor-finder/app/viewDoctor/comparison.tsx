/*import React, { useEffect, useState } from "react";
import DoctorComparison from "../components/DoctorComparison";
import { getDoctorById } from "../../lib/firestore";

const DoctorDetailsPage = () => {
  const [doctor1, setDoctor1] = useState(null);
  const [doctor2, setDoctor2] = useState(null);

  useEffect(() => {

    getDoctorById("doctor-1").then(setDoctor1);//replace doctor-1 with an actual doctor  
    getDoctorById("doctor-2").then(setDoctor2); //replace doctor-2 with an actual doctor
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
