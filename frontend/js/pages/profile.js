// HackMate AI - Developer Profile Controller Page

document.addEventListener('DOMContentLoaded', () => {
  const state = Utils.State.get();
  let currentUser = state.team.members.find(m => m.isCurrentUser);

  // Initialize profile data placeholders if missing
  const userLocal = JSON.parse(localStorage.getItem('HACKMATE_CURRENT_USER') || '{}');
  if (!currentUser.bio) {
    currentUser.bio = "Passionate full-stack developer & hacker building innovative web applications.";
  }
  if (!currentUser.university) {
    currentUser.university = userLocal.university || "Atmiya University";
  }
  if (!currentUser.location) {
    currentUser.location = "India";
  }
  if (!currentUser.joinDate) {
    currentUser.joinDate = "September 2026";
  }
  if (!currentUser.availabilityStatus) {
    currentUser.availabilityStatus = "Fully Available";
  }
  if (!currentUser.domains) {
    currentUser.domains = ["AI", "Web Development", "Data Science"];
  }

  // 1. Initial Render
  renderProfile(currentUser);

  // 2. Setup Edit Profile Modal Operations
  setupEditProfileModal(currentUser, state);

  // 3. Share Button Handler
  setupShareButton();
});

// --- Dynamic Profile Renderer ---
function renderProfile(user) {
  // Populate Header Banner details
  Utils.$('#profile-avatar-banner').innerText = user.avatar;
  Utils.$('#profile-name-banner').innerText = user.name;
  Utils.$('#profile-role-banner').innerText = user.role;
  Utils.$('#profile-uni-banner').innerHTML = `<i data-lucide="graduation-cap" style="width:14px;"></i> ${user.university}`;
  Utils.$('#profile-loc-banner').innerHTML = `<i data-lucide="map-pin" style="width:14px;"></i> ${user.location}`;
  Utils.$('#profile-join-banner').innerHTML = `<i data-lucide="calendar" style="width:14px;"></i> Joined ${user.joinDate}`;
  Utils.$('#profile-avail-badge').innerHTML = `<i data-lucide="clock" style="width:12px;"></i> ${user.availabilityStatus}`;

  // Left Sidebar details
  Utils.$('#profile-bio-summary').innerText = user.bio;
  Utils.$('#profile-github-link').href = `https://github.com/${user.github}`;
  Utils.$('#profile-github-text').innerText = `github.com/${user.github}`;
  Utils.$('#profile-linkedin-link').href = `https://linkedin.com/in/${user.linkedin}`;
  Utils.$('#profile-linkedin-text').innerText = `linkedin.com/in/${user.linkedin}`;

  // Calculate Profile Completion %
  calculateProfileCompletion(user);

  // Render Interest Domains
  renderDomains(user.domains);

  // Render Tech Stack and Skill Progress Bars
  renderSkills();

  // Render Badge slots

  // Render Badge slots
  renderBadges();

  // Render Leaderboard positioning
  renderLeaderboard(user);

  // Re-run Lucide Icons Compile
  if (window.lucide) window.lucide.createIcons();
}

// --- Calculate Profile Completion ---
function calculateProfileCompletion(user) {
  let score = 30; // base score for registration
  if (user.bio && user.bio.length > 20) score += 15;
  if (user.github) score += 15;
  if (user.linkedin) score += 15;
  if (user.skills && user.skills.length > 2) score += 15;
  if (user.university) score += 10;

  score = Math.min(score, 100);

  const ringText = Utils.$('#completion-ring-text');
  if (ringText) ringText.innerText = `${score}%`;

  // Draw ring offset
  const circle = Utils.$('#completion-svg-circle');
  if (circle) {
    const radius = circle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    const offset = circumference - (score / 100) * circumference;
    circle.style.strokeDashoffset = offset;
  }
}

// --- Render Domains ---
function renderDomains(domains) {
  const container = Utils.$('#domains-container');
  if (!container) return;
  
  container.innerHTML = domains.map(d => `
    <span class="badge badge-purple" style="font-size: var(--font-size-xs); padding: var(--space-2) var(--space-3);">${d}</span>
  `).join('');
}

