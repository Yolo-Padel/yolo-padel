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
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function getMinutesRemaining(expiresAt: Date): number {
  const now = new Date();
  const diff = expiresAt.getTime() - now.getTime();
  return Math.max(0, Math.floor(diff / 60000));
}

export interface PaymentInstructionsEmailProps {
  orderCode: string;
  customerName: string;
  email: string;
  totalAmount: number;
  paymentUrl: string;
  expiresAt: Date;
  bookings: Array<{
    court: string;
    date: string;
    time: string;
    location: string;
  }>;
}

export default function PaymentInstructionsEmail({
  orderCode,
  customerName,
  email,
  totalAmount,
  paymentUrl,
  expiresAt,
  bookings,
}: PaymentInstructionsEmailProps) {
  const minutesRemaining = getMinutesRemaining(expiresAt);

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
          {/* Header */}
          <Text
            style={{
              fontSize: "24px",
              fontWeight: 700,
              marginBottom: "4px",
              color: "#09090b",
            }}
          >
            Complete Your Payment
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
            Hi {customerName},
          </Text>
          <Text
            style={{
              fontSize: "14px",
              color: "#3f3f46",
              lineHeight: "22px",
              marginBottom: "20px",
            }}
          >
            Your booking has been reserved! Complete your payment within{" "}
            <strong>{minutesRemaining} minutes</strong> to confirm your
            reservation.
          </Text>

          {/* Payment Deadline Warning */}
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
              ⏰ <strong>Payment Deadline:</strong> Your reservation will be
              automatically cancelled if payment is not completed within 15
              minutes.
            </Text>
          </div>

          {/* Payment Amount */}
          <div
            style={{
              backgroundColor: "#f9fafb",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "24px",
              border: "1px solid #e4e4e7",
              textAlign: "center",
            }}
          >
            <Text
              style={{
                fontSize: "14px",
                color: "#71717a",
                margin: "0 0 8px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Total Amount
            </Text>
            <Text
              style={{
                fontSize: "32px",
                fontWeight: 700,
                color: "#09090b",
                margin: 0,
              }}
            >
              {formatCurrency(totalAmount)}
            </Text>
          </div>

          {/* CTA Button */}
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <Button
              href={paymentUrl}
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
              Complete Payment Now
            </Button>
          </div>

          {/* Booking Summary */}
          <Text
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "#09090b",
              marginBottom: "12px",
            }}
          >
            Booking Summary
          </Text>

          {bookings.map((booking, index) => (
            <div
              key={index}
              style={{
                backgroundColor: "#fafafa",
                borderRadius: "8px",
                padding: "12px 16px",
                marginBottom: "8px",
                border: "1px solid #e4e4e7",
              }}
            >
              <Text
                style={{
                  fontSize: "13px",
                  color: "#09090b",
                  margin: "0 0 4px",
                  fontWeight: 600,
                }}
              >
                {booking.court}
              </Text>
              <Text
                style={{
                  fontSize: "12px",
                  color: "#71717a",
                  margin: "0 0 2px",
                }}
              >
                📍 {booking.location}
              </Text>
              <Text
                style={{
                  fontSize: "12px",
                  color: "#71717a",
                  margin: "0 0 2px",
                }}
              >
                📅 {formatDate(booking.date)}
              </Text>
              <Text style={{ fontSize: "12px", color: "#71717a", margin: 0 }}>
                🕐 {booking.time}
              </Text>
            </div>
          ))}

          {/* Divider */}
          <div
            style={{
              borderTop: "1px solid #e4e4e7",
              margin: "32px 0 24px",
            }}
          />

          <Text style={{ fontSize: "13px", color: "#a1a1aa", margin: 0 }}>
            Cheers,
            <br />
            Yolo Padel Team
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
            This is an automated email. Please do not reply directly to this
            message.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
