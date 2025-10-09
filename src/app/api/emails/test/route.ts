import { NextRequest, NextResponse } from "next/server";
import { render } from "@react-email/render";
import ConfirmationEmail from "@/components/emails/confirmation-email";
import WelcomeEmail from "@/components/emails/welcome-email";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const template = searchParams.get("template") || "welcome";

  try {
    let html: string;

    switch (template) {
      case "confirmation":
        html = await render(
          ConfirmationEmail({
            userName: "John Doe",
            confirmationUrl: "https://example.com/confirm/token123",
          })
        );
        break;
      case "welcome":
        html = await render(
          WelcomeEmail({
            userName: "John Doe",
            dashboardUrl: "https://example.com/dashboard",
          })
        );
        break;
      default:
        return NextResponse.json(
          { error: "Invalid template type. Use: confirmation, welcome" },
          { status: 400 }
        );
    }

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error("Error rendering email template:", error);
    return NextResponse.json(
      { error: "Failed to render email template" },
      { status: 500 }
    );
  }
}
