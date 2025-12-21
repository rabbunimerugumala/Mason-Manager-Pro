// ✅ Generated following IndiBuddy project rules

"use client";

import { useState, useEffect } from "react";
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
import { useAuth } from "@/context/AuthContext";

export default function AuthPage() {
  const { user, loading, signup, login } = useAuth();
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

  // Redirect if already logged in
  useEffect(() => {
    if (isClient && !loading && user) {
      router.replace("/sites");
    }
  }, [isClient, loading, user, router]);

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

    setIsLoading(true);

    try {
      // Try login first
      try {
        await login(name, password);
        toast({
          title: "Logged In!",
          description: "Welcome back.",
          duration: 2000,
        });
        router.push("/sites");
      } catch (loginError: any) {
        // If user not found, try signup
        if (loginError.message === "User not found") {
          await signup(name, password);
          toast({
            title: "Account Created!",
            description: "Logged in successfully.",
            duration: 2000,
          });
          router.push("/sites");
        } else {
          // Other login errors (wrong password, etc.)
          throw loginError;
        }
      }
    } catch (error: any) {
      console.error("Login/Signup Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Could not complete login/signup.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isClient || loading) {
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

  if (user) {
    return null; // Will redirect
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
