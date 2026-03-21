"use client";

import ConfirmationStep from "../../../components/ConfirmationStep";
import DetailsStep from "../../../components/DetailsStep";
import PartyDateStep from "../../../components/PartyDateStep";
import StepHeader from "../../../components/StepHeader";
import TableSelectionStep from "../../../components/TableSelectionStep";
import {
  ReservationFlowProvider,
  useReservationFlow,
} from "../../../contexts/ReservationFlowContext";

function ReservationFlowScreen() {
  const { currentStep } = useReservationFlow();

  let currentComponent = <PartyDateStep />;

  if (currentStep === 1) {
    currentComponent = <TableSelectionStep />;
  } else if (currentStep === 2) {
    currentComponent = <DetailsStep />;
  } else if (currentStep === 3) {
    currentComponent = <ConfirmationStep />;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#fffaf0_0%,#f7efdf_34%,#f2e4ca_100%)] px-4 py-10 text-stone-900 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.75),transparent_70%)]" />
      <div className="pointer-events-none absolute -left-32 top-24 h-72 w-72 rounded-full bg-[#f4d9be]/35 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-80 h-80 w-80 rounded-full bg-[#f0c8bf]/25 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center">
        <StepHeader currentStep={currentStep} />
        {currentComponent}
      </div>
    </main>
  );
}

export default function MakeReservationPage() {
  return (
    <ReservationFlowProvider>
      <ReservationFlowScreen />
    </ReservationFlowProvider>
  );
}
