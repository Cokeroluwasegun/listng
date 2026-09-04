"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ChevronRight, ChevronLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { FaceCapture } from "@/components/auth/FaceCapture";

const NIGERIAN_STATES = [
  { name: "Abia", slug: "abia" },
  { name: "Adamawa", slug: "adamawa" },
  { name: "Akwa Ibom", slug: "akwa-ibom" },
  { name: "Anambra", slug: "anambra" },
  { name: "Bauchi", slug: "bauchi" },
  { name: "Bayelsa", slug: "bayelsa" },
  { name: "Benue", slug: "benue" },
  { name: "Borno", slug: "borno" },
  { name: "Cross River", slug: "cross-river" },
  { name: "Delta", slug: "delta" },
  { name: "Ebonyi", slug: "ebonyi" },
  { name: "Edo", slug: "edo" },
  { name: "Ekiti", slug: "ekiti" },
  { name: "Enugu", slug: "enugu" },
  { name: "FCT - Abuja", slug: "fct-abuja" },
  { name: "Gombe", slug: "gombe" },
  { name: "Imo", slug: "imo" },
  { name: "Jigawa", slug: "jigawa" },
  { name: "Kaduna", slug: "kaduna" },
  { name: "Kano", slug: "kano" },
  { name: "Katsina", slug: "katsina" },
  { name: "Kebbi", slug: "kebbi" },
  { name: "Kogi", slug: "kogi" },
  { name: "Kwara", slug: "kwara" },
  { name: "Lagos", slug: "lagos" },
  { name: "Nasarawa", slug: "nasarawa" },
  { name: "Niger", slug: "niger" },
  { name: "Ogun", slug: "ogun" },
  { name: "Ondo", slug: "ondo" },
  { name: "Osun", slug: "osun" },
  { name: "Oyo", slug: "oyo" },
  { name: "Plateau", slug: "plateau" },
  { name: "Rivers", slug: "rivers" },
  { name: "Sokoto", slug: "sokoto" },
  { name: "Taraba", slug: "taraba" },
  { name: "Yobe", slug: "yobe" },
  { name: "Zamfara", slug: "zamfara" },
];

const stateSlugToName = Object.fromEntries(NIGERIAN_STATES.map((s) => [s.slug, s.name]));

const accountSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  phone: z.string().regex(/^(\+234|0)[789][01]\d{8}$/, "Invalid Nigerian phone number format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don&apos;t match",
  path: ["confirmPassword"]
});

const locationSchema = z.object({
  state: z.string().min(1, "Please select a state"),
  city: z.string().min(2, "City is required"),
  marketId: z.string().min(1, "Please select a market"),
  streetAddress: z.string().min(5, "Street address is required")
});

type AccountData = z.infer<typeof accountSchema>;
type LocationData = z.infer<typeof locationSchema>;

