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
