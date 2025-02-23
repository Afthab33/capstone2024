/*


"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

//const socket = (vercel link)

type DoctorUpdate = {
  doctorId: string;
  message: string;
};

export default function DoctorUpdates({ doctorId }: { doctorId: string }) {
  const [updates, setUpdates] = useState<string[]>([]);

  useEffect(() => {
    socket.emit("subscribe", { doctorId });

    socket.on("doctor_update", (update: DoctorUpdate) => {
      if (update.doctorId === doctorId) {
        setUpdates((prev) => [...prev, update.message]);
      }
    });

    return () => {
      socket.off("doctor_update");
    };
  }, [doctorId]);

  return (
    <div className="p-4 bg-white border rounded-md shadow-md">
      <h2 className="text-lg font-semibold">Live Updates for Doctor {doctorId}</h2>
      <ul className="mt-2">
        {updates.map((update, index) => (
          <li key={index} className="text-sm text-gray-600">{update}</li>
        ))}
      </ul>
    </div>
  );
}
*/
