export interface Step1Props {}

export interface Step2Props {
  onComplete: () => void;
}

export interface Step3Props {
  onComplete?: () => void;
  onBackToStep2?: () => void;
}

export interface StepConfig {
  id: number;
  title: string;
  content?: React.ReactNode;
  alwaysVisible?: boolean;
}

export interface StepperProps {
  steps: StepConfig[];
  currentStep: number;
  onStepClick?: (stepId: number) => void;
}
