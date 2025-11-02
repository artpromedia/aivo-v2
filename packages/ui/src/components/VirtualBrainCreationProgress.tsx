import React, { useState, useEffect } from 'react';

export interface VirtualBrainCreationStage {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  estimatedDuration: number; // seconds
  details: string[];
}

export interface StudentInfo {
  id: string;
  firstName: string;
  lastName: string;
  gradeLevel: string;
}

export interface VirtualBrainCreationProgressProps {
  student: StudentInfo;
  assessmentResults?: any;
  context: 'teacher-onboarding' | 'parent-purchase' | 'manual';
  onComplete: (brainId: string) => void;
  onError?: (error: string) => void;
}

const CREATION_STAGES: VirtualBrainCreationStage[] = [
  {
    id: 'analyzing',
    title: 'Analyzing Assessment',
    description: 'Processing assessment results and learning patterns',
    icon: '🔍',
    status: 'pending',
    estimatedDuration: 45,
    details: [
      'Analyzing response patterns and accuracy',
      'Identifying learning strengths and challenges',
      'Processing IEP goals and accommodations',
      'Mapping to curriculum standards'
    ]
  },
  {
    id: 'cloning',
    title: 'Cloning Foundation Model',
    description: 'Creating personalized AI model from base framework',
    icon: '🧬',
    status: 'pending',
    estimatedDuration: 60,
    details: [
      'Selecting optimal base model architecture',
      'Initializing personalized parameters',
      'Configuring learning algorithms',
      'Setting up neural pathways'
    ]
  },
  {
    id: 'personalizing',
    title: 'Personalizing Adaptations',
    description: 'Applying student-specific learning preferences',
    icon: '⚙️',
    status: 'pending',
    estimatedDuration: 40,
    details: [
      'Applying learning style preferences',
      'Configuring pacing adjustments',
      'Setting up content adaptations',
      'Integrating accessibility features'
    ]
  },
  {
    id: 'testing',
    title: 'Testing & Validation',
    description: 'Quality assurance and performance validation',
    icon: '✅',
    status: 'pending',
    estimatedDuration: 30,
    details: [
      'Running system compatibility tests',
      'Validating learning algorithms',
      'Testing content adaptation quality',
      'Verifying safety and compliance'
    ]
  },
  {
    id: 'ready',
    title: 'Activation Complete',
    description: 'Virtual Brain is ready for learning!',
    icon: '🧠',
    status: 'pending',
    estimatedDuration: 15,
    details: [
      'Finalizing system activation',
      'Establishing learning baselines',
      'Preparing first lesson recommendations',
      'Setting up monitoring systems'
    ]
  }
];

