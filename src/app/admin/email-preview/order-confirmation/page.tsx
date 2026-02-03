import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { render } from "@react-email/render";
import OrderConfirmationEmail from "@/components/emails/order-confirmation";
import Link from "next/link";

export default async function OrderConfirmationPreviewPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token");
  if (!token) redirect("/auth");

  // Dummy data for preview
  const dummyData = {
    orderCode: "ORD-ABC12",
    customerName: "John Doe",
    bookings: [
      {
        court: "Court A",
        date: new Date("2026-02-05T00:00:00.000Z"),
        time: "14:00 - 16:00",
        bookingCode: "BK-XYZ01",
        location: "Yolo Padel Senayan • Court A",
      },
      {
        court: "Court B",
        date: new Date("2026-02-05T00:00:00.000Z"),
        time: "16:00 - 18:00",
        bookingCode: "BK-XYZ02",
        location: "Yolo Padel Senayan • Court B",
      },
    ],
  };

  // Render email to HTML string
  const emailHtml = await render(OrderConfirmationEmail(dummyData));

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
            Order Confirmation Email Preview
          </h1>
          <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
            This is how the email will look when sent to customers after payment
            success.
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
