import {
  Html,
  Head,
  Body,
  Container,
  Text,
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
  const displayName = userName || email;

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
            Sign in to Yolo Padel
          </Text>
          <Text
            style={{ fontSize: "14px", color: "#71717a", marginBottom: "24px" }}
          >
            One-click magic link
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
            You requested to sign in to your Yolo Padel account. Click the
            button below to access your account without entering a password.
          </Text>

          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <Button
              href={magicLinkUrl}
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
              Sign in to Yolo Padel
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
              {magicLinkUrl}
            </span>
          </Text>

          <div
            style={{
              backgroundColor: "#eff6ff",
              borderLeft: "4px solid #3b82f6",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "24px",
            }}
          >
            <Text
              style={{
                fontSize: "13px",
                color: "#1e40af",
                margin: 0,
                lineHeight: "20px",
              }}
            >
              🔒 This link expires in 15 minutes and can only be used once. If
              you didn&apos;t request it, ignore this email — your account
              remains secure.
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