export default function IndividualRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [markets, setMarkets] = useState<{id: string, name: string}[]>([]);
  const [loadingMarkets, setLoadingMarkets] = useState(false);
  const [faceDescriptor, setFaceDescriptor] = useState<number[] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accountForm = useForm<AccountData>({ resolver: zodResolver(accountSchema) });
  const locationForm = useForm<LocationData>({ resolver: zodResolver(locationSchema) });

  const selectedState = locationForm.watch("state");

  useEffect(() => {
    if (selectedState) {
      setLoadingMarkets(true);
      fetch(`/api/locations/markets?stateSlug=${selectedState}`)
        .then(res => res.json())
        .then(data => {
          if (data.markets) setMarkets(data.markets);
        })
        .catch(console.error)
        .finally(() => setLoadingMarkets(false));
    }
  }, [selectedState]);

  const onAccountSubmit = (_data: AccountData) => setStep(2);
  const onLocationSubmit = (_data: LocationData) => setStep(3);
  
  const handleFaceCapture = (descriptor: Float32Array | null) => {
    if (descriptor) {
      setFaceDescriptor(Array.from(descriptor));
      setTimeout(() => setStep(4), 1500); // Wait a bit to show success state
    }
  };

  const finalSubmit = async () => {
    if (!agreedToTerms) {
      setError("You must agree to the Terms of Service.");
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      const accountData = accountForm.getValues();
      const locationData = locationForm.getValues();

      const res = await fetch("/api/auth/register/individual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: accountData.name,
          email: accountData.email,
          phone: accountData.phone,
          password: accountData.password,
          marketId: locationData.marketId,
          streetAddress: locationData.streetAddress,
          faceDescriptor
        })
      });

      const data = await res.json();
      if (data.success) {
        router.push("/choose-plan");
      } else {
        setError(data.error || "Registration failed. Please try again.");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = ["Account", "Location", "Face ID", "Review"];

  return (
    <div className="min-h-screen bg-[var(--muted)] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-xl w-full bg-[var(--background)] rounded-2xl shadow-xl overflow-hidden border border-[var(--border)]">
        
        {/* Progress Header */}
        <div className="bg-[color-mix(in_srgb,var(--color-primary),transparent_95%)] p-6 border-b border-[var(--border)]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-display font-bold text-[var(--foreground)]">
              Seller Registration
            </h2>
            <span className="text-sm font-medium text-[var(--color-primary)]">
              Step {step} of 4
            </span>
          </div>
          
          <div className="flex justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-[var(--muted)] rounded">
              <div 
                className="h-full bg-[var(--color-primary)] rounded transition-all duration-300"
                style={{ width: `${((step - 1) / 3) * 100}%` }}
              />
            </div>
            {steps.map((label, i) => (
              <div key={label} className="relative z-10 flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  i + 1 <= step 
                    ? "bg-[var(--color-primary)] text-white" 
                    : "bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)]"
                }`}>
                  {i + 1 < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-xs mt-1 absolute -bottom-5 w-20 text-center ${
                  i + 1 === step ? "text-[var(--foreground)] font-semibold" : "text-[var(--muted-foreground)]"
                }`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <div className="p-8 mt-4">
          
          {/* STEP 1: Account Details */}
          {step === 1 && (
            <form onSubmit={accountForm.handleSubmit(onAccountSubmit)} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Full Name</label>
                <input 
                  {...accountForm.register("name")} 
                  className="w-full px-4 py-2 rounded-lg border border-[var(--border)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition" 
                  placeholder="John Doe" 
                />
                {accountForm.formState.errors.name && <p className="mt-1 text-sm text-red-500">{accountForm.formState.errors.name.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Email Address</label>
                <input 
                  type="email"
                  {...accountForm.register("email")} 
                  className="w-full px-4 py-2 rounded-lg border border-[var(--border)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition" 
                  placeholder="john@example.com" 
                />
                {accountForm.formState.errors.email && <p className="mt-1 text-sm text-red-500">{accountForm.formState.errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Phone Number</label>
                <input 
                  {...accountForm.register("phone")} 
                  className="w-full px-4 py-2 rounded-lg border border-[var(--border)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition" 
                  placeholder="08012345678" 
                />
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">Nigerian format: 080... or +234...</p>
                {accountForm.formState.errors.phone && <p className="mt-1 text-sm text-red-500">{accountForm.formState.errors.phone.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Password</label>
                  <input 
                    type="password"
                    {...accountForm.register("password")} 
                    className="w-full px-4 py-2 rounded-lg border border-[var(--border)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition" 
                  />
                  {accountForm.formState.errors.password && <p className="mt-1 text-sm text-red-500">{accountForm.formState.errors.password.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Confirm Password</label>
                  <input 
                    type="password"
                    {...accountForm.register("confirmPassword")} 
                    className="w-full px-4 py-2 rounded-lg border border-[var(--border)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition" 
                  />
                  {accountForm.formState.errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{accountForm.formState.errors.confirmPassword.message}</p>}
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  type="submit" 
                  className="flex items-center px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Continue <ChevronRight className="ml-2 w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Location */}
          {step === 2 && (
            <form onSubmit={locationForm.handleSubmit(onLocationSubmit)} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">State</label>
                <select 
                  {...locationForm.register("state")}
                  className="w-full px-4 py-2 rounded-lg border border-[var(--border)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition bg-transparent"
                >
                  <option value="">Select a state...</option>
                  {NIGERIAN_STATES.map(state => (
                    <option key={state.slug} value={state.slug}>{state.name}</option>
                  ))}
                </select>
                {locationForm.formState.errors.state && <p className="mt-1 text-sm text-red-500">{locationForm.formState.errors.state.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">City / LGA</label>
                <input 
                  {...locationForm.register("city")} 
                  className="w-full px-4 py-2 rounded-lg border border-[var(--border)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition" 
                  placeholder="e.g. Ikeja, Surulere" 
                />
                {locationForm.formState.errors.city && <p className="mt-1 text-sm text-red-500">{locationForm.formState.errors.city.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Primary Market</label>
                <select 
                  {...locationForm.register("marketId")}
                  disabled={!selectedState || loadingMarkets}
                  className="w-full px-4 py-2 rounded-lg border border-[var(--border)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition bg-transparent disabled:opacity-50"
                >
                  <option value="">{loadingMarkets ? "Loading markets..." : "Select a market..."}</option>
                  {markets.map(market => (
                    <option key={market.id} value={market.id}>{market.name}</option>
                  ))}
                </select>
                {locationForm.formState.errors.marketId && <p className="mt-1 text-sm text-red-500">{locationForm.formState.errors.marketId.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Street Address</label>
                <textarea 
                  {...locationForm.register("streetAddress")} 
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-[var(--border)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition resize-none" 
                  placeholder="Block/Shop number, Street name" 
                />
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">Your address helps buyers find you by market</p>
                {locationForm.formState.errors.streetAddress && <p className="mt-1 text-sm text-red-500">{locationForm.formState.errors.streetAddress.message}</p>}
              </div>

              <div className="pt-4 flex justify-between">
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className="flex items-center px-4 py-2.5 text-[var(--foreground)] hover:bg-[var(--muted)] rounded-lg font-medium transition-colors border border-[var(--border)]"
                >
                  <ChevronLeft className="mr-2 w-4 h-4" /> Back
                </button>
                <button 
                  type="submit" 
                  className="flex items-center px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Continue <ChevronRight className="ml-2 w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Face Capture */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-[color-mix(in_srgb,var(--color-primary),transparent_95%)] border border-[color-mix(in_srgb,var(--color-primary),transparent_80%)] rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-[var(--color-primary)] flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" /> Identity Verification
                </h4>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">
                  We capture your face once for identity verification. This keeps our marketplace safe, builds trust with buyers, and is never shared publicly.
                </p>
              </div>

              <FaceCapture onCapture={handleFaceCapture} />

              <div className="pt-6 flex justify-start">
                <button 
                  type="button" 
                  onClick={() => setStep(2)}
                  className="flex items-center px-4 py-2.5 text-[var(--foreground)] hover:bg-[var(--muted)] rounded-lg font-medium transition-colors border border-[var(--border)]"
                >
                  <ChevronLeft className="mr-2 w-4 h-4" /> Back
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Review & Submit */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              
              <div className="bg-[var(--muted)] rounded-xl p-5 border border-[var(--border)]">
                <h3 className="font-display font-semibold text-lg mb-4 text-[var(--foreground)] border-b border-[var(--border)] pb-2">Account Details</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 text-sm">
                  <div>
                    <dt className="text-[var(--muted-foreground)] font-medium">Full Name</dt>
                    <dd className="text-[var(--foreground)] mt-1">{accountForm.getValues("name")}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--muted-foreground)] font-medium">Email</dt>
                    <dd className="text-[var(--foreground)] mt-1">{accountForm.getValues("email")}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--muted-foreground)] font-medium">Phone</dt>
                    <dd className="text-[var(--foreground)] mt-1">{accountForm.getValues("phone")}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--muted-foreground)] font-medium">Location</dt>
                    <dd className="text-[var(--foreground)] mt-1">{locationForm.getValues("city")}, {stateSlugToName[locationForm.getValues("state")] || locationForm.getValues("state")}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-[var(--muted-foreground)] font-medium">Address</dt>
                    <dd className="text-[var(--foreground)] mt-1">{locationForm.getValues("streetAddress")}</dd>
                  </div>
                </dl>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm flex items-center border border-red-200">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {error}
                </div>
              )}

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="w-4 h-4 rounded border-[var(--border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] focus:ring-offset-0 bg-transparent cursor-pointer"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="font-medium text-[var(--foreground)] cursor-pointer">
                    I agree to the Terms of Service and Privacy Policy
                  </label>
                  <p className="text-[var(--muted-foreground)]">By registering, you agree to our platform rules.</p>
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button 
                  type="button" 
                  onClick={() => setStep(3)}
                  disabled={isSubmitting}
                  className="flex items-center px-4 py-2.5 text-[var(--foreground)] hover:bg-[var(--muted)] rounded-lg font-medium transition-colors border border-[var(--border)] disabled:opacity-50"
                >
                  <ChevronLeft className="mr-2 w-4 h-4" /> Back
                </button>
                <button 
                  onClick={finalSubmit}
                  disabled={isSubmitting || !agreedToTerms}
                  className="flex items-center px-8 py-2.5 bg-[var(--color-secondary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  {isSubmitting ? (
                    <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Creating Account...</>
                  ) : (
                    <><CheckCircle2 className="mr-2 w-4 h-4" /> Create Account</>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
