import { UserType } from "@/types/prisma";
import {
  Html,
  Head,
  Body,
  Container,
  Text,
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
  const displayName = userName || email;

  const roleLabel =
    userType === UserType.ADMIN
      ? "admin"
      : userType === UserType.STAFF
        ? "staff member"
        : "user";

  const roleDescription =
    userType === UserType.ADMIN
      ? "manage venues, courts, bookings, users, and full platform settings."
      : userType === UserType.STAFF
        ? "manage courts, bookings, users, and other administrative functions."
        : "book courts, view your bookings, and use other user features.";

  return (
    <Html>
      <Head />
      <Body
        style={{
          margin: 0,
          backgroundColor: "#f4f4f5",
          fontFamily: "Helvetica, Arial, sans-serif",
        }}
      >
        <Container
          style={{
            margin: "24px auto",
            padding: "32px",
            backgroundColor: "#ffffff",
            maxWidth: "520px",
            borderRadius: "16px",
            border: "1px solid #e4e4e7",
          }}
        >
          <Text
            style={{
              fontSize: "24px",
              fontWeight: 700,
              marginBottom: "4px",
              color: "#09090b",
            }}
          >
            You&apos;re Invited to Yolo Padel
          </Text>
          <Text
            style={{ fontSize: "14px", color: "#71717a", marginBottom: "24px" }}
          >
            Join as a {roleLabel}
          </Text>

          <Text
            style={{ fontSize: "16px", color: "#18181b", marginBottom: "16px" }}
          >
            Hi {displayName},
          </Text>
          <Text
            style={{
              fontSize: "14px",
              color: "#3f3f46",
              lineHeight: "22px",
              marginBottom: "20px",
            }}
          >
            You have been invited to join Yolo Padel as a {roleLabel}. As a{" "}
            {roleLabel}, you will have access to {roleDescription}
          </Text>

          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <Button
              href={invitationUrl}
              style={{
                backgroundColor: "#111827",
                color: "#ffffff",
                padding: "14px 32px",
                borderRadius: "8px",
                textDecoration: "none",
                fontSize: "15px",
                fontWeight: 600,
                display: "inline-block",
              }}
            >
              Accept Invitation
            </Button>
          </div>

          <Text
            style={{
              fontSize: "13px",
              color: "#71717a",
              lineHeight: "20px",
              marginBottom: "24px",
            }}
          >
            Or copy and paste this link into your browser:
            <br />
            <span style={{ wordBreak: "break-all", color: "#3b82f6" }}>
              {invitationUrl}
            </span>
          </Text>

          <div
            style={{
              backgroundColor: "#fef3c7",
              borderLeft: "4px solid #f59e0b",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "24px",
            }}
          >
            <Text
              style={{
                fontSize: "13px",
                color: "#92400e",
                margin: 0,
                lineHeight: "20px",
              }}
            >
              ⏰ This invitation expires in 15 minutes. If you don&apos;t want
              to accept, you can safely ignore this email.
            </Text>
          </div>

          <div
            style={{
              borderTop: "1px solid #e4e4e7",
              margin: "32px 0 24px",
            }}
          />
          <Text style={{ fontSize: "13px", color: "#a1a1aa", margin: 0 }}>
            Best regards,
            <br />
            Yolo Padel Team
          </Text>
        </Container>
        <Container
          style={{
            maxWidth: "520px",
            margin: "0 auto",
            padding: "16px 32px",
          }}
        >
          <Text
            style={{
              fontSize: "12px",
              color: "#a1a1aa",
              textAlign: "center",
              margin: 0,
            }}
          >
            © {new Date().getFullYear()} Yolo Padel. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
