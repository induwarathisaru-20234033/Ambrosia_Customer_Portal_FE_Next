"use client";

import axios from "axios";
import Link from "next/link";
import { useState } from "react";
import {
  API_BASE_URL,
  type ApiResponse,
  formatDateLabel,
  formatSlotTime,
} from "../../../components/flow-types";

type ReservationLookupData = {
  id: number;
  reservationCode: string;
  partySize: number;
  reservationStatus: number;
  reservationDate: string;
  occasion: string;
  specialRequests: string;
  customerDetail: {
    id: number;
    name: string;
    email: string;
    phoneNumber: string;
  };
  bookingSlot: {
    id: number;
    slotId: string;
    startTime: string;
    endTime: string;
  };
  table: {
    id: number;
    tableName: string;
    capacity: number;
    isOnlineBookingEnabled: boolean;
    existingAllocations: number;
  };
};

const cancelSteps = ["Reservation Detail", "Confirmation"] as const;

enum ReservationStatus {
  Booked = 1,
  Arrived = 2,
  NoShow = 3,
  Cancelled = 4,
}

function getStatusBlockingMessage(status: number) {
  if (status === ReservationStatus.Arrived) {
    return "This reservation has already been marked as arrived and cannot be cancelled online.";
  }

  if (status === ReservationStatus.NoShow) {
    return "This reservation is marked as no-show and can no longer be cancelled.";
  }

  if (status === ReservationStatus.Cancelled) {
    return "This reservation is already cancelled.";
  }

  return "This reservation cannot be cancelled right now. Please contact the restaurant for assistance.";
}