export const VirtualBrainCreationProgress: React.FC<VirtualBrainCreationProgressProps> = ({
  student,
  assessmentResults,
  context,
  onComplete,
  onError
}) => {
  const [stages, setStages] = useState<VirtualBrainCreationStage[]>(CREATION_STAGES);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [stageElapsed, setStageElapsed] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [createdBrainId, setCreatedBrainId] = useState<string | null>(null);

  const totalEstimatedDuration = CREATION_STAGES.reduce((sum, stage) => sum + stage.estimatedDuration, 0);

  useEffect(() => {
    if (isCreating && currentStageIndex < stages.length) {
      const currentStage = stages[currentStageIndex];
      
      // Update current stage to in-progress
      setStages(prev => prev.map((stage, idx) => ({
        ...stage,
        status: idx === currentStageIndex ? 'in-progress' : 
                idx < currentStageIndex ? 'completed' : 'pending'
      })));

      // Simulate stage progress
      const stageTimer = setInterval(() => {
        setStageElapsed(prev => {
          const newElapsed = prev + 1;
          setTotalElapsed(totalPrev => totalPrev + 1);
          
          if (newElapsed >= currentStage.estimatedDuration) {
            // Complete current stage
            setStages(prevStages => prevStages.map((stage, idx) => ({
              ...stage,
              status: idx === currentStageIndex ? 'completed' : stage.status
            })));
            
            // Move to next stage or complete
            if (currentStageIndex < stages.length - 1) {
              setTimeout(() => {
                setCurrentStageIndex(currentStageIndex + 1);
                setStageElapsed(0);
              }, 500);
            } else {
              // All stages complete
              const brainId = `brain-${student.id}-${Date.now()}`;
              setCreatedBrainId(brainId);
              setIsCreating(false);
              
              // Call PersonalModelAgent.cloneFromAssessment here
              // TODO: Replace with actual API call
              setTimeout(() => {
                onComplete(brainId);
              }, 1000);
            }
            
            clearInterval(stageTimer);
            return 0;
          }
          
          return newElapsed;
        });
      }, 1000);

      return () => clearInterval(stageTimer);
    }
  }, [isCreating, currentStageIndex, stages.length, student.id, onComplete]);

  const startCreation = async () => {
    setIsCreating(true);
    setCurrentStageIndex(0);
    setTotalElapsed(0);
    setStageElapsed(0);
    
    // TODO: Initialize PersonalModelAgent and call cloneFromAssessment
    // const modelAgent = new PersonalModelAgent(config, context, aivoBrain);
    // await modelAgent.initialize();
    // await modelAgent.cloneFromAssessment(assessmentResults);
  };

  const getContextMessage = () => {
    switch (context) {
      case 'teacher-onboarding':
        return {
          title: `Creating ${student.firstName}'s Virtual Brain`,
          subtitle: 'Setting up personalized learning for your classroom',
          audience: 'teacher'
        };
      case 'parent-purchase':
        return {
          title: `Setting Up ${student.firstName}'s Learning Experience`,
          subtitle: 'Creating a personalized AI tutor for your child',
          audience: 'parent'
        };
      default:
        return {
          title: `Creating Virtual Brain for ${student.firstName}`,
          subtitle: 'Personalizing the learning experience',
          audience: 'general'
        };
    }
  };

  const contextInfo = getContextMessage();
  const progressPercentage = Math.round((totalElapsed / totalEstimatedDuration) * 100);
  const currentStage = stages[currentStageIndex];

  if (!isCreating && !createdBrainId) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-xl text-center">
        <div className="text-6xl mb-6">🧠</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {contextInfo.title}
        </h2>
        <p className="text-gray-600 mb-6">
          {contextInfo.subtitle}
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
          <h3 className="font-semibold text-blue-900 mb-3">What happens during Virtual Brain creation:</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            {CREATION_STAGES.map((stage) => (
              <li key={stage.id} className="flex items-start">
                <span className="mr-2 mt-0.5">{stage.icon}</span>
                <div>
                  <span className="font-medium">{stage.title}:</span> {stage.description}
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="text-sm text-gray-500 mb-6">
          Estimated time: {Math.ceil(totalEstimatedDuration / 60)} minutes
        </div>
        
        <button
          onClick={startCreation}
          className="px-8 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold text-lg transition-colors"
        >
          Begin Virtual Brain Creation
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {contextInfo.title}
        </h2>
        <p className="text-gray-600">
          Please wait while we create a personalized learning experience...
        </p>
      </div>

      {/* Overall Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm text-gray-500">
            {Math.min(progressPercentage, 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-indigo-600 to-blue-600 h-3 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
        <div className="text-center mt-2 text-sm text-gray-500">
          Estimated time remaining: {Math.max(0, Math.ceil((totalEstimatedDuration - totalElapsed) / 60))} minutes
        </div>
      </div>

      {/* Stages */}
      <div className="space-y-6">
        {stages.map((stage, index) => (
          <div
            key={stage.id}
            className={`border rounded-lg p-6 transition-all duration-500 ${
              stage.status === 'completed'
                ? 'bg-green-50 border-green-200'
                : stage.status === 'in-progress'
                ? 'bg-blue-50 border-blue-300 shadow-md'
                : stage.status === 'error'
                ? 'bg-red-50 border-red-200'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`text-3xl ${stage.status === 'in-progress' ? 'animate-pulse' : ''}`}>
                {stage.status === 'completed' ? '✅' : 
                 stage.status === 'error' ? '❌' : stage.icon}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {stage.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    stage.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : stage.status === 'in-progress'
                      ? 'bg-blue-100 text-blue-800'
                      : stage.status === 'error'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {stage.status === 'completed' ? 'Complete' :
                     stage.status === 'in-progress' ? 'In Progress' :
                     stage.status === 'error' ? 'Error' : 'Pending'}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-3">{stage.description}</p>
                
                {stage.status === 'in-progress' && (
                  <div className="mb-3">
                    <div className="w-full bg-white rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${(stageElapsed / stage.estimatedDuration) * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {stageElapsed}s / {stage.estimatedDuration}s
                    </div>
                  </div>
                )}
                
                {(stage.status === 'in-progress' || stage.status === 'completed') && (
                  <ul className="text-sm text-gray-600 space-y-1">
                    {stage.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-green-500 mr-2 mt-0.5">
                          {stage.status === 'completed' || 
                           (stage.status === 'in-progress' && idx < Math.floor((stageElapsed / stage.estimatedDuration) * stage.details.length))
                            ? '✓' : '•'}
                        </span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Context-specific footer message */}
      <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg text-center">
        {context === 'teacher-onboarding' && (
          <p className="text-indigo-800">
            Once complete, {student.firstName}'s Virtual Brain will appear in your classroom dashboard
            where you can monitor their real-time learning progress.
          </p>
        )}
        {context === 'parent-purchase' && (
          <p className="text-indigo-800">
            Your personalized AI tutor is being created! You'll receive an email when {student.firstName} 
            can begin their first lesson.
          </p>
        )}
      </div>
    </div>
  );
};