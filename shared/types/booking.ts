export type BookingStatus = "confirmed" | "cancelled";

export interface Booking {
  id: string;
  sessionId: string;
  userId: string;
  amountPaid: number;
  status: BookingStatus;
  createdAt: string;
}
