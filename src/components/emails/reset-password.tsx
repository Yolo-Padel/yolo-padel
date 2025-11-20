import { Html, Head, Body, Text, Button, Container } from "@react-email/components";

interface ResetPasswordEmailProps {
  customerName?: string;
  email: string;
  resetUrl: string;
}

export default function ResetPasswordEmail({customerName,email,resetUrl}: ResetPasswordEmailProps) {

    return (
        <Html>
            <Head>
                <title>Reset Password</title>
            </Head>
            <Body className="bg-gray-100 font-sans">
                <Container className="max-w-2xl mx-auto bg-white">
                    <div className="text-center flex items-center justify-center bg-gray-900 text-white font-bold border-b border-gray-200 p-3 my-1">
                        <img src="/paddle-racket.png" width="40" height="40" /> 
                        <Text className="text-2xl text-white font-bold p-2">Reset Password</Text>
                    </div>
                    <Text>Hello {customerName || email},</Text>

                    <Text>You recently requested to reset the password for your account. Click the button below to proceed.</Text>
                    <Button href={resetUrl} className="bg-blue-700 text-white rounded-md font-medium hover:bg-blue-600 p-2">
                        Reset Password
                    </Button>
                    <Text>If you did not request a password reset, please ignore this email or reply to let us know. This password reset link is only valid for the next 30 minutes.</Text>
                    <Text>Thanks,</Text>
                    <Text>The Yolo Padel Team</Text>
                
    
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
                </Container>
            </Body>
        </Html>
    )
}