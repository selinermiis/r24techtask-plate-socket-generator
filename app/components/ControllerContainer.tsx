'use client';

import React, { useState, useEffect } from 'react';
import Stepper, { StepConfig } from './Stepper';
import Step1 from './steps/Step1';
import Step2 from './steps/Step2';
import Step3 from './steps/Step3';
import Step4 from './steps/Step4';

export default function ControllerContainer() {
  const [currentStep, setCurrentStep] = useState(1);
  const [mounted, setMounted] = useState(false);

  // Check localStorage on mount to determine initial step
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('dimensions');
      if (saved) {
        const parsed = JSON.parse(saved);
        // If there's at least 1 valid dimension, start at step 2
        if (Array.isArray(parsed) && parsed.length >= 1) {
          setCurrentStep(2);
        }
      }
    } catch (e) {
      console.error('localStorage okuma hatası:', e);
    }
  }, []);

  const handleStepComplete = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId);
  };

  const steps: StepConfig[] = [
    {
      id: 1,
      title: 'Maße. Eingeben.',
      content: <Step1 onComplete={handleStepComplete} />,
    },
    {
      id: 2,
      title: 'Steckdosen. Auswählen.',
      content: <Step2 onComplete={handleStepComplete} />,
      alwaysVisible: true, // Step 2 content is always visible with opacity
    },
    {
      id: 3,
      title: 'Bestätigung.',
      content: <Step3 onComplete={handleStepComplete} />,
      alwaysVisible: true, // Step 3 content is always visible with opacity
    },
    {
      id: 4,
      title: 'Abgeschlossen.',
      content: <Step4 />,
    },
  ];

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <div className="h-full max-h-[calc(100vh-7rem)] overflow-y-auto overflow-x-hidden pr-2">
      <Stepper
        steps={steps}
        currentStep={currentStep}
        onStepClick={handleStepClick}
      />
    </div>
  );
}
