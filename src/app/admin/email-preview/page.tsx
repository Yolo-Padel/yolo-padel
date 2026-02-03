import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";

const TEMPLATES = [
  {
    href: "/admin/email-preview/payment-instructions",
    title: "Payment Instructions",
    description:
      "Sent after order creation. Contains payment link and 15-minute deadline.",
    badge: "NEW",
    badgeStyle: { bg: "#fef3c7", color: "#92400e" },
  },
  {
    href: "/admin/email-preview/order-confirmation",
    title: "Order Confirmation",
    description:
      "Sent after payment success. Booking details and check-in instructions.",
    badge: "REDESIGNED",
    badgeStyle: { bg: "#dcfce7", color: "#166534" },
  },
  {
    href: "/admin/email-preview/booking-cancelation",
    title: "Booking Cancelation",
    description:
      "Sent when a booking is cancelled (e.g. payment not completed in time).",
    badge: null,
    badgeStyle: null,
  },
  {
    href: "/admin/email-preview/booking-reschedule",
    title: "Booking Reschedule",
    description: "Sent when a booking is rescheduled with updated details.",
    badge: null,
    badgeStyle: null,
  },
  {
    href: "/admin/email-preview/invitation",
    title: "Invitation",
    description:
      "Sent when inviting a user or staff member to join Yolo Padel.",
    badge: null,
    badgeStyle: null,
  },
  {
    href: "/admin/email-preview/login-with-magic-link",
    title: "Magic Link",
    description: "Sent when a user requests a passwordless sign-in link.",
    badge: null,
    badgeStyle: null,
  },
  {
    href: "/admin/email-preview/manual-booking-confirmation",
    title: "Manual Booking Confirmation",
    description: "Sent when staff creates a booking on behalf of a customer.",
    badge: null,
    badgeStyle: null,
  },
];

export default async function EmailPreviewIndexPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token");
  if (!token) redirect("/auth");

  return (
    <div
      style={{
        backgroundColor: "#f4f4f5",
        minHeight: "100vh",
        padding: "40px 20px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div
          style={{
            backgroundColor: "white",
            padding: "40px",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <h1
            style={{
              margin: "0 0 10px",
              fontSize: "32px",
              fontWeight: "bold",
              color: "#09090b",
            }}
          >
            Email Templates Preview
          </h1>
          <p
            style={{
              margin: "0 0 40px",
              color: "#71717a",
              fontSize: "16px",
            }}
          >
            Preview all email templates. Design aligned across templates.
          </p>

          <div style={{ display: "grid", gap: "20px" }}>
            {TEMPLATES.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                style={{
                  display: "block",
                  padding: "24px",
                  backgroundColor: "#fafafa",
                  border: "1px solid #e4e4e7",
                  borderRadius: "8px",
                  textDecoration: "none",
                  transition: "all 0.2s",
                }}
              >
                {t.badge && t.badgeStyle && (
                  <div style={{ marginBottom: "8px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 12px",
                        backgroundColor: t.badgeStyle.bg,
                        color: t.badgeStyle.color,
                        fontSize: "12px",
                        fontWeight: "600",
                        borderRadius: "4px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {t.badge}
                    </span>
                  </div>
                )}
                <h2
                  style={{
                    margin: "0 0 8px",
                    fontSize: "20px",
                    fontWeight: "600",
                    color: "#09090b",
                  }}
                >
                  {t.title}
                </h2>
                <p
                  style={{
                    margin: 0,
                    color: "#71717a",
                    fontSize: "14px",
                    lineHeight: "1.5",
                  }}
                >
                  {t.description}
                </p>
                <div
                  style={{
                    marginTop: "16px",
                    color: "#3b82f6",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  View Preview →
                </div>
              </Link>
            ))}
          </div>

          <div
            style={{
              marginTop: "40px",
              padding: "20px",
              backgroundColor: "#eff6ff",
              borderLeft: "4px solid #3b82f6",
              borderRadius: "8px",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "14px",
                color: "#1e40af",
                lineHeight: "1.6",
              }}
            >
              💡 <strong>Tip:</strong> These previews show how emails will
              appear in customer inboxes. Test on different screen sizes for
              mobile responsiveness.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
