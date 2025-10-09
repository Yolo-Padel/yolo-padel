import { Html, Head, Body, Container, Section, Text, Button, Hr, Link } from '@react-email/components';

interface WelcomeEmailProps {
  userName: string;
  dashboardUrl: string;
}

export default function WelcomeEmail({
  userName,
  dashboardUrl,
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head>
        <title>Selamat Datang di Yolo Padel!</title>
      </Head>
      <Body className="bg-gray-100 font-sans">
        <Container className="max-w-2xl mx-auto bg-white p-8">
          {/* Header */}
          <Section className="text-center mb-8">
            <Text className="text-2xl font-bold text-blue-600 mb-2">YOLO PADEL</Text>
            <Text className="text-sm text-gray-500">Platform Padel Terbaik di Indonesia</Text>
          </Section>

          {/* Content */}
          <Section>
            <Text className="text-3xl font-bold text-gray-900 mb-6 text-center">Selamat Datang, {userName}! 🎾</Text>
            
            <Text className="text-base leading-6 text-gray-700 mb-4">
              Terima kasih telah bergabung dengan Yolo Padel! Kami sangat senang Anda menjadi bagian 
              dari komunitas padel terbaik di Indonesia.
            </Text>

            <Section className="bg-gray-50 p-6 rounded-lg my-6">
              <Text className="text-lg font-bold text-gray-900 mb-4">Apa yang bisa Anda lakukan:</Text>
              
              <Text className="text-base leading-6 text-gray-700 mb-3">
                🏟️ <strong>Booking Lapangan:</strong> Pesan lapangan padel favorit Anda dengan mudah
              </Text>
              
              <Text className="text-base leading-6 text-gray-700 mb-3">
                👥 <strong>Cari Partner:</strong> Temukan partner bermain yang sesuai dengan level Anda
              </Text>
              
              <Text className="text-base leading-6 text-gray-700 mb-3">
                🏆 <strong>Turnamen:</strong> Ikuti turnamen dan kompetisi yang seru
              </Text>
              
              <Text className="text-base leading-6 text-gray-700 mb-3">
                📊 <strong>Tracking Progress:</strong> Pantau perkembangan permainan Anda
              </Text>
            </Section>

            <Section className="text-center my-8">
              <Button className="bg-blue-500 rounded-lg text-white text-base font-bold no-underline text-center inline-block px-7 py-4 border-0" href={dashboardUrl}>
                Mulai Bermain Sekarang
              </Button>
            </Section>

            <Hr className="border-gray-300 my-8" />

            <Text className="text-lg font-bold text-gray-900 mb-4">Tips untuk Pemula:</Text>
            
            <Text className="text-base leading-6 text-gray-700 mb-4">
              Jika Anda baru mengenal padel, jangan khawatir! Kami punya panduan lengkap 
              dan komunitas yang ramah untuk membantu Anda memulai perjalanan padel Anda.
            </Text>

            <Text className="text-base leading-6 text-gray-700 mb-4">
              Jangan ragu untuk menghubungi tim support kami jika ada pertanyaan. 
              Kami siap membantu Anda 24/7!
            </Text>

            <Text className="text-base text-gray-700 mt-8 text-center">
              Selamat bermain!<br />
              Tim Yolo Padel 🚀
            </Text>
          </Section>

          {/* Footer */}
          <Hr className="border-gray-300 my-8" />
          <Section className="text-center">
            <Text className="text-sm text-gray-500 mb-2">
              © 2024 Yolo Padel. Semua hak dilindungi.
            </Text>
            <Text className="text-sm text-gray-500">
              <Link href="#" className="text-blue-500 no-underline">Unsubscribe</Link> | 
              <Link href="#" className="text-blue-500 no-underline ml-2">Privacy Policy</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}