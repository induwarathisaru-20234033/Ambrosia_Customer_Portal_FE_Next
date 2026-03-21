"use client";

import { useReservationFlow } from "../contexts/ReservationFlowContext";

export default function DetailsStep() {
  const { draft, nextStep, previousStep, updateDetails } = useReservationFlow();
  const isFormValid =
    draft.details.firstName.trim() &&
    draft.details.lastName.trim() &&
    draft.details.email.trim() &&
    draft.details.phone.trim();

  return (
    <>
      <section className="mt-14 grid w-full gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[34px] border border-white/70 bg-white/82 px-5 py-8 shadow-[0_28px_70px_rgba(82,58,21,0.12)] backdrop-blur sm:px-8 md:px-10 lg:px-12 lg:py-12">
          <h2
            className="text-3xl text-stone-900"
            style={{ fontFamily: "var(--font-fraunces)" }}
          >
            Your Details
          </h2>
          <p className="mt-2 text-sm text-stone-500">
            Complete the form so we can confirm and hold your reservation.
          </p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-semibold text-stone-700">
              <span>First name</span>
              <input
                value={draft.details.firstName}
                onChange={(event) =>
                  updateDetails({ firstName: event.target.value })
                }
                className="rounded-2xl border border-[#e7dcc7] bg-[#fffaf1] px-4 py-3 font-medium text-stone-900 outline-none transition focus:border-[#ff8d85]"
                placeholder="Jane"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-stone-700">
              <span>Last name</span>
              <input
                value={draft.details.lastName}
                onChange={(event) =>
                  updateDetails({ lastName: event.target.value })
                }
                className="rounded-2xl border border-[#e7dcc7] bg-[#fffaf1] px-4 py-3 font-medium text-stone-900 outline-none transition focus:border-[#ff8d85]"
                placeholder="Doe"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-stone-700">
              <span>Email</span>
              <input
                type="email"
                value={draft.details.email}
                onChange={(event) =>
                  updateDetails({ email: event.target.value })
                }
                className="rounded-2xl border border-[#e7dcc7] bg-[#fffaf1] px-4 py-3 font-medium text-stone-900 outline-none transition focus:border-[#ff8d85]"
                placeholder="jane@domain.com"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-stone-700">
              <span>Phone</span>
              <input
                value={draft.details.phone}
                onChange={(event) =>
                  updateDetails({ phone: event.target.value })
                }
                className="rounded-2xl border border-[#e7dcc7] bg-[#fffaf1] px-4 py-3 font-medium text-stone-900 outline-none transition focus:border-[#ff8d85]"
                placeholder="07X XXX XXXX"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-stone-700 sm:col-span-2">
              <span>Special notes</span>
              <textarea
                value={draft.details.notes}
                onChange={(event) =>
                  updateDetails({ notes: event.target.value })
                }
                className="min-h-32 rounded-2xl border border-[#e7dcc7] bg-[#fffaf1] px-4 py-3 font-medium text-stone-900 outline-none transition focus:border-[#ff8d85]"
                placeholder="Allergies, celebration notes, seating preferences..."
              />
            </label>
          </div>
        </div>

        <aside className="rounded-[34px] border border-white/70 bg-white/82 px-5 py-8 shadow-[0_28px_70px_rgba(82,58,21,0.12)] backdrop-blur sm:px-8 lg:px-10 lg:py-12">
          <h2
            className="text-3xl text-stone-900"
            style={{ fontFamily: "var(--font-fraunces)" }}
          >
            Reservation Summary
          </h2>
          <div className="mt-6 space-y-4 text-sm font-medium text-stone-700">
            <div className="rounded-2xl bg-[#fff8eb] px-4 py-3">
              <strong className="block text-stone-900">Date</strong>
              <span>
                {draft.selectedDate.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="rounded-2xl bg-[#fff8eb] px-4 py-3">
              <strong className="block text-stone-900">Time</strong>
              <span>{draft.selectedTimeLabel || "Not selected"}</span>
            </div>
            <div className="rounded-2xl bg-[#fff8eb] px-4 py-3">
              <strong className="block text-stone-900">Guests</strong>
              <span>{draft.guestCount}</span>
            </div>
            <div className="rounded-2xl bg-[#fff8eb] px-4 py-3">
              <strong className="block text-stone-900">Table</strong>
              <span>{draft.selectedTable?.tableName ?? "Not selected"}</span>
            </div>
          </div>
        </aside>
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
          disabled={!isFormValid}
          onClick={nextStep}
          className="min-w-56 rounded-2xl bg-[#ff7469] px-8 py-3 text-sm font-semibold text-white shadow-[0_20px_34px_rgba(255,116,105,0.34)] transition enabled:hover:-translate-y-0.5 enabled:hover:bg-[#ff655a] disabled:cursor-not-allowed disabled:bg-[#f2b3ae] disabled:shadow-none"
        >
          Continue to Confirmation
        </button>
      </div>
    </>
  );
}
