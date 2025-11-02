import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, Calendar, CheckCircle, AlertCircle, Brain, FileText, Users, Search, Loader2, Plus, BookOpen, Edit3, Save, X, Wand2, Settings, Download, Upload } from 'lucide-react';

// Types matching the agent interface
interface IEPGoal {
  id: string;
  domain: string;
  description: string;
  measurableObjective: string;
  targetDate: Date;
  currentLevel: string;
  targetLevel: string;
  evaluationMethod: string;
  frequency: string;
  criteria: string;
  progress: Array<{
    date: Date;
    score: number;
    notes: string;
    reportedBy: string;
  }>;
  status: 'active' | 'met' | 'discontinued' | 'revised';
  accommodations: string[];
  services: string[];
}

interface IEPStudent {
  id: string;
  firstName: string;
  lastName: string;
  gradeLevel: string;
  disabilities: string[];
  hasIEP: boolean;
  iepEffectiveDate?: Date;
  nextReviewDate?: Date;
  goals: IEPGoal[];
}

interface AssessmentReport {
  studentId: string;
  overallScore: number;
  domainScores: Record<string, number>;
  recommendations: string[];
  strengths: string[];
  challenges: string[];
  completedAt: Date;
}

export function IEPAgentInterface() {
  const [activeTab, setActiveTab] = useState<'overview' | 'goals' | 'templates' | 'compliance' | 'reports'>('overview');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedGoalDomain, setSelectedGoalDomain] = useState<string>('');
  const [currentLevel, setCurrentLevel] = useState<string>('');
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [meetingNotes, setMeetingNotes] = useState<string>('');
  const [generatedReport, setGeneratedReport] = useState<string>('');

  // Mock data - in production, fetch from API
  const [iepStudents] = useState<IEPStudent[]>([
    {
      id: '1',
      firstName: 'Emma',
      lastName: 'Johnson',
      gradeLevel: '3rd Grade',
      disabilities: ['Specific Learning Disability', 'ADHD'],
      hasIEP: true,
      iepEffectiveDate: new Date('2024-09-01'),
      nextReviewDate: new Date('2025-03-15'),
      goals: [
        {
          id: 'goal-1',
          domain: 'Reading Comprehension',
          description: 'Reading fluency and comprehension',
          measurableObjective: 'By March 2025, Emma will read grade-level text with 80% accuracy and demonstrate comprehension by answering 4 out of 5 questions correctly.',
          targetDate: new Date('2025-03-15'),
          currentLevel: '2nd grade level, 65% accuracy',
          targetLevel: '3rd grade level, 80% accuracy',
          evaluationMethod: 'Weekly reading assessments and comprehension checks',
          frequency: 'Weekly',
          criteria: '80% accuracy over 3 consecutive weeks',
          progress: [
            { date: new Date('2024-11-01'), score: 68, notes: 'Showing improvement in sight word recognition', reportedBy: 'Ms. Johnson' },
            { date: new Date('2024-11-08'), score: 72, notes: 'Better focus during reading activities', reportedBy: 'Ms. Johnson' }
          ],
          status: 'active',
          accommodations: ['Extended time', 'Quiet environment', 'Visual aids'],
          services: ['Special Education Support', 'Reading Intervention']
        }
      ]
    },
    {
      id: '2',
      firstName: 'Marcus',
      lastName: 'Williams',
      gradeLevel: '4th Grade',
      disabilities: ['Autism Spectrum Disorder'],
      hasIEP: true,
      iepEffectiveDate: new Date('2024-08-15'),
      nextReviewDate: new Date('2025-04-20'),
      goals: []
    }
  ]);

  const domains = [
    'Reading Comprehension',
    'Written Expression',
    'Mathematics',
    'Social/Emotional',
    'Communication',
    'Behavioral',
    'Motor Skills',
    'Adaptive Behavior'
  ];

  // Mock IEP agent functions - in production, use actual IEPAssistantAgent
  const generateGoals = async (domain: string, currentLevel: string, studentId: string) => {
    setIsGenerating(true);
    try {
      // Simulate API call to IEP agent
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock generated goals
      const mockGoals: Partial<IEPGoal>[] = [
        {
          domain,
          description: `${domain} improvement goal`,
          measurableObjective: `By the end of the IEP year, the student will improve ${domain.toLowerCase()} skills from current level to grade-appropriate level with 80% accuracy.`,
          targetLevel: 'Grade-appropriate level with 80% accuracy',
          currentLevel,
          evaluationMethod: 'Weekly assessments and data collection',
          frequency: 'Weekly',
          criteria: '80% accuracy over 3 consecutive weeks',
          accommodations: ['Extended time', 'Visual supports', 'Frequent breaks'],
          services: ['Special Education Support']
        }
      ];

      return mockGoals;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateProgressReport = async (goals: IEPGoal[]) => {
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const report = `
IEP PROGRESS REPORT
Student: ${selectedStudent}
Report Date: ${new Date().toLocaleDateString()}
Reporting Period: Current Quarter

EXECUTIVE SUMMARY:
The student continues to make steady progress toward IEP goals with consistent support and accommodations. Virtual Brain adaptations have been particularly effective in maintaining engagement.

GOAL PROGRESS:
${goals.map(goal => `
• ${goal.description}
  Current Performance: ${goal.progress.length > 0 ? goal.progress[goal.progress.length - 1].score + '%' : 'Baseline'}
  Target: ${goal.criteria}
  Status: ${goal.status}
  Virtual Brain Adaptations: 15 adaptations made this quarter
`).join('\n')}

RECOMMENDATIONS:
- Continue current intervention strategies
- Increase complexity gradually as mastery is demonstrated
- Maintain consistent Virtual Brain monitoring
- Schedule parent conference to discuss progress

Next Review Date: ${goals[0]?.targetDate.toLocaleDateString() || 'TBD'}
      `;
      
      setGeneratedReport(report.trim());
    } finally {
      setIsGenerating(false);
    }
  };

  const checkCompliance = async (studentId: string) => {
    // Mock compliance check
    return {
      compliant: true,
      issues: [],
      suggestions: ['Consider adding more specific measurement criteria']
    };
  };

  const summarizeMeetingNotes = async (notes: string) => {
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return `
MEETING SUMMARY:
Key Discussion Points:
- Student progress review
- Goal adjustments needed
- Parent concerns addressed
- Service delivery updates

Action Items:
- Update goal criteria for reading comprehension
- Schedule additional speech therapy sessions
- Provide parents with home practice materials
- Monitor Virtual Brain adaptations more closely

Decisions Made:
- Approved continued services as outlined
- Modified timeline for mathematics goal
- Added additional accommodation for testing
      `;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateGoals = async () => {
    if (!selectedStudent || !selectedGoalDomain || !currentLevel) {
      alert('Please select a student, domain, and enter current level');
      return;
    }
    
    try {
      const goals = await generateGoals(selectedGoalDomain, currentLevel, selectedStudent);
      alert(`Generated ${goals.length} goal(s) for ${selectedGoalDomain}`);
      setShowGoalForm(false);
      setSelectedGoalDomain('');
      setCurrentLevel('');
    } catch (error) {
      alert('Error generating goals: ' + error);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedStudent) {
      alert('Please select a student first');
      return;
    }
    
    const student = iepStudents.find(s => s.id === selectedStudent);
    if (student && student.goals.length > 0) {
      await generateProgressReport(student.goals);
    } else {
      alert('No goals found for selected student');
    }
  };

  const handleSummarizeNotes = async () => {
    if (!meetingNotes.trim()) {
      alert('Please enter meeting notes first');
      return;
    }
    
    const summary = await summarizeMeetingNotes(meetingNotes);
    setGeneratedReport(summary);
  };

  const handleDownloadReport = () => {
    if (!generatedReport) return;
    
    const student = iepStudents.find(s => s.id === selectedStudent);
    const studentName = student ? `${student.firstName}_${student.lastName}` : 'Unknown_Student';
    const timestamp = new Date().toISOString().split('T')[0];
    
    // Create downloadable content
    const reportContent = `
IEP Progress Report
Student: ${student ? `${student.firstName} ${student.lastName}` : 'Unknown Student'}
Generated: ${new Date().toLocaleDateString()}

${generatedReport}

---
Generated by AIVO AI IEP Assistant
    `.trim();

    // Create and download file
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `IEP_Progress_Report_${studentName}_${timestamp}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleUseTemplate = (domain: string) => {
    const templates = {
      'Reading': 'By [date], when given grade-level text, [student] will demonstrate reading comprehension by answering 4 out of 5 literal and inferential questions with 80% accuracy across 3 consecutive trials.',
      'Mathematics': 'By [date], when presented with [specific math skill], [student] will solve problems with 80% accuracy across 4 out of 5 trials over 3 consecutive weeks.',
      'Writing': 'By [date], when given a writing prompt, [student] will compose a paragraph with topic sentence, 3 supporting details, and concluding sentence with 80% accuracy across 3 consecutive samples.',
      'Social Skills': 'By [date], during structured social interactions, [student] will demonstrate appropriate peer interaction skills including turn-taking and active listening in 4 out of 5 opportunities across 3 consecutive weeks.',
      'Behavior': 'By [date], when faced with a challenging situation, [student] will use appropriate coping strategies (deep breathing, asking for help, taking a break) with 80% success across 4 out of 5 opportunities.',
      'Communication': 'By [date], when engaging in conversation, [student] will use appropriate pragmatic language skills including eye contact, topic maintenance, and turn-taking with 80% accuracy across 4 out of 5 interactions.'
    };

    const template = templates[domain as keyof typeof templates] || `SMART goal template for ${domain}`;
    
    // Set the selected goal domain and copy template to current level field
    setSelectedGoalDomain(domain);
    setCurrentLevel(template);
    
    // Scroll to the goal generation section
    const goalSection = document.querySelector('[data-section="goal-generation"]');
    if (goalSection) {
      goalSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const selectedStudentData = iepStudents.find(s => s.id === selectedStudent);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Wand2 className="h-6 w-6 text-purple-600 mr-2" />
            IEP Assistant Agent
          </h1>
          <p className="text-gray-600 mt-1">
            AI-powered IEP management, goal generation, and compliance support
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select 
            value={selectedStudent} 
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="">Select Student</option>
            {iepStudents.map(student => (
              <option key={student.id} value={student.id}>
                {student.firstName} {student.lastName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Target },
            { id: 'goals', label: 'Goal Generation', icon: Plus },
            { id: 'templates', label: 'Templates', icon: BookOpen },
            { id: 'compliance', label: 'Compliance', icon: CheckCircle },
            { id: 'reports', label: 'Reports', icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total IEP Students</p>
                  <p className="text-2xl font-bold text-gray-900">{iepStudents.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Goals</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {iepStudents.reduce((acc, student) => acc + student.goals.filter(g => g.status === 'active').length, 0)}
                  </p>
                </div>
                <Target className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Upcoming Reviews</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {iepStudents.filter(s => s.nextReviewDate && s.nextReviewDate < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-orange-500" />
              </div>
            </div>
          </div>

          {selectedStudentData && (
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {selectedStudentData.firstName} {selectedStudentData.lastName} - IEP Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Student Information</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Grade: {selectedStudentData.gradeLevel}</p>
                    <p>Disabilities: {selectedStudentData.disabilities.join(', ')}</p>
                    <p>IEP Effective: {selectedStudentData.iepEffectiveDate?.toLocaleDateString()}</p>
                    <p>Next Review: {selectedStudentData.nextReviewDate?.toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Goal Summary</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Total Goals: {selectedStudentData.goals.length}</p>
                    <p>Active: {selectedStudentData.goals.filter(g => g.status === 'active').length}</p>
                    <p>Met: {selectedStudentData.goals.filter(g => g.status === 'met').length}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'goals' && (
        <div className="space-y-6">
          <div data-section="goal-generation" className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Goal Generation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Domain</label>
                <select
                  value={selectedGoalDomain}
                  onChange={(e) => setSelectedGoalDomain(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Select Domain</option>
                  {domains.map(domain => (
                    <option key={domain} value={domain}>{domain}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Performance Level</label>
                <input
                  type="text"
                  value={currentLevel}
                  onChange={(e) => setCurrentLevel(e.target.value)}
                  placeholder="e.g., 2nd grade level, 65% accuracy"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>
            <button
              onClick={handleGenerateGoals}
              disabled={isGenerating || !selectedStudent || !selectedGoalDomain || !currentLevel}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 flex items-center"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Goals...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate SMART Goals
                </>
              )}
            </button>
          </div>

          {selectedStudentData && selectedStudentData.goals.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Goals</h3>
              <div className="space-y-4">
                {selectedStudentData.goals.map(goal => (
                  <div key={goal.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{goal.description}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        goal.status === 'active' ? 'bg-green-100 text-green-800' :
                        goal.status === 'met' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {goal.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{goal.measurableObjective}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <p><strong>Current Level:</strong> {goal.currentLevel}</p>
                        <p><strong>Target Level:</strong> {goal.targetLevel}</p>
                      </div>
                      <div>
                        <p><strong>Evaluation:</strong> {goal.evaluationMethod}</p>
                        <p><strong>Frequency:</strong> {goal.frequency}</p>
                      </div>
                    </div>
                    {goal.progress.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-sm font-medium text-gray-700 mb-2">Recent Progress:</p>
                        <div className="text-sm text-gray-600">
                          {goal.progress[goal.progress.length - 1].score}% - {goal.progress[goal.progress.length - 1].notes}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Report Generation</h3>
            <div className="flex items-center space-x-4 mb-4">
              <button
                onClick={handleGenerateReport}
                disabled={isGenerating || !selectedStudent}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 flex items-center"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Progress Report
                  </>
                )}
              </button>
              {generatedReport && (
                <button 
                  onClick={handleDownloadReport}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Meeting Notes Summarization</h3>
            <textarea
              value={meetingNotes}
              onChange={(e) => setMeetingNotes(e.target.value)}
              placeholder="Enter IEP meeting notes here..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 mb-4"
            />
            <button
              onClick={handleSummarizeNotes}
              disabled={isGenerating || !meetingNotes.trim()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 flex items-center"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Summarizing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Summarize Notes
                </>
              )}
            </button>
          </div>

          {generatedReport && (
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Report</h3>
              <div className="bg-gray-50 rounded-lg p-4 border">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                  {generatedReport}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'compliance' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">IEP Compliance Check</h3>
            <p className="text-gray-600 mb-4">
              AI-powered compliance checking to ensure IEPs meet federal and state requirements
            </p>
            <button
              onClick={() => selectedStudent && checkCompliance(selectedStudent)}
              disabled={!selectedStudent}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 flex items-center"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Run Compliance Check
            </button>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Status</h3>
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span>All IEPs are compliant</span>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>Last compliance check: {new Date().toLocaleDateString()}</p>
              <p>Next scheduled check: {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">IEP Templates</h3>
            <p className="text-gray-600 mb-4">
              AI-generated IEP templates based on assessment data and student profiles
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {domains.map(domain => (
                <div key={domain} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                  <h4 className="font-medium text-gray-900 mb-2">{domain}</h4>
                  <p className="text-sm text-gray-600 mb-3">SMART goal template for {domain.toLowerCase()}</p>
                  <button 
                    onClick={() => handleUseTemplate(domain)}
                    className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                  >
                    Use Template
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}