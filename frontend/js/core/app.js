// HackMate AI - Main Application Bootstrap & Layout Engine

// Initial Theme Check to prevent flashing
(function() {
  const currentTheme = localStorage.getItem('HACKMATE_THEME') || 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);
})();

document.addEventListener('DOMContentLoaded', () => {
  // Ensure state is loaded
  const state = Utils.State.get();
  
  // 1. Inject Layout Elements
  injectSidebar(state);
  injectTopHeader(state);
  
  // 2. Setup Shared Interactivity
  initSidebarCollapsible();
  initMobileDrawer();
  initHeaderDropdowns();
  initWorkspaceSwitcher();
  initSearch();
  initTheme();
  
  // 3. Compile Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }
});

// --- Dynamic Sidebar Injector ---
function injectSidebar(state) {
  const sidebarEl = document.getElementById('sidebar');
  if (!sidebarEl) return;

  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  
  // Sidebar template construction
  sidebarEl.className = 'sidebar';
  
  // Retrieve user collapse preference
  const isCollapsed = localStorage.getItem('HACKMATE_SIDEBAR_COLLAPSED') === 'true';
  if (isCollapsed) {
    sidebarEl.classList.add('collapsed');
  }

  const menuItems = [
    { type: 'label', text: 'Workspace' },
    { path: 'dashboard.html', label: 'Dashboard', icon: 'home' },
    { path: 'team.html', label: 'Team', icon: 'users' },
    { path: 'problem-solution-lab.html', label: 'Problem & Solution Lab', icon: 'brain' },
    { path: 'discussion-board.html', label: 'Discussion Board', icon: 'message-square' },
    { path: 'task-board.html', label: 'Task Board', icon: 'clipboard-list' },
    { path: 'project-workspace.html', label: 'Project Workspace', icon: 'folder-open' },
    { path: 'pitch-studio.html', label: 'Pitch Studio', icon: 'mic' },
    
    { type: 'label', text: 'Insights & Archive' },
    { path: 'team-insights.html', label: 'Team Insights', icon: 'bar-chart-3' },
    { path: 'knowledge-hub.html', label: 'Knowledge Hub', icon: 'book-open' },
    { path: 'hackathon-library.html', label: 'Hackathon Library', icon: 'trophy' },
    
    { type: 'label', text: 'Preferences' },
    { path: 'profile.html', label: 'Profile', icon: 'user' },
    { path: 'settings.html', label: 'Settings', icon: 'settings' }
  ];

  let menuHtml = '';
  menuItems.forEach(item => {
    if (item.type === 'label') {
      menuHtml += `<div class="sidebar-menu-label">${item.text}</div>`;
    } else {
      const isActive = currentPath === item.path ? 'active' : '';
      menuHtml += `
        <a href="${item.path}" class="menu-item ${isActive}">
          <i data-lucide="${item.icon}"></i>
          <span>${item.label}</span>
        </a>
      `;
    }
  });

  const currentUser = state.team.members.find(m => m.isCurrentUser);

  sidebarEl.innerHTML = `
    <div class="sidebar-header">
      <div class="logo-container">HM</div>
      <span class="brand-name">HackMate AI</span>
    </div>
    
    <div class="team-switcher" id="workspace-switcher-trigger" style="position: relative; cursor: pointer;">
      <div class="team-info">
        <div class="team-badge">${state.team.avatar}</div>
        <span class="team-name">${state.team.name}</span>
      </div>
      <i data-lucide="chevrons-up-down" style="width: 14px; height: 14px;"></i>
      
      <!-- Workspace Switcher Floating Dropdown Panel -->
      <div id="workspace-switcher-dropdown" class="dropdown-menu" style="position: absolute; top: calc(100% + 8px); left: 0; width: 220px; padding: var(--space-2); background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); box-shadow: var(--glass-shadow); z-index: 10000; text-align: left;">
        <span style="font-size: 9px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); padding: var(--space-1) var(--space-2); display: block;">Active Workspaces</span>
        <div id="workspace-list-items" style="display: flex; flex-direction: column; gap: 2px; max-height: 160px; overflow-y: auto; margin-bottom: var(--space-2);">
          <!-- Populated dynamically -->
        </div>
        <div style="border-top: 1px solid var(--border-color-light); padding-top: var(--space-2); margin-top: var(--space-1);">
          <button class="btn btn-secondary btn-sm" id="create-new-workspace-btn" style="width: 100%; font-size: 11px; padding: var(--space-2); display: flex; align-items: center; justify-content: center; gap: 4px; border: none; background: rgba(139, 92, 246, 0.1); color: var(--primary);">
            <i data-lucide="plus" style="width: 12px; height: 12px;"></i> New Workspace
          </button>
        </div>
      </div>
    </div>
    
    <nav class="sidebar-menu">
      ${menuHtml}
    </nav>
    
    <div class="sidebar-footer">
      <div class="footer-user">
        <div class="user-avatar">${currentUser.avatar}</div>
        <div class="footer-user-details">
          <span class="footer-user-name">${currentUser.name}</span>
          <span class="footer-user-role">${currentUser.role}</span>
        </div>
      </div>
      <button class="collapse-sidebar-btn" id="collapse-sidebar-toggle">
        <i data-lucide="chevron-left"></i>
      </button>
    </div>
  `;
}

