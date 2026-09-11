// HackMate AI - Kanban Task Board Controller

let currentInspectTaskId = null;

document.addEventListener('DOMContentLoaded', () => {
  let state = Utils.State.get();
  const simulatedId = localStorage.getItem('HACKMATE_SIMULATED_MEMBER_ID') || 'm-1';

  // Populate Board and Assignees Dropdown
  renderKanban(state);
  populateAssigneeSelects(state);

  // Initialize Member Simulation Dropdown
  const simSelect = Utils.$('#simulate-member-select');
  const simBadge = Utils.$('#simulate-member-badge');
  const addTicketBtn = Utils.$('#add-ticket-btn');

  if (simSelect) {
    simSelect.innerHTML = state.team.members.map(m => `
      <option value="${m.id}" ${m.id === simulatedId ? 'selected' : ''}>${m.name} (${m.role})</option>
    `).join('');
    
    simSelect.addEventListener('change', () => {
      localStorage.setItem('HACKMATE_SIMULATED_MEMBER_ID', simSelect.value);
      window.location.reload();
    });
  }

  if (simBadge) {
    const activeSimMember = state.team.members.find(m => m.id === simulatedId) || state.team.members[0];
    if (activeSimMember.id === 'm-1') {
      simBadge.innerHTML = `<span style="background: rgba(139, 92, 246, 0.15); color: var(--primary); padding: 4px 8px; border-radius: 4px; border: 1px solid rgba(139, 92, 246, 0.3);"><i data-lucide="shield" style="width:12px; height:12px; display:inline-block; vertical-align:middle; margin-right:4px;"></i> Team Leader View (Admin: Add & View All)</span>`;
    } else {
      simBadge.innerHTML = `<span style="background: rgba(16, 185, 129, 0.15); color: var(--secondary); padding: 4px 8px; border-radius: 4px; border: 1px solid rgba(16, 185, 129, 0.3);"><i data-lucide="user" style="width:12px; height:12px; display:inline-block; vertical-align:middle; margin-right:4px;"></i> Contributor View (Only showing tasks for ${activeSimMember.name})</span>`;
    }
  }

  if (addTicketBtn) {
    if (simulatedId === 'm-1') {
      addTicketBtn.style.display = 'inline-flex';
    } else {
      addTicketBtn.style.display = 'none';
    }
  }

  // Set default date input for task creation (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateInput = Utils.$('#task-deadline');
  if (dateInput) {
    dateInput.value = tomorrow.toISOString().split('T')[0];
  }

  // Form submit: Create Task (Only for Team Leader m-1)
  const createTaskForm = Utils.$('#create-task-form');
  if (createTaskForm) {
    createTaskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const title = Utils.$('#task-title').value.trim();
      const desc = Utils.$('#task-desc').value.trim();
      const assigneeId = Utils.$('#task-assignee').value;
      const priority = Utils.$('#task-priority').value;
      const deadline = Utils.$('#task-deadline').value;
      const labelsStr = Utils.$('#task-labels').value.trim();

      const labels = labelsStr ? labelsStr.split(',').map(s => s.trim()) : [];

      Utils.State.update(draft => {
        draft.tasks.push({
          id: `task-${Date.now()}`,
          title,
          desc,
          status: 'todo',
          priority,
          assigneeId,
          deadline: new Date(deadline).toISOString(),
          labels,
          progress: 0,
          comments: []
        });
      });

      createTaskForm.reset();
      Utils.closeModal('create-task-modal');
      renderKanban(Utils.State.get());
      Utils.showToast('Ticket created successfully!', 'success');
    });
  }

  // Bind Card Click to Details Modal
  document.addEventListener('click', (e) => {
    const card = e.target.closest('.kanban-card');
    if (card) {
      const taskId = card.getAttribute('data-task-id');
      inspectTaskDetails(taskId, Utils.State.get());
    }
  });

  // Handle Detail Status Move
  const statusSelect = Utils.$('#detail-move-status');
  if (statusSelect) {
    statusSelect.addEventListener('change', () => {
      if (!currentInspectTaskId) return;
      const newStatus = statusSelect.value;

      Utils.State.update(draft => {
        const t = draft.tasks.find(x => x.id === currentInspectTaskId);
        if (t) {
          t.status = newStatus;
          t.progress = newStatus === 'completed' ? 100 : newStatus === 'review' ? 80 : newStatus === 'in-progress' ? 50 : 10;
        }
      });

      renderKanban(Utils.State.get());
      
      // Update badge in modal
      const badge = Utils.$('#detail-task-status');
      if (badge) {
        badge.innerText = newStatus;
        badge.className = `badge ${newStatus === 'completed' ? 'badge-success' : newStatus === 'review' ? 'badge-info' : newStatus === 'in-progress' ? 'badge-warning' : 'badge-purple'}`;
      }

      Utils.showToast('Ticket moved successfully.', 'success');
    });
  }

  // Handle Detail Comment Submissions
  const detailCommentForm = Utils.$('#detail-comment-form');
  if (detailCommentForm) {
    detailCommentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = Utils.$('#detail-comment-input');
      const text = input.value.trim();
      if (!text || !currentInspectTaskId) return;

      const simulatedId = localStorage.getItem('HACKMATE_SIMULATED_MEMBER_ID') || 'm-1';

      Utils.State.update(draft => {
        const task = draft.tasks.find(x => x.id === currentInspectTaskId);
        if (task) {
          if (!task.comments) task.comments = [];
          task.comments.push({
            memberId: simulatedId,
            text,
            timestamp: new Date().toISOString()
          });
        }
      });

      input.value = '';
      const updatedState = Utils.State.get();
      renderKanban(updatedState);
      renderDetailComments(updatedState.tasks.find(x => x.id === currentInspectTaskId), updatedState);
      Utils.showToast('Comment added!', 'success');
    });
  }

  // Handle Delete Ticket
  const deleteBtn = Utils.$('#detail-delete-task-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      if (!currentInspectTaskId) return;

      Utils.State.update(draft => {
        draft.tasks = draft.tasks.filter(x => x.id !== currentInspectTaskId);
      });

      Utils.closeModal('task-details-modal');
      renderKanban(Utils.State.get());
      Utils.showToast('Ticket deleted.', 'warning');
    });
  }

  // Handle Handoff / Reassignment for Testing Click
  const reassignSubmitBtn = Utils.$('#detail-reassign-submit-btn');
  if (reassignSubmitBtn) {
    reassignSubmitBtn.addEventListener('click', () => {
      if (!currentInspectTaskId) return;
      const newAssigneeId = Utils.$('#detail-reassign-select').value;
      const simulatedId = localStorage.getItem('HACKMATE_SIMULATED_MEMBER_ID') || 'm-1';
      
      Utils.State.update(draft => {
        const task = draft.tasks.find(x => x.id === currentInspectTaskId);
        if (task) {
          const fromMember = draft.team.members.find(m => m.id === simulatedId) || { name: 'Collaborator' };
          const toMember = draft.team.members.find(m => m.id === newAssigneeId) || { name: 'Teammate' };
          
          task.assigneeId = newAssigneeId;
          task.status = 'in-progress';
          task.progress = 50;
          
          if (!task.comments) task.comments = [];
          task.comments.push({
            memberId: simulatedId,
            text: `🔄 Handed off this ticket to ${toMember.name} for testing/review.`,
            timestamp: new Date().toISOString()
          });
        }
      });

      Utils.closeModal('task-details-modal');
      const updatedState = Utils.State.get();
      renderKanban(updatedState);
      Utils.showToast("Ticket reassigned and marked In Progress for testing!", "success");
    });
  }
});

