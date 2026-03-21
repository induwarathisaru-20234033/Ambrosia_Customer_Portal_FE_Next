"use client";

import Image from "next/image";
import { reservationSteps, stepContent } from "./flow-types";

type StepHeaderProps = {
  currentStep: number;
};

export default function StepHeader({ currentStep }: Readonly<StepHeaderProps>) {
  const content = stepContent[currentStep] ?? stepContent[0];

  return (
    <>
      <header className="text-center">
        <div className="flex justify-center">
          <Image
            src="/images/JuniperAndTonicLogoBGClearV2.png"
            alt="Juniper and Tonic logo"
            width={140}
            height={40}
            className="h-auto w-28 sm:w-32"
            priority
          />
        </div>
        <h1
          className="mt-4 text-4xl tracking-tight sm:text-5xl"
          style={{ fontFamily: "var(--font-fraunces)" }}
        >
          {content.title}
        </h1>
        <p className="mt-3 text-sm text-stone-500 sm:text-base">
          {content.subtitle}
        </p>
      </header>

      <section className="mt-10 flex w-full max-w-3xl items-start justify-center px-2">
        {reservationSteps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;

          return (
            <div key={step} className="flex min-w-0 flex-1 items-start">
              <div className="flex w-20 shrink-0 flex-col items-center gap-2 text-center sm:w-24">
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
              {index < reservationSteps.length - 1 ? (
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
    </>
  );
}
