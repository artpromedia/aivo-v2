import type { IEPGoal, VirtualBrain } from '../../types/virtual-brain';

interface GoalMapperProps {
  goal: IEPGoal;
  brain: VirtualBrain;
  onUpdateGoal?: (goal: IEPGoal) => void;
}

// Placeholder icons
const Target = ({ className }: { className?: string }) => <span className={className}>🎯</span>;
const Brain = ({ className }: { className?: string }) => <span className={className}>🧠</span>;
const CheckCircle = ({ className }: { className?: string }) => <span className={className}>✅</span>;
const Clock = ({ className }: { className?: string }) => <span className={className}>🕐</span>;

export function GoalMapper({ goal }: GoalMapperProps) {
  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusBadge = (status: IEPGoal['status']) => {
    const config = {
      active: { color: 'bg-green-100 text-green-800', label: 'Active' },
      completed: { color: 'bg-blue-100 text-blue-800', label: 'Completed' },
      modified: { color: 'bg-purple-100 text-purple-800', label: 'Modified' },
    };
    const { color, label } = config[status];
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${color}`}>
        {label}
      </span>
    );
  };

  // Match brain metrics to goal
  const relevantMetrics = goal.brainMetrics.map(metricId => {
    // This would fetch actual metric data from the brain
    return {
      id: metricId,
      value: Math.round(Math.random() * 100), // Placeholder
      label: metricId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    };
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">{goal.category}</h3>
            {getStatusBadge(goal.status)}
          </div>
          <p className="text-sm text-gray-700 mb-3">{goal.goal}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-bold text-gray-900">{goal.currentProgress}%</span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${getProgressColor(goal.currentProgress)}`}
            style={{ width: `${goal.currentProgress}%` }}
          />
        </div>
      </div>

      {/* Target Date */}
      <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
        <Clock className="w-4 h-4" />
        <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
      </div>

      {/* Brain Metrics Mapping */}
      <div className="border-t pt-4">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-5 h-5 text-purple-600" />
          <h4 className="text-sm font-semibold text-gray-900">
            Virtual Brain Metrics
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {relevantMetrics.map((metric) => (
            <div key={metric.id} className="bg-purple-50 rounded-lg p-3">
              <p className="text-xs text-purple-700 mb-1">{metric.label}</p>
              <div className="flex items-center justify-between">
                <div className="w-full bg-purple-200 rounded-full h-2 mr-3">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all"
                    style={{ width: `${metric.value}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-purple-900 whitespace-nowrap">
                  {metric.value}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Accommodations */}
      {goal.accommodations.length > 0 && (
        <div className="border-t mt-4 pt-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Accommodations</h4>
          <div className="flex flex-wrap gap-2">
            {goal.accommodations.map((accommodation, index: number) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1"
              >
                <CheckCircle className="w-3 h-3" />
                {accommodation}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
