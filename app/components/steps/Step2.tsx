'use client';

import React, { useState } from 'react';

interface Step2Props {
  onComplete: () => void;
}

export default function Step2({ onComplete }: Step2Props) {
  const [cutoutsEnabled, setCutoutsEnabled] = useState(true);
  const [selectedPanel, setSelectedPanel] = useState('');
  const [socketCount, setSocketCount] = useState(1);
  const [orientation, setOrientation] = useState('horizontal');

  const panels = [
    { id: '1', dimensions: '151.5 × 36.8 cm' },
    { id: '2', dimensions: '200 × 100 cm' },
  ];

  const handleContinue = () => {
    if (selectedPanel) {
      onComplete();
    }
  };

  return (
    <div>
      <h1>Step 2</h1>
    </div>
  );
}
