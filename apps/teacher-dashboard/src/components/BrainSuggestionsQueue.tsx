import { useState } from 'react';
import type { BrainSuggestion, Student } from '../../types/virtual-brain';

interface BrainSuggestionsQueueProps {
  suggestions: BrainSuggestion[];
  students: Student[];
  onAccept: (suggestionId: string, note?: string) => void;
  onReject: (suggestionId: string, note?: string) => void;
  onModify: (suggestionId: string, modification: string, note?: string) => void;
}

interface ModificationModalProps {
  suggestion: BrainSuggestion;
  student: Student | undefined;
  onSave: (modification: string, note: string) => void;
  onCancel: () => void;
}

// Placeholder icons
const Brain = ({ className }: { className?: string }) => <span className={className}>🧠</span>;
const CheckCircle = ({ className }: { className?: string }) => <span className={className}>✅</span>;
const XCircle = ({ className }: { className?: string }) => <span className={className}>❌</span>;
const Edit = ({ className }: { className?: string }) => <span className={className}>✏️</span>;
const AlertCircle = ({ className }: { className?: string }) => <span className={className}>⚠️</span>;
const X = ({ className }: { className?: string }) => <span className={className}>✖️</span>;
const Save = ({ className }: { className?: string }) => <span className={className}>💾</span>;

function ModificationModal({ suggestion, student, onSave, onCancel }: ModificationModalProps) {
  const [modification, setModification] = useState('');
  const [note, setNote] = useState('');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Modify Suggestion</h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Student: {student?.name} • {suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1)} Adjustment
          </p>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Original Suggestion</h3>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{suggestion.suggestion}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Modification *
            </label>
            <textarea
              value={modification}
              onChange={(e) => setModification(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Describe how you want to modify this suggestion..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Implementation Note (Optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              placeholder="Add notes about implementation timing, conditions, etc..."
            />
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => modification.trim() && onSave(modification, note)}
            disabled={!modification.trim()}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Modification</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function BrainSuggestionsQueue({
  suggestions,
  students,
  onAccept,
  onReject,
  onModify,
}: BrainSuggestionsQueueProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [teacherNotes, setTeacherNotes] = useState<Record<string, string>>({});
  const [modifyingId, setModifyingId] = useState<string | null>(null);

  const getStudent = (brainId: string) => {
    return students.find(s => s.virtualBrain?.id === brainId);
  };

  const getPriorityBadge = (priority: BrainSuggestion['priority']) => {
    const config: Record<BrainSuggestion['priority'], { color: string; label: string; icon: string }> = {
      urgent: { color: 'bg-red-100 text-red-800 border-red-300', label: 'Urgent', icon: '🚨' },
      high: { color: 'bg-orange-100 text-orange-800 border-orange-300', label: 'High', icon: '⚡' },
      medium: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'Medium', icon: '📌' },
      low: { color: 'bg-gray-100 text-gray-800 border-gray-300', label: 'Low', icon: '📝' },
    };
    const { color, label, icon } = config[priority];
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium border ${color}`}>
        {icon} {label}
      </span>
    );
  };

  const getTypeBadge = (type: BrainSuggestion['type']) => {
    const config: Record<BrainSuggestion['type'], { color: string; label: string }> = {
      difficulty: { color: 'bg-blue-100 text-blue-800', label: 'Difficulty' },
      pacing: { color: 'bg-purple-100 text-purple-800', label: 'Pacing' },
      content: { color: 'bg-green-100 text-green-800', label: 'Content' },
      intervention: { color: 'bg-red-100 text-red-800', label: 'Intervention' },
      break: { color: 'bg-indigo-100 text-indigo-800', label: 'Break' },
    };
    const { color, label } = config[type];
    return <span className={`px-2 py-1 rounded text-xs font-medium ${color}`}>{label}</span>;
  };

  const pendingSuggestions = suggestions.filter(s => s.status === 'pending');

  if (pendingSuggestions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">All Caught Up!</h3>
        <p className="text-gray-600">No pending suggestions from Virtual Brains</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Brain Suggestions Queue</h2>
              <p className="text-sm text-gray-600">
                {pendingSuggestions.length} pending suggestion{pendingSuggestions.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {pendingSuggestions.map((suggestion) => {
          const student = getStudent(suggestion.brainId);
          const isExpanded = expandedId === suggestion.id;

          return (
            <div key={suggestion.id} className="p-6 hover:bg-gray-50 transition-colors">
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                {student?.photo ? (
                  <img
                    src={student.photo}
                    alt={student.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {student?.name.split(' ').map((n: string) => n[0]).join('') || '??'}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{student?.name || 'Unknown Student'}</h3>
                    {getPriorityBadge(suggestion.priority)}
                    {getTypeBadge(suggestion.type)}
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{suggestion.suggestion}</p>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : suggestion.id)}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    {isExpanded ? 'Hide' : 'Show'} Details
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="ml-16 space-y-4 animate-in fade-in duration-200">
                  {/* AI Reasoning */}
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <Brain className="w-5 h-5 text-purple-600 flex-shrink-0" />
                      <h4 className="font-semibold text-purple-900">AI Reasoning</h4>
                    </div>
                    <p className="text-sm text-purple-800">{suggestion.reasoning}</p>
                  </div>

                  {/* Proposed Change */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Proposed Change</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700 font-medium">Before:</span>
                        <pre className="mt-1 text-blue-800 whitespace-pre-wrap">
                          {JSON.stringify(suggestion.proposedChange.before, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">After:</span>
                        <pre className="mt-1 text-blue-800 whitespace-pre-wrap">
                          {JSON.stringify(suggestion.proposedChange.after, null, 2)}
                        </pre>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-800">
                          <span className="font-medium">Expected Impact:</span> {suggestion.proposedChange.expectedImpact}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Teacher Note */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Add Teacher Note (Optional)
                    </label>
                    <textarea
                      value={teacherNotes[suggestion.id] || ''}
                      onChange={(e) => setTeacherNotes({
                        ...teacherNotes,
                        [suggestion.id]: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      rows={2}
                      placeholder="Optional: Add your thoughts or modifications..."
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onAccept(suggestion.id, teacherNotes[suggestion.id])}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Accept
                    </button>
                    <button
                      onClick={() => setModifyingId(suggestion.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <Edit className="w-4 h-4" />
                      Modify
                    </button>
                    <button
                      onClick={() => onReject(suggestion.id, teacherNotes[suggestion.id])}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modification Modal */}
      {modifyingId && (
        <ModificationModal
          suggestion={suggestions.find(s => s.id === modifyingId)!}
          student={getStudent(suggestions.find(s => s.id === modifyingId)!.brainId)}
          onSave={(modification, note) => {
            onModify(modifyingId, modification, note);
            setModifyingId(null);
          }}
          onCancel={() => setModifyingId(null)}
        />
      )}
    </div>
  );
}
