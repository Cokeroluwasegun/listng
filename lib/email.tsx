import { Resend } from "resend";
import { render } from "@react-email/render";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM_EMAIL ?? "ListNG <noreply@listng.com.ng>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string;
  subject: string;
  react: React.ReactElement;
}): Promise<{ success: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set, skipping email send:", subject);
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  const html = render(react, { pretty: true });
  const text = render(react, { plainText: true });

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error("[email] Resend error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[email] Unexpected error:", message);
    return { success: false, error: message };
  }
}

export async function sendWelcomeEmail(name: string, email: string) {
  const WelcomeEmail = (await import("./emails/welcome")).default;
  return sendEmail({
    to: email,
    subject: "Welcome to ListNG",
    react: (
      <WelcomeEmail
        name={name}
        loginUrl={`${APP_URL}/dashboard`}
      />
    ),
  });
}

export async function sendPaymentReceiptEmail(
  name: string,
  email: string,
  data: {
    packageName: string;
    amount: string;
    reference: string;
    endDate: string;
  }
) {
  const PaymentReceiptEmail = (await import("./emails/payment-receipt")).default;
  return sendEmail({
    to: email,
    subject: `Payment confirmed — ${data.packageName}`,
    react: (
      <PaymentReceiptEmail
        name={name}
        receiptUrl={`${APP_URL}/dashboard`}
        {...data}
      />
    ),
  });
}

export async function sendListingApprovedEmail(
  name: string,
  email: string,
  data: { listingTitle: string; listingUrl: string }
) {
  const ListingApprovedEmail = (await import("./emails/listing-approved")).default;
  return sendEmail({
    to: email,
    subject: "Your listing is live!",
    react: <ListingApprovedEmail name={name} {...data} />,
  });
}

export async function sendListingRejectedEmail(
  name: string,
  email: string,
  data: { listingTitle: string; reason: string; supportUrl: string }
) {
  const ListingRejectedEmail = (await import("./emails/listing-rejected")).default;
  return sendEmail({
    to: email,
    subject: "Action needed — your listing needs changes",
    react: <ListingRejectedEmail name={name} {...data} />,
  });
}

export async function sendSubscriptionExpiringEmail(
  name: string,
  email: string,
  data: { packageName: string; daysRemaining: number; renewUrl: string }
) {
  const SubscriptionExpiringEmail = (await import("./emails/subscription-expiring")).default;
  return sendEmail({
    to: email,
    subject: `Your ${data.packageName} expires in ${data.daysRemaining} days`,
    react: <SubscriptionExpiringEmail name={name} {...data} />,
  });
}

export async function sendMessageNotificationEmail(
  recipientName: string,
  recipientEmail: string,
  data: { senderName: string; messagePreview: string; conversationUrl: string }
) {
  const MessageNotificationEmail = (await import("./emails/message-notification")).default;
  return sendEmail({
    to: recipientEmail,
    subject: `New message from ${data.senderName}`,
    react: <MessageNotificationEmail recipientName={recipientName} {...data} />,
  });
}
