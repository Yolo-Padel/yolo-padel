import { render } from "@react-email/render";
import { resend, EMAIL_CONFIG } from "./resend";
import ConfirmationEmail from "@/components/emails/confirmation-email";
import WelcomeEmail from "@/components/emails/welcome-email";

// Types
export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface ConfirmationEmailData {
  to: string;
  userName: string;
  confirmationUrl: string;
}

export interface PasswordResetEmailData {
  to: string;
  userName: string;
  resetUrl: string;
}

export interface WelcomeEmailData {
  to: string;
  userName: string;
  dashboardUrl: string;
}

// Email Service Class
class EmailService {
  private async sendEmail(
    to: string,
    subject: string,
    html: string
  ): Promise<EmailResponse> {
    try {
      const { data, error } = await resend.emails.send({
        from: EMAIL_CONFIG.FROM_EMAIL,
        to: [to],
        subject,
        html,
      });

      if (error) {
        console.error("Email sending error:", error);
        return {
          success: false,
          error: error.message || "Failed to send email",
        };
      }

      return {
        success: true,
        messageId: data?.id,
      };
    } catch (error) {
      console.error("Email service error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async sendConfirmationEmail({
    to,
    userName,
    confirmationUrl,
  }: ConfirmationEmailData): Promise<EmailResponse> {
    try {
      const emailHtml = await render(
        ConfirmationEmail({
          userName,
          confirmationUrl,
        })
      );

      return await this.sendEmail(
        to,
        "Konfirmasi Email Anda - Yolo Padel",
        emailHtml
      );
    } catch (error) {
      console.error("Error rendering confirmation email:", error);
      return {
        success: false,
        error: "Failed to render confirmation email",
      };
    }
  }

  async sendWelcomeEmail({
    to,
    userName,
    dashboardUrl,
  }: WelcomeEmailData): Promise<EmailResponse> {
    try {
      const emailHtml = await render(
        WelcomeEmail({
          userName,
          dashboardUrl,
        })
      );

      return await this.sendEmail(
        to,
        "Selamat Datang di Yolo Padel! 🎾",
        emailHtml
      );
    } catch (error) {
      console.error("Error rendering welcome email:", error);
      return {
        success: false,
        error: "Failed to render welcome email",
      };
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();

// Export individual functions for convenience
export const sendConfirmationEmail = (data: ConfirmationEmailData) =>
  emailService.sendConfirmationEmail(data);

export const sendWelcomeEmail = (data: WelcomeEmailData) =>
  emailService.sendWelcomeEmail(data);
