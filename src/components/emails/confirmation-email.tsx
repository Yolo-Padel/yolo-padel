import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
  Button,
} from "@react-email/components";

interface ConfirmationEmailProps {
  userName: string;
  confirmationUrl: string;
}

export default function ConfirmationEmail({
  userName,
  confirmationUrl,
}: ConfirmationEmailProps) {
  return (
    <Html>
      <Head>
        <title>Konfirmasi Email Anda</title>
      </Head>
      <Body className="bg-slate-100 font-sans">
        <Container className="bg-white mx-auto py-5 pb-12 mb-16 max-w-2xl">
          {/* Header */}
          <Section className="px-6 py-8 text-center bg-gray-900">
            <Text className="text-2xl font-bold text-white m-0">
              Yolo Padel
            </Text>
          </Section>

          {/* Content */}
          <Section className="px-6 py-8">
            <Text className="text-2xl font-bold text-gray-900 mb-5">
              Halo {userName}!
            </Text>

            <Text className="text-base leading-6 text-gray-700 mb-4">
              Terima kasih telah mendaftar di Yolo Padel. Untuk menyelesaikan
              pendaftaran Anda, silakan konfirmasi alamat email Anda dengan
              mengklik tombol di bawah ini.
            </Text>

            <Section className="text-center my-8">
              <Button
                className="bg-emerald-500 rounded-lg text-white text-base font-bold no-underline text-center inline-block px-6 py-3 border-0"
                href={confirmationUrl}
              >
                Konfirmasi Email
              </Button>
            </Section>

            <Text className="text-base leading-6 text-gray-700 mb-4">
              Atau salin dan tempel link berikut ke browser Anda:
            </Text>

            <Text className="text-sm text-gray-500 break-all mb-4">
              {confirmationUrl}
            </Text>

            <Text className="text-base leading-6 text-gray-700 mb-4">
              Link konfirmasi ini akan kedaluwarsa dalam 24 jam.
            </Text>

            <Text className="text-base leading-6 text-gray-700 mb-4">
              Jika Anda tidak mendaftar untuk akun ini, Anda dapat mengabaikan
              email ini.
            </Text>

            <Text className="text-base text-gray-700 mt-8">
              Salam,
              <br />
              Tim Yolo Padel
            </Text>
          </Section>

          {/* Footer */}
          <Hr className="border-gray-200 my-5" />
          <Section className="px-6 text-center">
            <Text className="text-gray-500 text-xs leading-4 my-1">
              © 2024 Yolo Padel. All rights reserved.
            </Text>
            <Text className="text-gray-500 text-xs leading-4 my-1">
              Jika Anda tidak ingin menerima email ini lagi,{" "}
              <Link href="#" className="text-blue-600 underline">
                unsubscribe di sini
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
