"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { signIn } from "@/lib/auth-client"; 

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional()
});

type LoginData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginData>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const { error: signInError } = await signIn.email({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      });

      if (signInError) {
        setError(signInError.message || "Invalid email or password");
        return;
      }

      const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--muted))] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[hsl(var(--background))] rounded-2xl shadow-xl overflow-hidden border border-[hsl(var(--border))] p-8">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[hsl(var(--color-primary))] text-white font-display font-bold text-2xl mb-4 shadow-lg">
            L
          </div>
          <h1 className="text-2xl font-display font-bold text-[hsl(var(--foreground))]">Welcome back</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-2 text-sm">Sign in to your ListNG account</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 text-red-600 text-sm flex items-center border border-red-200">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Email Address</label>
            <input 
              type="email"
              {...register("email")}
              className="w-full px-4 py-2.5 rounded-lg border border-[hsl(var(--border))] focus:ring-2 focus:ring-[hsl(var(--color-primary))] outline-none transition" 
              placeholder="you@example.com"
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-[hsl(var(--foreground))]">Password</label>
              <Link href="/forgot-password" className="text-xs font-medium text-[hsl(var(--color-primary))] hover:underline underline-offset-2">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className="w-full px-4 py-2.5 rounded-lg border border-[hsl(var(--border))] focus:ring-2 focus:ring-[hsl(var(--color-primary))] outline-none transition pr-10" 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          <div className="flex items-center">
            <input 
              id="rememberMe" 
              type="checkbox" 
              {...register("rememberMe")}
              className="w-4 h-4 rounded border-[hsl(var(--border))] text-[hsl(var(--color-primary))] focus:ring-[hsl(var(--color-primary))]" 
            />
            <label htmlFor="rememberMe" className="ml-2 text-sm text-[hsl(var(--foreground))] cursor-pointer">
              Remember me for 30 days
            </label>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-2.5 bg-[hsl(var(--color-primary))] text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex justify-center items-center shadow-md disabled:opacity-70"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-[hsl(var(--color-primary))] hover:underline underline-offset-2">
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
}
