import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { X } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CreateListingWizard } from "@/components/listings/CreateListingWizard";

export default async function CreateListingPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    redirect("/login?callbackUrl=/listings/create");
  }

  const [categories, subscription] = await Promise.all([
    db.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        icon: true,
        slug: true,
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          select: { id: true, name: true, slug: true },
        },
      },
    }),
    db.userSubscription.findUnique({
      where: { userId: session.user.id },
      include: { package: true },
    }),
  ]);

  const hasActiveSubscription =
    !!subscription && subscription.status === "ACTIVE" && subscription.endDate >= new Date();
  const maxListings = hasActiveSubscription ? subscription.package.maxListings : 0;
  const usedSlots = hasActiveSubscription ? subscription.listingsUsed : 0;
  const slotsLeft = maxListings === -1 ? null : Math.max(0, maxListings - usedSlots);

  if (slotsLeft === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <X className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold mb-4">No Listing Slots Available</h2>
        <p className="text-gray-600 mb-8">
          You have exhausted your current plan&apos;s listing slots. Please upgrade your plan to
          continue selling on ListNG.
        </p>
        <Link
          href="/choose-plan"
          className="inline-flex bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors"
        >
          View Pricing Plans
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <CreateListingWizard
        categories={categories}
        defaultMarketId={session.user.marketId ?? undefined}
        slotsLeft={slotsLeft}
      />
    </div>
  );
}