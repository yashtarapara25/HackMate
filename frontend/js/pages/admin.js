// HackMate AI - Admin Panel Controller

document.addEventListener('DOMContentLoaded', () => {
  const state = Utils.State.get();

  // 1. Setup Tab Switching System
  initAdminTabSwitcher();

  // 2. Load Datasets & Populate Directories
  renderDashboardData();
  renderHackathonsList();
  renderTeamsTable();
  renderProjectsTable();
  renderReviewWorkspace();
  renderLeaderboards();
  renderAnnouncementsFeed();

  // 4. Setup Interactive Event Actions
  setupAdminForms();
});

// --- Tab Swapping Module ---
function initAdminTabSwitcher() {
  const sidebarLinks = document.querySelectorAll('.sidebar-menu-item[data-tab]');
  const panels = document.querySelectorAll('.admin-panel');
  const pageTitle = document.getElementById('admin-page-title');

  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      const targetTab = link.getAttribute('data-tab');

      // Update active links
      sidebarLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      // Update active panels
      panels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.id === `tab-${targetTab}`) {
          panel.classList.add('active');
        }
      });

      // Update Top Header Breadcrumb title
      if (pageTitle) {
        pageTitle.innerText = link.innerText.trim();
      }

      // Re-trigger Lucide Icons Compile
      if (window.lucide) window.lucide.createIcons();
    });
  });
}

// --- Render Dashboard Command Center ---
function renderDashboardData() {
  // Live Alert feed simulation
  const alerts = [
    { text: "ByteCraft submitted 'EcoPulse Collaboration Hub' architecture", time: "10 mins ago", type: "primary", icon: "upload-cloud" },
    { text: "Faculty Mentor Sophia Chen scheduled a team alignment sprint", time: "30 mins ago", type: "info", icon: "calendar" },
    { text: "Critique round 'Sprint 2 Frontend review' is pending grading", time: "1 hour ago", type: "warning", icon: "edit-3" },
    { text: "System Server Database Backup successfully synced", time: "3 hours ago", type: "success", icon: "database" }
  ];

  const container = document.getElementById('dash-alerts-feed');
  if (container) {
    container.innerHTML = alerts.map(a => `
      <div style="display:flex; gap:var(--space-3); align-items:flex-start; padding:var(--space-3); border-bottom:1px solid var(--border-color-light);">
        <div style="background:var(--bg-canvas); border:1px solid var(--border-color); border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; color:var(--${a.type}); flex-shrink:0;">
          <i data-lucide="${a.icon}" style="width:14px; height:14px;"></i>
        </div>
        <div style="display:flex; flex-direction:column; flex-grow:1;">
          <span style="font-size:var(--font-size-sm); color:var(--text-primary); font-weight:500;">${a.text}</span>
          <span style="font-size:10px; color:var(--text-muted); margin-top:2px;">${a.time}</span>
        </div>
      </div>
    `).join('');
  }
}

// --- Render Hackathons Management Cards ---
function renderHackathonsList() {
  const hackathons = [
    { name: "Global HackFest 2026", status: "Active", start: "July 16", deadline: "July 18", teams: 24, progress: 68, badge: "badge-success" },
    { name: "EcoHacks Climate Challenge", status: "Upcoming", start: "Aug 10", deadline: "Aug 12", teams: 0, progress: 0, badge: "badge-purple" },
    { name: "HealthTech Innovators 2025", status: "Archived", start: "Dec 12, 2025", deadline: "Dec 14, 2025", teams: 42, progress: 100, badge: "badge-secondary" }
  ];

  const container = document.getElementById('hackathons-cards-grid');
  if (container) {
    container.innerHTML = hackathons.map(h => `
      <div class="card" style="display:flex; flex-direction:column; justify-content:space-between; min-height:260px;">
        <div>
          <div style="height:100px; background:var(--primary-gradient); border-radius:var(--radius-sm); margin-bottom:var(--space-4); display:flex; align-items:center; justify-content:center; font-weight:800; color:#fff; font-size:var(--font-size-lg); opacity:0.85;">
            ${h.name.substring(0, 15)}
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-2);">
            <h4 style="font-size:var(--font-size-md); font-weight:700; color:var(--text-primary);">${h.name}</h4>
            <span class="badge ${h.badge}">${h.status}</span>
          </div>
          <div style="font-size:var(--font-size-xs); color:var(--text-muted); display:flex; flex-direction:column; gap:4px; margin-bottom:var(--space-4);">
            <span><strong style="color:var(--text-secondary);">Start:</strong> ${h.start}</span>
            <span><strong style="color:var(--text-secondary);">Deadline:</strong> ${h.deadline}</span>
            <span><strong style="color:var(--text-secondary);">Registered Teams:</strong> ${h.teams}</span>
          </div>
        </div>
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; color:var(--text-muted); margin-bottom:4px;">
            <span>Event Progress</span>
            <span style="font-weight:700; color:var(--text-primary);">${h.progress}%</span>
          </div>
          <div class="progress-bar-container" style="margin-bottom:var(--space-4);">
            <div class="progress-bar-fill" style="width:${h.progress}%;"></div>
          </div>
          <div style="display:flex; gap:6px;">
            <button class="btn btn-secondary btn-sm" onclick="Utils.Toast.show('Modifying event parameters...')">Edit</button>
            <button class="btn btn-primary btn-sm" onclick="Utils.Toast.show('Loading full event analytics...')">Inspect</button>
          </div>
        </div>
      </div>
    `).join('');
  }
}

