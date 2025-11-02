import React, { useState, useEffect } from 'react';
import {
  MessageSquare, Send, Users, QrCode, Mail, Phone, Calendar,
  CheckCircle, Clock, AlertTriangle, Plus, Search, Filter,
  Download, Eye, Edit, Trash2, Share, UserPlus, Copy,
  Bell, Settings, Archive, Star, Paperclip, Image, Video
} from 'lucide-react';

interface Parent {
  id: string;
  name: string;
  email: string;
  phone?: string;
  students: string[];
  status: 'connected' | 'invited' | 'inactive';
  lastActive?: string;
  preferredMethod: 'email' | 'sms' | 'app';
}

interface Message {
  id: string;
  parentId: string;
  parentName: string;
  subject: string;
  content: string;
  timestamp: string;
  type: 'sent' | 'received';
  status: 'delivered' | 'read' | 'pending';
  attachments?: Array<{ name: string; size: string; type: string }>;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

interface ClassroomCode {
  id: string;
  code: string;
  type: 'class' | 'individual';
  expiresAt: string;
  usageCount: number;
  maxUsage: number;
  isActive: boolean;
}

export function ParentCommunicationHub() {
  const [activeTab, setActiveTab] = useState<'messages' | 'invitations' | 'codes' | 'analytics'>('messages');
  const [parents, setParents] = useState<Parent[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [codes, setCodes] = useState<ClassroomCode[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedParents, setSelectedParents] = useState<Set<string>>(new Set());
  const [newMessage, setNewMessage] = useState({ subject: '', content: '', priority: 'normal' as const });

  // Communication action handlers
  const handleViewMessage = (messageId: string) => {
    console.log('Viewing message:', messageId);
    const message = messages.find(m => m.id === messageId);
    if (message) {
      alert(`Message from ${message.parentName}: ${message.subject}\n\n${message.content.substring(0, 200)}...`);
      // In production: open message detail modal or mark as read
    }
  };

  const handleReplyToMessage = (messageId: string) => {
    console.log('Replying to message:', messageId);
    const message = messages.find(m => m.id === messageId);
    if (message) {
      setNewMessage({
        subject: `Re: ${message.subject}`,
        content: `\n\n--- Original Message ---\nFrom: ${message.parentName}\nDate: ${new Date(message.timestamp).toLocaleString()}\n${message.content}`,
        priority: 'normal'
      });
      setShowComposeModal(true);
    }
  };

  const handleStarMessage = (messageId: string) => {
    console.log('Starring message:', messageId);
    const message = messages.find(m => m.id === messageId);
    if (message) {
      alert(`Message "${message.subject}" has been starred for follow-up.`);
      // In production: add starred property to message interface and update state
    }
  };

  const handleSendMessageToParent = (parentId: string) => {
    console.log('Sending message to parent:', parentId);
    const parent = parents.find(p => p.id === parentId);
    if (parent) {
      setNewMessage({
        subject: `Message for ${parent.name}`,
        content: '',
        priority: 'normal'
      });
      setSelectedParents(new Set([parentId]));
      setShowComposeModal(true);
    }
  };

  const handleEditParent = (parentId: string) => {
    console.log('Editing parent:', parentId);
    const parent = parents.find(p => p.id === parentId);
    if (parent) {
      alert(`Edit parent: ${parent.name}\nEmail: ${parent.email}\nPhone: ${parent.phone}\n\nEdit functionality will be implemented with parent management modal.`);
    }
  };

  const handleDeleteParent = (parentId: string) => {
    console.log('Deleting parent:', parentId);
    const parent = parents.find(p => p.id === parentId);
    if (parent && confirm(`Are you sure you want to remove ${parent.name} from the communication list?`)) {
      setParents(prev => prev.filter(p => p.id !== parentId));
      alert(`${parent.name} has been removed from the parent communication list.`);
    }
  };

  const handleAttachFile = () => {
    console.log('Attaching file to message');
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.jpg,.png,.txt';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        console.log('File selected:', file.name);
        alert(`File "${file.name}" attached to message. File attachments will be processed in production.`);
      }
    };
    input.click();
  };

