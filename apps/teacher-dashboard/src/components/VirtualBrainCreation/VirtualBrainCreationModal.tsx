import React from 'react';
import type { TeacherStudent } from '../../types/teacher';

interface VirtualBrainCreationModalProps {
  student: TeacherStudent;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (student: TeacherStudent, brainId: string) => void;
}

export const VirtualBrainCreationModal: React.FC<VirtualBrainCreationModalProps> = ({
  student,
  isOpen,
  onClose,
  onComplete
}) => {
  if (!isOpen) return null;

  const handleBrainCreationComplete = (brainId: string) => {
    console.log('Virtual Brain created for teacher dashboard:', brainId);
    
    // Update student with new Virtual Brain - will need to be integrated with existing VirtualBrain interface
    const updatedStudent: TeacherStudent = {
      ...student,
      // TODO: Connect to actual VirtualBrain creation result
      // virtualBrain: { id: brainId, status: 'active', createdAt: new Date().toISOString(), ... }
    };

    onComplete(updatedStudent, brainId);
  };



  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header with close button */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Virtual Brain Creation
            </h1>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close"
            >
              <span className="text-2xl text-gray-500">×</span>
            </button>
          </div>
        </div>

        {/* Progress Component */}
        <div className="p-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-6">🧠</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Creating {student.firstName}'s Virtual Brain
            </h2>
            <p className="text-gray-600 mb-8">
              This will integrate with the shared VirtualBrainCreationProgress component
            </p>
            <button
              onClick={() => handleBrainCreationComplete(`brain-${Date.now()}`)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
            >
              Simulate Creation Complete (Demo)
            </button>
            <div className="mt-6 text-sm text-gray-500">
              TODO: Import VirtualBrainCreationProgress from @aivo/ui package
              <br />
              This will show the 5-stage creation process with PersonalModelAgent integration
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};