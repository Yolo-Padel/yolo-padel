import { Html, Head, Body, Container, Text } from "@react-email/components";

function formatDate(dateInput: Date): string {
  return dateInput.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface BookingCancelationEmailProps {
  customerName?: string;
  court: string;
  date: Date;
  time: string;
  bookingCode: string;
  location: string;
  status: string;
}

export default function BookingCancelationEmail({
  customerName,
  court,
  date,
  time,
  bookingCode,
  location,
  status,
}: BookingCancelationEmailProps) {
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
          {/* Status Badge */}
          <div
            style={{
              backgroundColor: "#fef2f2",
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
                color: "#b91c1c",
                margin: 0,
              }}
            >
              Booking Cancelled
            </Text>
          </div>

          <Text
            style={{
              fontSize: "24px",
              fontWeight: 700,
              marginBottom: "4px",
              color: "#09090b",
            }}
          >
            Booking Cancellation Notice
          </Text>
          <Text
            style={{ fontSize: "14px", color: "#71717a", marginBottom: "24px" }}
          >
            Order / booking was not paid in time
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
              marginBottom: "24px",
            }}
          >
            This booking has been cancelled because payment was not completed
            within the required time. If you still need a slot, you can make a
            new booking and complete the payment before the expiry time.
          </Text>

          <Text
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "#09090b",
              marginBottom: "12px",
            }}
          >
            Cancelled Booking
          </Text>
          <div
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
              {court}
            </Text>
            <Text
              style={{
                fontSize: "13px",
                color: "#52525b",
                margin: "0 0 6px",
              }}
            >
              <strong>Booking Code:</strong> {bookingCode}
            </Text>
            <Text
              style={{
                fontSize: "13px",
                color: "#52525b",
                margin: "0 0 6px",
              }}
            >
              <strong>Location:</strong> {location}
            </Text>
            <Text
              style={{
                fontSize: "13px",
                color: "#52525b",
                margin: "0 0 6px",
              }}
            >
              <strong>Date:</strong> {formatDate(date)}
            </Text>
            <Text style={{ fontSize: "13px", color: "#52525b", margin: 0 }}>
              <strong>Time:</strong> {time} · <strong>Status:</strong>{" "}
              {status || "Expired"}
            </Text>
          </div>

          <div
            style={{
              borderTop: "1px solid #e4e4e7",
              margin: "32px 0 24px",
            }}
          />
          <Text
            style={{
              fontSize: "13px",
              color: "#71717a",
              lineHeight: "20px",
              marginBottom: "12px",
            }}
          >
            Need help? Reply to this email or contact support@yolo-padel.com
          </Text>
          <Text style={{ fontSize: "13px", color: "#a1a1aa", margin: 0 }}>
            Thanks for choosing Yolo Padel!
            <br />
            <span style={{ color: "#a1a1aa" }}>Team Yolo Padel</span>
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
