# Email System dengan Resend - Panduan Penggunaan

## Overview
Sistem email ini menggunakan Resend untuk mengirim email template yang telah dikustomisasi. Sistem ini mendukung tiga jenis email utama: konfirmasi email, reset password, dan welcome email.

## Setup

### 1. Environment Variables
Pastikan file `.env.local` sudah dikonfigurasi dengan:
```env
RESEND_API_KEY=your_resend_api_key_here
FROM_EMAIL=noreply@yourdomain.com
COMPANY_NAME=Your Company Name
```

### 2. Dependencies
Dependencies yang diperlukan sudah terinstall:
- `resend` - Client untuk Resend API
- `@react-email/components` - Komponen untuk membuat email template
- `@react-email/render` - Untuk render email template ke HTML
- `zod` - Untuk validasi request

## Struktur File

```
src/
├── lib/
│   ├── resend.ts              # Konfigurasi Resend client
│   └── email-service.ts       # Service layer untuk email
├── components/emails/
│   ├── EmailLayout.tsx        # Base layout untuk semua email
│   ├── ConfirmationEmail.tsx  # Template konfirmasi email
│   ├── PasswordResetEmail.tsx # Template reset password
│   └── WelcomeEmail.tsx       # Template welcome email
└── app/api/emails/
    ├── send-confirmation/route.ts  # API endpoint konfirmasi
    ├── send-reset/route.ts         # API endpoint reset password
    ├── send-welcome/route.ts       # API endpoint welcome
    └── test/route.ts               # API endpoint untuk testing
```

## Cara Penggunaan

### 1. Menggunakan Email Service Langsung

```typescript
import { EmailService } from '@/lib/email-service';

const emailService = new EmailService();

// Kirim email konfirmasi
await emailService.sendConfirmationEmail({
  to: 'user@example.com',
  name: 'John Doe',
  confirmationUrl: 'https://yourapp.com/confirm/token123'
});

// Kirim email reset password
await emailService.sendPasswordResetEmail({
  to: 'user@example.com',
  name: 'John Doe',
  resetUrl: 'https://yourapp.com/reset/token123'
});

// Kirim email welcome
await emailService.sendWelcomeEmail({
  to: 'user@example.com',
  name: 'John Doe',
  dashboardUrl: 'https://yourapp.com/dashboard'
});
```

### 2. Menggunakan API Endpoints

#### Konfirmasi Email
```bash
POST /api/emails/send-confirmation
Content-Type: application/json

{
  "to": "user@example.com",
  "name": "John Doe",
  "confirmationUrl": "https://yourapp.com/confirm/token123"
}
```

#### Reset Password
```bash
POST /api/emails/send-reset
Content-Type: application/json

{
  "to": "user@example.com",
  "name": "John Doe",
  "resetUrl": "https://yourapp.com/reset/token123"
}
```

#### Welcome Email
```bash
POST /api/emails/send-welcome
Content-Type: application/json

{
  "to": "user@example.com",
  "name": "John Doe",
  "dashboardUrl": "https://yourapp.com/dashboard"
}
```

### 3. Testing Template (Preview)
```bash
POST /api/emails/test
Content-Type: application/json

{
  "templateType": "confirmation" | "password-reset" | "welcome"
}
```

## Testing

### Manual Testing
1. Jalankan development server: `npm run dev`
2. Buka `http://localhost:3000/test-emails`
3. Test preview template dan pengiriman email

### Integration dengan Authentication
Contoh integrasi dengan sistem autentikasi:

```typescript
// Di registration handler
import { EmailService } from '@/lib/email-service';

export async function registerUser(userData: UserData) {
  // ... logic registrasi user
  
  const emailService = new EmailService();
  await emailService.sendConfirmationEmail({
    to: userData.email,
    name: userData.name,
    confirmationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/confirm/${confirmationToken}`
  });
}

// Di forgot password handler
export async function forgotPassword(email: string) {
  // ... logic generate reset token
  
  const emailService = new EmailService();
  await emailService.sendPasswordResetEmail({
    to: email,
    name: user.name,
    resetUrl: `${process.env.NEXT_PUBLIC_APP_URL}/reset/${resetToken}`
  });
}
```

## Kustomisasi Template

### Mengubah Styling
Edit file di `src/components/emails/` untuk mengubah tampilan email:
- `EmailLayout.tsx` - Base layout dan styling global
- `ConfirmationEmail.tsx` - Template konfirmasi
- `PasswordResetEmail.tsx` - Template reset password
- `WelcomeEmail.tsx` - Template welcome

### Menambah Template Baru
1. Buat file template baru di `src/components/emails/`
2. Tambahkan method di `EmailService` class
3. Buat API endpoint baru di `src/app/api/emails/`
4. Update test page jika diperlukan

## Error Handling
Semua API endpoint sudah dilengkapi dengan:
- Validasi input menggunakan Zod
- Error handling untuk Resend API
- Response yang konsisten

## Security Notes
- Jangan commit API key ke repository
- Gunakan environment variables untuk konfigurasi
- Validasi semua input dari client
- Rate limiting direkomendasikan untuk production

## Production Checklist
- [ ] Setup domain di Resend dashboard
- [ ] Konfigurasi SPF, DKIM, DMARC records
- [ ] Setup rate limiting
- [ ] Monitor email delivery metrics
- [ ] Setup error logging dan monitoring