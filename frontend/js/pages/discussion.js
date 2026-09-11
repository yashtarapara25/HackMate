// HackMate AI - Discussion Board Controller

let activeChannelId = 'ch-general';

document.addEventListener('DOMContentLoaded', () => {
  let state = Utils.State.get();

  // Populate channel list
  renderChannels(state);
  // Populate initial chat
  renderChatMessages(state);

  // Send Message form
  const sendForm = Utils.$('#chat-send-form');
  if (sendForm) {
    sendForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const box = Utils.$('#chat-input-box');
      const text = box.value.trim();
      if (!text) return;

      const currentUser = Utils.State.get().team.members.find(m => m.isCurrentUser);

      Utils.State.update(draft => {
        if (!draft.discussion.messages[activeChannelId]) {
          draft.discussion.messages[activeChannelId] = [];
        }

        draft.discussion.messages[activeChannelId].push({
          id: `msg-${Date.now()}`,
          memberId: currentUser.id,
          text,
          timestamp: new Date().toISOString(),
          reactions: []
        });
      });

      box.value = '';
      renderChatMessages(Utils.State.get());
      scrollChatToBottom();
      Utils.showToast('Message sent!', 'info');
    });
  }

  // Handle Channel Switch Clicks
  document.addEventListener('click', (e) => {
    const chLink = e.target.closest('.channel-link');
    if (chLink) {
      const channelId = chLink.getAttribute('data-channel-id');
      activeChannelId = channelId;
      
      // Update UI active link
      Utils.$$('.channel-link').forEach(link => {
        if (link.getAttribute('data-channel-id') === channelId) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });

      renderChatMessages(Utils.State.get());
      scrollChatToBottom();
    }
  });

  // Handle message reactions
  document.addEventListener('click', (e) => {
    const reactBtn = e.target.closest('.reaction-badge');
    if (reactBtn) {
      const msgId = reactBtn.getAttribute('data-msg-id');
      const emoji = reactBtn.getAttribute('data-emoji');

      Utils.State.update(draft => {
        const msgs = draft.discussion.messages[activeChannelId] || [];
        const msg = msgs.find(m => m.id === msgId);
        if (msg) {
          const reaction = msg.reactions.find(r => r.emoji === emoji);
          if (reaction) {
            reaction.count++;
          } else {
            msg.reactions.push({ emoji, count: 1 });
          }
        }
      });

      renderChatMessages(Utils.State.get());
    }
  });

  // Handle New Channel Creation
  const newChannelSubmit = Utils.$('#new-channel-submit');
  if (newChannelSubmit) {
    newChannelSubmit.addEventListener('click', () => {
      const nameInput = Utils.$('#channel-name-input');
      const descInput = Utils.$('#channel-desc-input');
      
      let name = nameInput.value.trim().toLowerCase();
      const topic = descInput.value.trim() || 'No topic set';

      if (name) {
        name = name.replace(/[^a-z0-9-_]/g, ''); // Clean name
        const newId = `ch-${name}`;

        Utils.State.update(draft => {
          const exists = draft.discussion.channels.some(c => c.id === newId);
          if (!exists) {
            draft.discussion.channels.push({
              id: newId,
              name: name,
              topic: topic
            });
            if (!draft.discussion.messages) draft.discussion.messages = {};
            draft.discussion.messages[newId] = [];
          }
        });

        nameInput.value = '';
        descInput.value = '';
        activeChannelId = newId;
        
        const updated = Utils.State.get();
        renderChannels(updated);
        renderChatMessages(updated);
        scrollChatToBottom();
        Utils.showToast(`Channel #${name} created!`, 'success');
      }
    });
  }
});

// --- Populators ---

function renderChannels(state) {
  const container = Utils.$('#channels-list-container');
  if (!container) return;

  container.innerHTML = state.discussion.channels.map(ch => `
    <div class="channel-link ${ch.id === activeChannelId ? 'active' : ''}" data-channel-id="${ch.id}">
      <i data-lucide="hash" style="width:14px; height:14px;"></i>
      <span>${ch.name}</span>
    </div>
  `).join('');

  if (window.lucide) window.lucide.createIcons();
}

function renderChatMessages(state) {
  const channel = state.discussion.channels.find(ch => ch.id === activeChannelId);
  if (!channel) return;

  // Header Title & Topic
  Utils.$('#active-channel-name').innerHTML = `<i data-lucide="hash" style="width:18px;"></i> ${channel.name}`;
  Utils.$('#active-channel-topic').innerText = channel.topic;
  Utils.$('#chat-input-box').placeholder = `Message #${channel.name}...`;

  const container = Utils.$('#chat-messages-container');
  if (!container) return;

  const msgs = state.discussion.messages[activeChannelId] || [];

  if (msgs.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: var(--space-8) 0;">
        <i data-lucide="message-square" class="empty-state-icon"></i>
        <h4 class="empty-state-title">Welcome to #${channel.name}!</h4>
        <p class="empty-state-desc">This is the start of the #${channel.name} channel. Introduce ideas or check in on components!</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  container.innerHTML = msgs.map(msg => {
    const sender = state.team.members.find(m => m.id === msg.memberId) || { name: 'Anonymous', avatar: '?', color: 'var(--text-muted)' };
    const relativeTime = Utils.getRelativeTime(msg.timestamp);

    // Build reaction HTML
    // Always provide options to quickly tap emojis (+🔥 or +👍)
    const activeReactions = (msg.reactions || []).map(r => `
      <div class="reaction-badge" data-msg-id="${msg.id}" data-emoji="${r.emoji}">
        <span>${r.emoji}</span>
        <span>${r.count}</span>
      </div>
    `).join('');

    return `
      <div class="chat-message-item">
        <div class="user-avatar" style="background-color: ${sender.color || 'var(--primary)'}; width:36px; height:36px; flex-shrink:0;">
          ${sender.avatar}
        </div>
        <div class="chat-msg-body">
          <div class="chat-msg-meta">
            <span class="chat-msg-user">${sender.name}</span>
            <span class="chat-msg-time">${relativeTime}</span>
          </div>
          <p class="chat-msg-text">${msg.text}</p>
          <div class="reactions-bar">
            ${activeReactions}
            <div class="reaction-badge" data-msg-id="${msg.id}" data-emoji="👍" title="React with Thumbs Up">
              <i data-lucide="smile" style="width:10px; height:10px;"></i> +👍
            </div>
            <div class="reaction-badge" data-msg-id="${msg.id}" data-emoji="🔥" title="React with Fire">
              <i data-lucide="flame" style="width:10px; height:10px;"></i> +🔥
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

function scrollChatToBottom() {
  const container = Utils.$('#chat-messages-container');
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}
