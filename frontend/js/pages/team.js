// HackMate AI - Team Page Controller

document.addEventListener('DOMContentLoaded', () => {
  // Ensure availableTalents exist in state
  Utils.State.update(draft => {
    if (!draft.availableTalents) {
      draft.availableTalents = [
        { id: 't-1', name: 'Rohan Mehta', role: 'Python ML Engineer', avatar: 'RM', color: '#eab308', skills: ['Python', 'PyTorch', 'Flask', 'Scikit-learn'], availability: 100 },
        { id: 't-2', name: 'Lara Vance', role: 'Frontend Developer', avatar: 'LV', color: '#ec4899', skills: ['React', 'CSS Grid', 'Tailwind', 'HTML'], availability: 90 },
        { id: 't-3', name: 'Devon Smith', role: 'Cloud & DevOps Engineer', avatar: 'DS', color: '#06b6d4', skills: ['AWS', 'Docker', 'Go', 'Python'], availability: 95 },
        { id: 't-4', name: 'Aarav Roy', role: 'UI/UX Designer', avatar: 'AR', color: '#8b5cf6', skills: ['Figma', 'Illustrator', 'Prototyping'], availability: 100 }
      ];
    }
  });

  let state = Utils.State.get();

  // Populate UI
  renderTeamMembers(state);
  renderSkillsMatrix(state);
  renderAvailableTalents(state.availableTalents);
  renderTeamTrackers(state);
  renderExploreTeams(state);

  // Handle "Request to Join Other Team" Click
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.request-join-team-btn');
    if (btn) {
      const teamId = btn.getAttribute('data-team-id');
      const otherTeamsList = [
        { id: 'ot-1', name: 'EcoVolt Hub' },
        { id: 'ot-2', name: 'NeuralNet Labs' },
        { id: 'ot-3', name: 'DevDynasty' }
      ];
      const targetTeam = otherTeamsList.find(t => t.id === teamId);
      const name = targetTeam ? targetTeam.name : "this team";

      if (confirm(`Send a request to join "${name}"? If the team leader approves, you will be switched to this team.`)) {
        let reqs = [];
        try {
          reqs = JSON.parse(localStorage.getItem('HACKMATE_OUTGOING_JOIN_REQUESTS')) || [];
        } catch(err) { console.error(err); }
        
        if (!reqs.some(r => r.teamId === teamId)) {
          reqs.push({ teamId, status: 'pending' });
          localStorage.setItem('HACKMATE_OUTGOING_JOIN_REQUESTS', JSON.stringify(reqs));
          Utils.showToast(`Join request sent to ${name} leader!`, 'info');
          renderExploreTeams(Utils.State.get());
        }
      }
    }
  });

  // Handle "Simulate Admin Approval" Click
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.simulate-approve-btn');
    if (btn) {
      const teamId = btn.getAttribute('data-team-id');
      const teamData = {
        'ot-1': {
          name: 'EcoVolt Hub',
          avatar: 'EV',
          members: [
            { id: 'm-leader-ev', name: 'Lara Vance', role: 'Frontend & Team Lead', avatar: 'LV', color: '#ec4899', skills: ['React', 'Tailwind', 'CSS'], availability: 90, contribution: 40 },
            { id: 'm-devon-ev', name: 'Devon Smith', role: 'Cloud Engineer', avatar: 'DS', color: '#06b6d4', skills: ['AWS', 'Docker', 'Go'], availability: 95, contribution: 30 },
            { id: 'm-1', name: 'Alex Rivers', role: 'Full-Stack Developer', avatar: 'AR', color: '#8b5cf6', skills: ['React', 'Node.js', 'MongoDB', 'System Design'], availability: 100, contribution: 30, isCurrentUser: true }
          ]
        },
        'ot-2': {
          name: 'NeuralNet Labs',
          avatar: 'NL',
          members: [
            { id: 'm-rohan-nl', name: 'Rohan Mehta', role: 'ML Scientist & Team Lead', avatar: 'RM', color: '#eab308', skills: ['Python', 'PyTorch', 'Flask'], availability: 100, contribution: 50 },
            { id: 'm-aarav-nl', name: 'Aarav Roy', role: 'UI/UX Specialist', avatar: 'AR', color: '#8b5cf6', skills: ['Figma', 'Illustrator'], availability: 100, contribution: 20 },
            { id: 'm-1', name: 'Alex Rivers', role: 'Full-Stack Developer', avatar: 'AR', color: '#8b5cf6', skills: ['React', 'Node.js', 'MongoDB', 'System Design'], availability: 100, contribution: 30, isCurrentUser: true }
          ]
        }
      };

      const newTeam = teamData[teamId];
      if (newTeam) {
        Utils.State.update(draft => {
          draft.team.name = newTeam.name;
          draft.team.avatar = newTeam.avatar;
          draft.team.members = newTeam.members;
          draft.team.invitations = [];
          draft.team.incomingInvites = [];
          draft.hackathon.name = newTeam.name + " Hub";
        });
        
        // Clear join requests
        localStorage.removeItem('HACKMATE_OUTGOING_JOIN_REQUESTS');
        
        // Show success alert and reload
        alert(`Request approved by ${newTeam.name} Leader! You have joined the team.`);
        window.location.reload();
      }
    }
  });

  // Setup Custom Email Inviter Form
  const inviteForm = Utils.$('#invite-form');
  if (inviteForm) {
    inviteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = Utils.$('#invite-name').value.trim();
      const role = Utils.$('#invite-role').value.trim();
      const email = Utils.$('#invite-email').value.trim();

      if (name && role && email) {
        Utils.State.update(draft => {
          draft.team.invitations.push({
            id: `inv-${Date.now()}`,
            name,
            role,
            status: 'Pending',
            email
          });
        });

        inviteForm.reset();
        const updated = Utils.State.get();
        renderTeamTrackers(updated);
        Utils.showToast(`Invitation email sent to ${email}!`, 'success');
      }
    });
  }

  // Bind Talent Search Filter
  const talentSearch = Utils.$('#talent-skill-search');
  if (talentSearch) {
    talentSearch.addEventListener('input', () => {
      const query = talentSearch.value.toLowerCase().trim();
      const st = Utils.State.get();
      
      const filtered = st.availableTalents.filter(talent => 
        talent.skills.some(skill => skill.toLowerCase().includes(query)) ||
        talent.role.toLowerCase().includes(query) ||
        talent.name.toLowerCase().includes(query)
      );

      renderAvailableTalents(filtered);
    });
  }

  // Handle Talent Recruitment Click (Recruit Button)
  document.addEventListener('click', (e) => {
    const recruitBtn = e.target.closest('.recruit-talent-btn');
    if (recruitBtn) {
      const talentId = recruitBtn.getAttribute('data-talent-id');
      
      Utils.State.update(draft => {
        const index = draft.availableTalents.findIndex(t => t.id === talentId);
        if (index !== -1) {
          const talent = draft.availableTalents[index];
          
          draft.team.members.push({
            id: talent.id,
            name: talent.name,
            role: talent.role,
            avatar: talent.avatar,
            color: talent.color,
            skills: talent.skills,
            availability: talent.availability,
            contribution: 10,
            isCurrentUser: false
          });

          draft.availableTalents.splice(index, 1);
        }
      });

      const updated = Utils.State.get();
      renderTeamMembers(updated);
      renderSkillsMatrix(updated);
      renderAvailableTalents(updated.availableTalents);
      
      if (talentSearch) talentSearch.value = '';

      Utils.showToast('New collaborator recruited!', 'success');
    }
  });

  // Handle Accept/Decline Clicks on the Team Trackers Card
  document.addEventListener('click', (e) => {
    const acceptBtn = e.target.closest('.team-accept-btn');
    const declineBtn = e.target.closest('.team-decline-btn');

    if (acceptBtn) {
      const id = acceptBtn.getAttribute('data-invite-id');
      Utils.State.update(draft => {
        const idx = draft.team.incomingInvites.findIndex(i => i.id === id);
        if (idx !== -1) {
          const invite = draft.team.incomingInvites[idx];
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
          draft.team.incomingInvites.splice(idx, 1);
        }
      });

      const updated = Utils.State.get();
      renderTeamMembers(updated);
      renderSkillsMatrix(updated);
      renderTeamTrackers(updated);
      Utils.showToast("Collaborator request accepted!", "success");
    }

    if (declineBtn) {
      const id = declineBtn.getAttribute('data-invite-id');
      Utils.State.update(draft => {
        draft.team.incomingInvites = draft.team.incomingInvites.filter(i => i.id !== id);
      });
      const updated = Utils.State.get();
      renderTeamTrackers(updated);
      Utils.showToast("Collaborator request declined.", "warning");
    }
  });

  // Handle Member Removal Click
  document.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('.remove-member-btn');
    if (removeBtn) {
      const memberId = removeBtn.getAttribute('data-member-id');
      const currentData = Utils.State.get();
      const targetMember = currentData.team.members.find(m => m.id === memberId);
      const name = targetMember ? targetMember.name : "this collaborator";

      if (confirm(`Are you sure you want to remove ${name} from the team?`)) {
        Utils.State.update(draft => {
          const index = draft.team.members.findIndex(m => m.id === memberId);
          if (index !== -1) {
            const removed = draft.team.members[index];
          
          // Re-insert default talent if applicable
          const defaultTalents = [
            { id: 't-1', name: 'Rohan Mehta', role: 'Python ML Engineer', avatar: 'RM', color: '#eab308', skills: ['Python', 'PyTorch', 'Flask', 'Scikit-learn'], availability: 100 },
            { id: 't-2', name: 'Lara Vance', role: 'Frontend Developer', avatar: 'LV', color: '#ec4899', skills: ['React', 'CSS Grid', 'Tailwind', 'HTML'], availability: 90 },
            { id: 't-3', name: 'Devon Smith', role: 'Cloud & DevOps Engineer', avatar: 'DS', color: '#06b6d4', skills: ['AWS', 'Docker', 'Go', 'Python'], availability: 95 },
            { id: 't-4', name: 'Aarav Roy', role: 'UI/UX Designer', avatar: 'AR', color: '#8b5cf6', skills: ['Figma', 'Illustrator', 'Prototyping'], availability: 100 }
          ];
          
          const matchingTalent = defaultTalents.find(t => t.id === memberId);
          if (matchingTalent) {
            draft.availableTalents.push(matchingTalent);
          }
          
          draft.team.members.splice(index, 1);
        }
      });

      const updated = Utils.State.get();
      renderTeamMembers(updated);
      renderSkillsMatrix(updated);
      renderAvailableTalents(updated.availableTalents);
      renderTeamTrackers(updated);
      
      Utils.showToast("Collaborator removed from team.", "warning");
      }
    }
  });
});

