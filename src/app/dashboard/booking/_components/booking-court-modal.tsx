import { Dialog, DialogContent } from "@/components/ui/dialog";
import { BookingForm } from "../../_components/booking-form";

export function BookingCourtModal({
  open,
  onOpenChange,
  onClose,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="p-8 lg:max-w-[600px] max-h-[85vh] overflow-y-auto"
      >
        <BookingForm onClose={onClose} isModal={true} />
      </DialogContent>
    </Dialog>
  );
}
