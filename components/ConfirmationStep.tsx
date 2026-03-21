"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useReservationFlow } from "../contexts/ReservationFlowContext";
import {
  API_BASE_URL,
  type ApiResponse,
  formatDateLabel,
  formatSlotTime,
} from "./flow-types";

type ReservationData = {
  id: number;
  reservationCode: string;
  partySize: number;
  reservationDate: string;
  bookingSlot: { id: number; startTime: string; endTime: string };
  table: { id: number; tableName: string };
  customerDetail: {
    id: number;
    name: string;
    email: string;
    phoneNumber: string;
  };
};

export default function ConfirmationStep() {
  const { draft, previousStep, resetFlow } = useReservationFlow();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [successData, setSuccessData] = useState<ReservationData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleConfirm() {
    setIsLoading(true);
    const [hours = 0, minutes = 0] = (draft.selectedTimeLabel || "")
      .split(":")
      .map(Number);
    const reservationDate = new Date(draft.selectedDate);
    reservationDate.setHours(hours, minutes, 0, 0);

    try {
      const { data } = await axios.post<ApiResponse<ReservationData>>(
        `${API_BASE_URL}/Reservations`,
        {
          partySize: draft.guestCount,
          reservationDate: reservationDate.toISOString(),
          occasion: "",
          specialRequests: draft.details.notes,
          customerName:
            `${draft.details.firstName} ${draft.details.lastName}`.trim(),
          customerEmail: draft.details.email,
          customerPhoneNumber: draft.details.phone,
          bookingSlotId: draft.selectedBookingSlotId,
          tableId: draft.selectedTableId,
        },
      );

      if (data.succeeded) {
        setSuccessData(data.data);
      } else {
        setErrorMessage(
          data.message || data.errors?.[0] || "Something went wrong.",
        );
      }
    } catch {
      setErrorMessage("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {/* ── Loading overlay ──────────────────────────────────────── */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-xl">
            <svg
              className="h-10 w-10 animate-spin text-[#ff7469]"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>
      )}

      {/* ── Success modal ────────────────────────────────────────── */}
      {successData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm overflow-hidden rounded-4xl bg-white shadow-2xl">
            {/* Green header */}
            <div className="flex flex-col items-center bg-[#4db87a] px-6 pb-8 pt-10">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white">
                <svg
                  className="h-10 w-10 text-[#4db87a]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2
                className="mt-5 text-2xl font-bold text-white"
                style={{ fontFamily: "var(--font-fraunces)" }}
              >
                Reservation Confirmed!
              </h2>
              <p className="mt-1 text-sm text-white/80">
                Your table is reserved.
              </p>
            </div>

            {/* White content */}
            <div className="px-6 py-6">
              {/* Reservation code */}
              <div className="rounded-2xl bg-[#f0faf4] px-4 py-4 text-center">
                <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">
                  Reservation ID
                </p>
                <p
                  className="mt-2 text-xl font-bold tracking-widest text-stone-900"
                  style={{ fontFamily: "var(--font-fraunces)" }}
                >
                  {successData.reservationCode}
                </p>
              </div>

              {/* Detail rows */}
              <div className="mt-5 divide-y divide-stone-100">
                {/* Party size */}
                <div className="flex items-center gap-4 pb-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-500">
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.6}
                    >
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                      Party Size
                    </p>
                    <p className="font-semibold text-stone-800">
                      {successData.partySize}{" "}
                      {successData.partySize === 1 ? "Guest" : "Guests"}
                    </p>
                  </div>
                </div>

                {/* Date & time */}
                <div className="flex items-center gap-4 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-500">
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.6}
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                      Date &amp; Time
                    </p>
                    <p className="font-semibold text-stone-800">
                      {formatDateLabel(successData.reservationDate)} &middot;{" "}
                      {formatSlotTime(successData.bookingSlot.startTime)}
                    </p>
                  </div>
                </div>

                {/* Table */}
                <div className="flex items-center gap-4 pt-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-500">
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.6}
                    >
                      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                      Table
                    </p>
                    <p className="font-semibold text-stone-800">
                      {successData.table.tableName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Confirmation notice */}
              <div className="mt-5 rounded-2xl bg-[#f0faf4] px-4 py-3 text-sm">
                <p className="text-stone-700">
                  <span className="mr-1 font-bold text-[#4db87a]">✓</span> A
                  confirmation email has been sent to{" "}
                  <strong>{successData.customerDetail.email}</strong>.
                </p>
                <p className="mt-1 text-stone-400">
                  Please arrive 10 minutes early for your reservation.
                </p>
              </div>

              {/* Buttons */}
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/reservations")}
                  className="flex-1 rounded-2xl bg-[#e8e2dc] py-3 text-sm font-semibold text-stone-700 transition hover:bg-[#ddd6ce]"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={resetFlow}
                  className="flex-1 rounded-2xl bg-[#ff7469] py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(255,116,105,0.30)] transition hover:bg-[#ff655a]"
                >
                  New Reservation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Error modal ──────────────────────────────────────────── */}
      {errorMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm overflow-hidden rounded-4xl bg-white shadow-2xl">
            {/* Red header */}
            <div className="flex flex-col items-center bg-[#f44336] px-6 pb-8 pt-10">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white">
                <svg
                  className="h-10 w-10 text-[#f44336]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>
              <h2
                className="mt-5 text-2xl font-bold text-white"
                style={{ fontFamily: "var(--font-fraunces)" }}
              >
                Reservation Failed!
              </h2>
            </div>

            {/* Content */}
            <div className="px-6 py-8 text-center">
              <p
                className="text-xl font-bold text-stone-900"
                style={{ fontFamily: "var(--font-fraunces)" }}
              >
                Something went wrong.
              </p>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="mt-6 rounded-2xl bg-[#e8e2dc] px-10 py-3 text-sm font-semibold text-stone-700 transition hover:bg-[#ddd6ce]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main confirmation card ───────────────────────────────── */}
      <section className="mt-14 w-full rounded-[34px] border border-white/70 bg-white/82 px-5 py-8 shadow-[0_28px_70px_rgba(82,58,21,0.12)] backdrop-blur sm:px-8 md:px-10 lg:px-12 lg:py-12">
        <div className="mx-auto max-w-4xl text-center">
          <h2
            className="text-3xl text-stone-900 sm:text-4xl"
            style={{ fontFamily: "var(--font-fraunces)" }}
          >
            You&apos;re Almost There!
          </h2>
          <p className="mt-3 text-sm text-stone-500 sm:text-base">
            Review your booking details below, then confirm to complete your
            reservation.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-2">
          <div className="rounded-3xl bg-[#fff8eb] p-6 shadow-[0_12px_26px_rgba(82,58,21,0.08)]">
            <h3
              className="text-2xl text-stone-900"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              Booking Summary
            </h3>
            <dl className="mt-5 space-y-3 text-sm font-medium text-stone-700">
              <div className="flex items-center justify-between gap-4">
                <dt>Date</dt>
                <dd>{formatDateLabel(draft.selectedDate)}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt>Time</dt>
                <dd>{draft.selectedTimeLabel}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt>Guests</dt>
                <dd>{draft.guestCount}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt>Table</dt>
                <dd>{draft.selectedTable?.tableName ?? "Not selected"}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-3xl bg-[#fff8eb] p-6 shadow-[0_12px_26px_rgba(82,58,21,0.08)]">
            <h3
              className="text-2xl text-stone-900"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              Guest Details
            </h3>
            <dl className="mt-5 space-y-3 text-sm font-medium text-stone-700">
              <div className="flex items-center justify-between gap-4">
                <dt>Name</dt>
                <dd>
                  {`${draft.details.firstName} ${draft.details.lastName}`.trim()}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt>Email</dt>
                <dd>{draft.details.email}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt>Phone</dt>
                <dd>{draft.details.phone}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt>Notes</dt>
                <dd className="max-w-56 text-right">
                  {draft.details.notes || "None"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <div className="mt-10 flex w-full flex-col items-center justify-center gap-4 sm:flex-row">
        <button
          type="button"
          onClick={previousStep}
          className="min-w-56 rounded-2xl bg-[#d8d1cb] px-8 py-3 text-center text-sm font-semibold text-stone-700 shadow-[0_14px_24px_rgba(82,58,21,0.12)] transition hover:bg-[#cec5bd]"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          className="min-w-56 rounded-2xl bg-[#ff7469] px-8 py-3 text-sm font-semibold text-white shadow-[0_20px_34px_rgba(255,116,105,0.34)] transition hover:-translate-y-0.5 hover:bg-[#ff655a]"
        >
          Confirm Reservation
        </button>
      </div>
    </>
  );
}