// --- Render Skill Progress Bars ---
function renderSkills() {
  const skillsData = [
    { cat: 'Programming', list: [{ name: 'Python', pct: 90 }, { name: 'JavaScript', pct: 85 }, { name: 'C++', pct: 70 }] },
    { cat: 'Frameworks', list: [{ name: 'FastAPI', pct: 80 }, { name: 'React', pct: 75 }, { name: 'Django', pct: 60 }] },
    { cat: 'Databases', list: [{ name: 'MongoDB', pct: 85 }, { name: 'PostgreSQL', pct: 80 }] },
    { cat: 'Tools', list: [{ name: 'Git & GitHub', pct: 90 }, { name: 'Figma', pct: 75 }, { name: 'Docker', pct: 65 }] }
  ];

  const container = Utils.$('#skills-categories-list');
  if (!container) return;

  container.innerHTML = skillsData.map(group => `
    <div class="skills-category">
      <div class="skills-category-title">${group.cat}</div>
      <div class="skills-bar-grid">
        ${group.list.map(s => `
          <div class="skill-bar-item">
            <div class="skill-info">
              <span class="skill-name">${s.name}</span>
              <span class="skill-pct">${s.pct}%</span>
            </div>
            <div class="skill-progress-bar">
              <div class="skill-progress-fill" style="width: ${s.pct}%;"></div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

// --- Render Project Cards ---
function renderProjects() {
  const projects = [
    {
      name: "EcoPulse Dashboard",
      desc: "An ambient telemetry graph plotting real-time carbon offsets for green smart buildings. Developed back-end router using FastAPI and integrated custom SVG graphs.",
      role: "Lead Full-Stack Developer",
      pct: 100,
      status: "Completed",
      badge: "badge-success",
      tech: ["FastAPI", "PostgreSQL", "SVG Charts"],
      featured: true
    },
    {
      name: "HackMate AI - Collaboration Hub",
      desc: "Intelligent workspace manager linking project checklists, SVG system topologies, and Slack-style channel relays to synchronize hackathon participants.",
      role: "System Architect",
      pct: 68,
      status: "In Progress",
      badge: "badge-warning",
      tech: ["Vanilla JS", "CSS Variables", "Lucide Icons"],
      featured: true
    }
  ];

  const container = Utils.$('#projects-cards-grid');
  if (!container) return;

  container.innerHTML = projects.map(p => `
    <div class="card project-card">
      <div>
        <div class="project-card-header">
          <div>
            <h4 class="project-card-title">${p.name}</h4>
            <span class="project-card-role">${p.role}</span>
          </div>
          <span class="badge ${p.badge}">${p.status}</span>
        </div>
        <p class="project-card-desc">${p.desc}</p>
      </div>
      <div class="project-card-footer">
        <div class="project-tech-pills">
          ${p.tech.map(t => `<span class="badge badge-purple" style="font-size:10px;">${t}</span>`).join('')}
        </div>
        <div class="project-actions">
          <div style="font-size:11px; color:var(--text-muted);">
            Progress: <strong style="color:var(--text-primary);">${p.pct}%</strong>
          </div>
          <div style="display:flex; gap:6px;">
            <button class="btn btn-secondary btn-sm" onclick="Utils.Toast.show('Opening repository...')">
              <i data-lucide="github" style="width:12px;"></i> Code
            </button>
            <button class="btn btn-primary btn-sm" onclick="Utils.Toast.show('Launching live demonstration...')">
              <i data-lucide="external-link" style="width:12px;"></i> Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

// --- Render Timelines ---
function renderTimelines() {
  const events = [
    { title: "Joined HackMate AI Workspace", date: "Recently", desc: "Initialized project workspace and team collaboration suite." }
  ];

  const container = Utils.$('#activity-timeline-list');
  if (!container) return;

  container.innerHTML = events.map(e => `
    <div class="profile-timeline-item">
      <span class="profile-timeline-dot"></span>
      <div class="profile-timeline-header">
        <span class="profile-timeline-title">${e.title}</span>
        <span class="profile-timeline-date">${e.date}</span>
      </div>
      <p class="profile-timeline-desc">${e.desc}</p>
    </div>
  `).join('');
}

// --- Render Badges ---
function renderBadges() {
  const badges = [
    { icon: "award", title: "1st EcoHacks", earned: true },
    { icon: "shield-check", title: "Cloud Arch", earned: true },
    { icon: "zap", title: "Fast Coder", earned: true },
    { icon: "users", title: "Team Lead", earned: true },
    { icon: "message-square", title: "Communicator", earned: false },
    { icon: "heart", title: "Helper", earned: false },
    { icon: "compass", title: "Explorer", earned: false },
    { icon: "trophy", title: "Champion", earned: false }
  ];

  const container = Utils.$('#badges-grid-container');
  if (!container) return;

  container.innerHTML = badges.map(b => `
    <div class="${b.earned ? 'badge-item-earned' : 'badge-item-locked'}" title="${b.title} (${b.earned ? 'Earned' : 'Locked'})">
      <i data-lucide="${b.icon}" style="width:20px; height:20px;"></i>
      <span style="font-size:8px; font-weight:600; text-align:center; margin-top:2px;">${b.title}</span>
    </div>
  `).join('');
}

// --- Render Leaderboard ---
function renderLeaderboard(user) {
  const state = Utils.State.get();
  const members = state.team.members || [user];

  const leaders = members.map((m, idx) => ({
    rank: idx + 1,
    name: m.name,
    xp: `${1000 - idx * 50} XP`,
    avatar: m.avatar,
    isUser: m.isCurrentUser
  }));

  const container = Utils.$('#mini-leaderboard-items');
  if (!container) return;

  container.innerHTML = leaders.map(l => `
    <div class="mini-leaderboard-item ${l.isUser ? 'highlight' : ''}">
      <div class="leader-item-left">
        <span class="leader-item-rank">${l.rank}</span>
        <div class="leader-item-avatar">${l.avatar}</div>
        <span class="leader-item-name">${l.name}</span>
      </div>
      <span class="leader-item-xp">${l.xp}</span>
    </div>
  `).join('');
}

// --- Edit Profile Form setup ---
function setupEditProfileModal(user, state) {
  const form = Utils.$('#edit-profile-form');
  if (!form) return;

  // Set initial form values
  Utils.$('#edit-name').value = user.name;
  Utils.$('#edit-role').value = user.role;
  Utils.$('#edit-uni').value = user.university;
  Utils.$('#edit-loc').value = user.location;
  Utils.$('#edit-bio').value = user.bio;
  Utils.$('#edit-github').value = user.github;
  Utils.$('#edit-linkedin').value = user.linkedin;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Capture values
    user.name = Utils.$('#edit-name').value.trim();
    user.role = Utils.$('#edit-role').value.trim();
    user.university = Utils.$('#edit-uni').value.trim();
    user.location = Utils.$('#edit-loc').value.trim();
    user.bio = Utils.$('#edit-bio').value.trim();
    user.github = Utils.$('#edit-github').value.trim();
    user.linkedin = Utils.$('#edit-linkedin').value.trim();

    // Calculate avatar initials
    user.avatar = user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

    // Save back to active workspace state
    Utils.State.save(state);

    // Refresh UI
    renderProfile(user);
    closeModal('edit-profile-modal');

    // Notify user
    Utils.Toast.show("Profile updated successfully!");

    // Also update footer user panel if exists
    const footerName = Utils.$('.footer-user-name');
    const footerAvatar = Utils.$('.footer-user .user-avatar');
    if (footerName) footerName.innerText = user.name;
    if (footerAvatar) footerAvatar.innerText = user.avatar;
  });
}

// --- Share Button Action ---
function setupShareButton() {
  const btn = Utils.$('#share-profile-btn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      Utils.Toast.show("Copied profile portfolio link to clipboard!");
    }).catch(() => {
      Utils.Toast.show("Failed to copy link.");
    });
  });
}
