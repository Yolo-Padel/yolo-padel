export type CourtSelection = {
  courtId: string;
  date: Date;
  slots: string[];
};

export type CourtSelections = Map<string, CourtSelection>;

export type BookingFormValues = {
  venueId: string;
  courtId: string;
  date: Date | undefined;
  slots: string[];
  totalPrice: number;
};
