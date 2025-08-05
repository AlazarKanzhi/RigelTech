import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { GraduationCap, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { loginSchema, type LoginData } from "@shared/schema";
import { useLocation } from "wouter";

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Welcome to Rigel",
        description: "Successfully logged in",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  // Redirect if already authenticated
  if (!isLoading && isAuthenticated) {
    setLocation("/");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rigel-blue to-rigel-blue-light flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-8 h-8 bg-rigel-orange rounded-full flex items-center justify-center mb-4 mx-auto">
            <GraduationCap className="text-white w-5 h-5" />
          </div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  const onSubmit = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rigel-blue to-rigel-blue-light flex">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md shadow-2xl">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-rigel-orange rounded-full mb-4">
                <GraduationCap className="text-white text-2xl w-8 h-8" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Rigel</h1>
              <p className="text-gray-600">Sign in to access your learning portal</p>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your username"
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            className="w-full pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit"
                  className="w-full bg-rigel-orange text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </Form>
            
            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Don't have an account? Contact your instructor for credentials.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Right side - Hero Section */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-8 text-white">
        <div className="max-w-md text-center">
          <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-8 mx-auto">
            <GraduationCap className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-4xl font-bold mb-6">Transform Your Learning Journey</h2>
          <p className="text-xl text-blue-100 mb-8">
            Access comprehensive courses, track your progress, and achieve your educational goals with Rigel's modern learning platform.
          </p>
          <div className="grid grid-cols-1 gap-4 text-left">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-rigel-orange rounded-full mr-3"></div>
              <span>Interactive course materials</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-rigel-orange rounded-full mr-3"></div>
              <span>Progress tracking and analytics</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-rigel-orange rounded-full mr-3"></div>
              <span>Personalized learning experience</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}