"use client";

import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  type AssignedTable,
  type ReservationDetails,
  type ReservationDraft,
  normalizeDate,
} from "../components/flow-types";

type ReservationFlowContextValue = {
  currentStep: number;
  draft: ReservationDraft;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  resetFlow: () => void;
  setGuestCount: (count: number) => void;
  setDisplayedMonth: (date: Date) => void;
  setSelectedDate: (date: Date) => void;
  setSelectedTime: (slotId: string, label: string, numericId?: number) => void;
  setSelectedTable: (
    tableId: number | null,
    table: AssignedTable | null,
  ) => void;
  updateDetails: (details: Partial<ReservationDetails>) => void;
};

const ReservationFlowContext =
  createContext<ReservationFlowContextValue | null>(null);

export function ReservationFlowProvider({
  children,
}: Readonly<PropsWithChildren>) {
  const today = useMemo(() => normalizeDate(new Date()), []);
  const [currentStep, setCurrentStep] = useState(0);
  const [draft, setDraft] = useState<ReservationDraft>({
    guestCount: 2,
    displayedMonth: new Date(today.getFullYear(), today.getMonth(), 1),
    selectedDate: today,
    selectedTimeId: "",
    selectedTimeLabel: "",
    selectedBookingSlotId: null,
    selectedTableId: null,
    selectedTable: null,
    details: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      notes: "",
    },
  });

  const goToStep = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((step) => Math.min(step + 1, 3));
  }, []);

  const previousStep = useCallback(() => {
    setCurrentStep((step) => Math.max(step - 1, 0));
  }, []);

  const setGuestCount = useCallback((count: number) => {
    setDraft((current) => ({
      ...current,
      guestCount: count,
      selectedTableId: null,
      selectedTable: null,
    }));
  }, []);

  const setDisplayedMonth = useCallback((date: Date) => {
    setDraft((current) => ({
      ...current,
      displayedMonth: date,
    }));
  }, []);

  const setSelectedDate = useCallback((date: Date) => {
    setDraft((current) => ({
      ...current,
      selectedDate: normalizeDate(date),
      selectedTimeId: "",
      selectedTimeLabel: "",
      selectedBookingSlotId: null,
      selectedTableId: null,
      selectedTable: null,
    }));
  }, []);

  const setSelectedTime = useCallback(
    (slotId: string, label: string, numericId?: number) => {
      setDraft((current) => ({
        ...current,
        selectedTimeId: slotId,
        selectedTimeLabel: label,
        selectedBookingSlotId: numericId ?? null,
        selectedTableId: null,
        selectedTable: null,
      }));
    },
    [],
  );

  const setSelectedTable = useCallback(
    (tableId: number | null, table: AssignedTable | null) => {
      setDraft((current) => {
        const sameTableId = current.selectedTableId === tableId;
        const currentAssignedId = current.selectedTable?.id ?? null;
        const nextAssignedId = table?.id ?? null;

        if (sameTableId && currentAssignedId === nextAssignedId) {
          return current;
        }

        return {
          ...current,
          selectedTableId: tableId,
          selectedTable: table,
        };
      });
    },
    [],
  );

  const resetFlow = useCallback(() => {
    const todayReset = normalizeDate(new Date());
    setDraft({
      guestCount: 2,
      displayedMonth: new Date(
        todayReset.getFullYear(),
        todayReset.getMonth(),
        1,
      ),
      selectedDate: todayReset,
      selectedTimeId: "",
      selectedTimeLabel: "",
      selectedBookingSlotId: null,
      selectedTableId: null,
      selectedTable: null,
      details: {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        notes: "",
      },
    });
    setCurrentStep(0);
  }, []);

  const updateDetails = useCallback((details: Partial<ReservationDetails>) => {
    setDraft((current) => ({
      ...current,
      details: {
        ...current.details,
        ...details,
      },
    }));
  }, []);

  const value = useMemo<ReservationFlowContextValue>(
    () => ({
      currentStep,
      draft,
      setCurrentStep: goToStep,
      nextStep,
      previousStep,
      resetFlow,
      setGuestCount,
      setDisplayedMonth,
      setSelectedDate,
      setSelectedTime,
      setSelectedTable,
      updateDetails,
    }),
    [
      currentStep,
      draft,
      goToStep,
      nextStep,
      previousStep,
      resetFlow,
      setDisplayedMonth,
      setGuestCount,
      setSelectedDate,
      setSelectedTable,
      setSelectedTime,
      updateDetails,
    ],
  );

  return (
    <ReservationFlowContext.Provider value={value}>
      {children}
    </ReservationFlowContext.Provider>
  );
}

export function useReservationFlow() {
  const context = useContext(ReservationFlowContext);

  if (!context) {
    throw new Error(
      "useReservationFlow must be used within ReservationFlowProvider",
    );
  }

  return context;
}
