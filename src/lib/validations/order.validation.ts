import { z } from "zod";
import { OrderStatus } from "@/types/prisma";

/**
 * Schema untuk create order dengan multiple bookings
 * Supports optional fee breakdown fields (taxAmount, bookingFee)
 * Requirements: 1.1, 1.2, 2.1, 2.2, 3.1
 */
export const createOrderSchema = z.object({
  userId: z.string().cuid("Invalid user ID format"),
  bookings: z
    .array(
      z.object({
        courtId: z.string().cuid("Invalid court ID format"),
        date: z.union([
          z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
          z.coerce.date(),
        ]),
        slots: z
          .array(z.string())
          .min(1, "At least one time slot is required")
          .refine(
            (slots) => {
              // Validate slot format: HH:mm-HH:mm
              const slotRegex = /^\d{2}:\d{2}-\d{2}:\d{2}$/;
              return slots.every((slot) => slotRegex.test(slot));
            },
            {
              message: "Invalid time slot format. Expected: HH:mm-HH:mm",
            }
          ),
        price: z.number().int().positive("Price must be a positive number"),
      })
    )
    .min(1, "At least one booking is required"),
  channelName: z.string().min(1, "Payment channel is required"),
  // Fee breakdown fields (optional, default to 0 per Requirements 1.2, 2.2)
  taxAmount: z.number().int().nonnegative("Tax amount must be non-negative").optional().default(0),
  bookingFee: z.number().int().nonnegative("Booking fee must be non-negative").optional().default(0),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

/**
 * Schema untuk update order status
 */
export const updateOrderStatusSchema = z.object({
  orderId: z.string().cuid("Invalid order ID format"),
  status: z.nativeEnum(OrderStatus),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

/**
 * Schema untuk get order by ID
 */
export const getOrderByIdSchema = z.object({
  orderId: z.string().cuid("Invalid order ID format"),
});

export type GetOrderByIdInput = z.infer<typeof getOrderByIdSchema>;

/**
 * Schema untuk get user's orders
 */
export const getUserOrdersSchema = z.object({
  userId: z.string().cuid("Invalid user ID format"),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(10),
  status: z.nativeEnum(OrderStatus).optional(),
});

export type GetUserOrdersInput = z.infer<typeof getUserOrdersSchema>;
