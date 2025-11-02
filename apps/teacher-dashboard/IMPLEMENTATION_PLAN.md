# Teacher Dashboard Implementation Plan

## Status: Teacher Dashboard Development Server Running ✅
- **URL**: http://localhost:5173/
- **Server**: Rolldown-Vite v7.1.14
- **Phase 1 MVP**: Complete (Virtual Brain Grid, Insights Panel, Suggestions Queue)
- **Current Phase**: Adding Complete Student Onboarding & Virtual Brain Creation Flow

## Completed Components (Phase 1):
✅ Virtual Brain Grid with drag-and-drop
✅ Classroom Insights Panel
✅ IEP Assistant Goal Mapper
✅ Brain Suggestions Queue
✅ Main Dashboard Page with tabs
✅ Complete type system
✅ Tailwind CSS configuration

## Implementation Progress:

### Phase 2: Student Onboarding & Virtual Brain Creation

#### 1. Student Onboarding Wizard ✅ (Shell Created)
**Status**: AddStudentWizard.tsx created - needs step components

**Remaining Step Components**:
- [ ] `BasicInfo.tsx` - First/last name, DOB, grade, student ID
- [ ] `LocationDetection.tsx` - ZIP code detection, district/curriculum selection
- [ ] `LearningProfile.tsx` - IEP upload, disabilities, learning preferences
- [ ] `ConsentCompliance.tsx` - COPPA/FERPA consent, parent notification
- [ ] `LicenseAllocation.tsx` - District/parent/trial license selection

**Step Component Interface**:
```typescript
interface StepProps {
  data: Partial<TeacherStudent>;
  onNext: (data: Partial<TeacherStudent>) => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}
```

#### 2. Assessment Administration Interface
**Components Needed**:
- [ ] `AssessmentInterface.tsx` - Main container
- [ ] `ModeSelector.tsx` - Independent/assisted/remote selection
- [ ] `TeacherAssistedView.tsx` - Question display with observations
- [ ] `StudentIndependentView.tsx` - Live monitoring interface
- [ ] `AssessmentMonitor.tsx` - Real-time progress tracking
- [ ] `InterventionPanel.tsx` - Send encouragement/hints

#### 3. Virtual Brain Creation Flow
**Components Needed**:
- [ ] `BrainCreation.tsx` - Main creation interface
- [ ] `CreationStages.tsx` - 5-stage progress display
  - Analyzing assessment results
  - Cloning from master model
  - Personalizing for student
  - Testing & validation
  - Ready & active
- [ ] `PostCreationActions.tsx` - Invite parent, assign lesson, configure

#### 4. Document Distribution Center
**Components Needed**:
- [ ] `DocumentUpload.tsx` - Drag-drop file upload
- [ ] `FileProcessor.tsx` - Processing status display
- [ ] `DistributionSettings.tsx` - Recipient/adaptation/schedule options
- [ ] `DistributionPreview.tsx` - Show how content adapts per student

#### 5. IEP Management System
**Components Needed**:
- [ ] `IEPDashboard.tsx` - Overview with stats
- [ ] `GoalTracking.tsx` - Individual goal progress
- [ ] `BrainAlignment.tsx` - Virtual Brain alignment scoring
- [ ] `IEPReportGenerator.tsx` - Generate progress reports

#### 6. Parent Engagement Hub
**Components Needed**:
- [ ] `ParentInvitationWizard.tsx` - Individual/bulk/QR invite methods
- [ ] `QRCodeGenerator.tsx` - Classroom join QR codes
- [ ] `EngagementTracking.tsx` - Parent connection status
- [ ] `CommunicationHub.tsx` - Teacher-parent messaging

### Services & Hooks to Create:

#### Services (`src/services/`):
```typescript
// virtualBrainService.ts
export const virtualBrainService = {
  createBrain: (student: TeacherStudent) => Promise<VirtualBrain>,
  monitorCreation: (brainId: string) => Observable<CreationStage>,
  getBrainFleetStatus: (classroomId: string) => Promise<BrainFleetStats>,
  pauseBrain: (brainId: string) => Promise<void>,
  resumeBrain: (brainId: string) => Promise<void>
};

// assessmentService.ts
export const assessmentService = {
  startAssessment: (studentId: string, mode: AssessmentMode) => Promise<string>,
  getQuestion: (assessmentId: string) => Promise<AssessmentQuestion>,
  submitAnswer: (assessmentId: string, answer: any) => Promise<void>,
  completeAssessment: (assessmentId: string) => Promise<AssessmentResults>,
  monitorProgress: (assessmentId: string) => Observable<AssessmentProgress>
};

// districtService.ts
export const districtService = {
  detectByZipCode: (zipCode: string) => Promise<District>,
  searchDistricts: (query: string) => Promise<District[]>,
  getCurriculum: (districtId: string) => Promise<Curriculum>
};

// iepService.ts
export const iepService = {
  uploadIEP: (file: File) => Promise<ParsedIEP>,
  parseIEPDocument: (file: File) => Promise<IEPGoal[]>,
  trackGoal: (goalId: string) => Promise<GoalProgress>,
  generateReport: (studentId: string) => Promise<Blob>
};

// parentInviteService.ts
export const parentInviteService = {
  sendInvitation: (invitation: ParentInvitation) => Promise<void>,
  generateQRCode: (classroomId: string) => Promise<ClassroomJoinInfo>,
  trackEngagement: (studentId: string) => Promise<EngagementMetrics>,
  resendInvite: (studentId: string) => Promise<void>
};

// contentService.ts
export const contentService = {
  uploadDocument: (file: File) => Promise<DocumentUpload>,
  processDocument: (docId: string) => Promise<void>,
  distributeContent: (docId: string, settings: DistributionSettings) => Promise<void>,
  getProcessingStatus: (docId: string) => Observable<ProcessingStatus>
};
```

