'use client';

import { createUserWithEmailAndPassword } from "firebase/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth, auth as getFirebaseAuth, db as getFirebaseDb } from "../authcontext";
import { doc, setDoc } from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ProgressIndicator from "../components/progressindicator"

export default function SignUp() {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const firstNameInputRef = useRef<HTMLInputElement>(null); // reference to first name input field
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [sex, setSex] = useState('');
  const [birthday, setBirthday] = useState('');
  const router = useRouter();
  const [userType, setUserType] = useState('patient');
  const [degree, setDegree] = useState('');
  const [doctorSignupStep, setDoctorSignupStep] = useState(1);
  const [clinicName, setClinicName] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const totalDoctorSteps = 5;
  const [specialty, setSpecialty] = useState('');
  const [selectedInsurances, setSelectedInsurances] = useState<string[]>([]); // list of selected insurances
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]); // list of selected languages
  const [showMoreInsurances, setShowMoreInsurances] = useState(false);

  // if user is logged in, redirect to home page
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  // focus on first name input field when component loads
  useEffect(() => {
    if (firstNameInputRef.current) {
      firstNameInputRef.current.focus();
    }
  }, []);

  const togglePasswordVisibility = (field: 'password' | 'confirmPassword') => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  }

  // check if form is valid
  const isFormValid = firstName && 
    lastName && 
    email && 
    password && 
    confirmPassword && 
    password === confirmPassword && 
    sex && 
    birthday && 
    (userType === 'doctor' ? degree : true);

  // check if passwords match
  useEffect(() => {
    if (password && confirmPassword && password !== confirmPassword) {
      setError('Error: Passwords do not match');
    } else {
      setError('');
    }
  }, [password, confirmPassword]);

  // toggle insurance
  const toggleInsurance = (insurance: string) => {
    setSelectedInsurances(prev =>
      prev.includes(insurance) // check if insurance is already selected
        ? prev.filter(i => i !== insurance) // remove insurance if already selected
        : [...prev, insurance] // add insurance if not selected
    );
  };

  // toggle language
  const toggleLanguage = (language: string) => {
    setSelectedLanguages(prev => 
      prev.includes(language)
        ? prev.filter(l => l !== language)
        : [...prev, language]
    );
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // prevent default form submission behavior
    setError(''); // clear any previous error messages

    try {
      const auth = getFirebaseAuth(); // get firebase auth instance
      const userCredential = await createUserWithEmailAndPassword(auth, email, password); // create user with email and password
      const user = userCredential.user; // get user object

      // create user document in Firebase
      const db = getFirebaseDb(); // get db from Firebase
      await setDoc(doc(db, 'users', user.uid), {
        firstName,
        lastName,
        email,
        role: userType,
        sex,
        birthday,
        ...(userType === 'doctor' ? { 
          degree,
          clinicName,
          streetAddress,
          city,
          state,
          zipCode,
          specialty,
          acceptedInsurances: selectedInsurances,
          spokenLanguages: selectedLanguages,
          rating: 0,
        } : {}),
        createdAt: new Date().toISOString(), // convert current date to string
      });

      console.log('User created successfully:', user);
      router.replace('/'); // redirect to home page
    } catch (error: unknown) {
      console.log('Sign up error:', error);
      if (error instanceof FirebaseError) {
        setError(error.message); // set error message if error is a FirebaseError
      } else {
        setError('An unexpected error occurred. Please try again.');
      }

      // if error and userType is doctor, reset doctorSignupStep to 1
      if (userType === 'doctor') {
        setDoctorSignupStep(1);
      }
    }
  };

  // handle birthday change
  const handleBirthdayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBirthday(e.target.value);
  };

  // check if step 1 is valid
  const isStep1Valid = () => {
    return Boolean(firstName && lastName && email && password && confirmPassword && 
           password === confirmPassword && sex && birthday && degree);
  };

  // check if step 2 is valid
  const isStep2Valid = () => {
    return Boolean(clinicName && streetAddress && city && state && zipCode);
  };

  const isStep3Valid = () => {
    return Boolean(specialty);
  };

  // check if step 4 is valid
  const isStep4Valid = () => {
    return selectedInsurances.length > 0;
  };

  // check if step 5 is valid
  const isStep5Valid = () => {
    return selectedLanguages.length > 0;
  };

  // handle next step
  const handleNextStep = () => {
    setError(''); // clear any existing errors
    let isValid = false;

    // check if step is valid
    switch (doctorSignupStep) {
      case 1:
        isValid = isStep1Valid();
        break;
      case 2:
        isValid = isStep2Valid();
        break;
      case 3:
        isValid = isStep3Valid();
        break;
      case 4:
        isValid = isStep4Valid();
        break;
      case 5:
        isValid = isStep5Valid();
        break;
    }

    // if step is valid, proceed to next step
    if (isValid) {
      if (doctorSignupStep < totalDoctorSteps) {
        setDoctorSignupStep(doctorSignupStep + 1);
      }
    } else {
      setError('Please fill out all required fields before proceeding.');
    }
  };

  // doctor signup component
  const renderDoctorSignupStep = () => {
    switch (doctorSignupStep) {
      case 1:
        return (
          <>
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
                <div className="flex-1">
                  <Input 
                    id="firstName" 
                    ref={firstNameInputRef} 
                    placeholder="First Name" 
                    spellCheck="false" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="flex space-x-2 sm:flex-1">
                  <div className="flex-1">
                    <Input 
                      id="lastName" 
                      placeholder="Last Name" 
                      spellCheck="false" 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                  <div className="w-24">
                    <Select onValueChange={setDegree} value={degree}>
                      <SelectTrigger>
                        <SelectValue placeholder="Degree" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MD">MD</SelectItem>
                        <SelectItem value="MA">MA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <Input 
                  id="email" 
                  type="email"
                  placeholder="Email" 
                  spellCheck="false" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"}
                    placeholder="Password" 
                    spellCheck="false"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('password')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <div className="relative">
                  <Input 
                    id="confirmPassword" 
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password" 
                    spellCheck="false"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirmPassword')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <RadioGroup className="flex space-x-4" value={sex} onValueChange={setSex}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">Female</Label>
                  </div>
                </RadioGroup>
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <Label htmlFor="birthday" className="lg:pl-40">Birthday</Label>
                  <Input
                    type="date"
                    id="birthday"
                    value={birthday}
                    onChange={handleBirthdayChange}
                    max={`${new Date().getFullYear()}-12-31`}
                    className="flex-1 appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:top-0 [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:bottom-0 [&::-webkit-calendar-picker-indicator]:left-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-clear-button]:hidden [&::-moz-calendar-picker-indicator]:opacity-0 [&::-moz-calendar-picker-indicator]:display-none"
                  />
                </div>
              </div>
            </div>
          </>
        );
      case 2:
        return (
          <>
            <div className="space-y-1">
              <Input 
                id="clinicName" 
                placeholder="Clinic Name" 
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Input 
                id="streetAddress" 
                placeholder="Street Address" 
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
              />
            </div>
            <div className="flex space-x-4">
              <div className="flex-1">
                <Input 
                  id="city" 
                  placeholder="City" 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div className="w-24">
                <Select onValueChange={setState} value={state}>
                  <SelectTrigger>
                    <SelectValue placeholder="State" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AL">AL</SelectItem>
                    <SelectItem value="AK">AK</SelectItem>
                    <SelectItem value="AZ">AZ</SelectItem>
                    <SelectItem value="AR">AR</SelectItem>
                    <SelectItem value="CA">CA</SelectItem>
                    <SelectItem value="CO">CO</SelectItem>
                    <SelectItem value="CT">CT</SelectItem>
                    <SelectItem value="DE">DE</SelectItem>
                    <SelectItem value="FL">FL</SelectItem>
                    <SelectItem value="GA">GA</SelectItem>
                    <SelectItem value="HI">HI</SelectItem>
                    <SelectItem value="ID">ID</SelectItem>
                    <SelectItem value="IL">IL</SelectItem>
                    <SelectItem value="IN">IN</SelectItem>
                    <SelectItem value="IA">IA</SelectItem>
                    <SelectItem value="KS">KS</SelectItem>
                    <SelectItem value="KY">KY</SelectItem>
                    <SelectItem value="LA">LA</SelectItem>
                    <SelectItem value="ME">ME</SelectItem>
                    <SelectItem value="MD">MD</SelectItem>
                    <SelectItem value="MA">MA</SelectItem>
                    <SelectItem value="MI">MI</SelectItem>
                    <SelectItem value="MN">MN</SelectItem>
                    <SelectItem value="MS">MS</SelectItem>
                    <SelectItem value="MO">MO</SelectItem>
                    <SelectItem value="MT">MT</SelectItem>
                    <SelectItem value="NE">NE</SelectItem>
                    <SelectItem value="NV">NV</SelectItem>
                    <SelectItem value="NH">NH</SelectItem>
                    <SelectItem value="NJ">NJ</SelectItem>
                    <SelectItem value="NM">NM</SelectItem>
                    <SelectItem value="NY">NY</SelectItem>
                    <SelectItem value="NC">NC</SelectItem>
                    <SelectItem value="ND">ND</SelectItem>
                    <SelectItem value="OH">OH</SelectItem>
                    <SelectItem value="OK">OK</SelectItem>
                    <SelectItem value="OR">OR</SelectItem>
                    <SelectItem value="PA">PA</SelectItem>
                    <SelectItem value="RI">RI</SelectItem>
                    <SelectItem value="SC">SC</SelectItem>
                    <SelectItem value="SD">SD</SelectItem>
                    <SelectItem value="TN">TN</SelectItem>
                    <SelectItem value="TX">TX</SelectItem>
                    <SelectItem value="UT">UT</SelectItem>
                    <SelectItem value="VT">VT</SelectItem>
                    <SelectItem value="VA">VA</SelectItem>
                    <SelectItem value="WA">WA</SelectItem>
                    <SelectItem value="WV">WV</SelectItem>
                    <SelectItem value="WI">WI</SelectItem>
                    <SelectItem value="WY">WY</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-24">
                <Input 
                  id="zipCode" 
                  placeholder="Zip Code" 
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value.replace(/\D/g, ''))} // remove non-numeric characters
                  maxLength={5}
                />
              </div>
            </div>
          </>
        );
      case 3:
        return (
          <div className="space-y-2">
            <RadioGroup onValueChange={setSpecialty} value={specialty}>
              {[
                "Family Medicine",
                "Pediatrics",
                "Internal Medicine",
                "Obstetrics and Gynecology (OB/GYN)",
                "Cardiology",
                "Dermatology",
                "Psychiatry",
                "Neurology",
                "General Surgery",
                "Physical Therapy",
                "Sports Medicine"
              ].map((specialtyOption) => (
                <div key={specialtyOption} className="flex items-center space-x-2">
                  <RadioGroupItem value={specialtyOption} id={specialtyOption} />
                  <Label htmlFor={specialtyOption}>{specialtyOption}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );
      case 4:
        const insurances = [
          "UnitedHealthcare", "Blue Cross Blue Shield (BCBS)", "Aetna", "Cigna", "Humana",
          "Anthem", "Kaiser Permanente", "Centene", "Molina Healthcare", "Health Net",
          "WellCare", "Amerigroup", "Medicaid", "Medicare", "Tricare",
          "CareSource", "Oscar Health", "EmblemHealth", "Highmark", "Ambetter"
        ];
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {insurances.slice(0, 10).map((insurance) => (
                <Button
                  key={insurance}
                  type="button"
                  variant={selectedInsurances.includes(insurance) ? "default" : "outline"}
                  onClick={() => toggleInsurance(insurance)}
                  className="justify-start"
                >
                  {insurance}
                </Button>
              ))}
              {showMoreInsurances && insurances.slice(10).map((insurance) => (
                <Button
                  key={insurance}
                  type="button"
                  variant={selectedInsurances.includes(insurance) ? "default" : "outline"}
                  onClick={() => toggleInsurance(insurance)}
                  className="justify-start"
                >
                  {insurance}
                </Button>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowMoreInsurances(!showMoreInsurances)}
              className="w-full"
            >
              {showMoreInsurances ? "Show Less" : "More Insurances"}
            </Button>
          </div>
        );
      case 5:
        const languages = [
          "English", "Spanish", "Mandarin", "French", "Arabic",
          "Hindi", "Bengali", "Portuguese", "Russian", "Japanese",
          "German", "Korean", "Vietnamese", "Italian", "Turkish"
        ];
        return (
          <div className="space-y-4">
            <div className="flex flex-wrap justify-center gap-2">
              {languages.map((language) => (
                <Button
                  key={language}
                  type="button"
                  variant={selectedLanguages.includes(language) ? "default" : "outline"}
                  onClick={() => toggleLanguage(language)}
                  className="w-32"
                >
                  {language}
                </Button>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <>
      {!user && (   // if user is not logged in, show signup page
        <div className="flex justify-center min-h-screen p-4">
          <Tabs defaultValue="patient" className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mt-5" onValueChange={(value) => setUserType(value)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="patient">Patient</TabsTrigger>
              <TabsTrigger value="doctor">Doctor</TabsTrigger>
            </TabsList>
            <TabsContent value="patient">
              <Card className="mt-3">
                <form onSubmit={handleSignUp}>
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-lg md:text-lg lg:text-lg">Patient Signup</CardTitle>
                    <CardDescription className="text-sm sm:text-sm md:text-sm lg:text-sm">
                      Once you sign up, you will be able to find your doctor and book an appointment.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                      <div className="flex-1">
                        <Input 
                          id="firstName" 
                          ref={firstNameInputRef} 
                          placeholder="First Name" 
                          spellCheck="false" 
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                        />
                      </div>
                      <div className="flex-1">
                        <Input 
                          id="lastName" 
                          placeholder="Last Name" 
                          spellCheck="false" 
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Input 
                        id="email" 
                        type="email"  // Add this line
                        placeholder="Email" 
                        spellCheck="false" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="relative">
                        <Input 
                          id="password" 
                          type={showPassword ? "text" : "password"}
                          placeholder="Password" 
                          spellCheck="false"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('password')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                          tabIndex={-1}  // make button not focusable
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="relative">
                        <Input 
                          id="confirmPassword" 
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm Password" 
                          spellCheck="false"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('confirmPassword')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                          tabIndex={-1}  // make button not focusable
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                      <RadioGroup className="flex space-x-4" value={sex} onValueChange={setSex}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="male" id="male" />
                          <Label htmlFor="male">Male</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="female" id="female" />
                          <Label htmlFor="female">Female</Label>
                        </div>
                      </RadioGroup>
                      <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <Label htmlFor="birthday" className="sm:pl-40">Birthday</Label>
                        <Input
                          type="date"
                          id="birthday"
                          value={birthday}
                          onChange={handleBirthdayChange}
                          max={`${new Date().getFullYear()}-12-31`}
                          className="flex-1 appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:top-0 [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:bottom-0 [&::-webkit-calendar-picker-indicator]:left-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-clear-button]:hidden [&::-moz-calendar-picker-indicator]:opacity-0 [&::-moz-calendar-picker-indicator]:display-none"
                        />
                      </div>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                  </CardContent>
                  <CardFooter className="flex">
                    <Button type="submit" size="lg" disabled={!isFormValid} className="w-full">
                      Create Account
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            <TabsContent value="doctor">
              <Card className="mt-3">
                <form onSubmit={handleSignUp}>
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-lg md:text-lg lg:text-lg">
                      {doctorSignupStep === 1 && "Doctor Signup"}
                      {doctorSignupStep === 2 && "Add Your Clinic"}
                      {doctorSignupStep === 3 && "Choose Your Specialty"}
                      {doctorSignupStep === 4 && "Add Your Insurances Offered"}
                      {doctorSignupStep === 5 && "Add Your Languages Spoken"}
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-sm md:text-sm lg:text-sm">
                      {doctorSignupStep === 1 && "Once you sign up, we will verify your credentials and show your profile to patients"}
                      {doctorSignupStep === 2 && "Enter your clinic's information for verification"}
                      {doctorSignupStep === 3 && "Select the service offered by your clinic"}
                      {doctorSignupStep === 4 && "Select the insurances offered by your clinic"}
                      {doctorSignupStep === 5 && "Select the languages spoken by your clinic"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {renderDoctorSignupStep()}
                  </CardContent>
                  <CardFooter className="flex flex-col items-stretch">
                    {error && (
                      <div className="text-red-500 text-sm mb-4">
                        {error}
                      </div>
                    )}
                    {doctorSignupStep < totalDoctorSteps ? (
                      <div className="flex flex-col sm:flex-row justify-between items-center w-full space-y-4 sm:space-y-0">
                        <Button 
                          className="w-full sm:w-60" 
                          type="button" 
                          onClick={handleNextStep}
                          disabled={
                            (doctorSignupStep === 1 && !isStep1Valid()) ||
                            (doctorSignupStep === 2 && !isStep2Valid()) ||
                            (doctorSignupStep === 3 && !isStep3Valid()) ||
                            (doctorSignupStep === 4 && !isStep4Valid())
                          }
                        >
                          Next
                        </Button>
                        <ProgressIndicator totalSteps={totalDoctorSteps} currentStep={doctorSignupStep} />
                      </div>
                    ) : (
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={!isStep5Valid()}
                      >
                        Create Account
                      </Button>
                    )}
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </>
  );
}