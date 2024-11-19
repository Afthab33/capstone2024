'use client';

import { useAuth } from "../authcontext";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db as getFirebaseDb } from "../authcontext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface userData {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    sex: string;
    birthday: string;
    symptoms?: string[];
}

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState<userData | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [originalSymptoms, setOriginalSymptoms] = useState<string[]>([]);

  const symptomCategories = {
    "General": [
      "Fever",
      "Fatigue",
      "Chills",
      "Night Sweats",
      "Loss of Appetite",
      "Weight Loss",
      "Weight Gain"
    ],
    "Respiratory": [
      "Cough",
      "Shortness of Breath",
      "Wheezing",
      "Chest Pain",
      "Sore Throat",
      "Runny Nose",
      "Nasal Congestion"
    ],
    "Digestive": [
      "Nausea",
      "Vomiting",
      "Diarrhea",
      "Constipation",
      "Abdominal Pain",
      "Bloating",
      "Heartburn"
    ],
    "Neurological": [
      "Headache",
      "Dizziness",
      "Memory Problems",
      "Confusion",
      "Tremors",
      "Numbness",
      "Tingling"
    ],
    "Musculoskeletal": [
      "Joint Pain",
      "Muscle Aches",
      "Back Pain",
      "Neck Pain",
      "Stiffness",
      "Weakness",
      "Limited Range of Motion"
    ],
    "Skin": [
      "Rash",
      "Itching",
      "Dry Skin",
      "Bruising",
      "Changes in Skin Color",
      "New Growths",
      "Excessive Sweating"
    ],
    "Mental Health": [
      "Anxiety",
      "Depression",
      "Insomnia",
      "Mood Changes",
      "Difficulty Concentrating",
      "Stress",
      "Panic Attacks"
    ]
  };

  const Separator = () => <hr className="my-6 border-gray-200" />;

  const fetchUserData = useCallback(async () => {
    try {
      if (!user) return;
      const db = getFirebaseDb();
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const data = userDoc.data() as userData;
        setUserData(data);
        const symptoms = data.symptoms || [];
        setSelectedSymptoms(symptoms);
        setOriginalSymptoms(symptoms);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/');
        return;
      }
      
      fetchUserData();
    }
  }, [user, authLoading, router, fetchUserData]);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSave = async () => {
    if (!user) return;
    
    try {
      const db = getFirebaseDb();
      await updateDoc(doc(db, 'users', user.uid), {
        symptoms: selectedSymptoms
      });
      
      await fetchUserData();
    } catch (error) {
      console.error('Error updating symptoms:', error);
    }
  };

  const handleCancel = () => {
    setSelectedSymptoms(originalSymptoms);
  };

  const hasChanges = () => {
    if (selectedSymptoms.length !== originalSymptoms.length) return true;
    return !selectedSymptoms.every(symptom => originalSymptoms.includes(symptom));
  };

  return (
    <div className="flex flex-col min-h-screen mx-4 sm:mx-20 lg:mx-48">
      {authLoading || !userData ? (
        <>
          <Skeleton className="h-8 w-48 mt-10 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.keys(symptomCategories).map((category) => (
              <Card key={category}>
                <CardContent className="p-4">
                  <Skeleton className="h-7 w-36 mb-4" />
                  <div className="flex flex-wrap gap-2">
                    {Array(7).fill(0).map((_, index) => (
                      <Skeleton 
                        key={index} 
                        className="h-10 w-32 rounded-md"
                      /> 
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-semibold text-left mt-10 mb-6">
            Your Symptoms
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(symptomCategories).map(([category, symptoms]) => (
              <Card key={category}>
                <CardContent className="p-4">
                  <h2 className="text-lg font-semibold text-left mb-4">
                    {category}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {symptoms.map((symptom) => (
                      <Button
                        key={symptom}
                        variant={selectedSymptoms.includes(symptom) ? "default" : "outline"}
                        onClick={() => toggleSymptom(symptom)}
                        className="justify-start h-auto py-2"
                      >
                        {symptom}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="w-full sm:w-auto"
              disabled={!hasChanges()}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="w-full sm:w-auto mb-10"
              disabled={!hasChanges()}
            >
              Save Changes
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
