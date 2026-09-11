// HackMate AI - Dashboard Controller

document.addEventListener('DOMContentLoaded', () => {
  // Load workspace state
  let state = Utils.State.get();

  // Populate Dashboard Content
  populateDashboard(state);

  // Start Countdown Timer
  initCountdownTimer(state.hackathon.timeRemaining);

  // Listen to state changes to reload parts of the page if needed
  window.addEventListener('hackmateStateChanged', (e) => {
    state = e.detail;
    updateSprintMetrics(state);
  });

  // Handle Manage Timer toggle
  const manageBtn = Utils.$('#manage-time-btn');
  const manageControl = Utils.$('#manage-time-control');
  const saveBtn = Utils.$('#save-time-btn');

  if (manageBtn && manageControl && saveBtn) {
    manageBtn.addEventListener('click', () => {
      const isHidden = manageControl.style.display === 'none';
      manageControl.style.display = isHidden ? 'block' : 'none';
      
      if (isHidden) {
        // Pre-fill with current remaining values
        const currentSeconds = Utils.State.get().hackathon.timeRemaining;
        const currentH = Math.floor(currentSeconds / 3600);
        const currentM = Math.floor((currentSeconds % 3600) / 60);
        Utils.$('#input-manage-hours').value = currentH;
        Utils.$('#input-manage-mins').value = currentM;
      }
    });

    saveBtn.addEventListener('click', () => {
      const hoursVal = parseInt(Utils.$('#input-manage-hours').value) || 0;
      const minsVal = parseInt(Utils.$('#input-manage-mins').value) || 0;

      const totalSeconds = (hoursVal * 3600) + (minsVal * 60);

      Utils.State.update(draft => {
        draft.hackathon.timeRemaining = totalSeconds;
      });

      // Update timer in real time
      initCountdownTimer(totalSeconds);

      // Hide input
      manageControl.style.display = 'none';
      Utils.showToast("Hackathon timer updated dynamically!", "success");
    });
  }
});

// --- Dynamic Population ---
function populateDashboard(state) {
  const currentUser = state.team.members.find(m => m.isCurrentUser);
  
  // Title & Tagline
  Utils.$('#welcome-message').innerText = `Hello, ${currentUser.name.split(' ')[0]}`;
  Utils.$('#hackathon-tagline').innerText = `Workspace synced with ${state.hackathon.name} | Team: ${state.team.name}`;
  
  // Stat Card Metrics
  Utils.$('#stat-progress').innerText = `${state.hackathon.teamProgress}%`;
  Utils.$('#stat-progress-bar').style.width = `${state.hackathon.teamProgress}%`;
  Utils.$('#stat-health').innerText = `${state.hackathon.healthScore}%`;

  // Render Roster & Vacancies
  renderDashboardRoster(state);

  // Render Dashboard Recruitment Panel
  renderDashboardRecruits(state.availableTalents);

  // Render Incoming Invites
  renderDashboardInvites(state.team.incomingInvites);

  // Bind Dashboard Recruit Search
  const searchInput = Utils.$('#dash-recruit-search');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase().trim();
      const st = Utils.State.get();
      const filtered = st.availableTalents.filter(talent => 
        talent.skills.some(skill => skill.toLowerCase().includes(q)) ||
        talent.role.toLowerCase().includes(q) ||
        talent.name.toLowerCase().includes(q)
      );
      renderDashboardRecruits(filtered);
    });
  }

  // Bind Dashboard Recruit Actions (Click Recruitment)
  document.addEventListener('click', (e) => {
    const recruitBtn = e.target.closest('.dash-recruit-btn');
    if (recruitBtn) {
      const id = recruitBtn.getAttribute('data-talent-id');
      Utils.State.update(draft => {
        const index = draft.availableTalents.findIndex(t => t.id === id);
        if (index !== -1) {
          const t = draft.availableTalents[index];
          draft.team.members.push({
            id: t.id,
            name: t.name,
            role: t.role,
            avatar: t.avatar,
            color: t.color,
            skills: t.skills,
            availability: t.availability,
            contribution: 10,
            isCurrentUser: false
          });
          draft.availableTalents.splice(index, 1);
        }
      });
      const updated = Utils.State.get();
      renderDashboardRoster(updated);
      renderDashboardRecruits(updated.availableTalents);
      if (searchInput) searchInput.value = '';
      Utils.showToast("Collaborator recruited successfully!", "success");
    }
  });

  // Bind Accept/Decline Invite Actions
  document.addEventListener('click', (e) => {
    const acceptBtn = e.target.closest('.invite-accept-btn');
    const declineBtn = e.target.closest('.invite-decline-btn');

    if (acceptBtn) {
      const id = acceptBtn.getAttribute('data-invite-id');
      Utils.State.update(draft => {
        const index = draft.team.incomingInvites.findIndex(i => i.id === id);
        if (index !== -1) {
          const invite = draft.team.incomingInvites[index];
          draft.team.members.push({
            id: invite.id,
            name: invite.name,
            role: invite.role,
            avatar: invite.avatar,
            color: invite.color,
            skills: invite.skills,
            availability: 100,
            contribution: 10,
            isCurrentUser: false
          });
          draft.team.incomingInvites.splice(index, 1);
        }
      });
      const updated = Utils.State.get();
      renderDashboardRoster(updated);
      renderDashboardInvites(updated.team.incomingInvites);
      Utils.showToast("Invitation accepted! Member joined.", "success");
    }

    if (declineBtn) {
      const id = declineBtn.getAttribute('data-invite-id');
      Utils.State.update(draft => {
        draft.team.incomingInvites = draft.team.incomingInvites.filter(i => i.id !== id);
      });
      const updated = Utils.State.get();
      renderDashboardInvites(updated.team.incomingInvites);
      Utils.showToast("Invitation declined.", "warning");
    }
  });

  // Render Sprint Checklist
  Utils.$('#sprint-label').innerText = state.hackathon.currentSprint;
  renderSprintTasks(state);

  // Render Pending Decisions
  renderDecisions(state);

  // Render Deadlines
  renderDeadlines();

  // Render Activity Timeline
  renderActivityTimeline();
}

