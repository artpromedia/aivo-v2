import type { Student } from '../../types/virtual-brain';
import { FocusIndicator } from './FocusIndicator';
import { BrainStatus } from './BrainStatus';

interface BrainCardProps {
  student: Student;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}

// Placeholder icon components (will be replaced with lucide-react after install)
const Brain = ({ className }: { className?: string }) => <span className={className}>🧠</span>;
const AlertCircle = ({ className }: { className?: string }) => <span className={className}>⚠️</span>;
const Clock = ({ className }: { className?: string }) => <span className={className}>🕐</span>;
const FileText = ({ className }: { className?: string }) => <span className={className}>📄</span>;

export function BrainCard({ student, onClick, onDragStart, onDragEnd }: BrainCardProps) {
  const brain = student.virtualBrain;
  
  if (!brain) {
    return (
      <div className="brain-card p-4 opacity-50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              {student.photo ? (
                <img 
                  src={student.photo} 
                  alt={student.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-medium text-gray-500">
                  {student.name.split(' ').map(n => n[0]).join('')}
                </span>
              )}
            </div>
            <div>
              <p className="font-medium text-sm text-gray-700">{student.name}</p>
              <p className="text-xs text-gray-500">{student.gradeLevel}</p>
            </div>
          </div>
        </div>
        <div className="text-xs text-gray-500 text-center py-2">
          No Virtual Brain Active
        </div>
      </div>
    );
  }

  return (
    <div
      className="brain-card p-4 relative"
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
    >
      {/* Brain Status Indicator */}
      <BrainStatus status={brain.status} />
      
      {/* IEP Badge */}
      {student.hasIEP && (
        <div className="absolute top-2 left-2 bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-medium">
          IEP
        </div>
      )}

      {/* Student Info */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0">
          {student.photo ? (
            <img 
              src={student.photo} 
              alt={student.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
              <span className="text-white font-medium">
                {student.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-gray-900 truncate">{student.name}</p>
          <p className="text-xs text-gray-500">{student.gradeLevel}</p>
        </div>
      </div>

      {/* Current Activity */}
      <div className="mb-3">
        <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
          <FileText className="w-3 h-3" />
          <span className="truncate">{brain.currentState.currentSubject}</span>
        </div>
        <p className="text-xs text-gray-500 truncate">{brain.currentState.currentActivity}</p>
      </div>

      {/* Focus Level Meter */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-gray-700">Focus</span>
          <span className="text-xs font-medium text-gray-900">
            {brain.currentState.focusLevel}%
          </span>
        </div>
        <FocusIndicator level={brain.currentState.focusLevel} />
      </div>

      {/* Brain Stats */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-gray-50 rounded px-2 py-1">
          <div className="flex items-center gap-1 text-gray-600 mb-0.5">
            <Brain className="w-3 h-3" />
            <span>Adaptations</span>
          </div>
          <p className="font-medium text-gray-900">{brain.currentState.adaptationsMade}</p>
        </div>
        <div className="bg-gray-50 rounded px-2 py-1">
          <div className="flex items-center gap-1 text-gray-600 mb-0.5">
            <Clock className="w-3 h-3" />
            <span>Last Update</span>
          </div>
          <p className="font-medium text-gray-900">
            {new Date(brain.currentState.lastAdaptation).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        </div>
      </div>

      {/* Suggestion Alert */}
      {brain.suggestions.filter(s => s.status === 'pending').length > 0 && (
        <div className="mt-3 bg-amber-50 border border-amber-200 rounded px-2 py-1.5 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span className="text-xs text-amber-800">
            {brain.suggestions.filter(s => s.status === 'pending').length} pending suggestion{brain.suggestions.filter(s => s.status === 'pending').length > 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
}
