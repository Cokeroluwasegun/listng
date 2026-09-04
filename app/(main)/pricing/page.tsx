import { db } from "@/lib/db";
import Link from "next/link";
import { Check, HelpCircle } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vendor Pricing & Packages | ListNG",
  description: "Choose the perfect plan for your business on ListNG marketplace."
};

export default async function PricingPage() {
  const packages = await db.package.findMany({
    orderBy: { sortOrder: 'asc' }
  });

  return (
    <div className="min-h-screen bg-[var(--muted)] py-16">
      <div className="max-w-7xl mx-auto px-4">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600">
            Whether you&apos;re just clearing out your closet or running a full-scale business, we have a plan for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-24">
          {packages.map((pkg) => {
            const isFree = pkg.price.toNumber() === 0;
            return (
              <div 
                key={pkg.id} 
                className={cn(
                  "bg-white rounded-3xl p-8 relative flex flex-col transition-all duration-300",
                  pkg.isPopular 
                    ? "border-2 border-[var(--color-primary)] shadow-xl scale-100 lg:scale-105 z-10" 
                    : "border border-gray-200 shadow-sm hover:shadow-md"
                )}
              >
                {pkg.isPopular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--color-primary)] text-white text-xs font-bold uppercase tracking-widest py-1.5 px-4 rounded-full">
                    Most Popular
                  </div>
                )}
                
                <div className="mb-8">
                  <h3 className="text-2xl font-display font-bold text-gray-900">{pkg.name}</h3>
                  {pkg.badge && (
                    <span className="inline-block mt-2 text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {pkg.badge}
                    </span>
                  )}
                  <div className="mt-4 flex items-baseline text-gray-900">
                    <span className="text-4xl font-extrabold tracking-tight">
                      {isFree ? "Free" : formatPrice(pkg.price.toNumber())}
                    </span>
                    {!isFree && <span className="ml-1 text-xl font-medium text-gray-500">/mo</span>}
                  </div>
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                  {(pkg.features as string[])?.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="w-5 h-5 text-[var(--color-secondary)] shrink-0 mr-3" />
                      <span className="text-gray-600 text-sm leading-tight">{feature}</span>
                    </li>
                  ))}
                  {pkg.heroSpotsPerMonth > 0 && (
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-[var(--color-primary)] shrink-0 mr-3" />
                      <span className="text-gray-900 font-medium text-sm leading-tight">
                        {pkg.heroSpotsPerMonth} Sponsored Spots per month
                      </span>
                    </li>
                  )}
                </ul>

                <Link 
                  href={isFree ? "/register" : `/checkout?packageId=${pkg.id}`}
                  className={cn(
                    "w-full block text-center py-4 rounded-xl font-bold transition-colors",
                    pkg.isPopular
                      ? "bg-[var(--color-primary)] text-white hover:bg-orange-600 shadow-md"
                      : "bg-orange-50 text-[var(--color-primary)] hover:bg-orange-100"
                  )}
                >
                  {isFree ? "Get Started" : "Choose Plan"}
                </Link>
              </div>
            );
          })}
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-display font-bold text-gray-900">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h4 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[var(--color-primary)]" />
                Can I change my plan later?
              </h4>
              <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time from your vendor dashboard. If you upgrade, the prorated amount will be applied.</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h4 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[var(--color-primary)]" />
                Is VAT included?
              </h4>
              <p className="text-gray-600">No, the prices listed above do not include Value Added Tax (VAT). Applicable VAT will be added at checkout.</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h4 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[var(--color-primary)]" />
                How is payment made?
              </h4>
              <p className="text-gray-600">We process all payments securely via Paystack. You can pay using your debit/credit card, direct bank transfer, or USSD.</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h4 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[var(--color-primary)]" />
                What is CAC verification?
              </h4>
              <p className="text-gray-600">CAC verification allows us to verify your registered business with the Corporate Affairs Commission of Nigeria. Verified businesses get a special badge and higher trust from buyers.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