// --- Countdown Clock Logic ---
let timerInterval = null;
let currentSecondsRemaining = 0;

function initCountdownTimer(initialSeconds) {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  currentSecondsRemaining = initialSeconds;

  function updateClock() {
    if (currentSecondsRemaining <= 0) {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      Utils.$('#timer-hours').innerText = '00';
      Utils.$('#timer-minutes').innerText = '00';
      Utils.$('#timer-seconds').innerText = '00';
      return;
    }
    
    currentSecondsRemaining--;
    
    const h = Math.floor(currentSecondsRemaining / 3600);
    const m = Math.floor((currentSecondsRemaining % 3600) / 60);
    const s = currentSecondsRemaining % 60;
    
    Utils.$('#timer-hours').innerText = String(h).padStart(2, '0');
    Utils.$('#timer-minutes').innerText = String(m).padStart(2, '0');
    Utils.$('#timer-seconds').innerText = String(s).padStart(2, '0');
    
    // Update simple display stat
    Utils.$('#stat-time').innerText = `${h}h ${m}m`;
  }

  updateClock();
  timerInterval = setInterval(updateClock, 1000);
}

// --- Render Helper Functions ---

function renderSprintTasks(state) {
  const container = Utils.$('#sprint-tasks-container');
  if (!container) return;

  const currentTasks = state.tasks;
  const completedCount = currentTasks.filter(t => t.status === 'completed').length;
  Utils.$('#stat-tasks').innerText = `${completedCount} / ${currentTasks.length}`;

  if (state.team.members.length === 0) {
    container.innerHTML = `<div style="font-size:11px; color:var(--text-muted); text-align:center; padding:20px 0;">No team members found.</div>`;
    return;
  }

  container.innerHTML = state.team.members.map(member => {
    const memberTasks = currentTasks.filter(t => t.assigneeId === member.id);
    const tasksHtml = memberTasks.length > 0 ? memberTasks.map(task => {
      const isCompleted = task.status === 'completed';
      const statusText = task.status === 'completed' ? 'Completed' : task.status === 'review' ? 'Review' : task.status === 'in-progress' ? 'In Progress' : 'Todo';
      const badgeClass = task.status === 'completed' ? 'badge-success' : task.status === 'review' ? 'badge-info' : task.status === 'in-progress' ? 'badge-warning' : 'badge-purple';
      
      return `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-2) 0; border-bottom: 1px solid rgba(255,255,255,0.02);">
          <span style="font-size: 12px; color: ${isCompleted ? 'var(--text-muted)' : 'var(--text-secondary)'}; text-decoration: ${isCompleted ? 'line-through' : 'none'};">${task.title}</span>
          <span class="badge ${badgeClass}" style="font-size: 9px; padding: 1px 6px;">${statusText}</span>
        </div>
      `;
    }).join('') : `
      <div style="font-size: 11px; color: var(--text-muted); font-style: italic; padding: var(--space-1) 0;">No tasks assigned</div>
    `;

    return `
      <div style="margin-bottom: var(--space-4); border-bottom: 1px solid var(--border-color-light); padding-bottom: var(--space-3);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-2);">
          <div style="display: flex; align-items: center; gap: var(--space-2);">
            <div class="user-avatar" style="width: 22px; height: 22px; font-size: 10px; font-weight:700; background-color: ${member.color || 'var(--primary)'}; color:#fff; display:flex; align-items:center; justify-content:center; border-radius:50%;">
              ${member.avatar}
            </div>
            <strong style="font-size: 12px; color: var(--text-primary);">${member.name}</strong>
            <span style="font-size: 10px; color: var(--text-muted);">${member.role}</span>
          </div>
          <span style="font-size: 10px; font-weight: 600; color: var(--primary);">${memberTasks.filter(t => t.status === 'completed').length}/${memberTasks.length} Done</span>
        </div>
        <div style="padding-left: 30px; display: flex; flex-direction: column;">
          ${tasksHtml}
        </div>
      </div>
    `;
  }).join('');
}

