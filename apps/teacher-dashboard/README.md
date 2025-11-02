# Teacher Dashboard - Aivo AI Learning Platform

A comprehensive teacher dashboard with complete Virtual Brain integration for monitoring and managing student learning.

## Features

### 🧠 Virtual Brain Classroom Grid
- Live grid of student cards with real-time Virtual Brain status
- Focus level meters (green/yellow/red indicators)
- IEP badges for students with special education plans
- Drag-and-drop card reordering
- Click for detailed student view
- Responsive grid (4x5 desktop, 2x3 tablet, 1 column mobile)

### 📊 Classroom Brain Insights
- Total Virtual Brains active count
- Average classroom focus percentage
- Number of brains needing intervention
- Documents currently being processed
- Next IEP review reminder
- Recent trends with directional indicators

### 💡 Brain Suggestions Queue
- AI-generated suggestions from Virtual Brains
- Priority badges (urgent, high, medium, low)
- Suggestion types (difficulty, pacing, content, intervention, break)
- AI reasoning display
- Proposed changes with before/after preview
- Expected impact analysis
- Accept/Modify/Reject actions
- Teacher notes for each decision

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7+ (Rolldown)
- **Styling**: Tailwind CSS 3.4+
- **State Management**: Zustand
- **Data Fetching**: TanStack Query v5
- **Animations**: Framer Motion
- **Charts**: Recharts

## Getting Started

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build
```

## Project Structure

```
src/
├── components/
│   ├── VirtualBrainGrid/          # Student cards grid
│   ├── IEPAssistant/              # IEP management
│   ├── ClassroomInsightsPanel.tsx # Metrics dashboard
│   └── BrainSuggestionsQueue.tsx  # AI suggestions
├── pages/
│   └── DashboardPage.tsx          # Main page
└── types/
    └── virtual-brain.ts           # Type definitions
```

## License

Part of the Aivo AI Learning Platform