export default function CancelReservationPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [reservationCode, setReservationCode] = useState("");
  const [reservation, setReservation] = useState<ReservationLookupData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleLookupReservation() {
    const normalizedCode = reservationCode
      .trim()
      .toUpperCase()
      .replaceAll(/\s+/g, "");
    if (!normalizedCode) {
      setErrorMessage("Please enter your reservation code.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { data } = await axios.get<ApiResponse<ReservationLookupData>>(
        `${API_BASE_URL}/Reservations/code/${encodeURIComponent(normalizedCode)}`,
      );

      if (!data.succeeded || !data.data) {
        setErrorMessage(
          data.message || data.errors?.[0] || "Reservation not found.",
        );
        return;
      }

      if (data.data.reservationStatus !== ReservationStatus.Booked) {
        setReservation(null);
        setReservationCode(data.data.reservationCode || normalizedCode);
        setErrorMessage(getStatusBlockingMessage(data.data.reservationStatus));
        setCurrentStep(0);
        return;
      }

      setReservation(data.data);
      setReservationCode(data.data.reservationCode);
      setCurrentStep(1);
    } catch {
      setErrorMessage("We could not find that reservation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCancelReservation() {
    if (!reservation) {
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { data } = await axios.patch<ApiResponse<null>>(
        `${API_BASE_URL}/Reservations/${reservation.id}/cancel`,
      );

      if (!data.succeeded) {
        setErrorMessage(
          data.message || data.errors?.[0] || "Could not cancel reservation.",
        );
        return;
      }

      setSuccessMessage("Your reservation has been cancelled successfully.");
    } catch {
      setErrorMessage("Could not cancel reservation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#fffaf0_0%,#f7efdf_34%,#f2e4ca_100%)] px-4 py-10 text-stone-900 sm:px-6 lg:px-8">
      {isLoading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-sm">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/70 border-t-[#ff5f55]" />
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.75),transparent_70%)]" />
      <div className="pointer-events-none absolute -left-32 top-24 h-72 w-72 rounded-full bg-[#f4d9be]/35 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-80 h-80 w-80 rounded-full bg-[#f0c8bf]/25 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center">
        <header className="text-center">
          <h1
            className="mt-4 text-4xl tracking-tight sm:text-5xl"
            style={{ fontFamily: "var(--font-fraunces)" }}
          >
            Cancel Reservation
          </h1>
          <p className="mt-3 text-sm text-stone-500 sm:text-base">
            Enter reservation details to continue with cancellation.
          </p>
        </header>

        <section className="mt-10 flex w-full max-w-xl items-start justify-center px-2">
          {cancelSteps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isActive = index === currentStep;

            return (
              <div key={step} className="flex min-w-0 flex-1 items-start">
                <div className="flex w-28 shrink-0 flex-col items-center gap-2 text-center sm:w-32">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition-colors ${
                      isCompleted || isActive
                        ? "border-transparent bg-[#ff5f55] text-white shadow-[0_12px_24px_rgba(255,95,85,0.3)]"
                        : "border-[#d7d5cf] bg-[#e7e9eb] text-stone-500"
                    }`}
                  >
                    {isCompleted ? "✓" : index + 1}
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-600 sm:text-xs">
                    {step}
                  </span>
                </div>
                {index < cancelSteps.length - 1 ? (
                  <div
                    className={`mx-2 mt-4 h-px min-w-8 flex-1 ${
                      index < currentStep ? "bg-[#ff5f55]" : "bg-[#d6d2c8]"
                    } sm:mx-4 sm:min-w-16`}
                  />
                ) : null}
              </div>
            );
          })}
        </section>

        <section className="mt-12 w-full max-w-2xl rounded-[34px] border border-white/70 bg-white/82 px-5 py-8 shadow-[0_28px_70px_rgba(82,58,21,0.12)] backdrop-blur sm:px-8 md:px-10 lg:px-12 lg:py-12">
          {currentStep === 0 ? (
            <div className="mx-auto max-w-xl">
              <label
                htmlFor="reservationCode"
                className="text-sm font-semibold text-stone-700"
              >
                Reservation Code *
              </label>
              <input
                id="reservationCode"
                type="text"
                value={reservationCode}
                onChange={(event) => setReservationCode(event.target.value)}
                placeholder="RES-20260320-8775"
                className="mt-3 w-full rounded-lg border border-[#d4d0c7] bg-[#f4f2ef] px-4 py-3 text-sm tracking-[0.24em] uppercase text-stone-900 outline-none transition focus:border-[#ff8a80]"
              />

              {errorMessage ? (
                <p className="mt-4 rounded-xl bg-[#ffe3df] px-4 py-3 text-sm font-medium text-[#8a3f34]">
                  {errorMessage}
                </p>
              ) : null}

              <div className="mt-10 flex w-full flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/reservations"
                  className="min-w-40 rounded-2xl bg-[#d8d1cb] px-8 py-3 text-center text-sm font-semibold text-stone-700 shadow-[0_14px_24px_rgba(82,58,21,0.12)] transition hover:bg-[#cec5bd]"
                >
                  Back
                </Link>
                <button
                  type="button"
                  onClick={handleLookupReservation}
                  className="min-w-56 rounded-2xl bg-[#ff7469] px-8 py-3 text-sm font-semibold text-white shadow-[0_20px_34px_rgba(255,116,105,0.34)] transition hover:-translate-y-0.5 hover:bg-[#ff655a]"
                >
                  Confirm Detail
                </button>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl">
              <h2
                className="text-3xl text-stone-900 sm:text-4xl"
                style={{ fontFamily: "var(--font-fraunces)" }}
              >
                Reservation Details
              </h2>
              <p className="mt-2 text-sm text-stone-500">
                Review the booking below before cancellation.
              </p>

              <dl className="mt-8 grid gap-4 rounded-3xl bg-[#fff8eb] p-6 text-sm text-stone-700 shadow-[0_12px_26px_rgba(82,58,21,0.08)] md:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                    Reservation Code
                  </dt>
                  <dd className="mt-1 font-semibold text-stone-900">
                    {reservation?.reservationCode ?? "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                    Name
                  </dt>
                  <dd className="mt-1 font-semibold text-stone-900">
                    {reservation?.customerDetail.name ?? "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                    Email
                  </dt>
                  <dd className="mt-1 font-semibold text-stone-900">
                    {reservation?.customerDetail.email ?? "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                    Phone
                  </dt>
                  <dd className="mt-1 font-semibold text-stone-900">
                    {reservation?.customerDetail.phoneNumber ?? "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                    Guests
                  </dt>
                  <dd className="mt-1 font-semibold text-stone-900">
                    {reservation?.partySize ?? "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                    Table
                  </dt>
                  <dd className="mt-1 font-semibold text-stone-900">
                    {reservation?.table.tableName ?? "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                    Date
                  </dt>
                  <dd className="mt-1 font-semibold text-stone-900">
                    {formatDateLabel(reservation?.reservationDate ?? null)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                    Time
                  </dt>
                  <dd className="mt-1 font-semibold text-stone-900">
                    {formatSlotTime(reservation?.bookingSlot.startTime ?? "")}
                  </dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                    Special Requests
                  </dt>
                  <dd className="mt-1 font-semibold text-stone-900">
                    {reservation?.specialRequests || "None"}
                  </dd>
                </div>
              </dl>

              {errorMessage ? (
                <p className="mt-4 rounded-xl bg-[#ffe3df] px-4 py-3 text-sm font-medium text-[#8a3f34]">
                  {errorMessage}
                </p>
              ) : null}
              {successMessage ? (
                <p className="mt-4 rounded-xl bg-[#dff7e7] px-4 py-3 text-sm font-medium text-[#266040]">
                  {successMessage}
                </p>
              ) : null}

              <div className="mt-10 flex w-full flex-col items-center justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(0);
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  className="min-w-40 rounded-2xl bg-[#d8d1cb] px-8 py-3 text-center text-sm font-semibold text-stone-700 shadow-[0_14px_24px_rgba(82,58,21,0.12)] transition hover:bg-[#cec5bd]"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleCancelReservation}
                  className="min-w-56 rounded-2xl bg-[#ff7469] px-8 py-3 text-sm font-semibold text-white shadow-[0_20px_34px_rgba(255,116,105,0.34)] transition hover:-translate-y-0.5 hover:bg-[#ff655a]"
                >
                  Cancel Reservation
                </button>
              </div>

              {successMessage ? (
                <div className="mt-5 flex justify-center">
                  <Link
                    href="/reservations"
                    className="text-sm font-semibold text-[#c85f53] underline underline-offset-4"
                  >
                    Return to Reservation Desk
                  </Link>
                </div>
              ) : null}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
