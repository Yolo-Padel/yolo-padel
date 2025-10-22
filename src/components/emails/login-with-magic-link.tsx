import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
  Button,
} from "@react-email/components";

interface LoginWithMagicLinkProps {
  userName?: string;
  email: string;
  magicLinkUrl: string;
}

export default function LoginWithMagicLink({
  userName,
  email,
  magicLinkUrl,
}: LoginWithMagicLinkProps) {
  return (
    <Html>
      <Head>
        <title>Login to Yolo Padel - Magic Link</title>
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
              Hello {userName || email}!
            </Text>

            <Text className="text-base leading-6 text-gray-700 mb-4">
              You requested to login to your Yolo Padel account. Click the button 
              below to securely access your account without entering a password.
            </Text>

            <Text className="text-base leading-6 text-gray-700 mb-4">
              This magic link will automatically log you in and is valid for the 
              next 15 minutes for security purposes.
            </Text>

            <Section className="text-center my-8">
              <Button
                className="bg-emerald-500 rounded-lg text-white text-base font-bold no-underline text-center inline-block px-6 py-3 border-0"
                href={magicLinkUrl}
              >
                Login to Yolo Padel
              </Button>
            </Section>

            <Text className="text-base leading-6 text-gray-700 mb-4">
              Or copy and paste this link into your browser:
            </Text>

            <Text className="text-sm text-gray-500 break-all mb-4">
              {magicLinkUrl}
            </Text>

            <Text className="text-base leading-6 text-gray-700 mb-4">
              <strong>Security Notice:</strong> This link will expire in 15 minutes 
              and can only be used once. If you didn't request this login link, 
              please ignore this email and your account remains secure.
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
              © 2024 Yolo Padel. All rights reserved.
            </Text>
            <Text className="text-gray-500 text-xs leading-4 my-1">
              If you don't want to receive these emails anymore,{" "}
              <Link href="#" className="text-blue-600 underline">
                unsubscribe here
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}