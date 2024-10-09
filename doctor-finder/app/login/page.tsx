'use client';

import { useAuth } from "../authcontext";
import { signInWithEmailAndPassword } from "firebase/auth";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { auth as getFirebaseAuth } from "../authcontext"
import { FirebaseError } from "firebase/app"

export default function Login() {
    const { user } = useAuth(); // get user from authcontext
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    // if user is logged in, redirect to home page
    useEffect(() => {
        if (user) {
            router.push('/');
        }
    }, [user, router]); 

    // if user is logged in, don't render the login page
    if (user) return null;

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const isFormValid = email && password;

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // prevent default form submission behavior
        setError(''); // clear any previous error messages

        try {
            const auth = getFirebaseAuth(); // get firebase auth instance
            const { user } = await signInWithEmailAndPassword(auth, email, password); // sign in with email and password
            localStorage.setItem('userCache', JSON.stringify(user)); // store user in local storage
            router.push('/'); // redirect to home page
        } catch (error: unknown) {
            if (error instanceof FirebaseError) {
                setError(error.message); // set error message if error is a FirebaseError
            } else {
                setError('An unexpected error occurred');
            }
        }
    };

    return (
        <div className="flex justify-center min-h-screen p-4">
            <Tabs defaultValue="patient" className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mt-5">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="patient">Patient</TabsTrigger>
                    <TabsTrigger value="doctor">Doctor</TabsTrigger>
                </TabsList>
                <TabsContent value="patient">
                    <Card className="mt-3">
                    <form onSubmit={handleLogin}>
                        <CardHeader>
                        <CardTitle className="text-xl sm:text-lg md:text-lg lg:text-lg">Patient Login</CardTitle>
                        <CardDescription className="text-base sm:text-sm md:text-sm lg:text-sm">
                            Log in to your account to book appointments and manage your health.
                        </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
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
                                onClick={togglePasswordVisibility}
                                tabIndex={-1}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                                ) : (
                                <Eye className="h-5 w-5" />
                                )}
                            </button>
                            </div>
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        </CardContent>
                        <CardFooter>
                        <Button type="submit" size="lg" disabled={!isFormValid} className="w-full">Log In</Button>
                        </CardFooter>
                    </form>
                    </Card>
                </TabsContent>
                <TabsContent value="doctor">
                    <Card className="mt-3">
                    <form onSubmit={handleLogin}>
                        <CardHeader>
                        <CardTitle className="text-xl sm:text-lg md:text-lg lg:text-lg">Doctor Login</CardTitle>
                        <CardDescription className="text-base sm:text-sm md:text-sm lg:text-sm">
                            Log in to manage your appointments and patient records.
                        </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
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
                                onClick={togglePasswordVisibility}
                                tabIndex={-1}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                                ) : (
                                <Eye className="h-5 w-5" />
                                )}
                            </button>
                            </div>
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        </CardContent>
                        <CardFooter>
                        <Button type="submit" size="lg" disabled={!isFormValid} className="w-full">Log In</Button>
                        </CardFooter>
                    </form>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