function updateSprintMetrics(state) {
  const currentTasks = state.tasks;
  const completedCount = currentTasks.filter(t => t.status === 'completed').length;
  
  Utils.$('#stat-tasks').innerText = `${completedCount} / ${currentTasks.length}`;
  Utils.$('#stat-progress').innerText = `${state.hackathon.teamProgress}%`;
  Utils.$('#stat-progress-bar').style.width = `${state.hackathon.teamProgress}%`;
}

function renderDecisions(state) {
  const container = Utils.$('#decisions-container');
  if (!container) return;

  const decisions = [
    { id: 'dec-1', type: 'Voting Required', title: 'Finalize Solution Architecture (Monolithic vs Microservice)', urgency: 'High', page: 'problem-solution-lab.html' },
    { id: 'dec-2', type: 'Discussion Open', title: 'Confirm AI prompt formatting templates', urgency: 'Medium', page: 'discussion-board.html' }
  ];

  container.innerHTML = decisions.map(dec => `
    <div class="dash-list-item" onclick="window.location.href='${dec.page}'" style="cursor: pointer;">
      <div class="dash-list-item-left">
        <div class="stat-icon" style="width:32px; height:32px; font-size:var(--font-size-sm); background-color: var(--primary-light); color: var(--primary);">
          <i data-lucide="help-circle" style="width:16px;"></i>
        </div>
        <div>
          <span style="font-size:var(--font-size-sm); font-weight:600; color:var(--text-primary); display:block;">${dec.title}</span>
          <span style="font-size:10px; color:var(--text-muted);">${dec.type}</span>
        </div>
      </div>
      <span class="badge ${dec.urgency === 'High' ? 'badge-danger' : 'badge-warning'}">${dec.urgency}</span>
    </div>
  `).join('');
  
  if (window.lucide) window.lucide.createIcons();
}

function renderDeadlines() {
  const container = Utils.$('#deadlines-container');
  if (!container) return;

  const deadlines = [
    { title: 'Architecture Freeze', date: 'Today, 8:00 PM', timeDiff: 'Remaining: 1h' },
    { title: 'Submission Draft Mockup', date: 'Tomorrow, 12:00 PM', timeDiff: 'Remaining: 17h' },
    { title: 'Final Presentation Slides Lock', date: 'Jul 18, 8:00 AM', timeDiff: 'Remaining: 37h' }
  ];

  container.innerHTML = deadlines.map(dl => `
    <div class="dash-list-item">
      <div>
        <span style="font-size:var(--font-size-sm); font-weight:600; color:var(--text-primary); display:block;">${dl.title}</span>
        <span style="font-size:var(--font-size-xs); color:var(--text-muted);">${dl.date}</span>
      </div>
      <span class="badge badge-purple">${dl.timeDiff}</span>
    </div>
  `).join('');
}

function renderActivityTimeline() {
  const container = Utils.$('#activities-container');
  if (!container) return;

  const activities = [
    { title: 'Alex Rivers marked "Mock Data Layer Setup" as in-progress', time: '15 mins ago' },
    { title: 'Sophia Chen completed "Design Left Sidebar Layout"', time: '2 hours ago' },
    { title: 'Marcus Vance created "API Planning Draft" document', time: '4 hours ago' }
  ];

  container.innerHTML = activities.map(act => `
    <div class="activity-item">
      <div class="activity-dot"></div>
      <div class="activity-content">
        <span class="activity-title">${act.title}</span>
        <span class="activity-time">${act.time}</span>
      </div>
    </div>
  `).join('');
}