// --- Render Teams Directory Table ---
function renderTeamsTable() {
  const teams = [
    { name: "ByteCraft", lead: "Alex Rivers", count: 4, progress: 68, statement: "Low-latency collaboration routers", status: "Active", badge: "badge-success", mentor: "Sophia Chen", health: 94 },
    { name: "DevDynasty", lead: "Rohan Mehta", count: 4, progress: 100, statement: "Automated test harnesses", status: "Submitting", badge: "badge-purple", mentor: "Marcus Vance", health: 92 },
    { name: "QuantumHacks", lead: "Aisha Khan", count: 3, progress: 45, statement: "Decentralized cryptographic vaults", status: "Drafting", badge: "badge-warning", mentor: "Elena Rostova", health: 88 }
  ];

  const container = document.getElementById('teams-table-rows');
  if (container) {
    container.innerHTML = teams.map(t => `
      <tr>
        <td><strong>${t.name}</strong></td>
        <td>${t.lead}</td>
        <td>${t.count}/6 Members</td>
        <td>
          <div style="display:flex; align-items:center; gap:8px;">
            <div class="progress-bar-container" style="width:60px; margin-bottom:0;">
              <div class="progress-bar-fill" style="width:${t.progress}%;"></div>
            </div>
            <span style="font-size:11px; font-weight:600;">${t.progress}%</span>
          </div>
        </td>
        <td><span style="font-size:var(--font-size-xs); color:var(--text-secondary);">${t.statement}</span></td>
        <td><span class="badge ${t.badge}">${t.status}</span></td>
        <td>${t.mentor}</td>
        <td><strong style="color:var(--secondary);">${t.health}%</strong></td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="Utils.Toast.show('Viewing ByteCraft detail console...')">Inspect</button>
        </td>
      </tr>
    `).join('');
  }
}



// --- Render Submitted Projects Table ---
function renderProjectsTable() {
  const projects = [
    { name: "EcoPulse Dashboard", team: "ByteCraft", hack: "Global HackFest 2026", tech: ["FastAPI", "PostgreSQL"], stage: "Integration Sprint", status: "Active Review", badge: "badge-warning" },
    { name: "TestBot Harness", team: "DevDynasty", hack: "Global HackFest 2026", tech: ["Node.js", "Docker"], stage: "Presentation Prep", status: "Approved", badge: "badge-success" }
  ];

  const container = document.getElementById('projects-table-rows');
  if (container) {
    container.innerHTML = projects.map(p => `
      <tr>
        <td><strong>${p.name}</strong></td>
        <td>${p.team}</td>
        <td>${p.hack}</td>
        <td>
          <div style="display:flex; gap:4px;">
            ${p.tech.map(t => `<span class="badge badge-purple" style="font-size:10px;">${t}</span>`).join('')}
          </div>
        </td>
        <td><span style="font-size:var(--font-size-xs);">${p.stage}</span></td>
        <td><span class="badge ${p.badge}">${p.status}</span></td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="openReviewWorkspace('${p.name}')">Review</button>
        </td>
      </tr>
    `).join('');
  }
}

