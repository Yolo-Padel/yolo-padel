import { Html, Head, Body, Container, Text } from "@react-email/components";

interface BookingRescheduleEmailProps {
  customerName?: string;
  court: string;
  date: Date;
  time: string;
  bookingCode: string;
  location: string;
  status: string;
}

export default function BookingRescheduleEmail({
  customerName,
  court,
  date,
  time,
  bookingCode,
  location,
  status,
}: BookingRescheduleEmailProps) {
  return (
    <Html>
      <Head>
        <title>Booking Reschedule</title>
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
              Booking Reschedule Confirmation
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
              Your booking has been successfully rescheduled. Here are your
              booking details :
            </Text>

            <ul
              style={{
                listStyleType: "none",
                padding: 1,
                fontSize: "16px",
                fontWeight: "bold",
              }}
            >
              <li> Court : {court}</li>
              <li> Date : {date.toLocaleDateString()}</li>
              <li> Time : {time}</li>
              <li> Booking Code: {bookingCode}</li>
              <li> Location : {location}</li>
              <li> Status : {status}</li>
            </ul>

            <Text className="text-base leading-6 text-gray-700 mb-4">
              If you didn't request this change, please contact our support team
              immediately at support@yolo-padel.com Otherwise, get ready to play
              — we'll see you soon!
              <br />
              Thanks for choosing Yolo Padel 💚 Team Yolo Padel
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
