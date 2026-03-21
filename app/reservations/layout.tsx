import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reservations | Juniper & Tonic",
  description: "Book or manage reservations at Juniper & Tonic.",
};

export default function ReservationsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
