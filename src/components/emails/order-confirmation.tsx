import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Button,
} from "@react-email/components";

function formatDate(dateInput: Date): string {
  return dateInput.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface Booking {
  court: string;
  date: Date;
  time: string;
  bookingCode: string;
  location: string;
}

interface OrderConfirmationEmailProps {
  orderCode: string;
  customerName?: string;
  bookings: Booking[];
}

export default function OrderConfirmationEmail({
  orderCode,
  customerName,
  bookings,
}: OrderConfirmationEmailProps) {
  const displayName = customerName || "Padeler";

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
          {/* Success Badge */}
          <div
            style={{
              backgroundColor: "#dcfce7",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "24px",
              textAlign: "center",
            }}
          >
            <Text
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#166534",
                margin: 0,
              }}
            >
              ✅ Payment Successful
            </Text>
          </div>

          {/* Header */}
          <Text
            style={{
              fontSize: "24px",
              fontWeight: 700,
              marginBottom: "4px",
              color: "#09090b",
            }}
          >
            See You on the Court!
          </Text>
          <Text
            style={{ fontSize: "14px", color: "#71717a", marginBottom: "24px" }}
          >
            Order Code: <strong>{orderCode}</strong>
          </Text>

          {/* Greeting */}
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
              marginBottom: "24px",
            }}
          >
            Your payment has been confirmed and your booking is all set! Here
            are your confirmed reservations:
          </Text>

          {/* Booking Cards */}
          <Text
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "#09090b",
              marginBottom: "12px",
            }}
          >
            Your Bookings
          </Text>

          {bookings.map((booking, index) => (
            <div
              key={index}
              style={{
                backgroundColor: "#f9fafb",
                borderRadius: "12px",
                padding: "16px 20px",
                marginBottom: "12px",
                border: "1px solid #e4e4e7",
              }}
            >
              <Text
                style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "#09090b",
                  margin: "0 0 12px",
                }}
              >
                {booking.court}
              </Text>
              <Text
                style={{
                  fontSize: "13px",
                  color: "#52525b",
                  margin: "0 0 6px",
                }}
              >
                <strong>Booking Code:</strong> {booking.bookingCode}
              </Text>
              <Text
                style={{
                  fontSize: "13px",
                  color: "#52525b",
                  margin: "0 0 6px",
                }}
              >
                <strong>Location:</strong> {booking.location}
              </Text>
              <Text
                style={{
                  fontSize: "13px",
                  color: "#52525b",
                  margin: "0 0 6px",
                }}
              >
                <strong>Date:</strong> {formatDate(booking.date)}
              </Text>
              <Text style={{ fontSize: "13px", color: "#52525b", margin: 0 }}>
                <strong>Time:</strong> {booking.time}
              </Text>
            </div>
          ))}

          {/* Important Info */}
          <div
            style={{
              backgroundColor: "#eff6ff",
              borderLeft: "4px solid #3b82f6",
              borderRadius: "8px",
              padding: "12px 16px",
              marginTop: "24px",
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
              📋 <strong>Important:</strong> Please arrive 10 minutes before
              your session for check-in. Bring your booking code for a smooth
              entry.
            </Text>
          </div>

          {/* Divider */}
          <div
            style={{
              borderTop: "1px solid #e4e4e7",
              margin: "32px 0 24px",
            }}
          />

          {/* Footer */}
          <Text
            style={{
              fontSize: "13px",
              color: "#71717a",
              lineHeight: "20px",
              marginBottom: "12px",
            }}
          >
            Need to reschedule or have questions? Reply to this email and our
            team will help you out.
          </Text>

          <Text style={{ fontSize: "13px", color: "#3f3f46", margin: 0 }}>
            Thanks for choosing Yolo Padel!
            <br />
            <span style={{ color: "#a1a1aa" }}>Team Yolo Padel</span>
          </Text>
        </Container>

        {/* Email Footer */}
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
