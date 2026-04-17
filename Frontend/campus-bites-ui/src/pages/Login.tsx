import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import heroIllustration from "@/assets/hero-illustration.png";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000"; 


const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔹 Login Handler
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    try {
      const res = await axios.post("https://mern-backend-fdavadhecebafpbb.centralindia-01.azurewebsites.net/api/users/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/home");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Login failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 Register Handler
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const name = form.get("name") as string;
    const email = form.get("reg-email") as string;
    const password = form.get("reg-password") as string;

    try {
      const res = await axios.post(`https://mern-backend-fdavadhecebafpbb.centralindia-01.azurewebsites.net/api/users/register`, { name, email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/home");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Registration failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/20 to-secondary/20 items-center justify-center p-12">
        <div className="max-w-lg">
          <img
            src={heroIllustration}
            alt="Smart Canteen"
            className="w-full h-auto rounded-3xl shadow-2xl"
          />
          <h2 className="text-3xl font-bold mt-8 text-foreground">
            Order Food, Skip the Queue! 🎉
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Browse menu, order online, and pick up your food with QR verification. Fast, easy, and contactless!
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
              <span className="text-4xl">🍽️</span>
            </div>
            <h1 className="text-3xl font-bold">Smart Canteen</h1>
            <p className="text-muted-foreground mt-2">Welcome back! Please sign in to continue</p>
          </div>

          {error && (
            <p className="text-red-500 text-center mb-3">{error}</p>
          )}

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            {/* LOGIN */}
            <TabsContent value="login">
              <Card className="border-2 rounded-2xl">
                <CardHeader>
                  <CardTitle>Login</CardTitle>
                  <CardDescription>Enter your credentials to access your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" placeholder="you@example.com" required className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" name="password" type="password" placeholder="••••••••" required className="rounded-xl" />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Logging in..." : "Login"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* REGISTER */}
            <TabsContent value="register">
              <Card className="border-2 rounded-2xl">
                <CardHeader>
                  <CardTitle>Create Account</CardTitle>
                  <CardDescription>Fill in your details to get started</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" name="name" type="text" placeholder="John Doe" required className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-email">Email</Label>
                      <Input id="reg-email" name="reg-email" type="email" placeholder="you@example.com" required className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-password">Password</Label>
                      <Input id="reg-password" name="reg-password" type="password" placeholder="••••••••" required className="rounded-xl" />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Creating account..." : "Register"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <Button variant="link" asChild>
              <a href="/admin">Admin Login</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
