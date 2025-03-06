"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_API_URL;
  console.log(API_BASE_URL)
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        email,
        password,
      });

      console.log("Signup Success:", response.data);
      alert("Signup successful!");

    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error("Signup Error:", err.response?.data || err.message);
        setError(err.response?.data?.message || "Something went wrong");
      } else {
        console.error("Signup Error:", err);
      }      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1f1d1d]">
      <Card className="w-full max-w-xs shadow-md rounded-lg bg-gray-300 pt-4 pb-4 px-2">
        <CardHeader>
          <CardTitle className="text-gray-800 text-center text-2xl font-semibold">
            Sign up to get started!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col items-center" onSubmit={handleSignup}>
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
              {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
              <p className="text-gray-500 text-sm text-left mt-1">
                Have an account already?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/signin")}
                  className="font-semibold text-cyan-800 hover:underline"
                >
                  Sign In
                </button>
              </p>
            </div>
            <Button
              type="submit"
              className="w-1/2 bg-cyan-800 mt-6 text-md"
              disabled={loading}
            >
              {loading ? "Signing up..." : "Sign Up"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
