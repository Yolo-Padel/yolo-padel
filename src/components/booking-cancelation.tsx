import { Html, Head, Body, Container, Text } from "@react-email/components";

interface BookingCancelationEmailProps {
  customerName?: string;
  email: string;
  court: string;
  date: Date;
  time: string;
  player: number;
  location: string;
  status: string;
}

export default function BookingCancelationEmail({ customerName, email, court, date, time, player, location, status }: BookingCancelationEmailProps) {
  return (
    <Html>
      <Head>
        <title>Booking Cancelation</title>
      </Head>
      <Body className="bg-gray-100 font-sans">
        <Container className="max-w-2xl mx-auto bg-white ">
          <div className="text-center flex items-center justify-center bg-gray-900 text-white font-bold border-b border-gray-200 p-3 my-1">
          <img src="\paddle-racket.png" width="40" height="40" style={{ margin: '0' }} />
          <Text className="p-2 text-2xl font-bold text-white">
            Booking Cancelation
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
              We’ve processed your booking cancellation. Here are your booking details :
            </Text>
            
            <ul style={{ listStyleType: 'none', padding: 1, fontSize: '16px', fontWeight: 'bold' }}>
              <li> Court     : {court}</li>
              <li> Date      : {date.toLocaleDateString()}</li>
              <li> Time      : {time}</li>
              <li> Players   : {player}</li>
              <li> Location  : {location}</li>
              <li> Location  : {status}</li>
            </ul>
            
            <Text className="text-base leading-6 text-gray-700 mb-4">
              We’re sorry to see you cancel — but we hope to have you back on court soon!
              If you cancelled by mistake, you can make a new booking anytime
              <br/>
              Thanks for choosing Yolo Padel 💚
              Team Yolo Padel
            </Text>

            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px', marginTop: '20px', textAlign: 'center' }}>
            <Text className="text-sm text-gray-600">
              Need help? Contact us at support@yolo-padel.com
            </Text>

            <div style={{ margin: '15px 0' }}>
                {/* Social Media Icons */}
                <a href="https://instagram.com/yolo-padel" style={{ margin: '0 8px' }}>Instagram</a>
                <a href="https://facebook.com/yolo-padel" style={{ margin: '0 8px' }}>Facebook</a>
                <a href="https://twitter.com/yolo-padel" style={{ margin: '0 8px' }}>Twitter</a>
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
