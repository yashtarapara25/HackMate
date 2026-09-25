// HackMate AI - Unified Data Layer (Clean Initial State)
const HACKMATE_MOCK_DATA = {
  // Hackathon Status
  hackathon: {
    name: "HackMate AI Sprint 2026",
    tagline: "Building Intelligent Collaborative Workspaces",
    timeRemaining: 172800, // 48 hours session timer
    startDate: "2026-07-16T09:00:00Z",
    endDate: "2026-07-18T09:00:00Z",
    sponsors: ["Google Cloud", "GitHub", "Neon PostgreSQL"],
    category: "AI & Collaboration Tools",
    teamProgress: 0,
    healthScore: 100,
    currentSprint: "Sprint 1: System Setup & Onboarding"
  },

  // Team Context (Clean User Workspace)
  team: {
    name: "My Team Workspace",
    avatar: "HW",
    hackathonId: "ghf-2026",
    members: [],
    invitations: [],
    incomingInvites: []
  },

  // Problem & Solution Lab Ideas (Clean Empty Arrays)
  problemSolutionLab: {
    problemStatement: "",
    painPoints: [],
    ideas: []
  },

  // Voting Records
  votes: [],

  // Discussion Channels & Messages (Clean Empty Chats)
  discussion: {
    channels: [
      { id: "ch-general", name: "general", topic: "General team announcements and chat" },
      { id: "ch-frontend", name: "frontend", topic: "UI layout and design components" },
      { id: "ch-backend", name: "backend", topic: "FastAPI server and database endpoints" }
    ],
    messages: {
      "ch-general": [],
      "ch-frontend": [],
      "ch-backend": []
    }
  },

  // Kanban Tasks (Clean Empty Task List)
  tasks: [],

  // Project Workspace (Clean Folder Structure)
  workspace: {
    folders: [
      {
        id: "f-req",
        name: "Requirements",
        files: []
      },
      {
        id: "f-res",
        name: "Research",
        files: []
      }
    ]
  },

  // Presentation slides workspace
  pitchStudio: {
    uploadedFile: "",
    checklist: [
      { id: "cl-1", text: "Set core problem statement", checked: false },
      { id: "cl-2", text: "Assign sprint tasks to team", checked: false },
      { id: "cl-3", text: "Confirm architecture & tech stack", checked: false }
    ],
    judgeFeedback: []
  },

  // Knowledge Hub & Library
  knowledgeHub: [],
  hackathonLibrary: [],
  availableTalents: []
};

// Expose on window object for easy global access
window.HACKMATE_DATA = HACKMATE_MOCK_DATA;
