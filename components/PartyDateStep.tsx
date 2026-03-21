"use client";

import axios from "axios";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useReservationFlow } from "../contexts/ReservationFlowContext";
import {
  API_BASE_URL,
  type ApiResponse,
  type BookingSlot,
  type CalendarExclusion,
  type TimeSlot,
  findNextAvailableDate,
  formatDateKey,
  formatMonthLabel,
  formatSlotTime,
  getTimeSlotClass,
  normalizeDate,
  quickPartySizes,
  weekdays,
} from "./flow-types";

export default function PartyDateStep() {
  const {
    draft,
    nextStep,
    setDisplayedMonth,
    setGuestCount,
    setSelectedDate,
    setSelectedTime,
  } = useReservationFlow();
  const today = useMemo(() => normalizeDate(new Date()), []);
  const [closedDateKeys, setClosedDateKeys] = useState<Set<string>>(new Set());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState("");

  const monthLabel = formatMonthLabel(draft.displayedMonth);
  const selectedDateKey = formatDateKey(draft.selectedDate);

  const calendarDays = useMemo(() => {
    const year = draft.displayedMonth.getFullYear();
    const month = draft.displayedMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const dayOffset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: Array<{ key: string; date: Date | null }> = [];

    for (let i = 0; i < dayOffset; i += 1) {
      cells.push({ key: `pad-start-${i}`, date: null });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push({ key: `day-${day}`, date: new Date(year, month, day) });
    }

    const trailing = (7 - (cells.length % 7)) % 7;
    for (let i = 0; i < trailing; i += 1) {
      cells.push({ key: `pad-end-${i}`, date: null });
    }

    return cells;
  }, [draft.displayedMonth]);

  useEffect(() => {
    let isCancelled = false;

    async function loadCalendarExclusions() {
      try {
        const { data } = await axios.get<ApiResponse<CalendarExclusion[]>>(
          `${API_BASE_URL}/CalenderExclusions`,
        );

        const exclusionSet = new Set(
          (data.data ?? []).map((item) => item.exclusionDate.slice(0, 10)),
        );

        if (!isCancelled) {
          setClosedDateKeys(exclusionSet);

          if (exclusionSet.has(selectedDateKey)) {
            const nextAvailable = findNextAvailableDate(today, exclusionSet);
            setSelectedDate(nextAvailable);
            setDisplayedMonth(
              new Date(
                nextAvailable.getFullYear(),
                nextAvailable.getMonth(),
                1,
              ),
            );
          }
        }
      } catch (error) {
        console.error("Failed to load calendar exclusions", error);
        if (!isCancelled) {
          setClosedDateKeys(new Set());
        }
      }
    }

    loadCalendarExclusions();

    return () => {
      isCancelled = true;
    };
  }, [selectedDateKey, setDisplayedMonth, setSelectedDate, today]);

  useEffect(() => {
    let isCancelled = false;

    async function loadTimeSlots() {
      setIsLoadingSlots(true);
      setSlotsError("");

      try {
        const dateQuery = encodeURIComponent(formatDateKey(draft.selectedDate));
        const { data } = await axios.get<ApiResponse<BookingSlot[]>>(
          `${API_BASE_URL}/Configs/booking-slots?dateTime=${dateQuery}`,
        );

        const mappedSlots: TimeSlot[] = (data.data ?? []).map((slot) => {
          const allocatedCount = slot.allocatedTableIds?.length ?? 0;
          const isFull = slot.numberOfTables <= allocatedCount;
          const isPartial =
            slot.numberOfTables > allocatedCount && allocatedCount > 0;
          let status: TimeSlot["status"] = "available";

          if (isFull) {
            status = "full";
          } else if (isPartial) {
            status = "partial";
          }

          return {
            id: slot.slotId || String(slot.id),
            numericId: slot.id,
            label: formatSlotTime(slot.startTime),
            status,
            allocatedCount,
            totalTables: slot.numberOfTables,
            disabled: isFull,
          };
        });

        if (!isCancelled) {
          setTimeSlots(mappedSlots);

          const currentSelection = mappedSlots.find(
            (slot) => slot.id === draft.selectedTimeId && !slot.disabled,
          );
          if (currentSelection) {
            setSelectedTime(
              currentSelection.id,
              currentSelection.label,
              currentSelection.numericId,
            );
          } else {
            const firstOpenSlot = mappedSlots.find((slot) => !slot.disabled);
            setSelectedTime(
              firstOpenSlot?.id ?? "",
              firstOpenSlot?.label ?? "",
              firstOpenSlot?.numericId,
            );
          }
        }
      } catch (error) {
        console.error("Failed to load booking slots", error);
        if (!isCancelled) {
          setTimeSlots([]);
          setSelectedTime("", "");
          setSlotsError("Could not load timeslots for the selected date.");
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingSlots(false);
        }
      }
    }

    loadTimeSlots();

    return () => {
      isCancelled = true;
    };
  }, [draft.selectedDate, draft.selectedTimeId, setSelectedTime]);

  return (
    <>
      <section className="mt-12 w-full max-w-[24rem] rounded-[28px] border border-white/70 bg-white/90 px-8 py-7 text-center shadow-[0_24px_60px_rgba(82,58,21,0.14),0_6px_18px_rgba(82,58,21,0.08)] backdrop-blur">
        <h2
          className="text-3xl text-stone-900"
          style={{ fontFamily: "var(--font-fraunces)" }}
        >
          Event Size
        </h2>
        <p className="mt-2 text-sm text-stone-500">
          Select your party including children
        </p>

        <div className="mt-8 flex items-center justify-center gap-7 sm:gap-10">
          <button
            type="button"
            aria-label="Decrease party size"
            onClick={() => setGuestCount(Math.max(1, draft.guestCount - 1))}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ff9f92] text-xl text-[#ff7a70] transition hover:bg-[#fff4f1]"
          >
            &#8249;
          </button>
          <div className="min-w-20 text-center">
            <div
              className="text-7xl leading-none text-[#ff6a61]"
              style={{ fontFamily: "var(--font-fraunces)" }}
            >
              {draft.guestCount}
            </div>
          </div>
          <button
            type="button"
            aria-label="Increase party size"
            onClick={() => setGuestCount(Math.min(16, draft.guestCount + 1))}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ff9f92] text-xl text-[#ff7a70] transition hover:bg-[#fff4f1]"
          >
            &#8250;
          </button>
        </div>

        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
            Quick Select
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            {quickPartySizes.map((size) => {
              const isSelected = size === draft.guestCount;

              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => setGuestCount(size)}
                  className={`flex h-11 w-11 items-center justify-center rounded-full border text-sm font-semibold transition ${
                    isSelected
                      ? "border-[#1e1712] bg-[#e68d89] text-stone-950 shadow-[0_10px_18px_rgba(230,141,137,0.4)]"
                      : "border-[#1f1711] bg-white text-stone-800 hover:bg-[#fff7ef]"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mt-14 w-full rounded-[34px] border border-white/70 bg-white/82 px-5 py-8 shadow-[0_28px_70px_rgba(82,58,21,0.12)] backdrop-blur sm:px-8 md:px-10 lg:px-14 lg:py-12">
        <div className="text-center">
          <h2
            className="text-3xl text-stone-900 sm:text-4xl"
            style={{ fontFamily: "var(--font-fraunces)" }}
          >
            Date &amp; Time
          </h2>
          <p className="mt-2 text-sm text-stone-500 sm:text-base">
            Choose your preferred time to dine with us
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.4fr] lg:items-start">
          <div className="rounded-3xl border border-white/80 bg-[#fff9ed] p-5 shadow-[0_18px_42px_rgba(82,58,21,0.1)]">
            <div className="flex items-center justify-between text-stone-500">
              <button
                type="button"
                aria-label="Previous month"
                onClick={() =>
                  setDisplayedMonth(
                    new Date(
                      draft.displayedMonth.getFullYear(),
                      draft.displayedMonth.getMonth() - 1,
                      1,
                    ),
                  )
                }
                className="flex h-8 w-8 items-center justify-center rounded-full text-lg transition hover:bg-white"
              >
                &#8249;
              </button>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-stone-700">
                {monthLabel}
              </p>
              <button
                type="button"
                aria-label="Next month"
                onClick={() =>
                  setDisplayedMonth(
                    new Date(
                      draft.displayedMonth.getFullYear(),
                      draft.displayedMonth.getMonth() + 1,
                      1,
                    ),
                  )
                }
                className="flex h-8 w-8 items-center justify-center rounded-full text-lg transition hover:bg-white"
              >
                &#8250;
              </button>
            </div>

            <div className="mt-6 grid grid-cols-7 gap-y-3 text-center">
              {weekdays.map((day) => (
                <span
                  key={day}
                  className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400"
                >
                  {day}
                </span>
              ))}

              {calendarDays.map(({ key, date }) => {
                if (!date) {
                  return <span key={key} />;
                }

                const normalizedDate = normalizeDate(date);
                const dateKey = formatDateKey(normalizedDate);
                const isPastDate = normalizedDate < today;
                const isClosedDate = closedDateKeys.has(dateKey);
                const isDisabled = isPastDate || isClosedDate;
                const isSelected = dateKey === selectedDateKey;
                let dateButtonClass = "text-stone-700 hover:bg-white";

                if (isSelected) {
                  dateButtonClass =
                    "bg-[#ff5f55] text-white shadow-[0_10px_18px_rgba(255,95,85,0.35)]";
                } else if (isDisabled) {
                  dateButtonClass = "cursor-not-allowed text-stone-300";
                }

                return (
                  <button
                    key={key}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => {
                      if (!isDisabled) {
                        setSelectedDate(normalizedDate);
                      }
                    }}
                    className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition ${dateButtonClass}`}
                    title={isClosedDate ? "Closed on this date" : undefined}
                  >
                    {normalizedDate.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-white/80 bg-[#fff9ed] p-5 shadow-[0_18px_42px_rgba(82,58,21,0.1)] sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3
                  className="text-2xl text-stone-900"
                  style={{ fontFamily: "var(--font-fraunces)" }}
                >
                  Available Times
                </h3>
                <p className="mt-1 text-sm text-stone-500">
                  Party of {draft.guestCount} on{" "}
                  {draft.selectedDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#b16a4f] shadow-[0_10px_18px_rgba(82,58,21,0.08)]">
                Indoor
              </div>
            </div>

            <div className="mt-6">
              {isLoadingSlots ? (
                <p className="text-sm font-medium text-stone-500">
                  Loading timeslots...
                </p>
              ) : null}
              {!isLoadingSlots && slotsError ? (
                <p className="text-sm font-medium text-red-500">{slotsError}</p>
              ) : null}
              {!isLoadingSlots && !slotsError && timeSlots.length === 0 ? (
                <p className="text-sm font-medium text-stone-500">
                  No slots available for this date.
                </p>
              ) : null}
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {timeSlots.map((slot) => {
                const isSelected =
                  slot.id === draft.selectedTimeId && !slot.disabled;

                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={slot.disabled}
                    onClick={() =>
                      setSelectedTime(slot.id, slot.label, slot.numericId)
                    }
                    className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${getTimeSlotClass(
                      slot,
                      isSelected,
                    )} ${slot.disabled ? "cursor-not-allowed" : "hover:-translate-y-0.5"}`}
                    title={
                      slot.disabled
                        ? "Fully booked"
                        : `Allocated ${slot.allocatedCount}/${slot.totalTables} tables`
                    }
                  >
                    {slot.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <div className="mt-10 flex w-full flex-col items-center justify-center gap-4 sm:flex-row">
        <Link
          href="/reservations"
          className="min-w-32 rounded-2xl bg-[#d8d1cb] px-7 py-3 text-center text-sm font-semibold text-stone-700 shadow-[0_14px_24px_rgba(82,58,21,0.12)] transition hover:bg-[#cec5bd]"
        >
          Cancel
        </Link>
        <button
          type="button"
          disabled={!draft.selectedTimeId}
          onClick={nextStep}
          className="min-w-56 rounded-2xl bg-[#ff7469] px-8 py-3 text-sm font-semibold text-white shadow-[0_20px_34px_rgba(255,116,105,0.34)] transition enabled:hover:-translate-y-0.5 enabled:hover:bg-[#ff655a] disabled:cursor-not-allowed disabled:bg-[#f2b3ae] disabled:shadow-none"
        >
          Continue to Table Selection
        </button>
      </div>
    </>
  );
}
