// HackMate AI - Unified Mock Data Layer
const HACKMATE_MOCK_DATA = {
  // Hackathon Status
  hackathon: {
    name: "Global HackFest 2026",
    tagline: "Building the Next Generation of Collaborative AI",
    timeRemaining: 172800, // 48 hours in seconds
    startDate: "2026-07-16T09:00:00Z",
    endDate: "2026-07-18T09:00:00Z",
    sponsors: ["Google Cloud", "GitHub", "MongoDB", "Vercel"],
    category: "AI & Collaboration tools",
    teamProgress: 68,
    healthScore: 94,
    currentSprint: "Sprint 2: Integration & Frontend Polish"
  },

  // Team Context
  team: {
    name: "HackMate AI Workspace",
    avatar: "HW",
    hackathonId: "ghf-2026",
    members: [
      {
        id: "m-1",
        name: "Yash Patel",
        role: "Team Lead & Hackathon Developer",
        avatar: "YP",
        color: "#a855f7",
        skills: ["React", "Python", "FastAPI"],
        availability: 100,
        contribution: 100,
        email: "yash64104@gmail.com",
        isCurrentUser: true
      }
    ],
    invitations: [],
    incomingInvites: []
  },

  // Problem & Solution Lab Ideas
  problemSolutionLab: {
    problemStatement: "Traditional hackathons suffer from fragmented team communications, where planning, coding, documenting, and presenting are split across multiple disjointed tools (Discord, WhatsApp, Notion, Trello, Slides), leading to loss of context, alignment issues, and project abandonment.",
    painPoints: [
      { id: "pp-1", text: "Context switching: Developers waste up to 30 mins an hour jumping between chat, tasks, and documentation.", votes: 4 },
      { id: "pp-2", text: "Loss of ideas: Great ideas discussed in casual chats get buried and lost over the 48-hour sprint.", votes: 3 },
      { id: "pp-3", text: "Pitch and code mismatch: The final pitch slides often describe features that the team couldn't complete, creating friction with judges.", votes: 4 }
    ],
    ideas: [
      {
        id: "idea-1",
        title: "HackMate AI - Unified Workspace",
        description: "An integrated command center matching the hackathon lifecycle: chat, voting, tasks, system diagrams, and pitch slides synced in real time.",
        pros: ["Eliminates context switching", "Keeps everyone aligned on the same board", "Auto-generates pitch skeleton from tasks"],
        cons: ["Requires high engineering effort for 48h MVP", "Needs robust offline-first synchronization"],
        score: 9.2,
        votes: 4,
        author: "Alex Rivers"
      },
      {
        id: "idea-2",
        title: "SlideSynth - Auto Pitch Deck Builder",
        description: "A tool that watches github commits and commits descriptive summary slides to Google Slides automatically.",
        pros: ["Very high wow-factor for judges", "Keeps slides 100% updated with git logs"],
        cons: ["Hard to control layout design quality automatically", "Doesn't solve team communication issues"],
        score: 7.8,
        votes: 1,
        author: "Sophia Chen"
      },
      {
        id: "idea-3",
        title: "GitHealth - Hackathon Dev Tracker",
        description: "A gamified productivity analytics dashboard for hackathon organizers to track team git commits and active working hours.",
        pros: ["Great for organizers and judges to prevent cheating"],
        cons: ["Teams might find it intrusive", "Doesn't help teams actually build better"],
        score: 6.0,
        votes: 0,
        author: "Marcus Vance"
      }
    ]
  },

  // Voting Records
  votes: [
    { ideaId: "idea-1", rating: 5, memberId: "m-1", comment: "This solves our exact problem. Meta and high utility." },
    { ideaId: "idea-1", rating: 5, memberId: "m-2", comment: "Love the UI concepts. Clean and dashboard-focused." },
    { ideaId: "idea-1", rating: 4.5, memberId: "m-3", comment: "Highly feasible if we build frontend-only prototypes." },
    { ideaId: "idea-1", rating: 5, memberId: "m-4", comment: "I can build the prompt-to-checklist feature easily." },
    { ideaId: "idea-2", rating: 4, memberId: "m-2", comment: "Good backup idea but maybe too narrow." },
    { ideaId: "idea-2", rating: 3, memberId: "m-1", comment: "APIs might limit customization during presentation." }
  ],

  // Discussion Channels & Simulated Chat History
  discussion: {
    channels: [
      { id: "ch-general", name: "general", topic: "General team announcements and chat" },
      { id: "ch-frontend", name: "frontend", topic: "CSS, design tokens, HTML layouts" },
      { id: "ch-backend", name: "backend", topic: "Server configs, routers, APIs" },
      { id: "ch-database", name: "database", topic: "Schemas, migrations, indexes" },
      { id: "ch-ai", name: "ai-services", topic: "LLMs, prompts, embeddings" },
      { id: "ch-presentation", name: "presentation", topic: "Pitch slides, checklists, demo script" }
    ],
    messages: {
      "ch-general": [
        { id: "msg-1", memberId: "m-1", text: "Welcome to Global HackFest 2026! 🚀 Let's build HackMate AI.", timestamp: "2026-07-16T09:15:00Z", reactions: [{ emoji: "🔥", count: 3 }] },
        { id: "msg-2", memberId: "m-2", text: "Design system skeleton is ready in variables.css. It's beautiful!", timestamp: "2026-07-16T10:30:00Z", reactions: [{ emoji: "🎨", count: 2 }, { emoji: "🚀", count: 2 }] },
        { id: "msg-3", memberId: "m-3", text: "Great. I am preparing the local development server configurations.", timestamp: "2026-07-16T10:45:00Z" }
      ],
      "ch-frontend": [
        { id: "msg-f1", memberId: "m-2", text: "Just set up variables.css. Added glassmorphism borders and custom glow shadows.", timestamp: "2026-07-16T11:00:00Z" },
        { id: "msg-f2", memberId: "m-1", text: "Awesome! Let's ensure the sidebar collapses cleanly on smaller screens.", timestamp: "2026-07-16T11:15:00Z" }
      ],
      "ch-backend": [
        { id: "msg-b1", memberId: "m-3", text: "Should we build standard HTTP routers or use JSON mockup files for fast deployment?", timestamp: "2026-07-16T12:00:00Z" },
        { id: "msg-b2", memberId: "m-1", text: "Mockups are perfect. The user specified frontend only, and we want full focus on visual excellence.", timestamp: "2026-07-16T12:15:00Z" }
      ]
    }
  },

  // Kanban Tasks
  tasks: [
    {
      id: "task-1",
      title: "Establish Design System Variables",
      desc: "Implement variables.css and global.css to lock in the dark mode palette, fonts, spacing and glassmorphism components.",
      status: "completed",
      priority: "high",
      assigneeId: "m-2",
      deadline: "2026-07-16T14:00:00Z",
      labels: ["CSS", "Design"],
      progress: 100,
      comments: [
        { memberId: "m-1", text: "Looks amazing, Sophia!", timestamp: "2026-07-16T13:30:00Z" }
      ]
    },
    {
      id: "task-2",
      title: "Design Left Sidebar Layout",
      desc: "Construct the collapsible left panel incorporating team profile switcher and page navigation items.",
      status: "completed",
      priority: "high",
      assigneeId: "m-2",
      deadline: "2026-07-16T17:00:00Z",
      labels: ["CSS", "HTML"],
      progress: 100,
      comments: []
    },
    {
      id: "task-3",
      title: "Mock Data Layer Setup",
      desc: "Create mock-data.js compiling mock structures for dashboard, team lists, solution labs, and chat feeds.",
      status: "in-progress",
      priority: "medium",
      assigneeId: "m-1",
      deadline: "2026-07-16T21:00:00Z",
      labels: ["JS", "Mocking"],
      progress: 80,
      comments: []
    },
    {
      id: "task-4",
      title: "Render Interactive Charts",
      desc: "Configure ApexCharts inside team-insights.html to display velocity metrics, user contributions, and task pipelines.",
      status: "todo",
      priority: "medium",
      assigneeId: "m-1",
      deadline: "2026-07-17T12:00:00Z",
      labels: ["JS", "Charts"],
      progress: 0,
      comments: []
    },
    {
      id: "task-5",
      title: "Develop Solution Lab UI",
      desc: "Build editable idea cards, pain point grids, and solution comparisons inside problem-solution-lab.html.",
      status: "in-progress",
      priority: "high",
      assigneeId: "m-2",
      deadline: "2026-07-17T03:00:00Z",
      labels: ["HTML", "JS"],
      progress: 30,
      comments: []
    },
    {
      id: "task-6",
      title: "Pitch Studio Checklist & Timers",
      desc: "Implement stopwatch/timer widgets and modular section editors in the pitch planner dashboard.",
      status: "todo",
      priority: "low",
      assigneeId: "m-4",
      deadline: "2026-07-17T18:00:00Z",
      labels: ["HTML", "Pitch"],
      progress: 0,
      comments: []
    }
  ],

  // Project Workspace (Notion-style file tree)
  workspace: {
    folders: [
      {
        id: "f-req",
        name: "Requirements",
        files: [
          { id: "doc-1", title: "Product Spec MVP", content: "### HackMate AI - Functional Specification\n\n**Goal**: Provide a cohesive hackathon experience.\n\n**Features**:\n1. Core dashboard detailing sprint statuses\n2. Idea boards supporting vote mechanics\n3. Integrated chat rooms mapping subteams\n4. Kanban schedules assigning cards\n5. Static architecture diagrams plotting workflows" }
        ]
      },
      {
        id: "f-res",
        name: "Research",
        files: [
          { id: "doc-2", title: "Competitor Analysis", content: "### Competitors:\n- **Discord**: Great chat, poor planning.\n- **Notion**: Beautiful doc layout, bad team synchronization/realtime flow.\n- **Trello**: Fast cards, separate workspace context." }
        ]
      },
      {
        id: "f-meet",
        name: "Meeting Notes",
        files: [
          { id: "doc-3", title: "Kickoff Sync", content: "### Kickoff Notes - Jul 16\n- Decided on Dark/Zinc UI aesthetic.\n- Focus heavily on visual wow factor.\n- Aiming for full frontend deployment completeness." }
        ]
      }
    ]
  },

  // Presentation slides workspace
  pitchStudio: {
    uploadedFile: "HackMate_AI_Pitch_Draft.pptx",
    checklist: [
      { id: "cl-1", text: "Upload 30-sec demo recording", checked: false },
      { id: "cl-2", text: "Validate ER Diagram placeholders", checked: true },
      { id: "cl-3", text: "Double-check developer profiles linked", checked: true },
      { id: "cl-4", text: "Practice slide timeline (max 3 mins)", checked: false }
    ],
    judgeFeedback: [
      { id: "fb-1", criteria: "Product Innovation", text: "Stunning UI concept. Ensure you detail how team messaging synchronizes with the task tracker during conflicts.", author: "Judge Sarah (Principal Architect)" },
      { id: "fb-2", criteria: "Technical Feasibility", text: "Frontend layout looks clean, but mock database updates should persist across page refreshes before final demo.", author: "Judge Dave (Senior Engineer)" }
    ]
  },

  // Knowledge Hub Articles
  knowledgeHub: [
    { id: "kh-1", title: "Perfect Pitch Deck Guidelines", author: "Sophia Chen", summary: "Judges value clarity, impact, and feasibility. Keep technical slides under 1 min.", updated: "2 hours ago" },
    { id: "kh-2", title: "Google Cloud Spanner Configuration", author: "Marcus Vance", summary: "How to set up database migrations with Spanner without exceeding free-tier limits.", updated: "1 day ago" }
  ],

  // Hackathon Library (Completed Projects)
  hackathonLibrary: [
    {
      id: "p-arch-1",
      title: "EcoPulse",
      hackathon: "EcoHacks 2025",
      award: "1st Place Winner",
      problem: "Household energy waste goes unmonitored because metrics are complicated.",
      solution: "A gamified smart-grid hub comparing local neighborhood power indexes.",
      tech: ["Node.js", "Chart.js", "Arduino", "MongoDB"],
      github: "https://github.com/bytecraft/ecopulse",
      demo: "https://youtube.com/watch?v=ecopulse"
    },
    {
      id: "p-arch-2",
      title: "EduFlow",
      hackathon: "EduTech Global 2025",
      award: "Best Design Award",
      problem: "Remote classroom lectures leave students isolated with doubts.",
      solution: "Real-time anonymous questions queue synced with video streams.",
      tech: ["Tailwind", "Firebase", "WebRTC", "Svelte"],
      github: "https://github.com/bytecraft/eduflow",
      demo: "https://youtube.com/watch?v=eduflow"
    }
  ],

  // Available Talents catalog
  availableTalents: [
    { id: 't-1', name: 'Rohan Mehta', role: 'Python ML Engineer', avatar: 'RM', color: '#eab308', skills: ['Python', 'PyTorch', 'Flask', 'Scikit-learn'], availability: 100 },
    { id: 't-2', name: 'Lara Vance', role: 'Frontend Developer', avatar: 'LV', color: '#ec4899', skills: ['React', 'CSS Grid', 'Tailwind', 'HTML'], availability: 90 },
    { id: 't-3', name: 'Devon Smith', role: 'Cloud & DevOps Engineer', avatar: 'DS', color: '#06b6d4', skills: ['AWS', 'Docker', 'Go', 'Python'], availability: 95 },
    { id: 't-4', name: 'Aarav Roy', role: 'UI/UX Designer', avatar: 'AR', color: '#8b5cf6', skills: ['Figma', 'Illustrator', 'Prototyping'], availability: 100 }
  ]
};

// Expose on window object for easy global access
window.HACKMATE_DATA = HACKMATE_MOCK_DATA;
