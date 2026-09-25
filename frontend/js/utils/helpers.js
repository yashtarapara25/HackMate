// HackMate AI - Shared Utilities

// 1. LocalStorage State Engine
const HackMateState = {
  safeGetItem: function(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn("Storage read failed: ", e);
      return null;
    }
  },
  
  safeSetItem: function(key, val) {
    try {
      localStorage.setItem(key, val);
    } catch (e) {
      console.warn("Storage write failed: ", e);
    }
  },

  safeRemoveItem: function(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn("Storage removal failed: ", e);
    }
  },

  // Get registry of workspaces
  getWorkspacesList: function() {
    const data = this.safeGetItem('HACKMATE_WORKSPACES_LIST');
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error(e);
      }
    }
    const defaults = [{ id: "ws-1", name: "ByteCraft", description: "Default HackMate Team Workspace", avatar: "BC" }];
    this.safeSetItem('HACKMATE_WORKSPACES_LIST', JSON.stringify(defaults));
    return defaults;
  },

  // Get backend API base URL (dynamic for local dev and production deployment)
  getApiBaseUrl: function() {
    const customApi = this.safeGetItem('HACKMATE_API_URL');
    if (customApi) return customApi.replace(/\/$/, '');
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    return isLocal ? 'http://localhost:8000' : 'https://hackmate-backend.onrender.com';
  },

  // Background fetch from backend API
  fetchWorkspacesFromBackend: async function() {
    try {
      const response = await fetch(`${this.getApiBaseUrl()}/api/workspaces`);
      if (response.ok) {
        const list = await response.json();
        // Save to local storage for instant access next time
        this.saveWorkspacesList(list);
        return list;
      }
    } catch (e) {
      console.warn("Backend server not reached: using local cache.");
    }
    return null;
  },

  // Save registry of workspaces
  saveWorkspacesList: function(list) {
    this.safeSetItem('HACKMATE_WORKSPACES_LIST', JSON.stringify(list));
  },

  // Get active workspace ID
  getActiveWorkspaceId: function() {
    let id = this.safeGetItem('HACKMATE_ACTIVE_WORKSPACE_ID');
    if (!id) {
      id = "ws-1";
      this.safeSetItem('HACKMATE_ACTIVE_WORKSPACE_ID', id);
    }
    return id;
  },

  // Switch active workspace
  setActiveWorkspaceId: function(id) {
    this.safeSetItem('HACKMATE_ACTIVE_WORKSPACE_ID', id);
  },

  get: function() {
    const activeId = this.getActiveWorkspaceId();
    const storageKey = `HACKMATE_WORKSPACE_STATE_${activeId}`;
    const data = this.safeGetItem(storageKey);
    
    const list = this.getWorkspacesList();
    const activeWorkspace = list.find(w => w.id === activeId) || list[0];
 
    let parsed;
    if (data) {
      try {
        parsed = JSON.parse(data);
        // Self-Healing Check: Reset if state schema is outdated or missing features
        if (!parsed.availableTalents || 
            !parsed.team || 
            !parsed.team.members || 
            !parsed.team.incomingInvites ||
            !parsed.pitchStudio ||
            !parsed.pitchStudio.judgeFeedback ||
            parsed.team.members.length === 0 ||
            !parsed.team.members[0].skills) {
          console.warn("Outdated HackMate workspace state schema detected. Resetting...");
          
          let initializedData;
          if (activeId === 'ws-1') {
            initializedData = JSON.parse(JSON.stringify(window.HACKMATE_DATA));
          } else {
            initializedData = createBlankWorkspaceState(activeWorkspace);
          }
          parsed = initializedData;
        }
      } catch (e) {
        console.error("Failed to parse state, resetting...", e);
      }
    }
    
    if (!parsed) {
      // Seed new workspace
      let initializedData;
      if (activeId === 'ws-1') {
        initializedData = JSON.parse(JSON.stringify(window.HACKMATE_DATA));
      } else {
        initializedData = createBlankWorkspaceState(activeWorkspace);
      }
      parsed = initializedData;
    }
 
    // --- ENFORCE GLOBAL KNOWLEDGE HUB & LIBRARY ---
    let globalKH = this.safeGetItem('HACKMATE_GLOBAL_KNOWLEDGE_HUB');
    if (globalKH) {
      try {
        const parsedKH = JSON.parse(globalKH);
        if (parsedKH && parsedKH.length > 0) {
          parsed.knowledgeHub = parsedKH;
        } else {
          parsed.knowledgeHub = window.HACKMATE_DATA.knowledgeHub || [];
          this.safeSetItem('HACKMATE_GLOBAL_KNOWLEDGE_HUB', JSON.stringify(parsed.knowledgeHub));
        }
      } catch(e) {
        console.error(e);
        parsed.knowledgeHub = window.HACKMATE_DATA.knowledgeHub || [];
      }
    } else {
      parsed.knowledgeHub = window.HACKMATE_DATA.knowledgeHub || [];
      this.safeSetItem('HACKMATE_GLOBAL_KNOWLEDGE_HUB', JSON.stringify(parsed.knowledgeHub));
    }
 
    let globalLib = this.safeGetItem('HACKMATE_GLOBAL_HACKATHON_LIBRARY');
    if (globalLib) {
      try {
        const parsedLib = JSON.parse(globalLib);
        if (parsedLib && parsedLib.length > 0) {
          parsed.hackathonLibrary = parsedLib;
        } else {
          parsed.hackathonLibrary = window.HACKMATE_DATA.hackathonLibrary || [];
          this.safeSetItem('HACKMATE_GLOBAL_HACKATHON_LIBRARY', JSON.stringify(parsed.hackathonLibrary));
        }
      } catch(e) {
        console.error(e);
        parsed.hackathonLibrary = window.HACKMATE_DATA.hackathonLibrary || [];
      }
    } else {
      parsed.hackathonLibrary = window.HACKMATE_DATA.hackathonLibrary || [];
      this.safeSetItem('HACKMATE_GLOBAL_HACKATHON_LIBRARY', JSON.stringify(parsed.hackathonLibrary));
    }
 
    // Bind active logged-in user to team.members
    const activeUserRaw = this.safeGetItem('HACKMATE_CURRENT_USER');
    if (activeUserRaw) {
      try {
        const currentUserObj = JSON.parse(activeUserRaw);
        const name = currentUserObj.full_name || currentUserObj.name || "Hacker User";
        const email = currentUserObj.email || "user@hackmate.ai";
        const avatar = currentUserObj.avatar || currentUserObj.avatar_url || (name ? name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase() : "HU");
        const skills = currentUserObj.skills || ["React", "Python"];
        const university = currentUserObj.university || "";

        // Reset members array to contain ONLY the authenticated current user
        parsed.team.members = [{
          id: currentUserObj.id || "usr-" + Date.now(),
          name: name,
          role: "Team Lead & Hacker",
          avatar: avatar,
          color: "#a855f7",
          skills: skills,
          university: university,
          availability: 100,
          contribution: 100,
          email: email,
          isCurrentUser: true
        }];
      } catch (e) {
        console.warn("Failed to bind active user:", e);
      }
    }

    // Write back any global changes
    const rawKey = `HACKMATE_WORKSPACE_STATE_${activeId}`;
    this.safeSetItem(rawKey, JSON.stringify(parsed));
    return parsed;
  },
 
  save: function(state) {
    const activeId = this.getActiveWorkspaceId();
    const storageKey = `HACKMATE_WORKSPACE_STATE_${activeId}`;
    
    // Extract and update global items
    if (state.knowledgeHub) {
      this.safeSetItem('HACKMATE_GLOBAL_KNOWLEDGE_HUB', JSON.stringify(state.knowledgeHub));
    }
    if (state.hackathonLibrary) {
      this.safeSetItem('HACKMATE_GLOBAL_HACKATHON_LIBRARY', JSON.stringify(state.hackathonLibrary));
    }
 
    this.safeSetItem(storageKey, JSON.stringify(state));
  },
 
  update: function(callback) {
    const state = this.get();
    callback(state);
    this.save(state);
    // Dispatch custom event to notify other scripts of state changes
    window.dispatchEvent(new CustomEvent('hackmateStateChanged', { detail: state }));
  }
};