// --- Populate dropdown ---
function populateAssigneeSelects(state) {
  const select = Utils.$('#task-assignee');
  if (!select) return;

  select.innerHTML = state.team.members.map(m => `
    <option value="${m.id}">${m.name} (${m.avatar})</option>
  `).join('');
}

// --- Render Board columns ---
function renderKanban(state) {
  const columns = ['todo', 'in-progress', 'completed'];
  const simulatedId = localStorage.getItem('HACKMATE_SIMULATED_MEMBER_ID') || 'm-1';
  
  columns.forEach(col => {
    const listContainer = Utils.$(`#list-${col}`);
    const countEl = Utils.$(`#count-${col}`);
    if (!listContainer) return;

    // Filter tasks for this column based on simulated view
    let filteredTasks = state.tasks.filter(t => t.status === col);
    if (simulatedId !== 'm-1') {
      filteredTasks = filteredTasks.filter(t => t.assigneeId === simulatedId);
    }
    if (countEl) countEl.innerText = filteredTasks.length;

    if (filteredTasks.length === 0) {
      listContainer.innerHTML = `
        <div style="font-size:10px; color:var(--text-muted); text-align:center; padding:30px 0; border:1px dashed var(--border-color-light); border-radius:var(--radius-sm);">
          No tickets here.
        </div>
      `;
      return;
    }

    listContainer.innerHTML = filteredTasks.map(task => {
      const assignee = state.team.members.find(m => m.id === task.assigneeId) || { name: 'Unassigned', avatar: '?', color: 'var(--text-muted)' };
      const priorityClass = task.priority === 'high' ? 'badge-danger' : task.priority === 'medium' ? 'badge-warning' : 'badge-info';
      const labelsHtml = task.labels.map(l => `<span class="badge badge-purple" style="font-size:9px; padding:0 4px; background:rgba(139,92,246,0.08); border:1px solid rgba(139,92,246,0.25);">${l}</span>`).join('');
      const commentsCount = task.comments ? task.comments.length : 0;

      return `
        <div class="card kanban-card" data-task-id="${task.id}">
          <div class="kanban-card-header">
            <span class="badge ${priorityClass}">${task.priority}</span>
            <div class="user-avatar" style="width:20px; height:20px; font-size:9px; background-color: ${assignee.color || 'var(--primary)'};" title="Assigned to ${assignee.name}">
              ${assignee.avatar}
            </div>
          </div>
          <h4 class="kanban-card-title">${task.title}</h4>
          <p class="kanban-card-desc">${task.desc}</p>
          
          <div style="display:flex; flex-wrap:wrap; gap:2px; margin-bottom:var(--space-2);">
            ${labelsHtml}
          </div>

          <div class="kanban-card-footer">
            <div class="kanban-card-icons">
              <span class="kanban-card-icon-item" title="Comments"><i data-lucide="message-square" style="width:10px; height:10px;"></i> ${commentsCount}</span>
            </div>
            <span style="font-size:9px; color:var(--text-muted);"><i data-lucide="calendar" style="width:10px; height:10px; display:inline-block; vertical-align:middle; margin-right:2px;"></i> ${task.deadline.split('T')[0]}</span>
          </div>
        </div>
      `;
    }).join('');
  });

  if (window.lucide) window.lucide.createIcons();
}