// --- Dynamic Top Header Injector ---
function injectTopHeader(state) {
  const headerEl = document.getElementById('top-header');
  if (!headerEl) return;

  const currentUser = state.team.members.find(m => m.isCurrentUser);

  headerEl.className = 'top-header';
  headerEl.innerHTML = `
    <div class="header-left">
      <button class="hamburger-btn" id="mobile-sidebar-toggle">
        <i data-lucide="menu"></i>
      </button>
      <div class="search-container">
        <i data-lucide="search" class="search-icon" style="width: 16px; height: 16px;"></i>
        <input type="text" class="search-input" id="global-search" placeholder="Search workspace, documents, tasks...">
      </div>
    </div>
    
    <div class="header-right">
      <!-- Theme Toggle Button -->
      <button class="btn-icon" id="theme-toggle-btn" title="Toggle Light/Dark Theme" style="cursor: pointer; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; border: none; background: transparent; color: var(--text-secondary); transition: all var(--transition-fast);">
        <!-- Icon injected dynamically -->
      </button>

      <!-- Notifications Toggle -->
      <div class="icon-badge-container" id="notification-bell">
        <button class="btn-icon">
          <i data-lucide="bell"></i>
        </button>
        <span class="badge-dot"></span>
        
        <!-- Notifications Dropdown -->
        <div class="dropdown-menu" id="notification-dropdown" style="width: 300px; padding: var(--space-3);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
            <h4 style="font-size: var(--font-size-sm); font-weight: 600;">Notifications</h4>
            <span class="badge badge-purple" style="font-size: 10px;">3 New</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: var(--space-2); max-height: 250px; overflow-y: auto;">
            <div style="padding: var(--space-2); border-radius: var(--radius-xs); background: rgba(255,255,255,0.02); font-size: var(--font-size-xs);">
              <p style="color: var(--text-primary); font-weight:500;">Sophia Chen commented on task "Establish Design System Variables"</p>
              <span style="color: var(--text-muted);">15 mins ago</span>
            </div>
            <div style="padding: var(--space-2); border-radius: var(--radius-xs); background: rgba(255,255,255,0.02); font-size: var(--font-size-xs);">
              <p style="color: var(--text-primary); font-weight:500;">Idea "HackMate AI - Unified Workspace" is winning the voting rounds.</p>
              <span style="color: var(--text-muted);">1 hour ago</span>
            </div>
            <div style="padding: var(--space-2); border-radius: var(--radius-xs); background: rgba(255,255,255,0.02); font-size: var(--font-size-xs);">
              <p style="color: var(--text-primary); font-weight:500;">Marcus Vance added file "API Planning Draft" to Requirements folder.</p>
              <span style="color: var(--text-muted);">3 hours ago</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Profile Widget -->
      <div style="position: relative;">
        <div class="user-profile-widget" id="profile-widget">
          <div class="user-avatar">${currentUser.avatar}</div>
          <span class="user-name">${currentUser.name}</span>
          <i data-lucide="chevron-down" style="width: 14px; height: 14px;"></i>
        </div>
        
        <!-- Profile Dropdown -->
        <div class="dropdown-menu" id="profile-dropdown">
          <a class="dropdown-item" href="profile.html">
            <i data-lucide="user" style="width: 16px;"></i> Profile
          </a>
          <a class="dropdown-item" href="settings.html">
            <i data-lucide="settings" style="width: 16px;"></i> Settings
          </a>
          <div class="dropdown-divider"></div>
          <a class="dropdown-item" href="../auth/login.html" style="color: var(--danger);">
            <i data-lucide="log-out" style="width: 16px;"></i> Log Out
          </a>
        </div>
      </div>
    </div>
  `;
}

// --- Interaction Initializers ---

function initSidebarCollapsible() {
  const toggleBtn = document.getElementById('collapse-sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  if (!toggleBtn || !sidebar) return;

  toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    const isCollapsed = sidebar.classList.contains('collapsed');
    localStorage.setItem('HACKMATE_SIDEBAR_COLLAPSED', isCollapsed);
    
    // Toggle button icon direction
    const icon = toggleBtn.querySelector('i');
    if (icon) {
      if (isCollapsed) {
        icon.setAttribute('data-lucide', 'chevron-right');
      } else {
        icon.setAttribute('data-lucide', 'chevron-left');
      }
      if (window.lucide) window.lucide.createIcons();
    }
  });
}