// --- Populate Functions ---

function renderTeamMembers(state) {
  const container = Utils.$('#members-grid');
  if (!container) return;

  container.innerHTML = state.team.members.map(member => {
    const skillsHtml = member.skills.map(s => `<span class="badge badge-purple" style="font-size:10px;">${s}</span>`).join('');
    const removeBtnHtml = !member.isCurrentUser ? `
      <button class="btn btn-danger btn-sm remove-member-btn" data-member-id="${member.id}" style="position: absolute; top: 12px; right: 12px; padding: 0; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(239, 68, 68, 0.4); background: rgba(239, 68, 68, 0.15); color: #ef4444; transition: all var(--transition-fast);" onmouseover="this.style.background='var(--danger)'; this.style.color='#fff';" onmouseout="this.style.background='rgba(239, 68, 68, 0.15)'; this.style.color='#ef4444';" title="Remove Teammate">
        <i data-lucide="trash-2" style="width: 12px; height: 12px;"></i>
      </button>
    ` : '';
    
    return `
      <div class="card member-card">
        ${removeBtnHtml}
        <div class="member-card-avatar" style="background-color: ${member.color || 'var(--primary)'};">
          ${member.avatar}
        </div>
        <h3 class="member-card-title">${member.name}</h3>
        <span class="member-card-role">${member.role}</span>
        
        <div class="member-skills-list">
          ${skillsHtml}
        </div>
        
        <div class="member-stat-row">
          <div class="member-stat">
            <span class="member-stat-val">${member.availability}%</span>
            <span class="member-stat-lbl">Availability</span>
          </div>
          <div class="member-stat">
            <span class="member-stat-val">${member.contribution}%</span>
            <span class="member-stat-lbl">Contribution</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

function renderSkillsMatrix(state) {
  const headers = Utils.$('#matrix-headers');
  const tbody = Utils.$('#matrix-body');
  if (!headers || !tbody) return;

  // Clear headers (except 'Core Skills')
  headers.innerHTML = '<th style="width: 200px;">Core Skills</th>';
  state.team.members.forEach(member => {
    headers.innerHTML += `
      <th style="text-align: center;">
        <div style="font-weight:600; color:var(--text-primary);">${member.name.split(' ')[0]}</div>
        <span style="font-size:10px; text-transform:none; color:var(--text-muted); font-weight:normal;">${member.avatar}</span>
      </th>
    `;
  });

  // Collect all unique skills
  const allSkills = new Set();
  state.team.members.forEach(m => m.skills.forEach(s => allSkills.add(s)));

  // Populate rows
  tbody.innerHTML = Array.from(allSkills).map(skill => {
    const cols = state.team.members.map(member => {
      const hasSkill = member.skills.includes(skill);
      if (hasSkill) {
        return `<td class="matrix-cell-active"><i data-lucide="check" style="width:16px; margin: 0 auto;"></i></td>`;
      } else {
        return `<td class="matrix-cell-empty">-</td>`;
      }
    }).join('');

    return `
      <tr>
        <td style="font-weight: 500; color: var(--text-primary);">${skill}</td>
        ${cols}
      </tr>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

function renderAvailableTalents(talents) {
  const container = Utils.$('#talents-list-container');
  if (!container) return;

  if (talents.length === 0) {
    container.innerHTML = `
      <div style="font-size: 11px; color: var(--text-muted); text-align: center; padding: 20px 0;">
        No available hackers match this skill query.
      </div>
    `;
    return;
  }

  container.innerHTML = talents.map(talent => {
    const skillsHtml = talent.skills.map(s => `<span class="badge badge-purple" style="font-size:9px; padding:0 4px; background:rgba(139,92,246,0.05);">${s}</span>`).join('');
    
    return `
      <div style="display:flex; align-items:center; justify-content:space-between; padding:var(--space-2); background:rgba(255,255,255,0.01); border:1px solid var(--border-color-light); border-radius:var(--radius-sm);">
        <div style="display:flex; align-items:center; gap:var(--space-2); overflow:hidden;">
          <div class="user-avatar" style="width:30px; height:30px; font-size:10px; flex-shrink:0; background-color:${talent.color};">
            ${talent.avatar}
          </div>
          <div style="overflow:hidden;">
            <span style="font-size:var(--font-size-sm); font-weight:600; color:var(--text-primary); display:block; line-height:1.2;">${talent.name}</span>
            <span style="font-size:10px; color:var(--text-muted); display:block; margin-bottom:2px;">${talent.role}</span>
            <div style="display:flex; gap:2px; flex-wrap:wrap;">
              ${skillsHtml}
            </div>
          </div>
        </div>
        <button class="btn btn-primary btn-sm recruit-talent-btn" data-talent-id="${talent.id}" style="padding:4px 8px; font-size:10px;">
          <i data-lucide="plus" style="width:10px;"></i> Recruit
        </button>
      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

function renderTeamTrackers(state) {
  const incomingContainer = Utils.$('#team-incoming-invites-body');
  const outgoingContainer = Utils.$('#team-outgoing-invites-body');

  // Render Incoming
  if (incomingContainer) {
    const incoming = state.team.incomingInvites || [];
    if (incoming.length === 0) {
      incomingContainer.innerHTML = `<tr><td colspan="3" style="text-align:center; color:var(--text-muted); font-size:11px;">No incoming requests.</td></tr>`;
    } else {
      incomingContainer.innerHTML = incoming.map(inv => `
        <tr>
          <td style="font-weight:500; color:var(--text-primary);">${inv.name}</td>
          <td>${inv.role}</td>
          <td>
            <div style="display:flex; gap:2px;">
              <button class="btn btn-primary btn-sm team-accept-btn" data-invite-id="${inv.id}" style="padding:2px 4px; font-size:9px; background:var(--secondary); border:none;">Accept</button>
              <button class="btn btn-danger btn-sm team-decline-btn" data-invite-id="${inv.id}" style="padding:2px 4px; font-size:9px; border:none;">Decline</button>
            </div>
          </td>
        </tr>
      `).join('');
    }
  }

  // Render Outgoing
  if (outgoingContainer) {
    const outgoing = state.team.invitations || [];
    if (outgoing.length === 0) {
      outgoingContainer.innerHTML = `<tr><td colspan="3" style="text-align:center; color:var(--text-muted); font-size:11px;">No pending outgoing email invites.</td></tr>`;
    } else {
      outgoingContainer.innerHTML = outgoing.map(inv => `
        <tr>
          <td style="font-weight:500; color:var(--text-primary);">${inv.name}<br><span style="font-size:10px; color:var(--text-muted);">${inv.email}</span></td>
          <td>${inv.role}</td>
          <td><span class="badge badge-warning">${inv.status}</span></td>
        </tr>
      `).join('');
    }
  }

  if (window.lucide) window.lucide.createIcons();
}

function renderExploreTeams(state) {
  const container = Utils.$('#explore-teams-container');
  if (!container) return;

  const otherTeamsList = [
    { id: 'ot-1', name: 'EcoVolt Hub', avatar: 'EV', color: '#ec4899', membersCount: 2, maxMembers: 4, leader: 'Lara Vance', description: 'Smart grid monitoring & AI conservation platform.' },
    { id: 'ot-2', name: 'NeuralNet Labs', avatar: 'NL', color: '#eab308', membersCount: 3, maxMembers: 4, leader: 'Rohan Mehta', description: 'Deep learning pipeline optimizations for mobile runtimes.' },
    { id: 'ot-3', name: 'DevDynasty', avatar: 'DD', color: '#06b6d4', membersCount: 4, maxMembers: 4, leader: 'Sophia Chen', description: 'Collaborative code sharing & real-time IDE sync tool.' }
  ];

  let reqs = [];
  try {
    reqs = JSON.parse(localStorage.getItem('HACKMATE_OUTGOING_JOIN_REQUESTS')) || [];
  } catch(e) { console.error(e); }

  container.innerHTML = otherTeamsList.map(t => {
    const isFull = t.membersCount >= t.maxMembers;
    const req = reqs.find(r => r.teamId === t.id);
    const hasPending = req && req.status === 'pending';
    
    let actionBtnHtml = '';
    if (isFull) {
      actionBtnHtml = `<span style="font-size: 11px; color: var(--danger); font-weight:600;"><i data-lucide="slash" style="width:10px; display:inline-block; vertical-align:middle; margin-right:2px;"></i> Team Full</span>`;
    } else if (hasPending) {
      actionBtnHtml = `
        <div style="display:flex; flex-direction:column; gap:4px; align-items:flex-end;">
          <span class="badge badge-warning" style="font-size:9px; padding:2px 6px;">Pending Approval</span>
          <button class="btn btn-primary btn-sm simulate-approve-btn" data-team-id="${t.id}" style="padding:2px 6px; font-size:9px; background:var(--secondary); border:none; color:#fff; cursor:pointer;">
            Simulate Accept
          </button>
        </div>
      `;
    } else {
      actionBtnHtml = `
        <button class="btn btn-secondary btn-sm request-join-team-btn" data-team-id="${t.id}" style="padding:4px 8px; font-size:10px;">
          Request to Join
        </button>
      `;
    }

    return `
      <div style="display:flex; flex-direction:column; justify-content:space-between; padding:var(--space-3); background:rgba(255,255,255,0.01); border:1px solid var(--border-color-light); border-radius:var(--radius-md); gap:var(--space-2);">
        <div>
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:var(--space-2);">
            <div style="display:flex; align-items:center; gap:var(--space-2);">
              <div class="user-avatar" style="width:28px; height:28px; font-size:10px; font-weight:700; background-color:${t.color}; color:#fff; display:flex; align-items:center; justify-content:center; border-radius:4px;">
                ${t.avatar}
              </div>
              <div>
                <strong style="font-size:13px; color:var(--text-primary); display:block; line-height:1.2;">${t.name}</strong>
                <span style="font-size:10px; color:var(--text-muted);">Lead: ${t.leader}</span>
              </div>
            </div>
            <span style="font-size:10px; color:var(--text-muted); font-weight:600;">${t.membersCount}/${t.maxMembers} Members</span>
          </div>
          <p style="font-size:11px; color:var(--text-secondary); line-height:1.4;">${t.description}</p>
        </div>
        <div style="display:flex; justify-content:flex-end; align-items:center; border-top:1px solid rgba(255,255,255,0.02); padding-top:var(--space-2); margin-top:2px;">
          ${actionBtnHtml}
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}
