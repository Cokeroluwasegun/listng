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

interface ListingRejectedEmailProps {
  name: string;
  listingTitle: string;
  reason: string;
  supportUrl: string;
}

export default function ListingRejectedEmail({
  name,
  listingTitle,
  reason,
  supportUrl,
}: ListingRejectedEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Action needed on your listing</Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto my-8 max-w-xl rounded-lg border border-gray-200 bg-white p-8">
            <Heading className="text-2xl font-bold text-gray-900">
              Your listing needs changes
            </Heading>
            <Text className="mt-2 text-base text-gray-700">
              Hi {name}, we couldn't approve <strong>{listingTitle}</strong> for the following reason:
            </Text>
            <Section className="my-6 rounded-md border border-red-200 bg-red-50 p-4">
              <Text className="text-sm text-red-700">{reason}</Text>
            </Section>
            <Text className="text-base text-gray-700">
              Update your listing and resubmit — most issues are fixed in under a minute.
            </Text>
            <Section className="my-6 text-center">
              <a
                href={supportUrl}
                className="inline-block rounded-lg bg-orange-500 px-6 py-3 text-base font-semibold text-white no-underline"
              >
                Contact support
              </a>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
