export interface ViewDoctorProps {
    params: Promise<{
      id: string;
    }>;
  }
  
  export interface UserData {
    symptoms?: string[];
    insurance?: string;
  }
  
  export interface BookingPrereqs {
    reason: string;
    insurance: string;
    patientType: 'new' | 'returning' | null;
  }