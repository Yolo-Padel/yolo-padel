import ResetPasswordEmail from "@/components/emails/reset-password";
import { EMAIL_CONFIG, resend } from "../resend";
import WelcomeEmail from "@/components/emails/welcome-email";
import ConfirmationEmail from "@/components/emails/confirmation-email";
import BookingRescheduleEmail from "@/components/emails/booking-reschedule";
import BookingCancelationEmail from "@/components/emails/booking-cancelation";
import BookingConfirmationEmail from "@/components/emails/booking-confirmation";
import type { 
    WelcomeEmailData,
    ResetPasswordEmailData,
    ConfirmationEmailData,
    BookingRescheduleEmailData,
    BookingCancelationEmailData,
    BookingConfirmationEmailData
} from "../validations/send-email.validation";

export const resendService = {
    sendWelcomeEmail: async (data: WelcomeEmailData) => {
        try {
            const response = await resend.emails.send({
                from: EMAIL_CONFIG.FROM_EMAIL,
                to: data.email,
                subject: "Welcome to Yolo Padel!",
                react: WelcomeEmail({ userName: data.userName, email: data.email }),
                text: "Welcome to Yolo Padel!",
            });
            return {
                success: true,
                data: response,
                message: "Welcome email sent successfully",
            };
        } catch (error) {
            console.error("Send welcome email error:", error);
            return {
                success: false,
                data: null,
                message: error instanceof Error ? error.message : "Send welcome email error",
            };
        }
    },
    sendResetPasswordEmail: async (data: ResetPasswordEmailData) => {
        try {
            const response = await resend.emails.send({
                from: EMAIL_CONFIG.FROM_EMAIL,
                to: data.email,
                subject: "Forgot Password",
                react: ResetPasswordEmail({ customerName: data.customerName, email: data.email, resetUrl: data.resetUrl }),
            });
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
                message: error instanceof Error ? error.message : "Send forgot password email error",
            };
        }
    },
    sendConfirmationEmail: async (data: ConfirmationEmailData) => {
        try {
            const response = await resend.emails.send({
                from: EMAIL_CONFIG.FROM_EMAIL,
                to: data.email,
                subject: "Confirmation Email",
                react: ConfirmationEmail({ userName: data.userName, confirmationUrl: data.confirmationUrl }),
            });
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
                message: error instanceof Error ? error.message : "Send confirmation email error",
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
                    bookingId: data.bookingId, 
                    location: data.location, 
                    status: data.status 
                }),
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
                message: error instanceof Error ? error.message : "Send booking reschedule email error",
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
                    bookingId: data.bookingId, 
                    location: data.location, 
                    status: data.status 
                }),
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
                message: error instanceof Error ? error.message : "Send booking cancelation email error",
            };
        }
    },
    sendBookingConfirmationEmail: async (data: BookingConfirmationEmailData) => {
        try {
            const response = await resend.emails.send({
                from: EMAIL_CONFIG.FROM_EMAIL,
                to: data.email,
                subject: "Booking Confirmation",
                react: BookingConfirmationEmail({ 
                    customerName: data.customerName, 
                    court: data.court, 
                    date: new Date(data.date), 
                    time: data.time, 
                    bookingId: data.bookingId, 
                    location: data.location 
                }),
            });
            return {
                success: true,
                data: response,
                message: "Booking confirmation email sent successfully",
            };
        } catch (error) {
            console.error("Send booking confirmation email error:", error);

            return {
                success: false,
                data: null,
                message: error instanceof Error ? error.message : "Send booking confirmation email error",
            };
        }
    }
}