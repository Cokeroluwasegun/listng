import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";

interface PaymentReceiptEmailProps {
  name: string;
  packageName: string;
  amount: string;
  reference: string;
  endDate: string;
  receiptUrl: string;
}

export default function PaymentReceiptEmail({
  name,
  packageName,
  amount,
  reference,
  endDate,
  receiptUrl,
}: PaymentReceiptEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Payment received — your {packageName} subscription is active</Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto my-8 max-w-xl rounded-lg border border-gray-200 bg-white p-8">
            <Heading className="text-2xl font-bold text-gray-900">
              Payment confirmed
            </Heading>
            <Text className="mt-2 text-base text-gray-700">
              Hi {name}, your payment for <strong>{packageName}</strong> was successful.
            </Text>
            <Section className="my-6 rounded-md border border-gray-200 bg-gray-50 p-4">
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="py-1 text-gray-500">Amount</td>
                    <td className="py-1 text-right font-semibold text-gray-900">{amount}</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-gray-500">Reference</td>
                    <td className="py-1 text-right font-mono text-xs text-gray-900">{reference}</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-gray-500">Active until</td>
                    <td className="py-1 text-right font-semibold text-gray-900">{endDate}</td>
                  </tr>
                </tbody>
              </table>
            </Section>
            <Section className="my-6 text-center">
              <a
                href={receiptUrl}
                className="inline-block rounded-lg bg-orange-500 px-6 py-3 text-base font-semibold text-white no-underline"
              >
                View receipt
              </a>
            </Section>
            <Text className="text-sm text-gray-500">
              If you have any questions, reply to this email and we'll help.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
