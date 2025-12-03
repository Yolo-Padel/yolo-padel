import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Button,
} from "@react-email/components";

interface ConfirmationEmailProps {
  userName: string;
  confirmationUrl: string;
}

export default function ConfirmationEmail({
  userName,
  confirmationUrl,
}: ConfirmationEmailProps) {
  return (
    <Html>
      <Head>
        <title>Confirm Your Email</title>
      </Head>
      <Body className="bg-slate-100 font-sans">
        <Container className="bg-white mx-auto py-5 pb-12 mb-16 max-w-2xl">
          {/* Header */}
          <Section className="px-6 py-8 text-center bg-gray-900">
            <Text className="text-2xl font-bold text-white m-0">
              Yolo Padel
            </Text>
          </Section>

          {/* Content */}
          <Section className="px-6 py-8">
            <Text className="text-2xl font-bold text-gray-900 mb-5">
              Hello {userName}!
            </Text>

            <Text className="text-base leading-6 text-gray-700 mb-4">
              Thank you for registering at Yolo Padel. To complete your
              registration, please confirm your email address by clicking the
              button below.
            </Text>

            <Section className="text-center my-8">
              <Button
                className="bg-emerald-500 rounded-lg text-white text-base font-bold no-underline text-center inline-block px-6 py-3 border-0"
                href={confirmationUrl}
              >
                Confirm Email
              </Button>
            </Section>

            <Text className="text-base leading-6 text-gray-700 mb-4">
              Or copy and paste the following link into your browser:
            </Text>

            <Text className="text-sm text-gray-500 break-all mb-4">
              {confirmationUrl}
            </Text>

            <Text className="text-base leading-6 text-gray-700 mb-4">
              This confirmation link will expire in 24 hours.
            </Text>

            <Text className="text-base leading-6 text-gray-700 mb-4">
              If you did not register for this account, you can ignore this
              email.
            </Text>

            <Text className="text-base text-gray-700 mt-8">
              Best regards,
              <br />
              Yolo Padel Team
            </Text>
          </Section>

          {/* Footer */}
          <Hr className="border-gray-200 my-5" />
          <Section className="px-6 text-center">
            <Text className="text-gray-500 text-xs leading-4 my-1">
              © 2025 Yolo Padel. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
