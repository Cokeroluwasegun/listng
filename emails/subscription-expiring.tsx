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

interface SubscriptionExpiringEmailProps {
  name: string;
  packageName: string;
  daysRemaining: number;
  renewUrl: string;
}

export default function SubscriptionExpiringEmail({
  name,
  packageName,
  daysRemaining,
  renewUrl,
}: SubscriptionExpiringEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{`Your ${packageName} subscription expires in ${daysRemaining} days`}</Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto my-8 max-w-xl rounded-lg border border-gray-200 bg-white p-8">
            <Heading className="text-2xl font-bold text-gray-900">
              Your subscription expires soon
            </Heading>
            <Text className="mt-2 text-base text-gray-700">
              Hi {name}, your <strong>{packageName}</strong> subscription expires in <strong>{daysRemaining} days</strong>.
            </Text>
            <Text className="text-base text-gray-700">
              Renew now to keep your listings visible and continue using your boost slots without interruption.
            </Text>
            <Section className="my-6 text-center">
              <a
                href={renewUrl}
                className="inline-block rounded-lg bg-orange-500 px-6 py-3 text-base font-semibold text-white no-underline"
              >
                Renew subscription
              </a>
            </Section>
            <Text className="text-sm text-gray-500">
              After expiry, your listings will be hidden and can be re-activated when you resubscribe.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
