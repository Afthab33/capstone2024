
import React from "react";

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  degree: string;
  clinicName: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  specialty: string;
  acceptedInsurances: string[];
  spokenLanguages: string[];
  rating?: number;
  reviewCount?: number;
  profileImage?: string;
  availability?: {
    [date: string]: string[];
  };
}

const DoctorComparison = ({ doctor1 , doctor2 }: { doctor1: Doctor, doctor2: Doctor }) => {
  return (
    <div className="comparison-container">
      <table className="comparison-table">
        <thead>
          <tr>
            <th>Attribute</th>
            <th>{doctor1.firstName} {doctor1.lastName}</th>
            <th>{doctor2.firstName} {doctor2.lastName}</th>
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
            <td>{doctor1.streetAddress}, {doctor1.city}, {doctor1.state} {doctor1.zipCode}</td>
            <td>{doctor2.streetAddress}, {doctor2.city}, {doctor2.state} {doctor2.zipCode}</td>
          </tr>
          <tr>
            <td>Insurance Accepted</td>
            <td>{doctor1.acceptedInsurances.join(", ")}</td>
            <td>{doctor2.acceptedInsurances.join(", ")}</td>
          </tr>
          <tr>
            <td>Languages</td>
            <td>{doctor1.spokenLanguages.join(", ")}</td>
            <td>{doctor2.spokenLanguages.join(", ")}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default DoctorComparison;
