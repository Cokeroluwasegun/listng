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

interface MessageNotificationEmailProps {
  recipientName: string;
  senderName: string;
  messagePreview: string;
  conversationUrl: string;
}

export default function MessageNotificationEmail({
  recipientName,
  senderName,
  messagePreview,
  conversationUrl,
}: MessageNotificationEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>New message from {senderName}</Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto my-8 max-w-xl rounded-lg border border-gray-200 bg-white p-8">
            <Heading className="text-2xl font-bold text-gray-900">
              New message from {senderName}
            </Heading>
            <Text className="mt-2 text-base text-gray-700">
              Hi {recipientName}, {senderName} sent you a message:
            </Text>
            <Section className="my-6 rounded-md border-l-4 border-orange-500 bg-gray-50 p-4">
              <Text className="text-sm italic text-gray-700">
                {messagePreview.length > 200
                  ? `${messagePreview.slice(0, 200)}…`
                  : messagePreview}
              </Text>
            </Section>
            <Section className="my-6 text-center">
              <a
                href={conversationUrl}
                className="inline-block rounded-lg bg-orange-500 px-6 py-3 text-base font-semibold text-white no-underline"
              >
                Reply to {senderName}
              </a>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