// 2. Relative Time Helper
function getRelativeTime(dateTimeString) {
  const date = new Date(dateTimeString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// 3. Modal Controllers
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

// 4. Toast Notification Manager
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let iconClass = 'info';
  if (type === 'success') iconClass = 'check-circle';
  else if (type === 'danger') iconClass = 'alert-triangle';
  else if (type === 'warning') iconClass = 'alert-circle';

  toast.innerHTML = `
    <i data-lucide="${iconClass}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  
  // Re-run lucide icons compilation for new toast elements
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Remove toast after duration
  setTimeout(() => {
    toast.style.transform = 'translateX(120%)';
    toast.style.opacity = '0';
    toast.style.transition = 'all 300ms ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// 5. Query Selector helper
const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);

function createBlankWorkspaceState(activeWorkspace) {
  const currentUser = window.HACKMATE_DATA.team.members.find(m => m.isCurrentUser);
  return {
    hackathon: {
      name: activeWorkspace.name + " Hub",
      timeRemaining: 172800, // 48 hours
      teamProgress: 0,
      healthScore: 100,
      currentSprint: "Sprint 1: Ideation"
    },
    team: {
      name: activeWorkspace.name,
      avatar: activeWorkspace.avatar,
      hackathonId: "hack-" + Date.now(),
      members: [
        {
          ...currentUser,
          contribution: 100,
          availability: 100
        }
      ],
      invitations: [],
      incomingInvites: []
    },
    availableTalents: [
      { id: 't-1', name: 'Rohan Mehta', role: 'Python ML Engineer', avatar: 'RM', color: '#eab308', skills: ['Python', 'PyTorch', 'Flask', 'Scikit-learn'], availability: 100 },
      { id: 't-2', name: 'Lara Vance', role: 'Frontend Developer', avatar: 'LV', color: '#ec4899', skills: ['React', 'CSS Grid', 'Tailwind', 'HTML'], availability: 90 },
      { id: 't-3', name: 'Devon Smith', role: 'Cloud & DevOps Engineer', avatar: 'DS', color: '#06b6d4', skills: ['AWS', 'Docker', 'Go', 'Python'], availability: 95 },
      { id: 't-4', name: 'Aarav Roy', role: 'UI/UX Designer', avatar: 'AR', color: '#8b5cf6', skills: ['Figma', 'Illustrator', 'Prototyping'], availability: 100 }
    ],
    tasks: [],
    workspace: {
      folders: []
    },
    pitchStudio: {
      uploadedFile: null,
      checklist: [
        { id: "cl-1", text: "Upload 30-sec demo recording", checked: false },
        { id: "cl-2", text: "Validate ER Diagram placeholders", checked: false },
        { id: "cl-3", text: "Double-check developer profiles linked", checked: false },
        { id: "cl-4", text: "Practice slide timeline (max 3 mins)", checked: false }
      ],
      judgeFeedback: []
    },
    knowledgeHub: [],
    hackathonLibrary: [],
    problemSolutionLab: {
      problemStatement: "Define your core hackathon problem statement here...",
      painPoints: [],
      ideas: []
    },
    discussion: {
      channels: [
        { id: "ch-general", name: "general", topic: "General Subteam Discussion" }
      ],
      messages: {
        "ch-general": []
      }
    },
    votes: []
  };
}

// Expose utilities
window.Utils = {
  State: HackMateState,
  getRelativeTime,
  openModal,
  closeModal,
  showToast,
  $,
  $$
};
