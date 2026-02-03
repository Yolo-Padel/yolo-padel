import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { render } from "@react-email/render";
import PaymentInstructionsEmail from "@/components/emails/payment-instructions";
import Link from "next/link";

export default async function PaymentInstructionsPreviewPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token");
  if (!token) redirect("/auth");

  // Dummy data for preview
  const dummyData = {
    orderCode: "ORD-ABC12",
    customerName: "John Doe",
    email: "john.doe@example.com",
    totalAmount: 450000,
    paymentUrl: "https://checkout.xendit.co/web/6579c8a1234567890abcdef",
    expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
    bookings: [
      {
        court: "Court A",
        date: "2026-02-05T00:00:00.000Z",
        time: "14:00 - 16:00",
        location: "Yolo Padel Senayan • Court A",
      },
      {
        court: "Court B",
        date: "2026-02-05T00:00:00.000Z",
        time: "16:00 - 18:00",
        location: "Yolo Padel Senayan • Court B",
      },
    ],
  };

  // Render email to HTML string
  const emailHtml = await render(PaymentInstructionsEmail(dummyData));

  return (
    <div
      style={{
        backgroundColor: "#f4f4f5",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <div
        style={{ maxWidth: "600px", margin: "0 auto", marginBottom: "20px" }}
      >
        <Link
          href="/admin/email-preview"
          style={{
            fontSize: "14px",
            color: "#3b82f6",
            marginBottom: "16px",
            display: "inline-block",
          }}
        >
          ← Back to templates
        </Link>
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <h1
            style={{ margin: "0 0 10px", fontSize: "24px", fontWeight: "bold" }}
          >
            Payment Instructions Email Preview
          </h1>
          <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
            This is how the email will look when sent to customers after order
            creation.
          </p>
        </div>
      </div>

      <iframe
        srcDoc={emailHtml}
        style={{
          width: "100%",
          minHeight: "800px",
          border: "none",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
        title="Email Preview"
      />
    </div>
  );
}