function initMobileDrawer() {
  const mobileToggle = document.getElementById('mobile-sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  if (!mobileToggle || !sidebar) return;

  // Create overlay if not present
  let overlay = document.querySelector('.sidebar-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
  }

  mobileToggle.addEventListener('click', () => {
    sidebar.classList.add('mobile-open');
    overlay.classList.add('active');
  });

  overlay.addEventListener('click', () => {
    sidebar.classList.remove('mobile-open');
    overlay.classList.remove('active');
  });
}

function initHeaderDropdowns() {
  const bell = document.getElementById('notification-bell');
  const bellDropdown = document.getElementById('notification-dropdown');
  const profile = document.getElementById('profile-widget');
  const profileDropdown = document.getElementById('profile-dropdown');

  if (bell && bellDropdown) {
    bell.addEventListener('click', (e) => {
      e.stopPropagation();
      bellDropdown.classList.toggle('active');
      if (profileDropdown) profileDropdown.classList.remove('active');
    });
  }

  if (profile && profileDropdown) {
    profile.addEventListener('click', (e) => {
      e.stopPropagation();
      profileDropdown.classList.toggle('active');
      if (bellDropdown) bellDropdown.classList.remove('active');
    });
  }

  // Close dropdowns on clicking outside
  document.addEventListener('click', () => {
    if (bellDropdown) bellDropdown.classList.remove('active');
    if (profileDropdown) profileDropdown.classList.remove('active');
  });
}

function initSearch() {
  const searchInput = document.getElementById('global-search');
  if (!searchInput) return;

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const query = searchInput.value.trim();
      if (query) {
        Utils.showToast(`Search for "${query}" initiated across workspace.`, 'info');
      }
    }
  });
}

// --- Workspace Switcher Manager ---
function initWorkspaceSwitcher() {
  const trigger = document.getElementById('workspace-switcher-trigger');
  const dropdown = document.getElementById('workspace-switcher-dropdown');
  const createBtn = document.getElementById('create-new-workspace-btn');

  if (!trigger || !dropdown) return;

  // Toggle Dropdown using CSS active state
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('active');
  });

  // Prevent closing when clicking inside
  dropdown.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // Close dropdown on clicking anywhere else
  document.addEventListener('click', () => {
    dropdown.classList.remove('active');
  });

  // Populate workspaces
  const listItems = document.getElementById('workspace-list-items');
  if (listItems) {
    // Render initially from cached state
    renderWorkspaceListItems(listItems, dropdown);

    // Fetch live data from backend and refresh list dynamically
    Utils.State.fetchWorkspacesFromBackend().then(list => {
      if (list) {
        renderWorkspaceListItems(listItems, dropdown);
      }
    });
  }

  function renderWorkspaceListItems(listItems, dropdown) {
    const list = Utils.State.getWorkspacesList();
    const activeId = Utils.State.getActiveWorkspaceId();

    listItems.innerHTML = list.map(ws => {
      const isActive = ws.id === activeId;
      const deleteIconHtml = (ws.id !== 'ws-1' && ws.id !== 'e1111111-1111-40bc-94ef-65d1b5e2d6b3') ? `
        <button class="delete-ws-btn" data-ws-id="${ws.id}" style="background: none; border: none; padding: 4px; color: var(--danger); cursor: pointer; display: flex; align-items: center; justify-content: center; opacity: 0.6; transition: opacity var(--transition-fast);" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.6'" title="Delete Workspace">
          <i data-lucide="trash-2" style="width: 12px; height: 12px;"></i>
        </button>
      ` : '';

      return `
        <div class="workspace-switch-row" style="display: flex; align-items: center; justify-content: space-between; padding: 2px 4px; border-radius: var(--radius-xs); transition: all var(--transition-fast);">
          <div class="workspace-switch-item ${isActive ? 'active' : ''}" data-ws-id="${ws.id}" 
               style="display: flex; align-items: center; justify-content: space-between; flex-grow: 1; padding: 6px 12px; border-radius: var(--radius-xs); cursor: pointer; ${isActive ? 'background: var(--primary-light); color: var(--primary); font-weight:600;' : 'color: var(--text-secondary);'}"
               onmouseover="if(this.className.indexOf('active')===-1) this.style.background='rgba(255,255,255,0.03)';"
               onmouseout="if(this.className.indexOf('active')===-1) this.style.background='none';">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 20px; height: 20px; border-radius: 4px; background: ${isActive ? 'var(--primary)' : 'rgba(255,255,255,0.05)'}; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700;">${ws.avatar}</div>
              <span style="font-size: var(--font-size-sm);">${ws.name}</span>
            </div>
            ${isActive ? '<i data-lucide="check" style="width: 12px; height: 12px; color: var(--primary);"></i>' : ''}
          </div>
          ${deleteIconHtml}
        </div>
      `;
    }).join('');

    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Bind item selection clicks
    listItems.querySelectorAll('.workspace-switch-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-ws-id');
        Utils.State.setActiveWorkspaceId(id);
        dropdown.classList.remove('active');
        window.location.reload();
      });
    });

    // Bind delete clicks
    listItems.querySelectorAll('.delete-ws-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent switching click trigger
        const wsId = btn.getAttribute('data-ws-id');
        const workspaces = Utils.State.getWorkspacesList();
        const ws = workspaces.find(w => w.id === wsId);
        const name = ws ? ws.name : "this workspace";

        if (confirm(`Are you sure you want to permanently delete workspace "${name}"?\nAll specs, channels, and sprint tasks will be lost.`)) {
          // Remove from registry
          const newList = workspaces.filter(w => w.id !== wsId);
          Utils.State.saveWorkspacesList(newList);

          // Clear local storage partition
          localStorage.removeItem(`HACKMATE_WORKSPACE_STATE_${wsId}`);

          // If current active workspace is deleted, switch back to list[0]
          const activeId = Utils.State.getActiveWorkspaceId();
          if (activeId === wsId) {
            Utils.State.setActiveWorkspaceId(list[0]?.id || 'ws-1');
          }

          dropdown.classList.remove('active');
          window.location.reload();
        }
      });
    });
  }

  // Bind "New Workspace" Modal Trigger
  if (createBtn) {
    createBtn.addEventListener('click', () => {
      dropdown.classList.remove('active');
      injectWorkspaceCreationModal();
      openModal('create-workspace-modal');
    });
  }
}

