'use client';

import React, { useState } from 'react';
import Stepper, { StepConfig } from './Stepper';
import Step1 from './steps/Step1';
import Step2 from './steps/Step2';
import Step3 from './steps/Step3';
import Step4 from './steps/Step4';

export default function ControllerContainer() {
  const [currentStep, setCurrentStep] = useState(1);

  const handleStepComplete = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
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
    },
    {
      id: 3,
      title: 'Bestätigung.',
      content: <Step3 onComplete={handleStepComplete} />,
    },
    {
      id: 4,
      title: 'Abgeschlossen.',
      content: <Step4 />,
    },
  ];

  return (
    <div className="controller-container">
      <Stepper steps={steps} currentStep={currentStep} />
    </div>
  );
}
