import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { render } from "@react-email/render";
import BookingRescheduleEmail from "@/components/emails/booking-reschedule";
import Link from "next/link";

export default async function BookingReschedulePreviewPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token");
  if (!token) redirect("/auth");

  const dummyData = {
    customerName: "John Doe",
    court: "Court A",
    date: new Date("2026-02-08"),
    time: "16:00 - 18:00",
    bookingCode: "BK-XYZ01",
    location: "Yolo Padel Senayan • Court A",
    status: "Confirmed",
  };

  const emailHtml = await render(BookingRescheduleEmail(dummyData));

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
            Booking Reschedule Email Preview
          </h1>
          <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
            Sent when a booking is rescheduled with updated details.
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
