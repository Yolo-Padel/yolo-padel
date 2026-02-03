import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Button,
} from "@react-email/components";

function formatDate(dateInput: string): string {
  const date = new Date(dateInput);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(time: string): string {
  if (time === "24:00") return "12:00 AM";
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const normalizedHour = hours % 12 || 12;
  return `${normalizedHour.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")} ${period}`;
}

export interface ManualBookingConfirmationEmailProps {
  customerName?: string | null;
  email: string;
  court: string;
  venue: string;
  date: string;
  startTime: string;
  endTime: string;
  bookingCode: string;
  loginUrl: string;
}

export default function ManualBookingConfirmationEmail({
  customerName,
  email,
  court,
  venue,
  date,
  startTime,
  endTime,
  bookingCode,
  loginUrl,
}: ManualBookingConfirmationEmailProps) {
  const displayName = customerName || email;
  const timeRange = `${formatTime(startTime)} – ${formatTime(endTime)}`;

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
            Booking Confirmation
          </Text>
          <Text
            style={{ fontSize: "14px", color: "#71717a", marginBottom: "24px" }}
          >
            Booking Code: <strong>{bookingCode}</strong>
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
            Your manual booking has been confirmed. Here are the details:
          </Text>

          <div
            style={{
              backgroundColor: "#f9fafb",
              borderRadius: "12px",
              padding: "16px 20px",
              marginBottom: "24px",
              border: "1px solid #e4e4e7",
            }}
          >
            <Text
              style={{ fontSize: "14px", color: "#09090b", margin: "0 0 8px" }}
            >
              <strong>Court</strong>: {court}
            </Text>
            <Text
              style={{ fontSize: "14px", color: "#09090b", margin: "0 0 8px" }}
            >
              <strong>Venue</strong>: {venue}
            </Text>
            <Text
              style={{ fontSize: "14px", color: "#09090b", margin: "0 0 8px" }}
            >
              <strong>Date</strong>: {formatDate(date)}
            </Text>
            <Text style={{ fontSize: "14px", color: "#09090b", margin: 0 }}>
              <strong>Time</strong>: {timeRange}
            </Text>
          </div>

          <Text
            style={{
              fontSize: "14px",
              color: "#3f3f46",
              lineHeight: "22px",
              marginBottom: "16px",
            }}
          >
            If you have never logged into Yolo Padel, you can sign in anytime
            using your email <strong>{email}</strong>. Simply visit the link
            below:
          </Text>

          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <Button
              href={loginUrl}
              style={{
                backgroundColor: "#111827",
                color: "#ffffff",
                padding: "12px 24px",
                borderRadius: "8px",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              Go to Login
            </Button>
          </div>

          <Text
            style={{
              fontSize: "13px",
              color: "#71717a",
              lineHeight: "20px",
              marginBottom: "12px",
            }}
          >
            Need help or want to update your booking? Just reply to this email
            and our team will assist you shortly.
          </Text>

          <Text style={{ fontSize: "13px", color: "#a1a1aa", margin: 0 }}>
            Cheers,
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
