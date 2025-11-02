import { useState } from 'react';
import type { TeacherStudent, District } from '../../types/teacher';
import { BasicInfo } from './BasicInfo';
import { LocationDetection } from './LocationDetection';
import { LearningProfile } from './LearningProfile';
import { ConsentCompliance } from './ConsentCompliance';
import { LicenseAllocation } from './LicenseAllocation';

interface AddStudentWizardProps {
  onComplete: (student: TeacherStudent) => void;
  onCancel: () => void;
}

export function AddStudentWizard({ onComplete, onCancel }: AddStudentWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [studentData, setStudentData] = useState<Partial<TeacherStudent>>({});

  const steps = [
    { number: 1, title: 'Basic Info', component: BasicInfo },
    { number: 2, title: 'District & Curriculum', component: LocationDetection },
    { number: 3, title: 'Learning Profile', component: LearningProfile },
    { number: 4, title: 'Privacy & Consent', component: ConsentCompliance },
    { number: 5, title: 'License Assignment', component: LicenseAllocation },
  ];

  const CurrentStepComponent = steps[currentStep - 1].component;

  const handleStepComplete = (data: Partial<TeacherStudent>) => {
    setStudentData({ ...studentData, ...data });
    
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // All steps complete, proceed to assessment
      onComplete(studentData as TeacherStudent);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveDraft = () => {
    // Save draft to local storage or API
    localStorage.setItem(`student-draft-${Date.now()}`, JSON.stringify(studentData));
    alert('Draft saved successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold
                ${currentStep > step.number ? 'bg-green-500 border-green-500 text-white' : 
                  currentStep === step.number ? 'bg-blue-500 border-blue-500 text-white' :
                  'bg-gray-100 border-gray-300 text-gray-400'}
              `}>
                {currentStep > step.number ? '✓' : step.number}
              </div>
              <div className="ml-3 flex-1">
                <div className={`text-sm font-medium ${
                  currentStep >= step.number ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {step.title}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  currentStep > step.number ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <CurrentStepComponent
          data={studentData}
          onNext={handleStepComplete}
          onBack={handleBack}
          isFirstStep={currentStep === 1}
          isLastStep={currentStep === steps.length}
        />
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex justify-between">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 hover:text-gray-900"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveDraft}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Save as Draft
        </button>
      </div>
    </div>
  );
}
