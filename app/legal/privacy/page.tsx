import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | ListNG",
  description: "ListNG privacy policy and NDPR compliance statement.",
};

export default function PrivacyPage() {
  const lastUpdated = "1 September 2026";
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold text-gray-900">Privacy Policy</h1>
      <p className="mb-8 text-sm text-gray-500">Last updated: {lastUpdated}</p>

      <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
        <section>
          <h2 className="text-xl font-semibold text-gray-900">1. Overview</h2>
          <p>
            ListNG (&quot;we&quot;, &quot;us&quot;) is committed to protecting your privacy in compliance with
            the Nigeria Data Protection Regulation (NDPR) 2019.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">2. Data We Collect</h2>
          <ul className="list-disc pl-6">
            <li><strong>Account data:</strong> name, email, phone, username.</li>
            <li><strong>Verification data:</strong> face descriptor (biometric), CAC business details.</li>
            <li><strong>Usage data:</strong> IP address, device fingerprint, login history, pages visited.</li>
            <li><strong>Transaction data:</strong> payment records via Paystack.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">3. How We Use Your Data</h2>
          <p>We use your data to:</p>
          <ul className="list-disc pl-6">
            <li>Provide and secure the Platform.</li>
            <li>Verify identity and prevent fraud.</li>
            <li>Process payments and subscriptions.</li>
            <li>Send service notifications (approvals, messages, payment receipts).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">4. Your Rights (NDPR)</h2>
          <ul className="list-disc pl-6">
            <li>Right to access your data.</li>
            <li>Right to correct inaccurate data.</li>
            <li>Right to delete your data (right to be forgotten).</li>
            <li>Right to data portability.</li>
          </ul>
          <p>
            Exercise these rights via <a className="text-primary underline" href="mailto:privacy@listng.com.ng">privacy@listng.com.ng</a> or by
            visiting your <a className="text-primary underline" href="/dashboard/settings">account settings</a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">5. Data Sharing</h2>
          <p>
            We share data only with: (a) payment processors (Paystack), (b) identity verification providers
            (Prembly/Dojah, face-api.js), (c) infrastructure providers (Neon, Vercel, Upstash, Sentry,
            Pusher, UploadThing, Resend). We do not sell your data.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">6. Data Retention</h2>
          <p>
            We retain account data while your account is active. After deletion, we remove personal data
            within 30 days, except where retention is required by law.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">7. Cookies</h2>
          <p>
            We use functional cookies (session) and analytics cookies (PostHog/Sentry). You can disable
            non-essential cookies in your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">8. Security</h2>
          <p>
            We use HTTPS, encrypted biometric storage, rate limiting, and access controls. No system is 100%
            secure; report vulnerabilities to <a className="text-primary underline" href="mailto:security@listng.com.ng">security@listng.com.ng</a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">9. Contact</h2>
          <p>
            Data Protection Officer: <a className="text-primary underline" href="mailto:dpo@listng.com.ng">dpo@listng.com.ng</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