// --- Render Project Reviews Workspace ---
function renderReviewWorkspace() {
  // Populate the default workspace structure
  const details = {
    name: "EcoPulse Dashboard",
    team: "ByteCraft",
    statement: "Creating a telemetry graph mapping real-time carbon offsets inside green buildings.",
    tech: ["FastAPI", "PostgreSQL", "SVG Charts"],
    repo: "https://github.com/bytecraft-hacks/ecopulse",
    video: "https://vimeo.com/ecopulse-demo"
  };

  Utils.$('#review-proj-title').innerText = details.name;
  Utils.$('#review-proj-team').innerText = `Submitted by: ${details.team}`;
  Utils.$('#review-proj-statement').innerText = details.statement;
  Utils.$('#review-proj-tech').innerHTML = details.tech.map(t => `<span class="badge badge-purple">${t}</span>`).join('');
  Utils.$('#review-proj-repo').href = details.repo;
  Utils.$('#review-proj-repo-text').innerText = details.repo;
}

function openReviewWorkspace(projName) {
  // Swaps to Reviews Tab automatically
  const reviewsLink = document.querySelector('.sidebar-menu-item[data-tab="reviews"]');
  if (reviewsLink) {
    reviewsLink.click();
    Utils.$('#review-proj-title').innerText = projName;
    Utils.$('#review-proj-team').innerText = `Submitted by: ${projName === 'EcoPulse Dashboard' ? 'ByteCraft' : 'DevDynasty'}`;
    Utils.Toast.show(`Workspace loaded for ${projName}`);
  }
}



// --- Render Leaderboard ranks ---
function renderLeaderboards() {
  const data = [
    { rank: 1, name: "ByteCraft", score: "94 XP", type: "team" },
    { rank: 2, name: "DevDynasty", score: "92 XP", type: "team" },
    { rank: 1, name: "Alex Rivers", score: "980 XP", type: "student" },
    { rank: 2, name: "Elena Rostova", score: "960 XP", type: "student" }
  ];

  const teamList = document.getElementById('leaderboard-teams-list');
  const studentList = document.getElementById('leaderboard-students-list');

  if (teamList && studentList) {
    teamList.innerHTML = data.filter(d => d.type === 'team').map(t => `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:var(--space-3); border-bottom:1px solid var(--border-color-light);">
        <div style="display:flex; align-items:center; gap:8px;">
          <strong style="color:var(--text-muted); width:18px;">#${t.rank}</strong>
          <span style="font-weight:600; color:var(--text-primary);">${t.name}</span>
        </div>
        <span style="font-weight:700; color:var(--primary);">${t.score}</span>
      </div>
    `).join('');

    studentList.innerHTML = data.filter(d => d.type === 'student').map(s => `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:var(--space-3); border-bottom:1px solid var(--border-color-light);">
        <div style="display:flex; align-items:center; gap:8px;">
          <strong style="color:var(--text-muted); width:18px;">#${s.rank}</strong>
          <span style="font-weight:600; color:var(--text-primary);">${s.name}</span>
        </div>
        <span style="font-weight:700; color:var(--primary);">${s.score}</span>
      </div>
    `).join('');
  }
}

// --- Render Announcements Notices ---
function renderAnnouncementsFeed() {
  const notices = [
    { title: "Sprint 2 Evaluation commences today at 3:00 PM", body: "Please ensure all project document repositories have completed layout pushes.", priority: "Critical", badge: "badge-danger", audience: "All Students", date: "Posted 1 hour ago" },
    { title: "Submission Portal opens on July 18, 9:00 AM", body: "Final presentation PDF decks must be loaded to the Document Center before submission.", priority: "Standard", badge: "badge-purple", audience: "Teams", date: "Posted Yesterday" }
  ];

  const container = document.getElementById('announcements-feed-container');
  if (container) {
    container.innerHTML = notices.map(n => `
      <div class="card" style="margin-bottom:var(--space-4);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:var(--space-2);">
          <div>
            <span class="badge ${n.badge}" style="margin-bottom:4px; display:inline-block;">${n.priority} Priority</span>
            <h4 style="font-size:var(--font-size-md); font-weight:700; color:var(--text-primary);">${n.title}</h4>
          </div>
          <span style="font-size:10px; color:var(--text-muted);">${n.date}</span>
        </div>
        <p style="font-size:var(--font-size-sm); color:var(--text-secondary); line-height:1.5; margin-bottom:var(--space-3);">${n.body}</p>
        <div style="border-top:1px solid var(--border-color-light); padding-top:var(--space-2); font-size:11px; color:var(--text-muted);">
          Target: <strong style="color:var(--text-secondary);">${n.audience}</strong>
        </div>
      </div>
    `).join('');
  }
}



