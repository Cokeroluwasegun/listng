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

interface WelcomeEmailProps {
  name: string;
  loginUrl: string;
}

export default function WelcomeEmail({ name, loginUrl }: WelcomeEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Welcome to ListNG — Nigeria's marketplace</Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto my-8 max-w-xl rounded-lg border border-gray-200 bg-white p-8">
            <Heading className="text-2xl font-bold text-gray-900">
              Welcome to ListNG, {name}!
            </Heading>
            <Text className="mt-4 text-base text-gray-700">
              Your account is ready. You can now browse listings, message sellers, and post your own items.
            </Text>
            <Section className="my-6 text-center">
              <a
                href={loginUrl}
                className="inline-block rounded-lg bg-orange-500 px-6 py-3 text-base font-semibold text-white no-underline"
              >
                Go to your dashboard
              </a>
            </Section>
            <Text className="text-sm text-gray-500">
              If you didn't create this account, you can safely ignore this email.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