// --- Inspect Task Details Modal ---
function inspectTaskDetails(taskId, state) {
  currentInspectTaskId = taskId;
  const task = state.tasks.find(x => x.id === taskId);
  if (!task) return;

  const assignee = state.team.members.find(m => m.id === task.assigneeId) || { name: 'Unassigned', avatar: '?', color: 'var(--text-muted)' };

  // Set values
  Utils.$('#detail-task-title').innerText = task.title;
  Utils.$('#detail-task-desc').innerText = task.desc;
  
  const pri = Utils.$('#detail-task-priority');
  pri.innerText = task.priority;
  pri.className = `badge ${task.priority === 'high' ? 'badge-danger' : task.priority === 'medium' ? 'badge-warning' : 'badge-info'}`;

  const st = Utils.$('#detail-task-status');
  st.innerText = task.status;
  st.className = `badge ${task.status === 'completed' ? 'badge-success' : task.status === 'review' ? 'badge-info' : task.status === 'in-progress' ? 'badge-warning' : 'badge-purple'}`;

  const avatar = Utils.$('#detail-task-assignee-avatar');
  avatar.innerText = assignee.avatar;
  avatar.style.backgroundColor = assignee.color || 'var(--primary)';
  
  Utils.$('#detail-task-assignee-name').innerText = assignee.name;
  Utils.$('#detail-task-deadline').innerText = new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  Utils.$('#detail-move-status').value = task.status;

  // Populate hand-off dropdown with other teammates
  const reassignSelect = Utils.$('#detail-reassign-select');
  if (reassignSelect) {
    reassignSelect.innerHTML = state.team.members
      .map(m => `<option value="${m.id}" style="background:var(--bg-surface); color:var(--text-primary);" ${m.id === task.assigneeId ? 'selected' : ''}>${m.name} (${m.avatar})</option>`)
      .join('');
  }

  // Render comments
  renderDetailComments(task, state);

  Utils.openModal('task-details-modal');
}

function renderDetailComments(task, state) {
  const container = Utils.$('#detail-task-comments');
  if (!container) return;

  const comments = task.comments || [];

  if (comments.length === 0) {
    container.innerHTML = `<div style="font-size:10px; color:var(--text-muted); text-align:center; padding:10px 0;">No comments on this ticket yet.</div>`;
    return;
  }

  container.innerHTML = comments.map(c => {
    const commenter = state.team.members.find(m => m.id === c.memberId) || { name: 'Collaborator' };
    return `
      <div class="ballot-comment-item">
        <strong>${commenter.name.split(' ')[0]}:</strong> ${c.text}
      </div>
    `;
  }).join('');
}
