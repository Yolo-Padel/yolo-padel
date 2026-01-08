import { EMAIL_CONFIG, brevo } from "@/lib/brevo";
import Invitation from "@/components/emails/invitation";
import BookingRescheduleEmail from "@/components/emails/booking-reschedule";
import BookingCancelationEmail from "@/components/emails/booking-cancelation";
import OrderConfirmationEmail from "@/components/emails/order-confirmation";
import ManualBookingConfirmationEmail from "@/components/emails/manual-booking-confirmation";
import type {
  InvitationEmailData,
  BookingRescheduleEmailData,
  BookingCancelationEmailData,
  OrderConfirmationEmailData,
  ManualBookingConfirmationEmailData,
} from "../validations/send-email.validation";
import { LoginWithMagicLinkData } from "../validations/auth.validation";
import LoginWithMagicLink from "@/components/emails/login-with-magic-link";
import { render } from "@react-email/render";

export const brevoService = {
  sendInvitationEmail: async (data: InvitationEmailData) => {
    try {
      const response = await brevo.sendTransacEmail({
        sender: {
          email: EMAIL_CONFIG.FROM_EMAIL,
          name: EMAIL_CONFIG.COMPANY_NAME,
        },
        to: [{ email: data.email }],
        subject: "Invitation",
        htmlContent: await render(
          Invitation({
            userName: data.userName,
            email: data.email,
            invitationUrl: data.invitationUrl,
            userType: data.userType,
          }),
        ),
      });

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
  sendBookingRescheduleEmail: async (data: BookingRescheduleEmailData) => {
    try {
      const response = await brevo.sendTransacEmail({
        sender: {
          email: EMAIL_CONFIG.FROM_EMAIL,
          name: EMAIL_CONFIG.COMPANY_NAME,
        },
        to: [{ email: data.email }],
        subject: "Booking Reschedule Confirmation",
        htmlContent: await render(
          BookingRescheduleEmail({
            customerName: data.customerName,
            court: data.court,
            date: new Date(data.date),
            time: data.time,
            bookingCode: data.bookingCode,
            location: data.location,
            status: data.status,
          }),
        ),
      });

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
      const response = await brevo.sendTransacEmail({
        sender: {
          email: EMAIL_CONFIG.FROM_EMAIL,
          name: EMAIL_CONFIG.COMPANY_NAME,
        },
        to: [{ email: data.email }],
        subject: "Booking Cancelation",
        htmlContent: await render(
          BookingCancelationEmail({
            customerName: data.customerName,
            court: data.court,
            date: new Date(data.date),
            time: data.time,
            bookingCode: data.bookingCode,
            location: data.location,
            status: data.status,
          }),
        ),
      });

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
      const response = await brevo.sendTransacEmail({
        sender: {
          email: EMAIL_CONFIG.FROM_EMAIL,
          name: EMAIL_CONFIG.COMPANY_NAME,
        },
        to: [{ email: data.email }],
        subject: "Order Confirmation",
        htmlContent: await render(
          OrderConfirmationEmail({
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
        ),
      });

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
    data: ManualBookingConfirmationEmailData,
  ) => {
    try {
      const response = await brevo.sendTransacEmail({
        sender: {
          email: EMAIL_CONFIG.FROM_EMAIL,
          name: EMAIL_CONFIG.COMPANY_NAME,
        },
        to: [{ email: data.email }],
        subject: "Your Booking is Confirmed",
        htmlContent: await render(
          ManualBookingConfirmationEmail({
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
        ),
      });

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
    magicLinkUrl: string,
  ) => {
    try {
      const response = await brevo.sendTransacEmail({
        sender: {
          email: EMAIL_CONFIG.FROM_EMAIL,
          name: EMAIL_CONFIG.COMPANY_NAME,
        },
        to: [{ email: data.email }],
        subject: "Magic Link",
        htmlContent: await render(
          LoginWithMagicLink({
            email: data.email,
            magicLinkUrl: magicLinkUrl,
          }),
        ),
      });

      return {
        success: true,
        data: response,
        message: "Magic link email sent successfully",
      };
    } catch (error) {
      console.error(
        "Send magic link email error:",
        (error as any).response?.data,
      );

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
