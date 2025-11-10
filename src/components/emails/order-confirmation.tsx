import { Html, Head, Body, Container, Text } from "@react-email/components";

interface Booking {
  court: string;
  date: Date;
  time: string;
  bookingId: string;
  location: string;
}

interface OrderConfirmationEmailProps {
  orderId: string;
  customerName?: string;
  bookings: Booking[];
}

export default function OrderConfirmationEmail({
  orderId,
  customerName,
  bookings,
}: OrderConfirmationEmailProps) {
  return (
    <Html>
      <Head>
        <title>Order Confirmation</title>
      </Head>
      <Body className="bg-gray-100 font-sans">
        <Container className="max-w-2xl mx-auto bg-white ">
          <div className="text-center flex items-center justify-center bg-gray-900 text-white font-bold border-b border-gray-200 p-3 my-1">
            <img
              src="\paddle-racket.png"
              width="40"
              height="40"
              style={{ margin: "0" }}
            />
            <Text className="p-2 text-2xl font-bold text-white">
              Order Confirmation
            </Text>
          </div>
          {/* Header */}
          <div className="flex items-center justify-between">
            <Text className="text-2xl font-bold text-gray-900 mb-5">
              Halo {customerName}!
            </Text>
          </div>

          {/* Content */}
          <div className="flex flex-col items-left justify-center">
            <Text className="text-base leading-6 text-gray-700 mb-1">
              Your padel court booking is confirmed! Here are your booking
              details :
            </Text>

            <Text
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                marginBottom: "10px",
              }}
            >
              Order ID : {orderId}
            </Text>

            {bookings.map((booking, index) => (
              <div
                key={index}
                style={{
                  marginBottom: "20px",
                  padding: "15px",
                  backgroundColor: "#f9fafb",
                  borderRadius: "8px",
                }}
              >
                <ul
                  style={{
                    listStyleType: "none",
                    padding: 0,
                    fontSize: "16px",
                    fontWeight: "bold",
                  }}
                >
                  <li> Court : {booking.court}</li>
                  <li> Date : {booking.date.toLocaleDateString()}</li>
                  <li> Time : {booking.time}</li>
                  <li> Booking ID: {booking.bookingId}</li>
                  <li> Location : {booking.location}</li>
                </ul>
              </div>
            ))}

            <Text className="text-base leading-6 text-gray-700 mb-4">
              Please arrive 10 minutes before your session for check-in.
              <br />
              Thanks for choosing Yolo Padel — can't wait to see you on court!
              <br />
              Team Yolo Padel
            </Text>

            <div
              style={{
                borderTop: "1px solid #e5e7eb",
                paddingTop: "20px",
                marginTop: "20px",
                textAlign: "center",
              }}
            >
              <Text className="text-sm text-gray-600">
                Need help? Contact us at support@yolo-padel.com
              </Text>

              <div style={{ margin: "15px 0" }}>
                {/* Social Media Icons */}
                <a
                  href="https://instagram.com/yolo-padel"
                  style={{ margin: "0 8px" }}
                >
                  Instagram
                </a>
                <a
                  href="https://facebook.com/yolo-padel"
                  style={{ margin: "0 8px" }}
                >
                  Facebook
                </a>
                <a
                  href="https://twitter.com/yolo-padel"
                  style={{ margin: "0 8px" }}
                >
                  Twitter
                </a>
              </div>

              <Text className="text-xs text-gray-500">
                © 2023 Yolo Padel. All rights reserved.
              </Text>
            </div>
          </div>
        </Container>
      </Body>
    </Html>
  );
}

