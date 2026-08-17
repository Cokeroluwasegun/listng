"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ChevronRight, ChevronLeft, Loader2, CheckCircle2, AlertCircle, Building, ShieldCheck } from "lucide-react";
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

const BUSINESS_TYPES = ["Retail", "Wholesale", "Services", "Manufacturing", "Import/Export", "Other"];
const CAC_TYPES = ["RC (Private Limited)", "BN (Business Name)", "IT (Incorporated Trustee)", "LLP (Limited Liability Partnership)"];

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

const businessSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  businessType: z.string().min(1, "Business type is required"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(2, "City is required"),
  marketId: z.string().min(1, "Market is required"),
  streetAddress: z.string().min(5, "Address is required"),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  whatsapp: z.string().optional().or(z.literal(""))
});

type AccountData = z.infer<typeof accountSchema>;
type BusinessData = z.infer<typeof businessSchema>;

export default function VendorRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [markets, setMarkets] = useState<{id: string, name: string}[]>([]);
  const [loadingMarkets, setLoadingMarkets] = useState(false);
  const [faceDescriptor, setFaceDescriptor] = useState<number[] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // CAC state
  const [cacType, setCacType] = useState("");
  const [cacNumber, setCacNumber] = useState("");
  const [isVerifyingCac, setIsVerifyingCac] = useState(false);
  const [cacVerified, setCacVerified] = useState(false);
  const [cacData, setCacData] = useState<{ name: string; status: string; directors?: string[] } | null>(null);
  const [cacError, setCacError] = useState<string | null>(null);

  const accountForm = useForm<AccountData>({ resolver: zodResolver(accountSchema) });
  const businessForm = useForm<BusinessData>({ resolver: zodResolver(businessSchema) });

  const selectedState = businessForm.watch("state");

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

  const onAccountSubmit = (data: AccountData) => setStep(2);
  const onBusinessSubmit = (data: BusinessData) => setStep(3);

  const verifyCac = async () => {
    if (!cacType || !cacNumber) {
      setCacError("Please provide both company type and registration number.");
      return;
    }
    setCacError(null);
    setIsVerifyingCac(true);
    
    try {
      // Mocking CAC verification for this demo
      await new Promise(resolve => setTimeout(resolve, 1500));
      if (cacNumber.length > 5) {
        setCacData({
          name: businessForm.getValues("businessName").toUpperCase(),
          status: "ACTIVE",
          directors: [accountForm.getValues("name")]
        });
        setCacVerified(true);
      } else {
        setCacError("Invalid RC number format. Could not verify.");
      }
    } catch (err) {
      setCacError("Verification service unavailable. You can skip this for now.");
    } finally {
      setIsVerifyingCac(false);
    }
  };
  
  const handleFaceCapture = (descriptor: Float32Array | null) => {
    if (descriptor) {
      setFaceDescriptor(Array.from(descriptor));
      setTimeout(() => setStep(5), 1500);
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
      const businessData = businessForm.getValues();

      const res = await fetch("/api/auth/register/vendor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: accountData.name,
          email: accountData.email,
          phone: accountData.phone,
          password: accountData.password,
          businessName: businessData.businessName,
          businessType: businessData.businessType,
          marketId: businessData.marketId,
          streetAddress: businessData.streetAddress,
          website: businessData.website,
          whatsapp: businessData.whatsapp,
          cacVerification: cacVerified ? { type: cacType, number: cacNumber, rawData: cacData } : undefined,
          faceDescriptor
        })
      });

      const data = await res.json();
      if (data.success) {
        router.push("/choose-plan");
      } else {
        setError(data.error || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = ["Account", "Business", "CAC", "Face ID", "Review"];

  return (
    <div className="min-h-screen bg-[hsl(var(--muted))] py-12 px-4 sm:px-6 flex items-center justify-center">
      <div className="max-w-xl w-full bg-[hsl(var(--background))] rounded-2xl shadow-xl overflow-hidden border border-[hsl(var(--border))]">
        
        {/* Progress Header */}
        <div className="bg-[hsl(var(--color-primary))/0.05] p-6 border-b border-[hsl(var(--border))]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-display font-bold text-[hsl(var(--foreground))]">
              Vendor Registration
            </h2>
            <span className="text-sm font-medium text-[hsl(var(--color-primary))]">
              Step {step} of 5
            </span>
          </div>
          
          <div className="flex justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-[hsl(var(--muted))] rounded">
              <div 
                className="h-full bg-[hsl(var(--color-primary))] rounded transition-all duration-300"
                style={{ width: `${((step - 1) / 4) * 100}%` }}
              />
            </div>
            {steps.map((label, i) => (
              <div key={label} className="relative z-10 flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  i + 1 <= step 
                    ? "bg-[hsl(var(--color-primary))] text-white" 
                    : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))]"
                }`}>
                  {i + 1 < step ? <CheckCircle2 className="w-3 h-3" /> : i + 1}
                </div>
                <span className={`text-[10px] mt-1 absolute -bottom-4 w-16 text-center ${
                  i + 1 === step ? "text-[hsl(var(--foreground))] font-semibold" : "text-[hsl(var(--muted-foreground))]"
                }`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <div className="p-8 mt-2">
          
          {/* STEP 1: Account Details */}
          {step === 1 && (
            <form onSubmit={accountForm.handleSubmit(onAccountSubmit)} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              {/* Similar fields as individual registration */}
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Full Name</label>
                <input {...accountForm.register("name")} className="w-full px-4 py-2 rounded-lg border border-[hsl(var(--border))] focus:ring-2 focus:ring-[hsl(var(--color-primary))] outline-none transition" />
                {accountForm.formState.errors.name && <p className="text-xs text-red-500 mt-1">{accountForm.formState.errors.name.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Email Address</label>
                <input type="email" {...accountForm.register("email")} className="w-full px-4 py-2 rounded-lg border border-[hsl(var(--border))] focus:ring-2 focus:ring-[hsl(var(--color-primary))] outline-none transition" />
                {accountForm.formState.errors.email && <p className="text-xs text-red-500 mt-1">{accountForm.formState.errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Phone Number</label>
                <input {...accountForm.register("phone")} className="w-full px-4 py-2 rounded-lg border border-[hsl(var(--border))] focus:ring-2 focus:ring-[hsl(var(--color-primary))] outline-none transition" />
                {accountForm.formState.errors.phone && <p className="text-xs text-red-500 mt-1">{accountForm.formState.errors.phone.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Password</label>
                  <input type="password" {...accountForm.register("password")} className="w-full px-4 py-2 rounded-lg border border-[hsl(var(--border))] focus:ring-2 focus:ring-[hsl(var(--color-primary))] outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Confirm</label>
                  <input type="password" {...accountForm.register("confirmPassword")} className="w-full px-4 py-2 rounded-lg border border-[hsl(var(--border))] focus:ring-2 focus:ring-[hsl(var(--color-primary))] outline-none transition" />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button type="submit" className="flex items-center px-6 py-2.5 bg-[hsl(var(--color-primary))] text-white rounded-lg font-medium hover:opacity-90 transition-opacity">
                  Continue <ChevronRight className="ml-2 w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Business Info */}
          {step === 2 && (
            <form onSubmit={businessForm.handleSubmit(onBusinessSubmit)} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Business Name</label>
                  <input {...businessForm.register("businessName")} className="w-full px-4 py-2 rounded-lg border border-[hsl(var(--border))] focus:ring-2 focus:ring-[hsl(var(--color-primary))] outline-none transition" />
                  {businessForm.formState.errors.businessName && <p className="text-xs text-red-500 mt-1">{businessForm.formState.errors.businessName.message}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Business Type</label>
                  <select {...businessForm.register("businessType")} className="w-full px-4 py-2 rounded-lg border border-[hsl(var(--border))] focus:ring-2 focus:ring-[hsl(var(--color-primary))] outline-none transition bg-transparent">
                    <option value="">Select type...</option>
                    {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">State</label>
                  <select {...businessForm.register("state")} className="w-full px-4 py-2 rounded-lg border border-[hsl(var(--border))] focus:ring-2 focus:ring-[hsl(var(--color-primary))] outline-none transition bg-transparent">
                    <option value="">Select state...</option>
                    {NIGERIAN_STATES.map(s => <option key={s.slug} value={s.slug}>{s.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">City</label>
                  <input {...businessForm.register("city")} className="w-full px-4 py-2 rounded-lg border border-[hsl(var(--border))] focus:ring-2 focus:ring-[hsl(var(--color-primary))] outline-none transition" />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Primary Market</label>
                  <select {...businessForm.register("marketId")} disabled={!selectedState || loadingMarkets} className="w-full px-4 py-2 rounded-lg border border-[hsl(var(--border))] focus:ring-2 focus:ring-[hsl(var(--color-primary))] outline-none transition bg-transparent disabled:opacity-50">
                    <option value="">{loadingMarkets ? "Loading..." : "Select market..."}</option>
                    {markets.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Address</label>
                  <textarea {...businessForm.register("streetAddress")} rows={2} className="w-full px-4 py-2 rounded-lg border border-[hsl(var(--border))] focus:ring-2 focus:ring-[hsl(var(--color-primary))] outline-none transition resize-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Website (Optional)</label>
                  <input {...businessForm.register("website")} placeholder="https://" className="w-full px-4 py-2 rounded-lg border border-[hsl(var(--border))] focus:ring-2 focus:ring-[hsl(var(--color-primary))] outline-none transition" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">WhatsApp (Optional)</label>
                  <input {...businessForm.register("whatsapp")} className="w-full px-4 py-2 rounded-lg border border-[hsl(var(--border))] focus:ring-2 focus:ring-[hsl(var(--color-primary))] outline-none transition" />
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button type="button" onClick={() => setStep(1)} className="flex items-center px-4 py-2 text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] rounded-lg font-medium border border-[hsl(var(--border))]">
                  <ChevronLeft className="mr-2 w-4 h-4" /> Back
                </button>
                <button type="submit" className="flex items-center px-6 py-2 bg-[hsl(var(--color-primary))] text-white rounded-lg font-medium hover:opacity-90">
                  Continue <ChevronRight className="ml-2 w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: CAC Verification */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center space-y-2 mb-6">
                <div className="mx-auto w-12 h-12 bg-[hsl(var(--color-secondary))/0.1] text-[hsl(var(--color-secondary))] rounded-full flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-display font-semibold">Verify Your Business (Optional but Recommended)</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Verified businesses get the CAC Verified badge and 3x more buyer trust.</p>
              </div>

              {!cacVerified ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Company Type</label>
                    <select 
                      value={cacType} onChange={(e) => setCacType(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-[hsl(var(--border))] focus:ring-2 focus:ring-[hsl(var(--color-primary))] outline-none transition bg-transparent"
                    >
                      <option value="">Select type...</option>
                      {CAC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[hsl(var(--foreground))] mb-1">Registration Number</label>
                    <input 
                      value={cacNumber} onChange={(e) => setCacNumber(e.target.value)}
                      placeholder="e.g. RC1234567"
                      className="w-full px-4 py-2 rounded-lg border border-[hsl(var(--border))] focus:ring-2 focus:ring-[hsl(var(--color-primary))] outline-none transition" 
                    />
                  </div>
                  
                  {cacError && <p className="text-sm text-red-500">{cacError}</p>}

                  <button 
                    onClick={verifyCac} disabled={isVerifyingCac || !cacType || !cacNumber}
                    className="w-full py-2.5 bg-[hsl(var(--foreground))] text-[hsl(var(--background))] rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex justify-center items-center"
                  >
                    {isVerifyingCac ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying...</> : "Verify Business"}
                  </button>
                </div>
              ) : (
                <div className="bg-[hsl(var(--color-secondary))/0.1] border border-[hsl(var(--color-secondary))/0.3] rounded-xl p-5">
                  <div className="flex items-center text-[hsl(var(--color-secondary))] font-semibold mb-3">
                    <CheckCircle2 className="w-5 h-5 mr-2" /> CAC Verification Successful
                  </div>
                  <dl className="text-sm space-y-2">
                    <div className="flex justify-between"><dt className="text-[hsl(var(--muted-foreground))]">Company Name:</dt><dd className="font-medium text-[hsl(var(--foreground))]">{cacData?.name ?? '-'}</dd></div>
                    <div className="flex justify-between"><dt className="text-[hsl(var(--muted-foreground))]">Status:</dt><dd className="font-medium text-[hsl(var(--foreground))]">{cacData?.status ?? '-'}</dd></div>
                  </dl>
                </div>
              )}

              <div className="pt-4 flex justify-between items-center">
                <button onClick={() => setStep(2)} className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">Back</button>
                <button onClick={() => setStep(4)} className="text-[hsl(var(--color-primary))] font-medium hover:underline underline-offset-4">
                  {cacVerified ? "Continue" : "Continue without verification"} <ChevronRight className="inline w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Face Capture */}
          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <FaceCapture onCapture={handleFaceCapture} />
              <div className="pt-4"><button onClick={() => setStep(3)} className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">Back</button></div>
            </div>
          )}

          {/* STEP 5: Review & Submit */}
          {step === 5 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-[hsl(var(--muted))] rounded-xl p-5 border border-[hsl(var(--border))]">
                <h3 className="font-display font-semibold text-lg mb-4 border-b border-[hsl(var(--border))] pb-2">Business Summary</h3>
                <dl className="grid grid-cols-2 gap-y-3 text-sm">
                  <div><dt className="text-[hsl(var(--muted-foreground))]">Rep Name</dt><dd>{accountForm.getValues("name")}</dd></div>
                  <div><dt className="text-[hsl(var(--muted-foreground))]">Business</dt><dd className="font-medium">{businessForm.getValues("businessName")}</dd></div>
                  <div><dt className="text-[hsl(var(--muted-foreground))]">Type</dt><dd>{businessForm.getValues("businessType")}</dd></div>
                  <div><dt className="text-[hsl(var(--muted-foreground))]">CAC Status</dt><dd className={cacVerified ? "text-[hsl(var(--color-secondary))] font-semibold" : "text-[hsl(var(--muted-foreground))]"}>{cacVerified ? "Verified" : "Unverified"}</dd></div>
                </dl>
              </div>

              {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">{error}</div>}

              <div className="flex items-start">
                <input id="terms" type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="mt-1 w-4 h-4 rounded border-[hsl(var(--border))] text-[hsl(var(--color-primary))] focus:ring-[hsl(var(--color-primary))]" />
                <label htmlFor="terms" className="ml-3 text-sm font-medium cursor-pointer">I agree to the Terms of Service and Privacy Policy</label>
              </div>

              <div className="pt-4 flex justify-between">
                <button onClick={() => setStep(4)} disabled={isSubmitting} className="px-4 py-2 border border-[hsl(var(--border))] rounded-lg hover:bg-[hsl(var(--muted))]">Back</button>
                <button onClick={finalSubmit} disabled={isSubmitting || !agreedToTerms} className="px-8 py-2.5 bg-[hsl(var(--color-secondary))] text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50">
                  {isSubmitting ? <><Loader2 className="inline w-4 h-4 mr-2 animate-spin" /> Submitting...</> : "Complete Registration"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
