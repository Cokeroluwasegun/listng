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

interface ListingApprovedEmailProps {
  name: string;
  listingTitle: string;
  listingUrl: string;
}

export default function ListingApprovedEmail({
  name,
  listingTitle,
  listingUrl,
}: ListingApprovedEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Your listing is live</Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto my-8 max-w-xl rounded-lg border border-gray-200 bg-white p-8">
            <Heading className="text-2xl font-bold text-gray-900">
              Your listing is live!
            </Heading>
            <Text className="mt-2 text-base text-gray-700">
              Hi {name}, your listing <strong>{listingTitle}</strong> has been approved and is now visible to buyers.
            </Text>
            <Section className="my-6 text-center">
              <a
                href={listingUrl}
                className="inline-block rounded-lg bg-orange-500 px-6 py-3 text-base font-semibold text-white no-underline"
              >
                View listing
              </a>
            </Section>
            <Text className="text-sm text-gray-500">
              Tip: Listings with clear photos and detailed descriptions get 3x more views.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
