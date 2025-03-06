"use client"
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function Signin() {
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_API_URL;

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      console.log("Sign in Success:", response.data);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userId", response.data.id);
      router.push("/pages/mainPage");
    } catch (err: any) {
      console.error("Signup Error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1f1d1d]">
      <Card className="w-full max-w-xs shadow-md rounded-lg bg-gray-300 pt-4 pb-4 px-2">
        <CardHeader>
          <CardTitle className="text-gray-800 text-center text-2xl font-semibold">
            Welcome Back!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col items-center" onSubmit={handleSignin}>
            <div className="flex flex-col items-start w-full">
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="border-gray-400 mb-4"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="border-gray-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="text-gray-500 text-sm text-left mt-1">
                New here?{" "}
                <Link
                  href="/signup"
                  className="font-semibold text-cyan-800 hover:underline"
                >
                  Sign Up
                </Link>
              </p>
            </div>
            <Button
              type="submit"
              className="w-1/2 bg-cyan-800 mt-6 text-md"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
