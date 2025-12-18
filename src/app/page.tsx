"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useUser,
  useAuth,
  useFirestore,
  useDoc,
  FirestorePermissionError,
  errorEmitter,
} from "@/firebase";
import {
  signInAnonymously,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";
import {
  doc,
  getDocs,
  collection,
  query,
  where,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import * as bcrypt from "bcryptjs";
import type { UserProfile } from "@/lib/types";
import { STORAGE_KEYS } from "@/lib/constants";

export default function AuthPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const userDocRef = useMemo(
    () => (user ? doc(firestore, "users", user.uid) : null),
    [user, firestore]
  );
  const { data: userProfile, isLoading: isProfileLoading } =
    useDoc<UserProfile>(userDocRef);

  useEffect(() => {
    if (isClient && user && userProfile) {
      router.replace("/sites");
    }
  }, [isClient, user, userProfile, router]);

  const handleLoginOrSignup = async () => {
    if (!name.trim()) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Please enter a valid name.",
      });
      return;
    }

    if (!password.trim()) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Please enter a password.",
      });
      return;
    }

    if (!auth || !firestore) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Firebase service is not available.",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Always ensure a user is authenticated first.
      let authUser = auth.currentUser;
      if (!authUser) {
        const userCredential = await signInAnonymously(auth);
        authUser = userCredential.user;
      }

      if (!authUser) {
        throw new Error("Authentication failed. Please try again.");
      }

      // Step 2: Now that we are authenticated, query the database.
      const usersRef = collection(firestore, "users");
      const q = query(usersRef, where("name", "==", name));

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // --- NEW USER (SIGN UP) ---
        const newUserDocRef = doc(firestore, "users", authUser.uid);

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser: Omit<UserProfile, "createdAt" | "updatedAt"> = {
          id: authUser.uid,
          name: name,
        };
        const fullUserPayload = {
          ...newUser,
          password: hashedPassword, // Store hashed password
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        await setDoc(newUserDocRef, fullUserPayload);

        // Store the user ID in sessionStorage for the Header to use
        sessionStorage.setItem(STORAGE_KEYS.USER_ID, authUser.uid);

        toast({
          title: "Account Created!",
          description: "Logged in successfully.",
          duration: 2000,
        });
        router.push("/sites");
      } else {
        // --- EXISTING USER (LOGIN) ---
        const existingUserDoc = querySnapshot.docs[0];
        const existingUser = existingUserDoc.data() as UserProfile & {
          password?: string;
        };

        // Verify password using bcrypt
        const passwordMatch = existingUser.password
          ? await bcrypt.compare(password, existingUser.password)
          : false;

        if (!passwordMatch) {
          toast({
            variant: "destructive",
            title: "Login Failed",
            description: "Incorrect password.",
            duration: 2000,
          });
          return;
        }

        // Password matches, log them in
        // Use the document ID (not the id field from data) as it's the actual Firestore document ID
        sessionStorage.setItem(STORAGE_KEYS.USER_ID, existingUserDoc.id);

        toast({
          title: "Logged In!",
          description: "Welcome back.",
          duration: 2000,
        });
        router.push("/sites");
      }
    } catch (error: any) {
      console.error("Login/Signup Error:", error);

      // Emit contextual error for Firestore permission issues
      if (error.code === "permission-denied") {
        errorEmitter.emit(
          "permission-error",
          new FirestorePermissionError({
            path: `users`,
            operation: "list", // This is the most likely initial failure point
          })
        );
      } else {
        toast({
          variant: "destructive",
          title: "An error occurred",
          description: error.message || "Could not complete login/signup.",
        });
      }

      // If something went wrong, sign out any partial anonymous session
      if (auth.currentUser) {
        await signOut(auth);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const effectiveLoading = isUserLoading || isProfileLoading;

  if (!isClient || effectiveLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6 flex justify-center items-center h-[80vh]">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <Skeleton className="h-7 w-2/3 mx-auto" />
            <Skeleton className="h-4 w-full mx-auto" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user && userProfile) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 flex justify-center items-center min-h-[80vh]">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center">Welcome</CardTitle>
          <CardDescription className="text-center">
            Manage your work sites, track worker attendance, and log daily
            expenses effortlessly.
            <br />
            <span className="text-xs">
              Enter your name and password to login or sign up.
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g., John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLoginOrSignup()}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLoginOrSignup()}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
              >
                {showPassword ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <Button
            onClick={handleLoginOrSignup}
            disabled={isLoading}
            className={cn("w-full btn-gradient-primary")}
          >
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Login / Sign Up"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
