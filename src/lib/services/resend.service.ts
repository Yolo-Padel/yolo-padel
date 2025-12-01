import ResetPasswordEmail from "@/components/emails/reset-password";
import { EMAIL_CONFIG, resend } from "../resend";
import Invitation from "@/components/emails/invitation";
import ConfirmationEmail from "@/components/emails/confirmation-email";
import BookingRescheduleEmail from "@/components/emails/booking-reschedule";
import BookingCancelationEmail from "@/components/emails/booking-cancelation";
import OrderConfirmationEmail from "@/components/emails/order-confirmation";
import ManualBookingConfirmationEmail from "@/components/emails/manual-booking-confirmation";
import type {
  InvitationEmailData,
  ResetPasswordEmailData,
  ConfirmationEmailData,
  BookingRescheduleEmailData,
  BookingCancelationEmailData,
  OrderConfirmationEmailData,
  ManualBookingConfirmationEmailData,
} from "../validations/send-email.validation";
import { LoginWithMagicLinkData } from "../validations/auth.validation";
import LoginWithMagicLink from "@/components/emails/login-with-magic-link";

export const resendService = {
  sendInvitationEmail: async (data: InvitationEmailData) => {
    try {
      const response = await resend.emails.send({
        from: EMAIL_CONFIG.FROM_EMAIL,
        to: data.email,
        subject: "Invitation",
        react: Invitation({
          userName: data.userName,
          email: data.email,
          invitationUrl: data.invitationUrl,
          userType: data.userType,
        }),
      });

      if (response.error) {
        return {
          success: false,
          data: null,
          message: response.error.message,
        };
      }

      return {
        success: true,
        data: response,
        message: "Invitation email sent successfully",
      };
    } catch (error) {
      console.error("Send invitation email error:", error);
      return {
        success: false,
        data: null,
        message:
          error instanceof Error
            ? error.message
            : "Send admin invitation email error",
      };
    }
  },
  /**
   * Deprecated: Use sendMagicLinkEmail instead
   * @param data ResetPasswordEmailData
   */
  sendResetPasswordEmail: async (data: ResetPasswordEmailData) => {
    try {
      const response = await resend.emails.send({
        from: EMAIL_CONFIG.FROM_EMAIL,
        to: data.email,
        subject: "Forgot Password",
        react: ResetPasswordEmail({
          customerName: data.customerName,
          email: data.email,
          resetUrl: data.resetUrl,
        }),
      });

      if (response.error) {
        return {
          success: false,
          data: null,
          message: response.error.message,
        };
      }

      return {
        success: true,
        data: response,
        message: "Forgot password email sent successfully",
      };
    } catch (error) {
      console.error("Send forgot password email error:", error);

      return {
        success: false,
        data: null,
        message:
          error instanceof Error
            ? error.message
            : "Send forgot password email error",
      };
    }
  },
  /**
   * Deprecated: Use sendMagicLinkEmail instead
   * @param data ConfirmationEmailData
   */
  sendConfirmationEmail: async (data: ConfirmationEmailData) => {
    try {
      const response = await resend.emails.send({
        from: EMAIL_CONFIG.FROM_EMAIL,
        to: data.email,
        subject: "Confirmation Email",
        react: ConfirmationEmail({
          userName: data.userName,
          confirmationUrl: data.confirmationUrl,
        }),
      });

      if (response.error) {
        return {
          success: false,
          data: null,
          message: response.error.message,
        };
      }

      return {
        success: true,
        data: response,
        message: "Confirmation email sent successfully",
      };
    } catch (error) {
      console.error("Send confirmation email error:", error);
      return {
        success: false,
        data: null,
        message:
          error instanceof Error
            ? error.message
            : "Send confirmation email error",
      };
    }
  },
  sendBookingRescheduleEmail: async (data: BookingRescheduleEmailData) => {
    try {
      const response = await resend.emails.send({
        from: EMAIL_CONFIG.FROM_EMAIL,
        to: data.email,
        subject: "Booking Reschedule Confirmation",
        react: BookingRescheduleEmail({
          customerName: data.customerName,
          court: data.court,
          date: new Date(data.date),
          time: data.time,
          bookingCode: data.bookingCode,
          location: data.location,
          status: data.status,
        }),
      });

      if (response.error) {
        return {
          success: false,
          data: null,
          message: response.error.message,
        };
      }

      return {
        success: true,
        data: response,
        message: "Booking reschedule email sent successfully",
      };
    } catch (error) {
      console.error("Send booking reschedule email error:", error);
      return {
        success: false,
        data: null,
        message:
          error instanceof Error
            ? error.message
            : "Send booking reschedule email error",
      };
    }
  },
  sendBookingCancelationEmail: async (data: BookingCancelationEmailData) => {
    try {
      const response = await resend.emails.send({
        from: EMAIL_CONFIG.FROM_EMAIL,
        to: data.email,
        subject: "Booking Cancelation",
        react: BookingCancelationEmail({
          customerName: data.customerName,
          court: data.court,
          date: new Date(data.date),
          time: data.time,
          bookingCode: data.bookingCode,
          location: data.location,
          status: data.status,
        }),
      });

      if (response.error) {
        return {
          success: false,
          data: null,
          message: response.error.message,
        };
      }

      return {
        success: true,
        data: response,
        message: "Booking cancelation email sent successfully",
      };
    } catch (error) {
      console.error("Send booking cancelation email error:", error);
      return {
        success: false,
        data: null,
        message:
          error instanceof Error
            ? error.message
            : "Send booking cancelation email error",
      };
    }
  },
  sendOrderConfirmationEmail: async (data: OrderConfirmationEmailData) => {
    try {
      const response = await resend.emails.send({
        from: EMAIL_CONFIG.FROM_EMAIL,
        to: data.email,
        subject: "Order Confirmation",
        react: OrderConfirmationEmail({
          orderCode: data.orderCode,
          customerName: data.customerName,
          bookings: data.bookings.map((booking) => ({
            court: booking.court,
            date: new Date(booking.date),
            time: booking.time,
            bookingCode: booking.bookingCode,
            location: booking.location,
          })),
        }),
      });

      if (response.error) {
        return {
          success: false,
          data: null,
          message: response.error.message,
        };
      }
      return {
        success: true,
        data: response,
        message: "Order confirmation email sent successfully",
      };
    } catch (error) {
      console.error("Send order confirmation email error:", error);

      return {
        success: false,
        data: null,
        message:
          error instanceof Error
            ? error.message
            : "Send order confirmation email error",
      };
    }
  },
  sendManualBookingConfirmationEmail: async (
    data: ManualBookingConfirmationEmailData
  ) => {
    try {
      const response = await resend.emails.send({
        from: EMAIL_CONFIG.FROM_EMAIL,
        to: data.email,
        subject: "Your Booking is Confirmed",
        react: ManualBookingConfirmationEmail({
          customerName: data.customerName,
          email: data.email,
          court: data.court,
          venue: data.venue,
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime,
          bookingCode: data.bookingCode,
          loginUrl: data.loginUrl,
        }),
      });

      if (response.error) {
        return {
          success: false,
          data: null,
          message: response.error.message,
        };
      }

      return {
        success: true,
        data: response,
        message: "Manual booking confirmation email sent successfully",
      };
    } catch (error) {
      console.error("Send manual booking confirmation email error:", error);
      return {
        success: false,
        data: null,
        message:
          error instanceof Error
            ? error.message
            : "Send manual booking confirmation email error",
      };
    }
  },
  sendMagicLinkEmail: async (
    data: LoginWithMagicLinkData,
    magicLinkUrl: string
  ) => {
    try {
      const response = await resend.emails.send({
        from: EMAIL_CONFIG.FROM_EMAIL,
        to: data.email,
        subject: "Magic Link",
        react: LoginWithMagicLink({
          email: data.email,
          magicLinkUrl: magicLinkUrl,
        }),
      });
      if (response.error) {
        return {
          success: false,
          data: null,
          message: response.error.message,
        };
      }
      return {
        success: true,
        data: response,
        message: "Magic link email sent successfully",
      };
    } catch (error) {
      console.error("Send magic link email error:", error);
      return {
        success: false,
        data: null,
        message:
          error instanceof Error
            ? error.message
            : "Send magic link email error",
      };
    }
  },
};
