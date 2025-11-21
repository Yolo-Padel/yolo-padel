import { BookingFormMultiStep } from "./booking-form-multi-step";
import config from "@/config.json";

/**
 * Main Booking Form Component with Multi-Step Flow
 *
 * Flow:
 * Step 1: Court Selection (Multi-court support with cart)
 * Step 2: Order Summary (Payment method selection)
 * Step 3: Payment Instructions (Mock/Hardcoded)
 * Step 4: Booking Success
 */
export const BookingForm = ({
  onClose,
  isModal = false,
}: {
  onClose: () => void;
  isModal?: boolean;
}) => {
  return (
    <BookingFormMultiStep
      onClose={onClose}
      isModal={isModal}
      taxPercentage={config.taxPercentageDecimal}
      bookingFeePercentage={config.bookingFeePercentageDecimal}
    />
  );
};
