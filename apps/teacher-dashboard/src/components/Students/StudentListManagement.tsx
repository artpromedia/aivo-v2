import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, Plus, MoreHorizontal, Edit, Trash2, 
  Eye, Brain, Target, Calendar, Award, AlertTriangle, 
  CheckCircle, Clock, BookOpen, User, Phone, Mail,
  SortAsc, SortDesc, Download, Upload, Settings
} from 'lucide-react';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  gradeLevel: string;
  hasIEP: boolean;
  parentConsent: boolean;
  lastActive: string;
  status: 'active' | 'inactive' | 'pending';
  virtualBrainStatus?: 'active' | 'creating' | 'error' | 'none';
  parentContact?: {
    name: string;
    email: string;
    phone: string;
  };
  iepInfo?: {
    effectiveDate: string;
    nextReview: string;
    goalsCount: number;
    goalsOnTrack: number;
  };
  metrics?: {
    averageFocus: number;
    totalLearningTime: number;
    successRate: number;
    lastSessionDate: string;
  };
}

type SortField = 'name' | 'grade' | 'lastActive' | 'status';
type SortDirection = 'asc' | 'desc';
type FilterStatus = 'all' | 'active' | 'inactive' | 'pending';
type FilterIEP = 'all' | 'with-iep' | 'without-iep';

