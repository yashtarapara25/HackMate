// HackMate AI - Kanban Task Board Controller

let currentInspectTaskId = null;

document.addEventListener('DOMContentLoaded', async () => {
  await syncTasksFromBackend();
  let state = Utils.State.get();

  // Populate Board and Assignees Dropdown
  renderKanban(state);
  populateAssigneeSelects(state);

  // Set default date input for task creation (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateInput = Utils.$('#task-deadline');
  if (dateInput) {
    dateInput.value = tomorrow.toISOString().split('T')[0];
  }

  // Form submit: Create Task
  const createTaskForm = Utils.$('#create-task-form');
  if (createTaskForm) {
    createTaskForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const title = Utils.$('#task-title').value.trim();
      const desc = Utils.$('#task-desc').value.trim();
      const priority = Utils.$('#task-priority').value;
      const deadline = Utils.$('#task-deadline').value;

      const token = localStorage.getItem('HACKMATE_AUTH_TOKEN');
      const apiBase = Utils.State.getApiBaseUrl();

      try {
        const res = await fetch(`${apiBase}/api/tasks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title,
            description: desc,
            priority,
            status: 'todo',
            due_date: new Date(deadline).toISOString()
          })
        });

        if (res.ok) {
          const newTask = await res.json();
          showToast(`Task "${newTask.title}" created in PostgreSQL!`, 'success');
          createTaskForm.reset();
          Utils.closeModal('create-task-modal');
          await syncTasksFromBackend();
          renderKanban(Utils.State.get());
        } else {
          const err = await res.json();
          showToast(err.detail || "Failed to create task", "danger");
        }
      } catch (err) {
        showToast("Error creating task on backend", "danger");
      }
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
    statusSelect.addEventListener('change', async () => {
      if (!currentInspectTaskId) return;
      const newStatus = statusSelect.value;
      const token = localStorage.getItem('HACKMATE_AUTH_TOKEN');
      const apiBase = Utils.State.getApiBaseUrl();

      try {
        await fetch(`${apiBase}/api/tasks/${currentInspectTaskId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: newStatus })
        });
      } catch (e) {
        console.warn("Failed to update task status on backend:", e);
      }

      Utils.State.update(draft => {
        const t = draft.tasks.find(x => x.id === currentInspectTaskId);
        if (t) {
          t.status = newStatus;
          t.progress = newStatus === 'completed' ? 100 : newStatus === 'review' ? 80 : newStatus === 'in-progress' ? 50 : 10;
        }
      });

      renderKanban(Utils.State.get());
      
      const badge = Utils.$('#detail-task-status');
      if (badge) {
        badge.innerText = newStatus;
        badge.className = `badge ${newStatus === 'completed' ? 'badge-success' : newStatus === 'review' ? 'badge-info' : newStatus === 'in-progress' ? 'badge-warning' : 'badge-purple'}`;
      }

      showToast('Task status updated in database.', 'success');
    });
  }
});

async function syncTasksFromBackend() {
  const token = localStorage.getItem('HACKMATE_AUTH_TOKEN');
  if (!token) return;

  try {
    const apiBase = Utils.State.getApiBaseUrl();
    const res = await fetch(`${apiBase}/api/tasks`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const tasks = await res.json();
      if (Array.isArray(tasks)) {
        Utils.State.update(draft => {
          draft.tasks = tasks.map(t => ({
            id: t.id,
            title: t.title,
            desc: t.description || '',
            status: t.status || 'todo',
            priority: t.priority || 'medium',
            assigneeId: t.assigned_to || '',
            deadline: t.due_date || new Date().toISOString(),
            labels: [],
            progress: t.status === 'completed' ? 100 : 0,
            comments: []
          }));
        });
      }
    }
  } catch (e) {
    console.warn("Error syncing tasks from backend:", e);
  }
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