// --- Setup Interactive Forms & Modals ---
function setupAdminForms() {
  // 1. Scoring form submission
  const reviewForm = document.getElementById('admin-review-scoring-form');
  if (reviewForm) {
    reviewForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const comment = document.getElementById('review-comment').value.trim();
      const score = document.getElementById('review-score-input').value;

      Utils.Toast.show(`Project submission graded: Score ${score}/100. Action saved!`);
      reviewForm.reset();
      
      // Navigate back to Projects
      const projectsLink = document.querySelector('.sidebar-menu-item[data-tab="projects"]');
      if (projectsLink) projectsLink.click();
    });
  }

  // 2. Announcement submission
  const announceForm = document.getElementById('create-announcement-form');
  if (announceForm) {
    announceForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const title = document.getElementById('announce-title').value.trim();
      const body = document.getElementById('announce-body').value.trim();
      const priority = document.getElementById('announce-priority').value;

      // Add to notice feed
      const noticesContainer = document.getElementById('announcements-feed-container');
      if (noticesContainer) {
        const div = document.createElement('div');
        div.className = 'card';
        div.style.marginBottom = 'var(--space-4)';
        
        let badgeColor = 'badge-purple';
        if (priority === 'Critical') badgeColor = 'badge-danger';
        else if (priority === 'High') badgeColor = 'badge-warning';

        div.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:var(--space-2);">
            <div>
              <span class="badge ${badgeColor}" style="margin-bottom:4px; display:inline-block;">${priority} Priority</span>
              <h4 style="font-size:var(--font-size-md); font-weight:700; color:var(--text-primary);">${title}</h4>
            </div>
            <span style="font-size:10px; color:var(--text-muted);">Posted Just Now</span>
          </div>
          <p style="font-size:var(--font-size-sm); color:var(--text-secondary); line-height:1.5; margin-bottom:var(--space-3);">${body}</p>
          <div style="border-top:1px solid var(--border-color-light); padding-top:var(--space-2); font-size:11px; color:var(--text-muted);">
            Target: <strong style="color:var(--text-secondary);">All Participants</strong>
          </div>
        `;
        noticesContainer.insertBefore(div, noticesContainer.firstChild);
      }

      Utils.Toast.show("Announcement published successfully!");
      closeModal('create-announcement-modal');
      announceForm.reset();
    });
  }

  // 3. Hackathon creation
  const hackForm = document.getElementById('create-hackathon-form');
  if (hackForm) {
    hackForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('hack-name').value.trim();
      const start = document.getElementById('hack-start').value;
      const end = document.getElementById('hack-end').value;

      // Add dummy hackathon card
      const grid = document.getElementById('hackathons-cards-grid');
      if (grid) {
        const div = document.createElement('div');
        div.className = 'card';
        div.style = 'display:flex; flex-direction:column; justify-content:space-between; min-height:260px;';
        div.innerHTML = `
          <div>
            <div style="height:100px; background:var(--accent-gradient); border-radius:var(--radius-sm); margin-bottom:var(--space-4); display:flex; align-items:center; justify-content:center; font-weight:800; color:#fff; font-size:var(--font-size-lg); opacity:0.85;">
              ${name.substring(0, 15)}
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-2);">
              <h4 style="font-size:var(--font-size-md); font-weight:700; color:var(--text-primary);">${name}</h4>
              <span class="badge badge-purple">Upcoming</span>
            </div>
            <div style="font-size:var(--font-size-xs); color:var(--text-muted); display:flex; flex-direction:column; gap:4px; margin-bottom:var(--space-4);">
              <span><strong style="color:var(--text-secondary);">Start:</strong> ${start}</span>
              <span><strong style="color:var(--text-secondary);">Deadline:</strong> ${end}</span>
              <span><strong style="color:var(--text-secondary);">Registered Teams:</strong> 0</span>
            </div>
          </div>
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; color:var(--text-muted); margin-bottom:4px;">
              <span>Event Progress</span>
              <span style="font-weight:700; color:var(--text-primary);">0%</span>
            </div>
            <div class="progress-bar-container" style="margin-bottom:var(--space-4);">
              <div class="progress-bar-fill" style="width:0%;"></div>
            </div>
            <div style="display:flex; gap:6px;">
              <button class="btn btn-secondary btn-sm" onclick="Utils.Toast.show('Modifying event parameters...')">Edit</button>
              <button class="btn btn-primary btn-sm" onclick="Utils.Toast.show('Loading full event analytics...')">Inspect</button>
            </div>
          </div>
        `;
        grid.insertBefore(div, grid.firstChild);
      }

      Utils.Toast.show("New Hackathon created successfully!");
      closeModal('create-hackathon-modal');
      hackForm.reset();
    });
  }
}
