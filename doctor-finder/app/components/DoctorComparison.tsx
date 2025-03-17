import React from "react";

interface Doctor {
  name: string;
  specialty: string;
  location: string;
  insurance: string[];
  languages: string[];
}

interface DoctorComparisonProps {
  doctor1: Doctor;
  doctor2: Doctor;
}

const DoctorComparison = ({ doctor1, doctor2 }: DoctorComparisonProps) => {
  return (
    <div className="comparison-container">
      <table className="comparison-table">
        <thead>
          <tr>
            <th>Attribute</th>
            <th>{doctor1.name}</th>
            <th>{doctor2.name}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Specialty</td>
            <td>{doctor1.specialty}</td>
            <td>{doctor2.specialty}</td>
          </tr>
          <tr>
            <td>Location</td>
            <td>{doctor1.location}</td>
            <td>{doctor2.location}</td>
          </tr>
          <tr>
            <td>Insurance Accepted</td>
            <td>{doctor1.insurance.join(", ")}</td>
            <td>{doctor2.insurance.join(", ")}</td>
          </tr>
          <tr>
            <td>Languages</td>
            <td>{doctor1.languages.join(", ")}</td>
            <td>{doctor2.languages.join(", ")}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default DoctorComparison;
