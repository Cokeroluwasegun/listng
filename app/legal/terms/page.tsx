import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | ListNG",
  description: "ListNG terms of service governing your use of our marketplace platform.",
};

export default function TermsPage() {
  const lastUpdated = "1 September 2026";
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold text-gray-900">Terms of Service</h1>
      <p className="mb-8 text-sm text-gray-500">Last updated: {lastUpdated}</p>

      <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
        <section>
          <h2 className="text-xl font-semibold text-gray-900">1. Acceptance</h2>
          <p>
            By creating an account or using ListNG (&quot;the Platform&quot;), you agree to these Terms of
            Service. If you do not agree, do not use the Platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">2. Eligibility</h2>
          <p>
            You must be at least 18 years old and a resident of Nigeria to use ListNG. Vendors must have a
            valid CAC registration to operate as a business.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">3. Listings &amp; Transactions</h2>
          <ul className="list-disc pl-6">
            <li>You are responsible for the accuracy of your listings.</li>
            <li>Prohibited items include weapons, drugs, stolen goods, and counterfeit items.</li>
            <li>ListNG is not a party to transactions between buyers and sellers.</li>
            <li>All sales must comply with Nigerian law.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">4. Subscriptions &amp; Refunds</h2>
          <p>
            Paid plans (Trader Plus, Market Pro, Distributor VIP) renew monthly and are billed via Paystack.
            You may cancel at any time; refunds are issued at ListNG&apos;s discretion and only for unused
            portions of a billing cycle.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">5. Identity Verification</h2>
          <p>
            Face verification and CAC verification are used to build trust. By submitting biometric or business
            data you consent to its processing for verification purposes only.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">6. Account Suspension</h2>
          <p>
            We may suspend accounts that violate these terms, engage in fraud, or receive consistent buyer
            complaints.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">7. Limitation of Liability</h2>
          <p>
            ListNG is provided &quot;as is&quot;. We are not liable for indirect, incidental, or consequential
            damages arising from use of the Platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">8. Governing Law</h2>
          <p>
            These terms are governed by the laws of the Federal Republic of Nigeria. Disputes are subject to
            the jurisdiction of Nigerian courts.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">9. Contact</h2>
          <p>For questions, email legal@listng.com.ng.</p>
        </section>
      </div>
    </div>
  );
}
