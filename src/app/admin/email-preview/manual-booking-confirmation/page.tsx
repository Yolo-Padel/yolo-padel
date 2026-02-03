import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { render } from "@react-email/render";
import ManualBookingConfirmationEmail from "@/components/emails/manual-booking-confirmation";
import Link from "next/link";

export default async function ManualBookingConfirmationPreviewPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token");
  if (!token) redirect("/auth");

  const dummyData = {
    customerName: "John Doe",
    email: "john.doe@example.com",
    court: "Court A",
    venue: "Yolo Padel Senayan",
    date: "2026-02-05",
    startTime: "14:00",
    endTime: "16:00",
    bookingCode: "BK-MAN01",
    loginUrl: "https://app.yolo-padel.com/dashboard",
  };

  const emailHtml = await render(ManualBookingConfirmationEmail(dummyData));

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
            Manual Booking Confirmation Email Preview
          </h1>
          <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
            Sent when staff creates a booking on behalf of a customer.
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
