// HackMate AI - Developer Profile Controller Page

document.addEventListener('DOMContentLoaded', async () => {
  let currentUser = await fetchUserProfileFromBackend();

  // 1. Initial Render
  renderProfile(currentUser);

  // 2. Setup Edit Profile Modal Operations
  setupEditProfileModal(currentUser);

  // 3. Share Button Handler
  setupShareButton();
});

// --- Fetch User Profile from Backend API ---
async function fetchUserProfileFromBackend() {
  const token = localStorage.getItem('HACKMATE_AUTH_TOKEN');
  const userLocal = JSON.parse(localStorage.getItem('HACKMATE_CURRENT_USER') || '{}');

  if (token) {
    try {
      const apiBase = Utils.State.getApiBaseUrl();
      const res = await fetch(`${apiBase}/api/users/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const dbUser = await res.json();
        localStorage.setItem('HACKMATE_CURRENT_USER', JSON.stringify(dbUser));
        return formatUserData(dbUser);
      }
    } catch (e) {
      console.warn("Backend profile API error, using stored profile:", e);
    }
  }

  return formatUserData(userLocal);
}

function formatUserData(user) {
  const name = user.full_name || user.name || "Hacker User";
  const avatar = user.avatar || user.avatar_url || name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase();
  
  return {
    id: user.id || "usr-1",
    name: name,
    email: user.email || "",
    avatar: avatar,
    role: user.role === 'admin' ? 'Platform Admin' : 'Full-Stack Hacker',
    university: user.university || "University / College",
    location: user.location || "India",
    bio: user.bio || "Passionate full-stack developer & hacker building innovative web applications.",
    github: user.github || "",
    linkedin: user.linkedin || "",
    portfolio: user.portfolio || "",
    skills: user.skills || ["React", "Python"],
    joinDate: "September 2026",
    availabilityStatus: "Fully Available",
    domains: ["AI", "Web Development", "Database Architecture"]
  };
}

// --- Dynamic Profile Renderer ---
function renderProfile(user) {
  // Populate Header Banner details
  if (Utils.$('#profile-avatar-banner')) Utils.$('#profile-avatar-banner').innerText = user.avatar;
  if (Utils.$('#profile-name-banner')) Utils.$('#profile-name-banner').innerText = user.name;
  if (Utils.$('#profile-role-banner')) Utils.$('#profile-role-banner').innerText = user.role;
  if (Utils.$('#profile-uni-banner')) Utils.$('#profile-uni-banner').innerHTML = `<i data-lucide="graduation-cap" style="width:14px;"></i> ${user.university}`;
  if (Utils.$('#profile-loc-banner')) Utils.$('#profile-loc-banner').innerHTML = `<i data-lucide="map-pin" style="width:14px;"></i> ${user.location}`;
  if (Utils.$('#profile-join-banner')) Utils.$('#profile-join-banner').innerHTML = `<i data-lucide="calendar" style="width:14px;"></i> Joined ${user.joinDate}`;
  if (Utils.$('#profile-avail-badge')) Utils.$('#profile-avail-badge').innerHTML = `<i data-lucide="clock" style="width:12px;"></i> ${user.availabilityStatus}`;

  // Left Sidebar details
  if (Utils.$('#profile-bio-summary')) Utils.$('#profile-bio-summary').innerText = user.bio;
  if (Utils.$('#profile-github-link')) {
    Utils.$('#profile-github-link').href = user.github ? `https://github.com/${user.github.replace(/^https?:\/\/github\.com\//, '')}` : '#';
    Utils.$('#profile-github-text').innerText = user.github ? `github.com/${user.github.replace(/^https?:\/\/github\.com\//, '')}` : 'Not provided';
  }
  if (Utils.$('#profile-linkedin-link')) {
    Utils.$('#profile-linkedin-link').href = user.linkedin ? `https://linkedin.com/in/${user.linkedin.replace(/^https?:\/\/linkedin\.com\/in\//, '')}` : '#';
    Utils.$('#profile-linkedin-text').innerText = user.linkedin ? `linkedin.com/in/${user.linkedin.replace(/^https?:\/\/linkedin\.com\/in\//, '')}` : 'Not provided';
  }

  // Calculate Profile Completion %
  calculateProfileCompletion(user);

  // Render Interest Domains
  renderDomains(user.domains);

  // Render Tech Stack and Skills
  renderSkills(user.skills);

  // Render Badge slots
  renderBadges();

  // Re-run Lucide Icons Compile
  if (window.lucide) window.lucide.createIcons();
}

// --- Calculate Profile Completion ---
function calculateProfileCompletion(user) {
  let score = 30; // base score for registration
  if (user.bio && user.bio.length > 10) score += 15;
  if (user.github) score += 15;
  if (user.linkedin) score += 15;
  if (user.skills && user.skills.length > 0) score += 15;
  if (user.university) score += 10;

  score = Math.min(score, 100);

  const ringText = Utils.$('#completion-ring-text');
  if (ringText) ringText.innerText = `${score}%`;

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

// --- Render Skill Tags ---
function renderSkills(userSkills) {
  const container = Utils.$('#skills-categories-list');
  if (!container) return;

  const skillsList = Array.isArray(userSkills) && userSkills.length > 0 ? userSkills : ["React", "FastAPI", "Python", "PostgreSQL"];

  container.innerHTML = `
    <div class="skills-category">
      <div class="skills-category-title">User Verified Tech Stack</div>
      <div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:10px;">
        ${skillsList.map(skill => `
          <span class="badge badge-purple" style="font-size:12px; padding:6px 12px;">${skill}</span>
        `).join('')}
      </div>
    </div>
  `;
}

// --- Render Badges ---
function renderBadges() {
  const badges = [
    { icon: "award", title: "Hackathon Participant", earned: true },
    { icon: "shield-check", title: "Verified Developer", earned: true },
    { icon: "zap", title: "Fast Responder", earned: true },
    { icon: "users", title: "Team Collaborator", earned: true }
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

// --- Edit Profile Form setup with REAL Backend API Integration ---
function setupEditProfileModal(user) {
  const form = Utils.$('#edit-profile-form');
  if (!form) return;

  // Set initial form values
  if (Utils.$('#edit-name')) Utils.$('#edit-name').value = user.name || '';
  if (Utils.$('#edit-role')) Utils.$('#edit-role').value = user.role || '';
  if (Utils.$('#edit-uni')) Utils.$('#edit-uni').value = user.university || '';
  if (Utils.$('#edit-loc')) Utils.$('#edit-loc').value = user.location || '';
  if (Utils.$('#edit-bio')) Utils.$('#edit-bio').value = user.bio || '';
  if (Utils.$('#edit-github')) Utils.$('#edit-github').value = user.github || '';
  if (Utils.$('#edit-linkedin')) Utils.$('#edit-linkedin').value = user.linkedin || '';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerText = "Saving to Database...";
    }

    const updatedData = {
      full_name: Utils.$('#edit-name').value.trim(),
      university: Utils.$('#edit-uni').value.trim(),
      location: Utils.$('#edit-loc').value.trim(),
      bio: Utils.$('#edit-bio').value.trim(),
      github: Utils.$('#edit-github').value.trim(),
      linkedin: Utils.$('#edit-linkedin').value.trim()
    };

    const token = localStorage.getItem('HACKMATE_AUTH_TOKEN');
    const apiBase = Utils.State.getApiBaseUrl();

    try {
      const res = await fetch(`${apiBase}/api/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });

      if (res.ok) {
        const savedUser = await res.json();
        localStorage.setItem('HACKMATE_CURRENT_USER', JSON.stringify(savedUser));
        
        const formatted = formatUserData(savedUser);
        renderProfile(formatted);
        closeModal('edit-profile-modal');
        showToast("Profile successfully updated in PostgreSQL database!", "success");
      } else {
        const err = await res.json();
        showToast(err.detail || "Failed to update profile", "danger");
      }
    } catch (err) {
      showToast("Network error updating profile", "danger");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = "Save Changes";
      }
    }
  });
}

// --- Share Button Action ---
function setupShareButton() {
  const btn = Utils.$('#share-profile-btn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      showToast("Profile portfolio link copied to clipboard!", "success");
    }).catch(() => {
      showToast("Failed to copy link.", "danger");
    });
  });
}

