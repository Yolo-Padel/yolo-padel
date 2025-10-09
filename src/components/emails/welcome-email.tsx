import { Html, Head, Body, Container, Text } from "@react-email/components";

interface WelcomeEmailProps {
  userName?: string;
  email: string;
}

export default function WelcomeEmail({ userName, email }: WelcomeEmailProps) {
  return (
    <Html>
      <Head>
        <title>Welcome to Yolo Padel!</title>
      </Head>
      <Body className="bg-gray-100 font-sans">
        <Container className="max-w-2xl mx-auto bg-white p-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Text className="text-2xl font-bold text-gray-900 mb-5">
              Halo {userName}!
            </Text>
            <Text className="text-base text-gray-700 mb-5">Email: {email}</Text>
            <div className="bg-red-500 size-10 rounded-full" />
          </div>
        </Container>
      </Body>
    </Html>
  );
}