// --- Team Roster render ---
function renderDashboardRoster(state) {
  const container = Utils.$('#dashboard-team-roster');
  const vacancies = Utils.$('#vacancies-indicator');
  if (!container) return;

  container.innerHTML = state.team.members.map(m => `
    <div class="user-avatar" style="background-color: ${m.color || 'var(--primary)'}; border: 1.5px solid var(--border-color); width:28px; height:28px; font-size:10px;" title="${m.name} (${m.role})">
      ${m.avatar}
    </div>
  `).join('');

  const maxSlots = 6;
  const emptySlots = maxSlots - state.team.members.length;
  if (vacancies) {
    if (emptySlots > 0) {
      vacancies.innerText = `${emptySlots} vacancies left • Team: ${state.team.members.length}/${maxSlots}`;
    } else {
      vacancies.innerText = `Workspace Full • Team: ${state.team.members.length}/${maxSlots}`;
    }
  }
}

// --- Team Recruitment renders ---
function renderDashboardRecruits(talents) {
  const container = Utils.$('#dash-recruit-container');
  if (!container) return;

  if (talents.length === 0) {
    container.innerHTML = `
      <div style="font-size:11px; color:var(--text-muted); text-align:center; padding:15px 0;">
        No candidates match this search.
      </div>
    `;
    return;
  }

  container.innerHTML = talents.map(talent => `
    <div style="display:flex; align-items:center; justify-content:space-between; padding:var(--space-2); background:rgba(255,255,255,0.01); border:1px solid var(--border-color-light); border-radius:var(--radius-sm); font-size:var(--font-size-xs);">
      <div style="display:flex; align-items:center; gap:var(--space-2); overflow:hidden;">
        <div class="user-avatar" style="width:24px; height:24px; font-size:9px; background-color:${talent.color}; flex-shrink:0;">
          ${talent.avatar}
        </div>
        <div style="overflow:hidden; white-space:nowrap; text-overflow:ellipsis;">
          <strong style="color:var(--text-primary);">${talent.name}</strong>
          <span style="color:var(--text-muted); display:block; font-size:9px;">${talent.role}</span>
        </div>
      </div>
      <button class="btn btn-primary btn-sm dash-recruit-btn" data-talent-id="${talent.id}" style="padding:2px 6px; font-size:9px;">
        <i data-lucide="plus" style="width:8px;"></i> Recruit
      </button>
    </div>
  `).join('');

  if (window.lucide) window.lucide.createIcons();
}

// --- Incoming Invites renders ---
function renderDashboardInvites(invites) {
  const container = Utils.$('#dash-invites-container');
  if (!container) return;

  if (invites.length === 0) {
    container.innerHTML = `
      <div style="font-size:11px; color:var(--text-muted); text-align:center; padding:20px 0;">
        No pending incoming requests.
      </div>
    `;
    return;
  }

  container.innerHTML = invites.map(inv => `
    <div style="display:flex; align-items:center; justify-content:space-between; padding:var(--space-2); background:rgba(255,255,255,0.01); border:1px solid var(--border-color-light); border-radius:var(--radius-sm); font-size:var(--font-size-xs);">
      <div style="display:flex; align-items:center; gap:var(--space-2); overflow:hidden;">
        <div class="user-avatar" style="width:24px; height:24px; font-size:9px; background-color:${inv.color}; flex-shrink:0;">
          ${inv.avatar}
        </div>
        <div style="overflow:hidden; white-space:nowrap; text-overflow:ellipsis;">
          <strong style="color:var(--text-primary);">${inv.name}</strong>
          <span style="color:var(--text-muted); display:block; font-size:9px;">${inv.role}</span>
        </div>
      </div>
      <div style="display:flex; gap:2px;">
        <button class="btn btn-primary btn-sm invite-accept-btn" data-invite-id="${inv.id}" style="padding:2px 4px; font-size:9px; background:var(--secondary); border:none;">Accept</button>
        <button class="btn btn-danger btn-sm invite-decline-btn" data-invite-id="${inv.id}" style="padding:2px 4px; font-size:9px; border:none;">Ignore</button>
      </div>
    </div>
  `).join('');

  if (window.lucide) window.lucide.createIcons();
}
