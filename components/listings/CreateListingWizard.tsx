"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Upload, X, MapPin, CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { NIGERIAN_STATES } from "@/lib/nigeria-data";

export interface CategoryNode {
  id: string;
  name: string;
  icon: string | null;
  slug: string;
  children: { id: string; name: string; slug: string }[];
}

interface MarketOption {
  id: string;
  name: string;
  slug: string;
  cityName: string;
}

interface CreateListingWizardProps {
  categories: CategoryNode[];
  defaultMarketId?: string;
  slotsLeft: number | null;
}

export function CreateListingWizard({ categories, defaultMarketId, slotsLeft }: CreateListingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [markets, setMarkets] = useState<MarketOption[]>([]);
  const [loadingMarkets, setLoadingMarkets] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    categoryId: "",
    subCategoryId: "",
    title: "",
    description: "",
    price: "",
    isNegotiable: true,
    condition: "Used",
    imageUrls: [] as string[],
    imageInput: "",
    state: "Lagos",
    marketId: "",
  });

  const currentCategory = useMemo(
    () => categories.find((c) => c.id === formData.categoryId),
    [categories, formData.categoryId]
  );

  function selectState(stateName: string) {
    setFormData((f) => ({ ...f, state: stateName, marketId: "" }));
    setMarkets([]);
    setLoadingMarkets(true);
    const slug = NIGERIAN_STATES.find((s) => s.name === stateName)?.slug;
    fetch(`/api/locations/markets?stateSlug=${slug}`)
      .then((r) => r.json())
      .then((data) => {
        const list = data.markets || [];
        setMarkets(list);
        if (defaultMarketId && list.some((m: MarketOption) => m.id === defaultMarketId)) {
          setFormData((f) => ({ ...f, marketId: defaultMarketId }));
        }
      })
      .finally(() => setLoadingMarkets(false));
  }

  function addImage() {
    const value = formData.imageInput.trim();
    if (!value) return;
    let parsed: URL;
    try {
      parsed = new URL(value);
    } catch {
      setError("Please enter a valid image URL (must start with http:// or https://).");
      return;
    }
    if (formData.imageUrls.includes(parsed.href)) return;
    setError(null);
    setFormData((f) => ({ ...f, imageUrls: [...f.imageUrls, parsed.href], imageInput: "" }));
  }

  function removeImage(index: number) {
    setFormData((f) => ({ ...f, imageUrls: f.imageUrls.filter((_, i) => i !== index) }));
  }

  const canNext =
    (step === 1 && !!formData.categoryId && !!formData.subCategoryId) ||
    (step === 2 && formData.title.length >= 5 && !!formData.price && Number(formData.price) > 0 && formData.description.length >= 20) ||
    (step === 3 && formData.imageUrls.length >= 1) ||
    step === 4;

  const handleNext = () => setStep((s) => Math.min(5, s + 1));
  const handleBack = () => setStep((s) => Math.max(1, s - 1));

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          price: Number(formData.price),
          isNegotiable: formData.isNegotiable,
          condition: formData.condition,
          images: formData.imageUrls,
          categoryId: formData.subCategoryId || formData.categoryId,
          marketId: formData.marketId || undefined,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        details?: { fieldErrors?: Record<string, string[] | undefined> };
      };

      if (!res.ok) {
        if (res.status === 403) {
          setError("You've reached your listing limit. Upgrade your plan to publish more listings.");
        } else if (res.status === 400 && data.details?.fieldErrors) {
          const firstField = Object.values(data.details.fieldErrors).find(Boolean)?.[0];
          setError(firstField || data.error || "Please review your listing details.");
        } else {
          setError(data.error || "Something went wrong. Please try again.");
        }
        return;
      }

      router.push("/dashboard/listings");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Header & Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900">Create New Listing</h1>
          {slotsLeft !== null && (
            <span className="text-sm font-medium text-gray-500">{slotsLeft} slot{slotsLeft === 1 ? "" : "s"} left</span>
          )}
        </div>

        <div className="flex items-center justify-between mb-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors z-10 bg-white",
                step === i ? "border-primary text-primary" :
                step > i ? "border-primary bg-primary text-white" : "border-gray-200 text-gray-400"
              )}>
                {step > i ? <CheckCircle2 className="w-5 h-5" /> : i}
              </div>
              {i < 5 && (
                <div className={cn(
                  "flex-1 h-1 mx-2 rounded-full transition-colors",
                  step > i ? "bg-primary" : "bg-gray-200"
                )} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs font-medium text-gray-500 px-1">
          <span>Category</span>
          <span>Details</span>
          <span>Photos</span>
          <span>Location</span>
          <span>Publish</span>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <div className="flex-1">
            <p>{error}</p>
            {error.includes("listing limit") && (
              <button
                onClick={() => router.push("/choose-plan")}
                className="mt-2 font-semibold text-red-700 underline underline-offset-2"
              >
                View Pricing Plans
              </button>
            )}
          </div>
        </div>
      )}

      {/* Wizard Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 min-h-[400px]">
        {/* Step 1: Category */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-xl font-bold text-gray-900">What are you selling?</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setFormData((f) => ({ ...f, categoryId: c.id, subCategoryId: "" }))}
                  className={cn(
                    "p-4 rounded-xl border-2 text-center transition-all",
                    formData.categoryId === c.id ? "border-primary bg-primary/5" : "border-gray-100 hover:border-primary/30 hover:bg-gray-50"
                  )}
                >
                  <div className="text-3xl mb-2">{c.icon || "📦"}</div>
                  <div className="font-medium text-gray-900">{c.name}</div>
                </button>
              ))}
            </div>

            {currentCategory && currentCategory.children.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Select Sub-category</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {currentCategory.children.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setFormData((f) => ({ ...f, subCategoryId: sub.id }))}
                      className={cn(
                        "px-4 py-3 rounded-lg border text-sm font-medium transition-all text-left",
                        formData.subCategoryId === sub.id ? "border-primary bg-primary text-white" : "border-gray-200 hover:border-gray-300 text-gray-700 bg-white"
                      )}
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-bold text-gray-900">Basic Details</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. iPhone 13 Pro Max 256GB"
                  value={formData.title}
                  onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description <span className="text-red-500">*</span></label>
                <textarea
                  rows={5}
                  placeholder="Describe your item in detail..."
                  value={formData.description}
                  onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                />
                <div className="text-right text-xs text-gray-500 mt-1">{formData.description.length}/2000</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (₦) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    placeholder="0.00"
                    min="1"
                    value={formData.price}
                    onChange={(e) => setFormData((f) => ({ ...f, price: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                <div className="flex flex-col justify-end pb-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isNegotiable}
                      onChange={(e) => setFormData((f) => ({ ...f, isNegotiable: e.target.checked }))}
                      className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary/20"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">Price is negotiable</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                <div className="grid grid-cols-3 gap-3">
                  {["New", "Used", "Refurbished"].map((cond) => (
                    <button
                      key={cond}
                      onClick={() => setFormData((f) => ({ ...f, condition: cond }))}
                      className={cn(
                        "py-2.5 rounded-lg border text-sm font-medium transition-all",
                        formData.condition === cond ? "border-primary bg-primary/10 text-primary" : "border-gray-200 hover:bg-gray-50 text-gray-700"
                      )}
                    >
                      {cond}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Photos */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-bold text-gray-900">Add Photos</h2>
            <p className="text-gray-500 text-sm">Add at least 1 photo. The first picture is the title picture.</p>

            <div className="flex gap-3">
              <input
                type="url"
                placeholder="Paste an image URL (https://...)"
                value={formData.imageInput}
                onChange={(e) => setFormData((f) => ({ ...f, imageInput: e.target.value }))}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addImage(); } }}
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              <button
                onClick={addImage}
                disabled={!formData.imageInput.trim()}
                className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                Add
              </button>
            </div>

            {formData.imageUrls.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {formData.imageUrls.map((url, i) => (
                  <div key={url} className="aspect-square bg-gray-100 rounded-xl relative group overflow-hidden border border-gray-200">
                    <img src={url} alt={`Listing image ${i + 1}`} className="w-full h-full object-cover" />
                    {i === 0 && (
                      <span className="absolute left-2 top-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        Title
                      </span>
                    )}
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center mt-6">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8" />
                </div>
                <p className="text-gray-900 font-medium mb-1">Add at least one image</p>
                <p className="text-gray-500 text-sm">Paste image URLs above to add photos</p>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Location */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-bold text-gray-900">Location Details</h2>
            <p className="text-gray-500 text-sm">Where is this item located?</p>

            <div className="space-y-4 max-w-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
                <select
                  value={formData.state}
                  onChange={(e) => selectState(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  {NIGERIAN_STATES.map((s) => (
                    <option key={s.slug} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Market / Hub</label>
                {loadingMarkets ? (
                  <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-500">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    Loading markets...
                  </div>
                ) : (
                  <select
                    value={formData.marketId}
                    onChange={(e) => setFormData((f) => ({ ...f, marketId: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="">Use my registered market</option>
                    {markets.map((m) => (
                      <option key={m.id} value={m.id}>{m.name} ({m.cityName})</option>
                    ))}
                  </select>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Leave as &quot;Use my registered market&quot; if the item is at your usual location.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-bold text-gray-900">Review & Publish</h2>

            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <div className="flex gap-6">
                <div className="w-32 h-32 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                  {formData.imageUrls[0] ? (
                    <img src={formData.imageUrls[0]} alt="Title" className="w-full h-full object-cover" />
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 text-sm text-gray-500">
                    <span className="bg-gray-200 px-2 py-0.5 rounded text-gray-700 font-medium">{formData.condition}</span>
                    <span>•</span>
                    <span>{currentCategory?.name} {formData.subCategoryId ? "› " + currentCategory?.children.find(c => c.id === formData.subCategoryId)?.name : ""}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">{formData.title || "Untitled Listing"}</h3>
                  <div className="text-2xl font-black text-gray-900 mb-2">
                    ₦ {Number(formData.price || 0).toLocaleString()}
                    {formData.isNegotiable && <span className="text-sm font-medium text-gray-500 ml-2">(Negotiable)</span>}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                    {markets.find((m) => m.id === formData.marketId)?.name || "Registered market"}, {formData.state}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm flex items-start gap-3">
              <div className="mt-0.5 text-blue-500"><CheckCircle2 className="w-5 h-5" /></div>
              <p>Your listing will be submitted for review. Once approved by our team, it will go live on the marketplace. This usually takes less than 1 hour.</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={handleBack}
          disabled={step === 1}
          className="px-6 py-3 font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>

        {step < 5 ? (
          <button
            onClick={handleNext}
            disabled={!canNext}
            className="flex items-center px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            Next Step
            <ChevronRight className="w-5 h-5 ml-1" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
          >
            {submitting ? "Publishing..." : "Publish Listing"}
          </button>
        )}
      </div>
    </>
  );
}