import type { ClassroomInsights } from '../../types/virtual-brain';

interface ClassroomInsightsPanelProps {
  insights: ClassroomInsights;
}

// Placeholder icons
const Brain = ({ className }: { className?: string }) => <span className={className}>🧠</span>;
const Activity = ({ className }: { className?: string }) => <span className={className}>📊</span>;
const AlertTriangle = ({ className }: { className?: string }) => <span className={className}>⚠️</span>;
const FileText = ({ className }: { className?: string }) => <span className={className}>📄</span>;
const Calendar = ({ className }: { className?: string }) => <span className={className}>📅</span>;
const TrendingUp = ({ className }: { className?: string }) => <span className={className}>📈</span>;
const TrendingDown = ({ className }: { className?: string }) => <span className={className}>📉</span>;
const Minus = ({ className }: { className?: string }) => <span className={className}>➖</span>;

export function ClassroomInsightsPanel({ insights }: ClassroomInsightsPanelProps) {
  const getTrendIcon = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'stable':
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      case 'stable':
        return 'text-gray-600';
    }
  };

  const getFocusColor = (focus: number) => {
    if (focus >= 70) return 'text-green-600 bg-green-50';
    if (focus >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Classroom Brain Insights</h2>
      
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Active Brains */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Brain className="w-8 h-8" />
            <span className={`text-2xl font-bold text-blue-900 ${insights.totalBrainsActive > 0 ? 'animate-pulse-soft' : ''}`}>
              {insights.totalBrainsActive}
            </span>
          </div>
          <p className="text-sm font-medium text-blue-800">Virtual Brains Active</p>
        </div>

        {/* Average Focus */}
        <div className={`rounded-lg p-4 ${getFocusColor(insights.averageFocus)}`}>
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-8 h-8" />
            <span className="text-2xl font-bold">
              {insights.averageFocus}%
            </span>
          </div>
          <p className="text-sm font-medium">Average Classroom Focus</p>
        </div>

        {/* Interventions Needed */}
        <div className={`rounded-lg p-4 ${
          insights.brainsNeedingIntervention > 0 ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-8 h-8" />
            <span className="text-2xl font-bold">
              {insights.brainsNeedingIntervention}
            </span>
          </div>
          <p className="text-sm font-medium">
            {insights.brainsNeedingIntervention === 1 ? 'Brain Needs' : 'Brains Need'} Intervention
          </p>
        </div>

        {/* Documents Processing */}
        <div className="bg-purple-50 text-purple-600 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-8 h-8" />
            <span className="text-2xl font-bold">
              {insights.documentsBeingProcessed}
            </span>
          </div>
          <p className="text-sm font-medium">Documents Processing</p>
        </div>

        {/* Next IEP Review */}
        {insights.nextIEPReview && (
          <div className="bg-indigo-50 text-indigo-600 rounded-lg p-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium mb-1">Next IEP Review</p>
                <p className="text-lg font-bold">
                  {new Date(insights.nextIEPReview).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Trends */}
      {insights.trends.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent Trends</h3>
          <div className="space-y-2">
            {insights.trends.map((trend, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getTrendIcon(trend.direction)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{trend.metric}</p>
                    <p className="text-xs text-gray-500">{trend.period}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${getTrendColor(trend.direction)}`}>
                    {trend.direction === 'up' ? '+' : trend.direction === 'down' ? '-' : ''}
                    {Math.abs(trend.change)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
