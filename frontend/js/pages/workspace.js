// HackMate AI - Workspace Controller (Ideation Lab & Docs Spec)

document.addEventListener('DOMContentLoaded', () => {
  const state = Utils.State.get();

  // Initialize page features depending on active layout elements
  if (Utils.$('#ideas-grid')) {
    initSolutionLab(state);
  }
  if (Utils.$('#workspace-folders-tree')) {
    initProjectWorkspace(state);
  }
});

// ==========================================
// 1. PROBLEM & SOLUTION LAB BEHAVIOR
// ==========================================

// ==========================================
// 1. PROBLEM & SOLUTION LAB BEHAVIOR
// ==========================================

async function initSolutionLab(state) {
  await syncSolutionLabFromBackend();
  renderSolutionLab(Utils.State.get());

  // Form submit: Edit Problem Statement
  const editProblemForm = Utils.$('#edit-problem-form');
  if (editProblemForm) {
    editProblemForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const txt = Utils.$('#problem-input').value.trim();
      const title = txt.substring(0, 50) + "...";

      const token = localStorage.getItem('HACKMATE_AUTH_TOKEN');
      const apiBase = Utils.State.getApiBaseUrl();

      try {
        const res = await fetch(`${apiBase}/api/problems`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ title, description: txt })
        });
        if (res.ok) {
          showToast('Problem statement saved in PostgreSQL database!', 'success');
        }
      } catch (err) {
        console.warn("Backend problem error:", err);
      }

      Utils.State.update(draft => {
        draft.problemSolutionLab.problemStatement = txt;
      });
      Utils.closeModal('edit-problem-modal');
      renderSolutionLab(Utils.State.get());
    });
  }

  // Form submit: Add Pain Point
  const addPainForm = Utils.$('#add-pain-form');
  if (addPainForm) {
    addPainForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = Utils.$('#pain-input').value.trim();
      Utils.State.update(draft => {
        draft.problemSolutionLab.painPoints.push({
          id: `pp-${Date.now()}`,
          text,
          votes: 1
        });
      });
      addPainForm.reset();
      Utils.closeModal('add-pain-modal');
      renderSolutionLab(Utils.State.get());
      Utils.showToast('Pain point recorded!', 'success');
    });
  }

  // Form submit: Add Idea / Solution
  const addIdeaForm = Utils.$('#add-idea-form');
  if (addIdeaForm) {
    addIdeaForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = Utils.$('#idea-title-input').value.trim();
      const description = Utils.$('#idea-desc-input').value.trim();
      const prosStr = Utils.$('#idea-pros-input').value.trim();
      const consStr = Utils.$('#idea-cons-input').value.trim();

      const pros = prosStr ? prosStr.split(',').map(s => s.trim()) : [];
      const cons = consStr ? consStr.split(',').map(s => s.trim()) : [];
      const currentUser = Utils.State.get().team.members.find(m => m.isCurrentUser) || { name: 'User' };

      const token = localStorage.getItem('HACKMATE_AUTH_TOKEN');
      const apiBase = Utils.State.getApiBaseUrl();

      try {
        const res = await fetch(`${apiBase}/api/solutions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ title, description, pros, cons })
        });
        if (res.ok) {
          showToast('Solution idea saved in database!', 'success');
        }
      } catch (err) {
        console.warn("Backend solution error:", err);
      }

      Utils.State.update(draft => {
        draft.problemSolutionLab.ideas.push({
          id: `idea-${Date.now()}`,
          title,
          description,
          pros,
          cons,
          score: 0.0,
          votes: 0,
          author: currentUser.name
        });
      });

      addIdeaForm.reset();
      Utils.closeModal('add-idea-modal');
      renderSolutionLab(Utils.State.get());
    });
  }

async function syncSolutionLabFromBackend() {
  const token = localStorage.getItem('HACKMATE_AUTH_TOKEN');
  if (!token) return;

  try {
    const apiBase = Utils.State.getApiBaseUrl();
    const [probRes, solRes] = await Promise.all([
      fetch(`${apiBase}/api/problems`, { headers: { 'Authorization': `Bearer ${token}` } }),
      fetch(`${apiBase}/api/solutions`, { headers: { 'Authorization': `Bearer ${token}` } })
    ]);

    if (probRes.ok) {
      const problems = await probRes.json();
      if (Array.isArray(problems) && problems.length > 0) {
        Utils.State.update(draft => {
          draft.problemSolutionLab.problemStatement = problems[0].description || problems[0].title;
        });
      }
    }

    if (solRes.ok) {
      const solutions = await solRes.json();
      if (Array.isArray(solutions) && solutions.length > 0) {
        Utils.State.update(draft => {
          draft.problemSolutionLab.ideas = solutions.map(s => ({
            id: s.id,
            title: s.title,
            description: s.description || '',
            pros: s.pros || [],
            cons: s.cons || [],
            score: s.votes_count ? 4.5 : 0.0,
            votes: s.votes_count || 0,
            author: s.created_by || 'Team Hacker'
          }));
        });
      }
    }
  } catch (e) {
    console.warn("Backend sync solution lab error:", e);
  }
}

  // Handle Pain Point Upvotes
  document.addEventListener('click', (e) => {
    const upvoteBtn = e.target.closest('.pain-upvote-btn');
    if (upvoteBtn) {
      const painId = upvoteBtn.getAttribute('data-pain-id');
      Utils.State.update(draft => {
        const item = draft.problemSolutionLab.painPoints.find(p => p.id === painId);
        if (item) item.votes++;
      });
      renderSolutionLab(Utils.State.get());
      Utils.showToast('Pain point upvoted.', 'info');
    }
  });

  // Handle Star Click Rating (Merged from Voting Board)
  document.addEventListener('click', (e) => {
    const star = e.target.closest('.star-icon');
    if (star) {
      const ideaId = star.getAttribute('data-idea-id');
      const rating = parseInt(star.getAttribute('data-value'));
      const currentUser = Utils.State.get().team.members.find(m => m.isCurrentUser);

      Utils.State.update(draft => {
        // Ensure votes array exists
        if (!draft.votes) draft.votes = [];
        
        let userVote = draft.votes.find(v => v.ideaId === ideaId && v.memberId === currentUser.id);
        if (userVote) {
          userVote.rating = rating;
        } else {
          draft.votes.push({
            ideaId,
            rating,
            memberId: currentUser.id,
            comment: ""
          });
          const idea = draft.problemSolutionLab.ideas.find(i => i.id === ideaId);
          if (idea) idea.votes++;
        }

        // Recompute average score
        const ideaVotes = draft.votes.filter(v => v.ideaId === ideaId);
        const avg = ideaVotes.reduce((sum, v) => sum + v.rating, 0) / ideaVotes.length;
        const idea = draft.problemSolutionLab.ideas.find(i => i.id === ideaId);
        if (idea) idea.score = avg;
      });

      renderSolutionLab(Utils.State.get());
      Utils.showToast(`Rated ${rating} stars!`, 'success');
    }
  });

  // Handle Feedback Comment Submit (Merged from Voting Board)
  document.addEventListener('submit', (e) => {
    const commentForm = e.target.closest('.ballot-comment-form');
    if (commentForm) {
      e.preventDefault();
      const ideaId = commentForm.getAttribute('data-idea-id');
      const input = commentForm.querySelector('.ballot-comment-input');
      const text = input.value.trim();

      if (text) {
        const currentUser = Utils.State.get().team.members.find(m => m.isCurrentUser);
        Utils.State.update(draft => {
          if (!draft.votes) draft.votes = [];
          
          let userVote = draft.votes.find(v => v.ideaId === ideaId && v.memberId === currentUser.id);
          if (userVote) {
            userVote.comment = text;
          } else {
            draft.votes.push({
              ideaId,
              rating: 5, // Default baseline rating if commenting
              memberId: currentUser.id,
              comment: text
            });
            const idea = draft.problemSolutionLab.ideas.find(i => i.id === ideaId);
            if (idea) idea.votes++;
          }
        });
        
        input.value = '';
        renderSolutionLab(Utils.State.get());
        Utils.showToast('Teammate review saved!', 'success');
      }
    }
  });
}

function renderSolutionLab(state) {
  // Display Problem Statement
  const probDisplay = Utils.$('#problem-statement-display');
  const probInput = Utils.$('#problem-input');
  if (probDisplay) {
    probDisplay.innerText = state.problemSolutionLab.problemStatement;
  }
  if (probInput) {
    probInput.value = state.problemSolutionLab.problemStatement;
  }

  // Display Pain Points
  const painGrid = Utils.$('#pain-points-grid');
  if (painGrid) {
    painGrid.innerHTML = state.problemSolutionLab.painPoints.map(pp => `
      <div class="card pain-card">
        <div class="pain-header">
          <span class="badge badge-purple">Pain Index</span>
          <button class="btn btn-icon btn-sm pain-upvote-btn" data-pain-id="${pp.id}" title="Upvote Pain Point">
            <i data-lucide="chevron-up" style="width:14px; height:14px;"></i>
          </button>
        </div>
        <p style="font-size: var(--font-size-sm); margin-bottom: var(--space-3); color: var(--text-primary); font-weight:500;">
          ${pp.text}
        </p>
        <div style="font-size: var(--font-size-xs); color: var(--text-muted); display:flex; align-items:center; gap:4px;">
          <i data-lucide="thumbs-up" style="width:12px; height:12px;"></i> ${pp.votes} confirmations
        </div>
      </div>
    `).join('');
  }

  // Calculate & Update Spotlight Leading Concept
  const ideas = state.problemSolutionLab.ideas || [];
  let winningIdea = null;
  if (ideas.length > 0) {
    winningIdea = ideas.reduce((best, curr) => {
      if (!best) return curr;
      if (curr.score > best.score) return curr;
      if (curr.score === best.score && curr.votes > best.votes) return curr;
      return best;
    }, null);
  }

  const winTitle = Utils.$('#winning-concept-title');
  const winDesc = Utils.$('#winning-concept-desc');
  if (winTitle && winDesc) {
    if (winningIdea && winningIdea.votes > 0) {
      winTitle.innerText = `${winningIdea.title} (${winningIdea.score.toFixed(1)} / 5.0 Stars)`;
      winDesc.innerText = `Leading concept pitched by ${winningIdea.author}. Cons: ${winningIdea.cons.join(', ') || 'None'}`;
    } else {
      winTitle.innerText = "No Leading Concept Yet";
      winDesc.innerText = "Cast the first ballot below to select the winning feature set.";
    }
  }

  // Display Solution Ideas with embedded ballot rating systems
  const ideasGrid = Utils.$('#ideas-grid');
  if (ideasGrid) {
    const currentUser = state.team.members.find(m => m.isCurrentUser);
    
    ideasGrid.innerHTML = ideas.map(idea => {
      const prosHtml = idea.pros.map(p => `<li>${p}</li>`).join('');
      const consHtml = idea.cons.map(c => `<li>${c}</li>`).join('');

      // Get rating for current user
      const userVote = (state.votes || []).find(v => v.ideaId === idea.id && v.memberId === currentUser.id);
      const userRating = userVote ? userVote.rating : 0;

      // Draw star widget HTML
      let starsHtml = '';
      for (let i = 1; i <= 5; i++) {
        starsHtml += `<i data-lucide="star" class="star-icon ${i <= userRating ? 'active' : ''}" data-idea-id="${idea.id}" data-value="${i}" style="width: 14px; height: 14px;"></i>`;
      }

      // Collect teammate reviews
      const ideaComments = (state.votes || []).filter(v => v.ideaId === idea.id && v.comment);
      let commentsHtml = '';
      if (ideaComments.length > 0) {
        commentsHtml = ideaComments.map(c => {
          const authorMember = state.team.members.find(m => m.id === c.memberId) || { name: 'Unknown' };
          return `
            <div class="ballot-comment-item">
              <strong style="color: var(--text-primary);">${authorMember.name.split(' ')[0]}:</strong> "${c.comment}"
            </div>
          `;
        }).join('');
      } else {
        commentsHtml = `<div style="font-size:10px; color:var(--text-muted); text-align:center; padding:var(--space-2) 0;">No reviews logged yet.</div>`;
      }

      const totalMembers = state.team.members.length;
      const votersCount = (state.votes || []).filter(v => v.ideaId === idea.id).length;

      return `
        <div class="card idea-card" style="display:flex; flex-direction:column; justify-content:space-between; gap:var(--space-4);">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:var(--space-2);">
              <h3 style="color:var(--text-primary); font-size:var(--font-size-md);">${idea.title}</h3>
              <span class="badge badge-success" style="font-weight:600;"><i data-lucide="star" style="width:10px; margin-right:2px; fill:var(--success);"></i> ${idea.score ? idea.score.toFixed(1) : '0.0'}</span>
            </div>
            <p style="font-size:var(--font-size-sm); color:var(--text-secondary); margin-bottom:var(--space-4);">${idea.description}</p>
            
            <div class="pro-con-grid" style="margin-bottom:var(--space-4);">
              <div>
                <strong style="font-size:9px; text-transform:uppercase; color:var(--text-muted); display:block; margin-bottom:4px;">Pros</strong>
                <ul class="pro-list" style="font-size:11px; padding-left:12px; color:var(--success);">${prosHtml}</ul>
              </div>
              <div>
                <strong style="font-size:9px; text-transform:uppercase; color:var(--text-muted); display:block; margin-bottom:4px;">Cons</strong>
                <ul class="con-list" style="font-size:11px; padding-left:12px; color:var(--danger);">${consHtml}</ul>
              </div>
            </div>
          </div>

          <!-- Integrated Voting Ballot -->
          <div style="border-top:1px solid var(--border-color-light); padding-top:var(--space-3); background:rgba(255,255,255,0.01); border-radius:var(--radius-sm); padding:var(--space-3);">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:var(--space-2);">
              <span style="font-size:10px; font-weight:700; color:var(--text-secondary);">YOUR BALLOT</span>
              <div class="rating-stars">${starsHtml}</div>
            </div>

            <!-- Ballot Tally -->
            <div style="margin-bottom: var(--space-3);">
              <div style="display:flex; justify-content:space-between; font-size:9px; color:var(--text-muted); margin-bottom:2px;">
                <span>Teammates Voted</span>
                <span>${votersCount} of ${totalMembers}</span>
              </div>
              <div class="progress-bar-container" style="height:4px;">
                <div class="progress-bar-fill" style="width: ${(votersCount / totalMembers) * 100}%; background-color: var(--secondary);"></div>
              </div>
            </div>

            <!-- Teammate reviews list -->
            <span style="font-size:9px; font-weight:700; color:var(--text-muted); display:block; margin-bottom:2px; text-transform:uppercase;">Reviews Feed</span>
            <div class="ballot-comments-list">${commentsHtml}</div>

            <!-- Submit comment inline -->
            <form class="ballot-comment-form" data-idea-id="${idea.id}" style="display:flex; gap:4px; margin-top:var(--space-2);">
              <input type="text" class="input-control ballot-comment-input" placeholder="Add feedback review..." style="flex-grow:1; padding:4px 8px; font-size:11px;" required>
              <button type="submit" class="btn btn-primary btn-sm" style="padding:4px 8px; font-size:10px;">Post</button>
            </form>
          </div>
          
          <div style="font-size:var(--font-size-xs); color:var(--text-muted); display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-color-light); padding-top:var(--space-2); margin-top:2px;">
            <span>Pitched by <strong style="color:var(--text-primary);">${idea.author}</strong></span>
            <span>(${idea.votes} votes cast)</span>
          </div>
        </div>
      `;
    }).join('');
  }

  if (window.lucide) window.lucide.createIcons();
}

// ==========================================
// 2. PROJECT WORKSPACE BEHAVIOR (NOTION STYLE)
// ==========================================

let activeFileId = null;

function initProjectWorkspace(state) {
  renderWorkspaceTree(state);
  
  // Load first file by default if available
  if (state.workspace.folders.length > 0 && state.workspace.folders[0].files.length > 0) {
    selectFile(state.workspace.folders[0].files[0].id, state);
  }

  // Editor Input Auto-Save
  const titleInput = Utils.$('#active-doc-title');
  const textarea = Utils.$('#active-doc-content');

  const autoSave = () => {
    if (!activeFileId) return;
    const title = titleInput.value;
    const content = textarea.value;

    Utils.State.update(draft => {
      draft.workspace.folders.forEach(folder => {
        const file = folder.files.find(f => f.id === activeFileId);
        if (file) {
          file.title = title;
          file.content = content;
        }
      });
    });
    
    // Update active tree link text
    const treeLink = Utils.$(`.workspace-tree-file-link[data-file-id="${activeFileId}"] span`);
    if (treeLink) {
      treeLink.innerText = title || 'Untitled Note';
    }
  };

  if (titleInput && textarea) {
    titleInput.addEventListener('input', autoSave);
    textarea.addEventListener('input', autoSave);
  }

  // Handle New File & Folder Creation (Upgraded Dialog)
  const newFileBtn = Utils.$('#new-document-trigger');
  if (newFileBtn) {
    newFileBtn.addEventListener('click', () => {
      const noteTitle = Utils.$('#note-title-input').value.trim() || 'Untitled Note';
      const folderSelectId = Utils.$('#folder-select').value;
      const newFolderText = Utils.$('#new-folder-input').value.trim();
      
      const newFileId = `doc-${Date.now()}`;
      
      Utils.State.update(draft => {
        let folderId = folderSelectId;
        
        // Create new folder if requested
        if (newFolderText) {
          const existingFolder = draft.workspace.folders.find(f => f.name.toLowerCase() === newFolderText.toLowerCase());
          if (existingFolder) {
            folderId = existingFolder.id;
          } else {
            folderId = `f-${Date.now()}`;
            draft.workspace.folders.push({
              id: folderId,
              name: newFolderText,
              files: []
            });
          }
        }
        
        const folder = draft.workspace.folders.find(f => f.id === folderId) || draft.workspace.folders[0];
        folder.files.push({
          id: newFileId,
          title: noteTitle,
          content: ''
        });
      });

      // Clear input fields
      Utils.$('#note-title-input').value = '';
      Utils.$('#new-folder-input').value = '';

      const updated = Utils.State.get();
      renderWorkspaceTree(updated);
      selectFile(newFileId, updated);
      Utils.showToast(`Document created in folder!`, 'success');
    });
  }
}

function renderWorkspaceTree(state) {
  const treeContainer = Utils.$('#workspace-folders-tree');
  const folderSelect = Utils.$('#folder-select');
  if (!treeContainer) return;

  // Render tree links
  treeContainer.innerHTML = state.workspace.folders.map(folder => {
    const filesHtml = folder.files.map(file => `
      <div class="workspace-tree-file-link ${file.id === activeFileId ? 'active' : ''}" data-file-id="${file.id}">
        <i data-lucide="file-text" style="width:14px; height:14px;"></i>
        <span>${file.title || 'Untitled Note'}</span>
      </div>
    `).join('');

    return `
      <div class="workspace-tree-folder">
        <div class="workspace-tree-header">
          <i data-lucide="folder" style="width:16px; height:16px;"></i>
          <span>${folder.name}</span>
        </div>
        <div class="workspace-tree-files">
          ${filesHtml}
        </div>
      </div>
    `;
  }).join('');

  // Populate folder selection options in modal
  if (folderSelect) {
    folderSelect.innerHTML = state.workspace.folders.map(f => `<option value="${f.id}">${f.name}</option>`).join('');
  }

  // Bind clicks to files
  treeContainer.querySelectorAll('.workspace-tree-file-link').forEach(link => {
    link.addEventListener('click', () => {
      const fileId = link.getAttribute('data-file-id');
      selectFile(fileId, Utils.State.get());
    });
  });

  if (window.lucide) window.lucide.createIcons();
}

function selectFile(fileId, state) {
  activeFileId = fileId;
  
  // Highlight active tree links
  Utils.$$('.workspace-tree-file-link').forEach(link => {
    if (link.getAttribute('data-file-id') === fileId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Find file and load content
  let selectedFile = null;
  state.workspace.folders.forEach(f => {
    const found = f.files.find(doc => doc.id === fileId);
    if (found) selectedFile = found;
  });

  if (selectedFile) {
    Utils.$('#active-doc-title').value = selectedFile.title;
    Utils.$('#active-doc-content').value = selectedFile.content;
    Utils.$('#editor-placeholder').style.display = 'none';
    Utils.$('#editor-frame').style.display = 'flex';
  }
}
