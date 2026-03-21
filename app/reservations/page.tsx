import Image from "next/image";
import Link from "next/link";

const reservationLinks = [
  {
    href: "/reservations/make",
    title: "Make a Reservation",
    description:
      "Pick your party size, date, and time to book your table in minutes.",
  },
  {
    href: "/reservations/cancel",
    title: "Cancel a Reservation",
    description: "Find your booking quickly and cancel it in a few easy steps.",
  },
];

export default function ReservationsPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#fffaf0_0%,#f7efdf_45%,#f3e6d1_100%)] px-6 py-16 text-stone-900">
      <div className="w-full max-w-5xl rounded-4xl border border-white/70 bg-white/65 p-8 shadow-[0_32px_90px_rgba(84,58,21,0.12)] backdrop-blur sm:p-12">
        <div className="flex justify-center">
          <Image
            src="/images/JuniperAndTonicLogoBGClearV2.png"
            alt="Juniper and Tonic logo"
            width={260}
            height={70}
            className="h-auto w-48 sm:w-60"
            priority
          />
        </div>
        <h1
          className="mt-4 text-center text-4xl tracking-tight sm:text-5xl"
          style={{ fontFamily: "var(--font-fraunces)" }}
        >
          Reservation Desk
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-center text-base leading-7 text-stone-600 sm:text-lg">
          Welcome to the Reservation Desk. Start a new booking or cancel an
          existing one in just a few simple steps.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {reservationLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group rounded-[28px] border border-[#eadfc8] bg-[#fffaf1] p-6 shadow-[0_18px_50px_rgba(84,58,21,0.08)] transition-transform duration-200 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <h2
                  className="text-2xl text-stone-900"
                  style={{ fontFamily: "var(--font-fraunces)" }}
                >
                  {link.title}
                </h2>
              </div>
              <p className="mt-4 max-w-sm text-sm leading-6 text-stone-600">
                {link.description}
              </p>
              <span className="mt-8 inline-flex items-center text-sm font-semibold text-[#c85f53] transition-transform duration-200 group-hover:translate-x-1">
                Continue
              </span>
            </Link>
          ))}
        </div>

        <footer className="mt-10 flex items-center justify-center gap-3 pt-6 text-sm font-semibold  text-stone-600">
          <span>Powered by</span>
          <Image
            src="/images/AmbrosiaLogoClearBG.png"
            alt="Ambrosia logo"
            width={130}
            height={30}
            className="h-auto w-32"
            priority
          />
        </footer>
      </div>
    </main>
  );
}
