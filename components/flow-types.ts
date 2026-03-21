export const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API ?? "";

export const reservationSteps = [
  "Party & Date",
  "Table",
  "Your Details",
  "Confirmation",
] as const;

export const stepContent = [
  {
    title: "Make a Reservation",
    subtitle: "Book your perfect dining experience",
  },
  {
    title: "Choose Your Perfect Spot",
    subtitle: "Select from our carefully curated dining spaces",
  },
  {
    title: "Tell Us About Yourself",
    subtitle: "We need a few details to hold your table",
  },
  {
    title: "Review & Confirm",
    subtitle: "Check your booking summary before placing the reservation",
  },
] as const;

export const quickPartySizes = [2, 4, 6, 8];
export const weekdays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
export const CANVAS_PADDING = 56;

export type ApiResponse<T> = {
  succeeded: boolean;
  message: string;
  errors: string[];
  data: T;
};

export type CalendarExclusion = {
  id: number;
  exclusionDate: string;
  reason: string;
};

export type BookingSlot = {
  id: number;
  slotId: string;
  startTime: string;
  endTime: string;
  day: number;
  numberOfTables: number;
  existingAllocations: number;
  allocatedTableIds: number[];
};

export type TimeSlot = {
  id: string;
  numericId: number;
  label: string;
  status: "available" | "partial" | "full";
  allocatedCount: number;
  totalTables: number;
  disabled?: boolean;
};

export type AssignedTable = {
  id: number;
  tableName: string;
  capacity: number;
  isOnlineBookingEnabled: boolean;
  existingAllocations: number;
};

export type FloorShape = {
  type: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fill: string;
  assignedTableId: number;
  assignedTable?: AssignedTable;
};

export type FloorMapData = {
  shapes: FloorShape[];
};

export type TableStatus = "available" | "selected" | "unavailable";

export type ReservationDetails = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes: string;
};

export type ReservationDraft = {
  guestCount: number;
  displayedMonth: Date;
  selectedDate: Date;
  selectedTimeId: string;
  selectedTimeLabel: string;
  selectedBookingSlotId: number | null;
  selectedTableId: number | null;
  selectedTable: AssignedTable | null;
  details: ReservationDetails;
};

export function normalizeDate(date: Date) {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);

  return normalized;
}

export function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function formatMonthLabel(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function formatDateLabel(date: Date | string | null) {
  if (!date) {
    return "Date not selected";
  }

  const parsed = typeof date === "string" ? new Date(`${date}T00:00:00`) : date;
  if (Number.isNaN(parsed.getTime())) {
    return typeof date === "string" ? date : "Date not selected";
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export function formatSlotTime(rawTime: string) {
  if (!rawTime) {
    return "-";
  }

  if (/^\d{2}:\d{2}/.test(rawTime)) {
    return rawTime.slice(0, 5);
  }

  const parsed = new Date(rawTime);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  return rawTime;
}

export function findNextAvailableDate(
  startDate: Date,
  closedDateKeys: Set<string>,
) {
  const cursor = normalizeDate(startDate);

  for (let i = 0; i < 370; i += 1) {
    const key = formatDateKey(cursor);
    if (!closedDateKeys.has(key)) {
      return cursor;
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return normalizeDate(startDate);
}

export function getTimeSlotClass(slot: TimeSlot, isSelected: boolean) {
  if (isSelected) {
    return "border-transparent bg-[#ff5f55] text-white shadow-[0_16px_28px_rgba(255,95,85,0.35)]";
  }

  if (slot.disabled) {
    return "border-transparent bg-[#8a95a1] text-stone-900/60 line-through";
  }

  if (slot.status === "partial") {
    return "border-transparent bg-[#ff8d85] text-white shadow-[0_10px_20px_rgba(255,141,133,0.3)]";
  }

  return "border border-[#e5dccf] bg-white text-stone-900 shadow-[0_8px_16px_rgba(62,45,19,0.08)]";
}

export function getTableStatus(
  shape: FloorShape,
  selectedTableId: number | null,
): TableStatus {
  if (shape.assignedTableId === selectedTableId) {
    return "selected";
  }

  if (
    !shape.assignedTable ||
    !shape.assignedTable.isOnlineBookingEnabled ||
    shape.assignedTable.existingAllocations > 0
  ) {
    return "unavailable";
  }

  return "available";
}

export function formatTableLabel(shape: FloorShape) {
  if (shape.assignedTable?.tableName) {
    const numericMatch = /(\d+)/.exec(shape.assignedTable.tableName);
    if (numericMatch) {
      return numericMatch[1];
    }
  }

  return String(shape.assignedTableId);
}

export function getCanvasMetrics(shapes: FloorShape[]) {
  if (shapes.length === 0) {
    return {
      minX: 0,
      minY: 0,
      width: 800,
      height: 480,
    };
  }

  const minX = Math.min(...shapes.map((shape) => shape.x));
  const minY = Math.min(...shapes.map((shape) => shape.y));
  const maxX = Math.max(...shapes.map((shape) => shape.x + shape.width));
  const maxY = Math.max(...shapes.map((shape) => shape.y + shape.height));

  return {
    minX,
    minY,
    width: maxX - minX + CANVAS_PADDING * 2,
    height: maxY - minY + CANVAS_PADDING * 2,
  };
}