#### Hooks (`src/hooks/`):
```typescript
// useVirtualBrainCreation.ts
export function useVirtualBrainCreation(student: TeacherStudent) {
  const [stages, setStages] = useState<VirtualBrainCreationStage[]>([]);
  const [currentStage, setCurrentStage] = useState<string>();
  const [brainId, setBrainId] = useState<string>();
  
  const startCreation = async () => {
    // Implementation
  };
  
  return { stages, currentStage, brainId, startCreation };
}

// useAssessmentFlow.ts
export function useAssessmentFlow(studentId: string) {
  const [mode, setMode] = useState<AssessmentMode>();
  const [question, setQuestion] = useState<AssessmentQuestion>();
  const [progress, setProgress] = useState<number>(0);
  
  const startAssessment = async (selectedMode: AssessmentMode) => {
    // Implementation
  };
  
  return { mode, question, progress, startAssessment };
}

// useDistrictDetection.ts
export function useDistrictDetection() {
  const [district, setDistrict] = useState<District>();
  const [loading, setLoading] = useState(false);
  
  const detectDistrict = async (zipCode: string) => {
    // Implementation
  };
  
  return { district, loading, detectDistrict };
}
```

### Page Integration:

Update `src/pages/DashboardPage.tsx` to add new tabs:
```typescript
const tabs = [
  { id: 'overview', label: 'Overview', icon: '🏠' },
  { id: 'students', label: 'Students', icon: '👨‍🎓', badge: studentsCount },
  { id: 'brains', label: 'Virtual Brains', icon: '🧠', badge: activeBrains },
  { id: 'suggestions', label: 'Brain Suggestions', icon: '💡', badge: pendingSuggestions },
  { id: 'iep', label: 'IEP Assistant', icon: '📋', badge: upcomingReviews },
  { id: 'content', label: 'Content', icon: '📚' },
  { id: 'parents', label: 'Parents', icon: '👨‍👩‍👧', badge: pendingInvites },
  { id: 'analytics', label: 'Analytics', icon: '📊' }
];
```

### Next Steps:

1. **Immediate** (Current Session):
   - Create BasicInfo.tsx step component
   - Create LocationDetection.tsx with district detection
   - Create LearningProfile.tsx with IEP upload

2. **Short Term** (Next 1-2 Sessions):
   - Complete remaining wizard steps
   - Build AssessmentInterface with 3 modes
   - Implement VirtualBrainCreation flow

3. **Medium Term** (Next 3-5 Sessions):
   - Document Distribution Center
   - IEP Management System
   - Parent Engagement Hub

4. **Polish & Integration** (Next 5-7 Sessions):
   - Real-time WebSocket connections
   - Backend API integration
   - Replace emoji placeholders with Lucide React icons
   - Mobile optimizations
   - Add animations with Framer Motion

### Current File Structure:
```
apps/teacher-dashboard/
├── src/
│   ├── components/
│   │   ├── VirtualBrainGrid/          ✅ Complete
│   │   ├── ClassroomInsightsPanel.tsx ✅ Complete
│   │   ├── IEPAssistant/              ✅ Complete
│   │   ├── BrainSuggestionsQueue.tsx  ✅ Complete
│   │   ├── StudentOnboarding/
│   │   │   ├── AddStudentWizard.tsx   ✅ Shell created
│   │   │   ├── BasicInfo.tsx          ⏳ TODO
│   │   │   ├── LocationDetection.tsx  ⏳ TODO
│   │   │   ├── LearningProfile.tsx    ⏳ TODO
│   │   │   ├── ConsentCompliance.tsx  ⏳ TODO
│   │   │   └── LicenseAllocation.tsx  ⏳ TODO
│   │   ├── Assessment/                ⏳ TODO
│   │   ├── VirtualBrain/              ⏳ TODO
│   │   ├── Content/                   ⏳ TODO
│   │   ├── IEP/                       ⏳ TODO
│   │   └── Parents/                   ⏳ TODO
│   ├── hooks/                         ⏳ TODO
│   ├── services/                      ⏳ TODO
│   ├── pages/
│   │   └── DashboardPage.tsx          ✅ Phase 1 complete
│   └── types/
│       ├── virtual-brain.ts           ✅ Complete
│       └── teacher.ts                 ✅ Complete
```

### Development Commands:
```bash
# Already running:
pnpm dev  # http://localhost:5173/

# To run:
pnpm build      # Production build
pnpm lint       # Lint check
pnpm test       # Run tests (when created)
```

### Notes:
- Server is currently running successfully
- All Phase 1 components are functional
- Type system is complete and comprehensive
- Tailwind CSS configured with custom brain/focus themes
- Ready to proceed with Phase 2 implementation