function injectWorkspaceCreationModal() {
  if (document.getElementById('create-workspace-modal')) return;

  const modalHtml = `
    <div class="modal-overlay" id="create-workspace-modal" style="z-index: 100000;">
      <div class="modal-container" style="max-width: 420px;">
        <div class="modal-header">
          <h3>Create New Workspace</h3>
          <button class="btn-icon btn-sm" onclick="closeModal('create-workspace-modal')"><i data-lucide="x"></i></button>
        </div>
        <div class="modal-body" style="text-align: left;">
          <form id="create-workspace-form">
            <div class="form-group" style="margin-bottom: var(--space-4);">
              <label for="new-ws-name">Workspace Name</label>
              <input type="text" id="new-ws-name" class="input-control" placeholder="e.g. EcoPulse" required autocomplete="off">
            </div>
            <div class="form-group" style="margin-bottom: var(--space-4);">
              <label for="new-ws-desc">Workspace Description</label>
              <input type="text" id="new-ws-desc" class="input-control" placeholder="e.g. Environmental smart grid hub" required autocomplete="off">
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;"><i data-lucide="plus"></i> Initialize Workspace</button>
          </form>
        </div>
      </div>
    </div>
  `;

  const div = document.createElement('div');
  div.innerHTML = modalHtml;
  document.body.appendChild(div.firstElementChild);

  // Bind Submit Handler
  const form = document.getElementById('create-workspace-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('new-ws-name').value.trim();
      const desc = document.getElementById('new-ws-desc').value.trim();

      if (name && desc) {
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        const newId = `ws-${Date.now()}`;

        // 1. Add entry to registry
        const list = Utils.State.getWorkspacesList();
        list.push({ id: newId, name, description: desc, avatar: initials });
        Utils.State.saveWorkspacesList(list);

        // 2. Switch Active Workspace ID
        Utils.State.setActiveWorkspaceId(newId);

        // 3. Clear inputs & reload
        closeModal('create-workspace-modal');
        window.location.reload();
      }
    });
  }

  if (window.lucide) window.lucide.createIcons();
}

function initTheme() {
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (!themeBtn) return;

  const currentTheme = localStorage.getItem('HACKMATE_THEME') || 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeToggleIcon(currentTheme);

  themeBtn.addEventListener('click', () => {
    const activeTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('HACKMATE_THEME', newTheme);
    updateThemeToggleIcon(newTheme);
  });
}

function updateThemeToggleIcon(theme) {
  const btn = document.getElementById('theme-toggle-btn');
  if (!btn) return;
  
  if (theme === 'light') {
    btn.innerHTML = `<i data-lucide="moon" style="width: 18px; height: 18px;"></i>`;
    btn.title = "Switch to Dark Mode";
  } else {
    btn.innerHTML = `<i data-lucide="sun" style="width: 18px; height: 18px;"></i>`;
    btn.title = "Switch to Light Mode";
  }
  if (window.lucide) window.lucide.createIcons();
}