  const handleAttachImage = () => {
    console.log('Attaching image to message');
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        console.log('Image selected:', file.name);
        alert(`Image "${file.name}" attached to message. Image attachments will be processed in production.`);
      }
    };
    input.click();
  };

  // Mock data initialization
  useEffect(() => {
    const mockParents: Parent[] = [
      {
        id: '1',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '(555) 123-4567',
        students: ['Emma Johnson'],
        status: 'connected',
        lastActive: '2024-11-02T10:30:00Z',
        preferredMethod: 'email'
      },
      {
        id: '2',
        name: 'Michael Williams',
        email: 'mike.williams@email.com',
        phone: '(555) 234-5678',
        students: ['Marcus Williams'],
        status: 'connected',
        lastActive: '2024-11-01T14:15:00Z',
        preferredMethod: 'app'
      },
      {
        id: '3',
        name: 'Lisa Chen',
        email: 'lisa.chen@email.com',
        students: ['Sophia Chen'],
        status: 'invited',
        preferredMethod: 'email'
      },
      {
        id: '4',
        name: 'Carlos Rodriguez',
        email: 'carlos.rodriguez@email.com',
        phone: '(555) 456-7890',
        students: ['Aiden Rodriguez'],
        status: 'inactive',
        preferredMethod: 'sms'
      }
    ];

    const mockMessages: Message[] = [
      {
        id: '1',
        parentId: '1',
        parentName: 'Sarah Johnson',
        subject: 'Emma\'s Progress Update',
        content: 'Thank you for the detailed progress report. We\'ve noticed Emma is more engaged with her math homework at home.',
        timestamp: '2024-11-02T09:15:00Z',
        type: 'received',
        status: 'read',
        priority: 'normal'
      },
      {
        id: '2',
        parentId: '2',
        parentName: 'Michael Williams',
        subject: 'IEP Meeting Follow-up',
        content: 'Following our IEP meeting, I wanted to confirm the accommodation adjustments for Marcus. The extra time for tests will be very helpful.',
        timestamp: '2024-11-01T16:30:00Z',
        type: 'received',
        status: 'read',
        priority: 'high'
      }
    ];

    const mockCodes: ClassroomCode[] = [
      {
        id: '1',
        code: 'CLASS2024A',
        type: 'class',
        expiresAt: '2024-12-31T23:59:59Z',
        usageCount: 12,
        maxUsage: 30,
        isActive: true
      },
      {
        id: '2',
        code: 'EMMA2024',
        type: 'individual',
        expiresAt: '2024-11-15T23:59:59Z',
        usageCount: 1,
        maxUsage: 1,
        isActive: false
      }
    ];

    setParents(mockParents);
    setMessages(mockMessages);
    setCodes(mockCodes);
  }, []);

  const generateClassroomCode = () => {
    const code = 'CLASS' + Math.random().toString(36).substr(2, 6).toUpperCase();
    const newCode: ClassroomCode = {
      id: Date.now().toString(),
      code,
      type: 'class',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      usageCount: 0,
      maxUsage: 50,
      isActive: true
    };
    setCodes([...codes, newCode]);
  };

  const generateQRCode = (code: string) => {
    // In production, generate actual QR code
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://aivo.app/join/${code}`)}`;
    window.open(qrUrl, '_blank');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const sendBulkMessage = () => {
    if (selectedParents.size === 0) {
      alert('Please select parents to send message to');
      return;
    }
    // In production, send actual messages
    alert(`Message sent to ${selectedParents.size} parent(s)`);
    setShowComposeModal(false);
    setSelectedParents(new Set());
    setNewMessage({ subject: '', content: '', priority: 'normal' });
  };

  const sendInvitation = (parentEmail: string, studentName: string) => {
    // In production, send actual invitation
    alert(`Invitation sent to ${parentEmail} for ${studentName}`);
    setShowInviteModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'invited': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-4 border-red-500 bg-red-50';
      case 'high': return 'border-l-4 border-orange-500 bg-orange-50';
      case 'normal': return 'border-l-4 border-blue-500 bg-blue-50';
      case 'low': return 'border-l-4 border-gray-500 bg-gray-50';
      default: return 'border-l-4 border-gray-300 bg-gray-50';
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <MessageSquare className="h-6 w-6 text-green-600 mr-2" />
            Parent Communication Hub
          </h1>
          <p className="text-gray-600 mt-1">
            Manage parent communications, invitations, and engagement tracking
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowComposeModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Send className="h-4 w-4 mr-2" />
            Compose Message
          </button>
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Parent
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'messages', label: 'Messages', icon: MessageSquare },
            { id: 'invitations', label: 'Parent Management', icon: Users },
            { id: 'codes', label: 'QR Codes', icon: QrCode },
            { id: 'analytics', label: 'Engagement Analytics', icon: Bell }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
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

      {/* Messages Tab */}
      {activeTab === 'messages' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Messages</h3>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <select className="px-3 py-2 border border-gray-300 rounded-lg">
                  <option>All Messages</option>
                  <option>Unread</option>
                  <option>High Priority</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-3">
              {messages.map((message) => (
                <div key={message.id} className={`p-4 rounded-lg ${getPriorityColor(message.priority)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium text-gray-900">{message.parentName}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          message.type === 'sent' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {message.type}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          message.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                          message.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {message.priority}
                        </span>
                      </div>
                      <h5 className="font-medium text-gray-800 mb-1">{message.subject}</h5>
                      <p className="text-sm text-gray-600 mb-2">{message.content}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{new Date(message.timestamp).toLocaleString()}</span>
                        <span className="flex items-center">
                          {message.status === 'read' && <CheckCircle className="h-3 w-3 text-green-500 mr-1" />}
                          {message.status === 'delivered' && <CheckCircle className="h-3 w-3 text-blue-500 mr-1" />}
                          {message.status === 'pending' && <Clock className="h-3 w-3 text-yellow-500 mr-1" />}
                          {message.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewMessage(message.id)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="View message"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleReplyToMessage(message.id)}
                        className="p-1 text-gray-400 hover:text-green-600"
                        title="Reply to message"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleStarMessage(message.id)}
                        className="p-1 text-gray-400 hover:text-yellow-600"
                        title="Star message"
                      >
                        <Star className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Parent Management Tab */}
      {activeTab === 'invitations' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
              <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{parents.filter(p => p.status === 'connected').length}</p>
              <p className="text-sm text-gray-600">Connected Parents</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
              <Clock className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{parents.filter(p => p.status === 'invited').length}</p>
              <p className="text-sm text-gray-600">Pending Invitations</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{parents.filter(p => p.status === 'inactive').length}</p>
              <p className="text-sm text-gray-600">Inactive Parents</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Parent Directory</h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedParents(new Set(parents.map(p => p.id)));
                      } else {
                        setSelectedParents(new Set());
                      }
                    }}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-600">Select All</span>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="w-12 p-4"></th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Parent</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Students</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Contact</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Last Active</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {parents.map((parent) => (
                    <tr key={parent.id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedParents.has(parent.id)}
                          onChange={(e) => {
                            const newSelected = new Set(selectedParents);
                            if (e.target.checked) {
                              newSelected.add(parent.id);
                            } else {
                              newSelected.delete(parent.id);
                            }
                            setSelectedParents(newSelected);
                          }}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                            {parent.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="ml-3">
                            <p className="font-medium text-gray-900">{parent.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-900">
                        {parent.students.join(', ')}
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <p className="text-gray-900">{parent.email}</p>
                          {parent.phone && <p className="text-gray-600">{parent.phone}</p>}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(parent.status)}`}>
                          {parent.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {parent.lastActive ? new Date(parent.lastActive).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleSendMessageToParent(parent.id)}
                            className="p-1 text-gray-400 hover:text-green-600"
                            title="Send message"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleEditParent(parent.id)}
                            className="p-1 text-gray-400 hover:text-blue-600"
                            title="Edit parent"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteParent(parent.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                            title="Remove parent"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* QR Codes Tab */}
      {activeTab === 'codes' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Classroom Join Codes</h3>
              <button
                onClick={generateClassroomCode}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Generate New Code
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {codes.map((code) => (
                <div key={code.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900 text-lg">{code.code}</h4>
                      <p className="text-sm text-gray-600 capitalize">{code.type} invitation</p>
                    </div>
                    <div className={`px-2 py-1 text-xs rounded-full ${
                      code.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {code.isActive ? 'Active' : 'Expired'}
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex justify-between">
                      <span>Usage:</span>
                      <span>{code.usageCount}/{code.maxUsage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Expires:</span>
                      <span>{new Date(code.expiresAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => copyToClipboard(code.code)}
                      className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 flex items-center justify-center"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Code
                    </button>
                    <button
                      onClick={() => generateQRCode(code.code)}
                      className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 flex items-center justify-center"
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      QR Code
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
              <Mail className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">142</p>
              <p className="text-sm text-gray-600">Messages Sent (30d)</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">89%</p>
              <p className="text-sm text-gray-600">Response Rate</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
              <Eye className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">94%</p>
              <p className="text-sm text-gray-600">Read Rate</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
              <Users className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">76%</p>
              <p className="text-sm text-gray-600">Active Parents</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Communication Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <Mail className="h-12 w-12 text-blue-500 mx-auto mb-3" />
                <p className="text-xl font-bold text-gray-900">65%</p>
                <p className="text-sm text-gray-600">Prefer Email</p>
              </div>
              <div className="text-center">
                <Phone className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-xl font-bold text-gray-900">25%</p>
                <p className="text-sm text-gray-600">Prefer SMS</p>
              </div>
              <div className="text-center">
                <Bell className="h-12 w-12 text-purple-500 mx-auto mb-3" />
                <p className="text-xl font-bold text-gray-900">10%</p>
                <p className="text-sm text-gray-600">App Notifications</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compose Message Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Compose Message</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
                <p className="text-sm text-gray-600">{selectedParents.size} parent(s) selected</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={newMessage.priority}
                  onChange={(e) => setNewMessage({ ...newMessage, priority: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                  placeholder="Enter message subject"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  value={newMessage.content}
                  onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                  placeholder="Enter your message"
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
                <button 
                  onClick={handleAttachFile}
                  className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded"
                  title="Attach file"
                >
                  <Paperclip className="h-4 w-4" />
                </button>
                <button 
                  onClick={handleAttachImage}
                  className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded"
                  title="Attach image"
                >
                  <Image className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowComposeModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={sendBulkMessage}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}