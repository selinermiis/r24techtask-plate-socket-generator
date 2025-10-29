'use client';

import React from 'react';
import type { StepConfig, StepperProps } from '@/app/types';

export default function Stepper({
  steps,
  currentStep,
  onStepClick,
}: StepperProps) {
  return (
    <div className="flex flex-col">
      {steps.map((step, index) => {
        const isCompleted = currentStep > step.id;
        const isCurrent = currentStep === step.id;
        const isPending = currentStep < step.id;
        const isLastStep = index === steps.length - 1;
        const isClickable = isCompleted || isCurrent;

        return (
          <div key={step.id} className="flex gap-2">
            {/* Left: Circle and Line */}
            <div className="flex flex-col items-center shrink-0">
              {/* Circle */}
              <div
                onClick={() => isClickable && onStepClick?.(step.id)}
                className={`
                  flex items-center justify-center
                  w-8 h-8 rounded-full
                  border-2 font-semibold text-sm
                  transition-all duration-200
                  ${
                    isCurrent
                      ? 'bg-primary border-primary text-white shadow-lg cursor-pointer hover:scale-105'
                      : isCompleted
                        ? 'bg-primary border-primary text-white cursor-pointer hover:shadow-md hover:scale-105'
                        : 'bg-white border-gray-300 text-gray-400'
                  }
                `}
              >
                {isCompleted ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  step.id
                )}
              </div>

              {/* Connecting Line */}
              {!isLastStep && (
                <div
                  className={`
                    w-0.5 flex-1 
                    transition-all duration-200
                    ${isCompleted ? 'bg-primary' : 'bg-gray-300'}
                  `}
                />
              )}
            </div>

            {/* Right: Title and Content */}
            <div className="flex-1 pb-8">
              <h3
                onClick={() => isClickable && onStepClick?.(step.id)}
                className={`
                  text-base mb-2
                  transition-all duration-200
                  ${
                    isCurrent
                      ? 'text-gray-900 cursor-pointer hover:text-black'
                      : isCompleted
                        ? 'text-gray-700 cursor-pointer hover:text-gray-900'
                        : 'text-gray-400'
                  }
                `}
              >
                {(() => {
                  const words = step.title.split(' ');
                  if (words.length === 0) return step.title;
                  return (
                    <>
                      <span className="font-bold">{words[0]}</span>
                      {words.length > 1 && ` ${words.slice(1).join(' ')}`}
                    </>
                  );
                })()}
              </h3>

              {/* Step Content */}
              {step.content && (
                <>
                  {step.alwaysVisible ? (
                    // Always visible with opacity
                    <div
                      className={`mt-4 transition-opacity duration-300 ${
                        isCurrent || isCompleted
                          ? 'opacity-100'
                          : 'opacity-40 pointer-events-none'
                      }`}
                    >
                      {step.content}
                    </div>
                  ) : (
                    // Show only if current or completed
                    (isCurrent || isCompleted) && (
                      <div className="mt-4">{step.content}</div>
                    )
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