export function StudentListManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterIEP, setFilterIEP] = useState<FilterIEP>('all');
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Mock student data - in production, fetch from API
  useEffect(() => {
    const mockStudents: Student[] = [
      {
        id: '1',
        firstName: 'Emma',
        lastName: 'Johnson',
        email: 'emma.johnson@school.edu',
        gradeLevel: '3rd Grade',
        hasIEP: true,
        parentConsent: true,
        lastActive: '2024-11-02T10:30:00Z',
        status: 'active',
        virtualBrainStatus: 'active',
        parentContact: {
          name: 'Sarah Johnson',
          email: 'sarah.johnson@email.com',
          phone: '(555) 123-4567'
        },
        iepInfo: {
          effectiveDate: '2024-09-01',
          nextReview: '2025-03-15',
          goalsCount: 4,
          goalsOnTrack: 3
        },
        metrics: {
          averageFocus: 82,
          totalLearningTime: 2340,
          successRate: 85,
          lastSessionDate: '2024-11-02T09:00:00Z'
        }
      },
      {
        id: '2',
        firstName: 'Marcus',
        lastName: 'Williams',
        email: 'marcus.williams@school.edu',
        gradeLevel: '4th Grade',
        hasIEP: true,
        parentConsent: true,
        lastActive: '2024-11-01T14:15:00Z',
        status: 'active',
        virtualBrainStatus: 'active',
        parentContact: {
          name: 'Michael Williams',
          email: 'mike.williams@email.com',
          phone: '(555) 234-5678'
        },
        iepInfo: {
          effectiveDate: '2024-08-15',
          nextReview: '2025-04-20',
          goalsCount: 6,
          goalsOnTrack: 5
        },
        metrics: {
          averageFocus: 76,
          totalLearningTime: 1980,
          successRate: 78,
          lastSessionDate: '2024-11-01T13:00:00Z'
        }
      },
      {
        id: '3',
        firstName: 'Sophia',
        lastName: 'Chen',
        email: 'sophia.chen@school.edu',
        gradeLevel: '3rd Grade',
        hasIEP: false,
        parentConsent: true,
        lastActive: '2024-11-02T11:45:00Z',
        status: 'active',
        virtualBrainStatus: 'active',
        parentContact: {
          name: 'Lisa Chen',
          email: 'lisa.chen@email.com',
          phone: '(555) 345-6789'
        },
        metrics: {
          averageFocus: 88,
          totalLearningTime: 2640,
          successRate: 91,
          lastSessionDate: '2024-11-02T11:00:00Z'
        }
      },
      {
        id: '4',
        firstName: 'Aiden',
        lastName: 'Rodriguez',
        gradeLevel: '4th Grade',
        hasIEP: false,
        parentConsent: false,
        lastActive: '2024-10-28T16:20:00Z',
        status: 'pending',
        virtualBrainStatus: 'none',
        parentContact: {
          name: 'Carlos Rodriguez',
          email: 'carlos.rodriguez@email.com',
          phone: '(555) 456-7890'
        }
      }
    ];
    setStudents(mockStudents);
  }, []);

  // Filter and sort students
  useEffect(() => {
    let filtered = [...students];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(student =>
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.gradeLevel.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(student => student.status === filterStatus);
    }

    // Apply IEP filter
    if (filterIEP !== 'all') {
      filtered = filtered.filter(student => 
        filterIEP === 'with-iep' ? student.hasIEP : !student.hasIEP
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'name':
          aValue = `${a.firstName} ${a.lastName}`;
          bValue = `${b.firstName} ${b.lastName}`;
          break;
        case 'grade':
          aValue = a.gradeLevel;
          bValue = b.gradeLevel;
          break;
        case 'lastActive':
          aValue = new Date(a.lastActive);
          bValue = new Date(b.lastActive);
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = a.firstName;
          bValue = b.firstName;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredStudents(filtered);
  }, [students, searchTerm, sortField, sortDirection, filterStatus, filterIEP]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectStudent = (studentId: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const handleSelectAll = () => {
    if (selectedStudents.size === filteredStudents.length) {
      setSelectedStudents(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedStudents(new Set(filteredStudents.map(s => s.id)));
      setShowBulkActions(true);
    }
  };

  const handleExportData = () => {
    const exportData = filteredStudents.map(student => ({
      name: `${student.firstName} ${student.lastName}`,
      grade: student.gradeLevel,
      status: student.status,
      hasIEP: student.hasIEP,
      lastActive: student.lastActive,
      virtualBrainStatus: student.virtualBrainStatus || 'none'
    }));
    
    const csvContent = [
      'Name,Grade,Status,Has IEP,Last Active,Virtual Brain Status',
      ...exportData.map(row => 
        `"${row.name}","${row.grade}","${row.status}","${row.hasIEP}","${row.lastActive}","${row.virtualBrainStatus}"`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `student-data-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('Exported student data:', exportData.length, 'students');
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        console.log('Importing file:', file.name);
        // TODO: Integrate with file processing service
        alert('File import functionality will be implemented with backend integration');
      }
    };
    input.click();
  };

  const handleBulkExport = () => {
    if (selectedStudents.size === 0) {
      alert('Please select students to export');
      return;
    }
    
    const selectedStudentData = filteredStudents
      .filter(student => selectedStudents.has(student.id))
      .map(student => ({
        name: `${student.firstName} ${student.lastName}`,
        grade: student.gradeLevel,
        status: student.status,
        hasIEP: student.hasIEP,
        lastActive: student.lastActive,
        virtualBrainStatus: student.virtualBrainStatus || 'none'
      }));
    
    const csvContent = [
      'Name,Grade,Status,Has IEP,Last Active,Virtual Brain Status',
      ...selectedStudentData.map(row => 
        `"${row.name}","${row.grade}","${row.status}","${row.hasIEP}","${row.lastActive}","${row.virtualBrainStatus}"`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `selected-students-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('Exported selected students:', selectedStudentData.length, 'students');
  };

  const handleViewStudent = (studentId: string) => {
    console.log('Viewing student details:', studentId);
    const student = filteredStudents.find(s => s.id === studentId);
    if (student) {
      alert(`Opening detailed view for ${student.firstName} ${student.lastName}\n\nThis will navigate to the comprehensive student profile with academic progress, Virtual Brain analytics, and management tools.`);
      // In production: navigate to student detail view
    }
  };

  const handleEditStudent = (studentId: string) => {
    console.log('Editing student:', studentId);
    const student = filteredStudents.find(s => s.id === studentId);
    if (student) {
      alert(`Opening edit interface for ${student.firstName} ${student.lastName}\n\nThis will open the student information editor for updating:\n- Personal details\n- Academic settings\n- Virtual Brain configuration\n- Parent contact information`);
      // In production: open student edit modal or navigate to edit page
    }
  };

  const handleStudentActions = (studentId: string) => {
    console.log('Opening student actions menu:', studentId);
    const student = filteredStudents.find(s => s.id === studentId);
    if (student) {
      alert(`Student Actions Menu for ${student.firstName} ${student.lastName}:\n\n• Generate progress report\n• Schedule parent conference\n• Update IEP status\n• Manage Virtual Brain settings\n• Archive/deactivate student\n\nAction menu will be implemented as dropdown component.`);
      // In production: show dropdown menu with contextual actions
    }
  };

  const handleAddStudent = () => {
    // TODO: Open Add Student Wizard modal
    console.log('Opening Add Student Wizard...');
    alert('Add Student Wizard will open here. This will guide through student onboarding including IEP setup, parent consent, and Virtual Brain creation.');
  };

  const handleSendMessage = () => {
    if (selectedStudents.size === 0) {
      alert('Please select students to message their parents');
      return;
    }
    console.log('Opening message composer for', selectedStudents.size, 'students');
    alert(`Message composer will open for ${selectedStudents.size} selected students' parents`);
  };

  const handleUpdateStatus = () => {
    if (selectedStudents.size === 0) {
      alert('Please select students to update status');
      return;
    }
    console.log('Opening status update modal for', selectedStudents.size, 'students');
    alert(`Status update modal will open for ${selectedStudents.size} selected students`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <Clock className="h-4 w-4 text-gray-500" />;
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getBrainStatusIcon = (status?: string) => {
    switch (status) {
      case 'active':
        return <Brain className="h-4 w-4 text-purple-500" />;
      case 'creating':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 bg-gray-300 rounded" />;
    }
  };

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Users className="h-6 w-6 text-blue-600 mr-2" />
            Student Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage students, track Virtual Brain status, and monitor IEP progress
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleAddStudent}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </button>
          <button 
            onClick={handleImportData}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </button>
          <button 
            onClick={handleExportData}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{students.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Virtual Brains</p>
              <p className="text-2xl font-bold text-gray-900">
                {students.filter(s => s.virtualBrainStatus === 'active').length}
              </p>
            </div>
            <Brain className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">IEP Students</p>
              <p className="text-2xl font-bold text-gray-900">
                {students.filter(s => s.hasIEP).length}
              </p>
            </div>
            <Target className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Consent</p>
              <p className="text-2xl font-bold text-gray-900">
                {students.filter(s => !s.parentConsent).length}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-6 shadow-sm border mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
            
            <select
              value={filterIEP}
              onChange={(e) => setFilterIEP(e.target.value as FilterIEP)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Students</option>
              <option value="with-iep">With IEP</option>
              <option value="without-iep">Without IEP</option>
            </select>

            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                }`}
              >
                Grid
              </button>
            </div>
          </div>
        </div>

        {showBulkActions && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {selectedStudents.size} student(s) selected
              </p>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleSendMessage}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Send Message
                </button>
                <button 
                  onClick={handleBulkExport}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  Export Data
                </button>
                <button 
                  onClick={handleUpdateStatus}
                  className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Student List */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {viewMode === 'list' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="w-12 p-4">
                    <input
                      type="checkbox"
                      checked={selectedStudents.size === filteredStudents.length && filteredStudents.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="text-left p-4">
                    <button 
                      onClick={() => handleSort('name')}
                      className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                      Student
                      {sortField === 'name' && (sortDirection === 'asc' ? 
                        <SortAsc className="ml-1 h-4 w-4" /> : 
                        <SortDesc className="ml-1 h-4 w-4" />
                      )}
                    </button>
                  </th>
                  <th className="text-left p-4">
                    <button 
                      onClick={() => handleSort('grade')}
                      className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                      Grade
                      {sortField === 'grade' && (sortDirection === 'asc' ? 
                        <SortAsc className="ml-1 h-4 w-4" /> : 
                        <SortDesc className="ml-1 h-4 w-4" />
                      )}
                    </button>
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700">Virtual Brain</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700">IEP</th>
                  <th className="text-left p-4">
                    <button 
                      onClick={() => handleSort('lastActive')}
                      className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                      Last Active
                      {sortField === 'lastActive' && (sortDirection === 'asc' ? 
                        <SortAsc className="ml-1 h-4 w-4" /> : 
                        <SortDesc className="ml-1 h-4 w-4" />
                      )}
                    </button>
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedStudents.has(student.id)}
                        onChange={() => handleSelectStudent(student.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                          {student.firstName[0]}{student.lastName[0]}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-900">{student.gradeLevel}</td>
                    <td className="p-4">
                      <div className="flex items-center">
                        {getStatusIcon(student.status)}
                        <span className={`ml-2 text-sm font-medium ${
                          student.status === 'active' ? 'text-green-700' :
                          student.status === 'pending' ? 'text-yellow-700' :
                          'text-gray-700'
                        }`}>
                          {student.status}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center">
                        {getBrainStatusIcon(student.virtualBrainStatus)}
                        <span className="ml-2 text-sm text-gray-700 capitalize">
                          {student.virtualBrainStatus || 'none'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      {student.hasIEP ? (
                        <div className="flex items-center">
                          <Target className="h-4 w-4 text-green-500" />
                          <span className="ml-2 text-sm text-green-700">
                            {student.iepInfo?.goalsOnTrack}/{student.iepInfo?.goalsCount} goals
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">No IEP</span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-gray-700">
                      {formatLastActive(student.lastActive)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleViewStudent(student.id)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="View student details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleEditStudent(student.id)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="Edit student"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleStudentActions(student.id)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="More actions"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          // Grid view
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student) => (
              <div key={student.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedStudents.has(student.id)}
                      onChange={() => handleSelectStudent(student.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                    />
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                      {student.firstName[0]}{student.lastName[0]}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(student.status)}
                    {getBrainStatusIcon(student.virtualBrainStatus)}
                  </div>
                </div>
                
                <h3 className="font-medium text-gray-900 mb-1">
                  {student.firstName} {student.lastName}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{student.gradeLevel}</p>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>Status:</span>
                    <span className="capitalize">{student.status}</span>
                  </div>
                  
                  {student.hasIEP && (
                    <div className="flex items-center justify-between">
                      <span>IEP Goals:</span>
                      <span>{student.iepInfo?.goalsOnTrack}/{student.iepInfo?.goalsCount}</span>
                    </div>
                  )}
                  
                  {student.metrics && (
                    <div className="flex items-center justify-between">
                      <span>Avg Focus:</span>
                      <span>{student.metrics.averageFocus}%</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span>Last Active:</span>
                    <span>{formatLastActive(student.lastActive)}</span>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <button 
                    onClick={() => handleViewStudent(student.id)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View Details
                  </button>
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => handleEditStudent(student.id)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Edit student"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleStudentActions(student.id)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="More actions"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding a new student'}
          </p>
        </div>
      )}
    </div>
  );
}