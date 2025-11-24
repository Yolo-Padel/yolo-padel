import { UserType } from "@/types/prisma";
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

interface InvitationProps {
  userName?: string;
  email: string;
  invitationUrl: string;
  userType: UserType;
}

export default function Invitation({
  userName,
  email,
  invitationUrl,
  userType,
}: InvitationProps) {
  return (
    <Html>
      <Head>
        <title>Invitation - Yolo Padel</title>
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
              {userType === UserType.STAFF
                ? "You have been invited to join Yolo Padel as a staff member."
                : "You have been invited to join Yolo Padel as a user."}
            </Text>

            <Text className="text-base leading-6 text-gray-700 mb-4">
              {userType === UserType.STAFF
                ? "As a staff member, you will have access to manage courts, bookings, users, and other administrative functions of the Yolo Padel system."
                : "As a user, you will have access to book courts, view your bookings, and other user functions of the Yolo Padel system."}
            </Text>

            <Section className="text-center my-8">
              <Button
                className="bg-emerald-500 rounded-lg text-white text-base font-bold no-underline text-center inline-block px-6 py-3 border-0"
                href={invitationUrl}
              >
                Accept Invitation
              </Button>
            </Section>

            <Text className="text-base leading-6 text-gray-700 mb-4">
              Or copy and paste this link into your browser:
            </Text>

            <Text className="text-sm text-gray-500 break-all mb-4">
              {invitationUrl}
            </Text>

            <Text className="text-base leading-6 text-gray-700 mb-4">
              This invitation will expire in 15 minutes. If you don't want to
              accept this invitation, you can safely ignore this email.
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
