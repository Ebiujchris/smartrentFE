export type LeaseStatus =
  | "ACTIVE"
  | "UPCOMING"
  | "EXPIRED"
  | "ENDED"
  | "UNASSIGNED";

interface LeaseDates {
  isActive: boolean;
  startDate: string;
  endDate: string;
}

export function getLeaseStatus(lease?: LeaseDates | null): LeaseStatus {
  if (!lease) return "UNASSIGNED";
  if (!lease.isActive) return "ENDED";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(lease.startDate);
  if (!Number.isNaN(startDate.getTime())) {
    startDate.setHours(0, 0, 0, 0);
    if (startDate > today) return "UPCOMING";
  }

  const endDate = new Date(lease.endDate);
  if (!Number.isNaN(endDate.getTime())) {
    endDate.setHours(23, 59, 59, 999);
    if (endDate < new Date()) return "EXPIRED";
  }

  return "ACTIVE";
}

export function getPaymentStatus(payment: {
  status: string;
  dueDate: string | Date;
}): string {
  if (payment.status !== "PENDING") return payment.status;

  const dueDate = new Date(payment.dueDate);
  if (Number.isNaN(dueDate.getTime())) return payment.status;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  return dueDate < today ? "OVERDUE" : payment.status;
}