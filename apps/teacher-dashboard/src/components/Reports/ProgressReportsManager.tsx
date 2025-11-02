import { useState, useEffect } from 'react';
import { Download, FileText, Calendar, Users, BarChart3, X } from 'lucide-react';

interface ProgressReport {
  id: string;
  title: string;
  type: 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'custom';
  period: string;
  studentsIncluded: number;
  generatedDate: Date;
  size: string;
  status: 'ready' | 'generating' | 'error';
}

interface ProgressReportsManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProgressReportsManager({ isOpen, onClose }: ProgressReportsManagerProps) {
  const [reports, setReports] = useState<ProgressReport[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<'weekly' | 'monthly' | 'quarterly' | 'annual' | 'custom'>('weekly');

  useEffect(() => {
    // Mock existing reports
    const mockReports: ProgressReport[] = [
      {
        id: '1',
        title: 'Weekly Progress Summary',
        type: 'weekly',
        period: 'Oct 26 - Nov 2, 2025',
        studentsIncluded: 24,
        generatedDate: new Date('2025-11-02'),
        size: '2.3 MB',
        status: 'ready'
      },
      {
        id: '2',
        title: 'Monthly Analytics Report',
        type: 'monthly',
        period: 'October 2025',
        studentsIncluded: 24,
        generatedDate: new Date('2025-11-01'),
        size: '8.7 MB',
        status: 'ready'
      },
      {
        id: '3',
        title: 'IEP Progress Review',
        type: 'quarterly',
        period: 'Q3 2025',
        studentsIncluded: 6,
        generatedDate: new Date('2025-10-15'),
        size: '12.4 MB',
        status: 'ready'
      }
    ];

    setReports(mockReports);
  }, []);

  const generateNewReport = async () => {
    setIsGenerating(true);
    
    // Simulate report generation
    const newReport: ProgressReport = {
      id: Date.now().toString(),
      title: `${selectedReportType.charAt(0).toUpperCase() + selectedReportType.slice(1)} Progress Report`,
      type: selectedReportType,
      period: selectedReportType === 'weekly' ? 'Current Week' : 
              selectedReportType === 'monthly' ? 'Current Month' :
              selectedReportType === 'quarterly' ? 'Current Quarter' : 'Current Year',
      studentsIncluded: 24,
      generatedDate: new Date(),
      size: '0 KB',
      status: 'generating'
    };

    setReports(prev => [newReport, ...prev]);

    // Simulate generation time
    setTimeout(() => {
      setReports(prev => prev.map(report => 
        report.id === newReport.id 
          ? { ...report, status: 'ready', size: `${(Math.random() * 10 + 1).toFixed(1)} MB` }
          : report
      ));
      setIsGenerating(false);
    }, 3000);
  };

  const downloadReport = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (report) {
      // In production, this would trigger actual file download
      alert(`Downloading ${report.title} (${report.size})...\n\nThe report includes:\n- Individual student progress summaries\n- Virtual Brain analytics\n- Learning milestone achievements\n- Intervention recommendations\n- Parent communication logs`);
    }
  };

  const deleteReport = (reportId: string) => {
    if (confirm('Are you sure you want to delete this report?')) {
      setReports(prev => prev.filter(r => r.id !== reportId));
    }
  };

  const getTypeIcon = (type: ProgressReport['type']) => {
    switch (type) {
      case 'weekly': return '📊';
      case 'monthly': return '📈';
      case 'quarterly': return '📋';
      case 'annual': return '📑';
      case 'custom': return '📄';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-blue-500" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Progress Reports</h2>
                <p className="text-sm text-gray-600">
                  Generate and download comprehensive student progress reports
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Generate New Report */}
        <div className="p-6 border-b border-gray-200 bg-blue-50">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Generate New Report</h3>
          <div className="flex items-center space-x-4">
            <select
              value={selectedReportType}
              onChange={(e) => setSelectedReportType(e.target.value as typeof selectedReportType)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={isGenerating}
            >
              <option value="weekly">Weekly Summary</option>
              <option value="monthly">Monthly Analytics</option>
              <option value="quarterly">Quarterly Review</option>
              <option value="annual">Annual Report</option>
              <option value="custom">Custom Range</option>
            </select>
            <button
              onClick={generateNewReport}
              disabled={isGenerating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <BarChart3 className="h-4 w-4" />
              <span>{isGenerating ? 'Generating...' : 'Generate Report'}</span>
            </button>
          </div>
        </div>

        {/* Reports List */}
        <div className="max-h-96 overflow-y-auto">
          {reports.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No reports generated yet</p>
            </div>
          ) : (
            reports.map((report) => (
              <div
                key={report.id}
                className="p-4 border-b border-gray-100 hover:bg-gray-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl mt-1">
                      {getTypeIcon(report.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{report.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{report.period}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {report.studentsIncluded} students
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {report.generatedDate.toLocaleDateString()}
                        </span>
                        <span>{report.size}</span>
                        <span className={`px-2 py-1 rounded-full ${
                          report.status === 'ready' ? 'bg-green-100 text-green-800' :
                          report.status === 'generating' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {report.status === 'ready' ? 'Ready' :
                           report.status === 'generating' ? 'Generating...' : 'Error'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {report.status === 'ready' && (
                      <button
                        onClick={() => downloadReport(report.id)}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 flex items-center space-x-1"
                      >
                        <Download className="h-3 w-3" />
                        <span>Download</span>
                      </button>
                    )}
                    <button
                      onClick={() => deleteReport(report.id)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                      disabled={report.status === 'generating'}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {report.status === 'generating' && (
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Analyzing Virtual Brain data and generating insights...
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
              {reports.length} report{reports.length !== 1 ? 's' : ''} • 
              {reports.filter(r => r.status === 'ready').length} ready for download
            </span>
            <button
              onClick={() => {
                if (confirm('Clear all reports? This cannot be undone.')) {
                  setReports([]);
                }
              }}
              className="text-red-600 hover:text-red-800"
            >
              Clear all
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}