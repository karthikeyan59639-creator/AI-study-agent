// StudyMate AI - Main Controller & UI Renderer

// Lightweight Confetti Particle System
function launchConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6'];

  for (let i = 0; i < 60; i++) {
    particles.push({
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
      y: window.innerHeight / 2 - 50,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 0.5) * 12 - 4,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 10
    });
  }

  let animationFrame;
  function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.3; // gravity
      p.alpha -= 0.015;
      p.rotation += p.vRot;

      if (p.alpha > 0) {
        active = true;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
    });

    if (active) {
      animationFrame = requestAnimationFrame(update);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cancelAnimationFrame(animationFrame);
    }
  }

  update();
}

class AppController {
  constructor() {
    this.currentView = 'landing'; // default view
    this.ocrSelectedSample = 'blackboard';
    this.parsedStagingTasks = [];
    this.init();
  }

  init() {
    // Subscribe store
    window.store.subscribe((state) => {
      this.updateNavbarBadges();
      if (this.currentView === 'dashboard') this.renderDashboard();
      if (this.currentView === 'calendar') window.academicCalendar.render();
      if (this.currentView === 'subjects') this.renderSubjects();
      if (this.currentView === 'analytics') window.productivityAnalytics.render();
      if (this.currentView === 'notifications') this.renderNotifications();
    });

    // Handle hash navigation
    window.addEventListener('hashchange', () => {
      this.handleRoute();
    });

    // Audio toggle button
    const audioBtn = document.getElementById('sound-toggle-btn');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        const enabled = window.soundFX.toggle();
        this.updateAudioButtonState(enabled);
      });
      this.updateAudioButtonState(window.soundFX.enabled);
    }

    // Initial route check
    this.handleRoute();
    this.setupEventListeners();
    this.updateNavbarBadges();
  }

  updateAudioButtonState(enabled) {
    const icon = document.getElementById('sound-icon');
    if (icon) {
      icon.textContent = enabled ? '🔊' : '🔇';
      icon.title = enabled ? 'Sound Effects Enabled (Click to Mute)' : 'Sound Effects Muted (Click to Enable)';
    }
  }

  handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'landing';
    this.switchView(hash);
  }

  switchView(viewName) {
    const validViews = ['landing', 'dashboard', 'add-task', 'assistant', 'calendar', 'subjects', 'analytics', 'notifications'];
    if (!validViews.includes(viewName)) viewName = 'dashboard';

    this.currentView = viewName;

    // Toggle view elements
    document.querySelectorAll('.app-view').forEach(el => {
      el.classList.remove('active');
    });

    const activeEl = document.getElementById(`view-${viewName}`);
    if (activeEl) {
      activeEl.classList.add('active');
    }

    // Toggle nav active state
    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.getAttribute('data-view') === viewName) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Render corresponding view
    if (viewName === 'dashboard') this.renderDashboard();
    if (viewName === 'calendar') window.academicCalendar.render();
    if (viewName === 'subjects') this.renderSubjects();
    if (viewName === 'analytics') window.productivityAnalytics.render();
    if (viewName === 'notifications') this.renderNotifications();
    if (viewName === 'assistant') this.scrollChatToBottom();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  updateNavbarBadges() {
    const unread = window.store.state.notifications.filter(n => !n.read).length;
    const badge = document.getElementById('nav-notif-badge');
    if (badge) {
      if (unread > 0) {
        badge.textContent = unread;
        badge.style.display = 'inline-flex';
      } else {
        badge.style.display = 'none';
      }
    }

    const userName = document.getElementById('nav-user-name');
    if (userName) {
      userName.textContent = window.store.state.studentProfile.name;
    }
  }

  showToast(title, message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type} slide-in`;
    toast.innerHTML = `
      <div class="toast-header">
        <span class="toast-title">${title}</span>
        <button class="toast-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
      </div>
      <div class="toast-body">${message}</div>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 400);
    }, 4500);
  }

  // --- Dashboard Rendering ---

  renderDashboard() {
    const state = window.store.state;
    const profile = state.studentProfile;
    const tasks = state.tasks;

    // Greeting
    const greetingEl = document.getElementById('dash-greeting');
    if (greetingEl) {
      const hours = new Date().getHours();
      const timeGreet = hours < 12 ? 'Good Morning' : hours < 17 ? 'Good Afternoon' : 'Good Evening';
      greetingEl.innerHTML = `${timeGreet}, <span class="highlight-name">${profile.name}</span>! 👋`;
    }

    const subInfo = document.getElementById('dash-student-meta');
    if (subInfo) {
      subInfo.textContent = `${profile.department} • ${profile.year}, Sec ${profile.section} • ${profile.college}`;
    }

    // Counters
    const now = new Date(2026, 9, 26);
    const dueToday = tasks.filter(t => {
      if (t.completed) return false;
      const d = new Date(t.deadline);
      return d.getDate() === 26 && d.getMonth() === 9;
    }).length;

    const dueThisWeek = tasks.filter(t => {
      if (t.completed) return false;
      const d = new Date(t.deadline);
      const diff = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
      return diff >= 0 && diff <= 7;
    }).length;

    const completedCount = tasks.filter(t => t.completed).length;

    document.getElementById('stat-due-today').textContent = dueToday;
    document.getElementById('stat-due-week').textContent = dueThisWeek;
    document.getElementById('stat-completed').textContent = completedCount;

    // Forgetfulness Protection Active Card
    const alerts = window.store.getForgetfulnessAlerts();
    const alertContainer = document.getElementById('dash-forgetfulness-container');
    if (alertContainer) {
      if (alerts.length > 0) {
        const topAlert = alerts[0];
        alertContainer.style.display = 'block';
        alertContainer.innerHTML = `
          <div class="forgetfulness-alert-card glass-panel alert-${topAlert.severity}">
            <div class="alert-shield-icon">🛡️</div>
            <div class="alert-content">
              <div class="alert-badge-row">
                <span class="alert-pill-urgent">${topAlert.badge}</span>
                <span class="alert-pill-label">StudyMate Forgetfulness Protection</span>
              </div>
              <h3 class="alert-heading">${topAlert.headline}</h3>
              <p class="alert-text">${topAlert.recommendation}</p>
            </div>
            <div class="alert-actions">
              <button class="btn btn-urgent-glow" onclick="window.app.quickRescueTask('${topAlert.task.id}')">
                ⚡ Rescue Task
              </button>
              <button class="btn btn-secondary-ghost" onclick="window.app.promptReschedule('${topAlert.task.id}')">
                🔄 Reschedule
              </button>
            </div>
          </div>
        `;
      } else {
        alertContainer.style.display = 'none';
      }
    }

    // Today's Work Lane
    const todayList = document.getElementById('dash-today-tasks');
    if (todayList) {
      const todayTasks = tasks.filter(t => {
        const d = new Date(t.deadline);
        return d.getDate() === 26 && d.getMonth() === 9;
      });

      if (todayTasks.length === 0) {
        todayList.innerHTML = `
          <div class="empty-state">
            <span class="empty-icon">🎉</span>
            <h4>No tasks due today!</h4>
            <p>You are completely ahead of schedule. Review upcoming items or enjoy your evening!</p>
          </div>
        `;
      } else {
        todayList.innerHTML = todayTasks.map(t => this.renderTaskCardHtml(t)).join('');
      }
    }

    // Upcoming Lane
    const upcomingList = document.getElementById('dash-upcoming-tasks');
    if (upcomingList) {
      const upcomingTasks = tasks.filter(t => {
        const d = new Date(t.deadline);
        const diff = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
        return diff > 0 && diff <= 7;
      }).sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

      if (upcomingTasks.length === 0) {
        upcomingList.innerHTML = `<div class="empty-state"><p>No deadlines scheduled for this week.</p></div>`;
      } else {
        upcomingList.innerHTML = upcomingTasks.map(t => this.renderTaskCardHtml(t)).join('');
      }
    }
  }

  renderTaskCardHtml(task) {
    const typeIcons = {
      lab: '🧪',
      assignment: '📝',
      homework: '📚',
      classwork: '📖',
      exam: '🎯',
      project: '📊',
      seminar: '🗣️'
    };
    const icon = typeIcons[task.type] || '📌';
    const deadlineFormatted = formatDateDisplay(task.deadline);
    const priorityClass = `badge-priority-${task.priority}`;
    const isCompleted = task.completed;

    return `
      <div class="task-card glass-panel ${isCompleted ? 'completed-task' : ''} priority-${task.priority}" id="task-card-${task.id}">
        <div class="task-card-left">
          <label class="custom-checkbox-container" title="Mark Task Complete">
            <input type="checkbox" ${isCompleted ? 'checked' : ''} onchange="window.app.toggleTask('${task.id}')">
            <span class="checkmark"></span>
          </label>
        </div>
        <div class="task-card-body" onclick="window.showTaskDetail('${task.id}')">
          <div class="task-top-tags">
            <span class="task-subj-pill">${task.subject}</span>
            <span class="task-type-pill">${icon} ${task.type.toUpperCase()}</span>
            <span class="priority-badge ${priorityClass}">● ${task.priority.toUpperCase()}</span>
            ${task.postponedCount > 0 ? `<span class="postponed-badge" title="Postponed ${task.postponedCount} times">Postponed ×${task.postponedCount}</span>` : ''}
          </div>
          <h4 class="task-title-text">${task.title}</h4>
          ${task.notes ? `<p class="task-notes-preview">${task.notes}</p>` : ''}
          <div class="task-meta-row">
            <span class="task-meta-item">⏰ ${deadlineFormatted}</span>
            <span class="task-meta-item">⏱️ ${task.estimatedMins}m est</span>
            <span class="task-meta-item">📊 ${task.difficulty.toUpperCase()}</span>
          </div>
        </div>
        <div class="task-card-actions">
          <button class="btn-icon" title="Reschedule Task" onclick="event.stopPropagation(); window.app.promptReschedule('${task.id}')">🔄</button>
          <button class="btn-icon" title="View Options" onclick="event.stopPropagation(); window.showTaskDetail('${task.id}')">⚙️</button>
        </div>
      </div>
    `;
  }

  toggleTask(taskId) {
    const updated = window.store.toggleTaskComplete(taskId);
    if (updated && updated.completed) {
      if (window.soundFX) window.soundFX.playSuccess();
      launchConfetti();
      this.showToast('🎉 Task Completed!', `"${updated.title}" marked as done!`, 'success');
    } else {
      if (window.soundFX) window.soundFX.playChime();
    }
  }

  quickRescueTask(taskId) {
    const task = window.store.state.tasks.find(t => t.id === taskId);
    if (!task) return;

    // Switch to AI Assistant and ask it to break down this task
    window.location.hash = 'assistant';
    const input = document.getElementById('chat-input');
    if (input) {
      input.value = `Help me tackle "${task.title}" right now. Break it into quick steps.`;
      this.sendChatMessage();
    }
  }

  promptReschedule(taskId) {
    const task = window.store.state.tasks.find(t => t.id === taskId);
    if (!task) return;

    const modal = document.getElementById('reschedule-modal');
    if (!modal) return;

    document.getElementById('resched-task-title').textContent = task.title;
    document.getElementById('resched-task-id').value = task.id;

    // Pre-populate date picker with tomorrow
    const d = new Date(task.deadline);
    d.setDate(d.getDate() + 1);
    const dateInput = document.getElementById('resched-date-input');
    if (dateInput) {
      dateInput.value = d.toISOString().slice(0, 16);
    }

    modal.classList.add('active');
  }

  confirmReschedule() {
    const taskId = document.getElementById('resched-task-id').value;
    const dateVal = document.getElementById('resched-date-input').value;
    const modal = document.getElementById('reschedule-modal');

    if (!taskId || !dateVal) return;

    const iso = new Date(dateVal).toISOString();
    const task = window.store.rescheduleTask(taskId, iso);

    if (modal) modal.classList.remove('active');
    if (window.soundFX) window.soundFX.playAlert();
    this.showToast('🔄 Task Rescheduled', `"${task.title}" updated in your academic plan.`, 'info');
  }

  // --- Add Task Studio (NLP & OCR) ---

  setupAddStudio() {
    // NLP input submit
    const nlpForm = document.getElementById('nlp-entry-form');
    if (nlpForm) {
      nlpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('nlp-task-input');
        if (!input || !input.value.trim()) return;

        const parsed = window.smartNLP.parse(input.value);
        this.renderParsedStagingTable(parsed);
      });
    }

    // OCR Sample buttons
    const btnBlackboard = document.getElementById('sample-btn-blackboard');
    if (btnBlackboard) {
      btnBlackboard.addEventListener('click', () => {
        this.selectOcrPreset('blackboard');
      });
    }

    const btnWhatsapp = document.getElementById('sample-btn-whatsapp');
    if (btnWhatsapp) {
      btnWhatsapp.addEventListener('click', () => {
        this.selectOcrPreset('whatsapp');
      });
    }

    // Custom File upload
    const fileInput = document.getElementById('ocr-file-upload');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          window.ocrEngine.processCustomImage(file, (customPreset) => {
            this.runOcrScanning(customPreset);
          });
        }
      });
    }
  }

  selectOcrPreset(key) {
    const preset = window.ocrEngine.getSample(key);
    this.runOcrScanning(preset);
  }

  runOcrScanning(preset) {
    const previewImg = document.getElementById('ocr-preview-img');
    const scanOverlay = document.getElementById('ocr-laser-overlay');
    const statusText = document.getElementById('ocr-status-text');
    const resultsPanel = document.getElementById('ocr-result-card');

    if (previewImg && preset.imagePath) {
      previewImg.src = preset.imagePath;
      previewImg.style.display = 'block';
    }

    if (scanOverlay) scanOverlay.style.display = 'block';
    if (statusText) statusText.textContent = '🔍 Scanning image for academic text and deadlines...';
    if (resultsPanel) resultsPanel.style.display = 'none';

    if (window.soundFX) window.soundFX.playChime();

    // Laser scanning animation for 1.5 seconds
    setTimeout(() => {
      if (statusText) statusText.textContent = '🧠 Analyzing subject, workload, and submission criteria...';

      setTimeout(() => {
        if (scanOverlay) scanOverlay.style.display = 'none';
        if (statusText) statusText.textContent = `✅ Successfully extracted academic tasks (${preset.extracted.confidence}% confidence)`;
        if (window.soundFX) window.soundFX.playSuccess();

        this.renderOcrResult(preset);
      }, 700);
    }, 1000);
  }

  renderOcrResult(preset) {
    const resultsPanel = document.getElementById('ocr-result-card');
    if (!resultsPanel) return;

    resultsPanel.style.display = 'block';
    const ext = preset.extracted;
    const deadlineIso = getOffsetDate(ext.deadlineDays, ext.deadlineHour, 0);

    resultsPanel.innerHTML = `
      <div class="ocr-extracted-box glass-panel">
        <div class="ocr-badge-row">
          <span class="ocr-confidence-tag">🎯 Confidence: ${ext.confidence}%</span>
          <span class="ocr-type-tag">Type: ${ext.type.toUpperCase()}</span>
          <span class="ocr-priority-tag priority-${ext.priority}">Priority: ${ext.priority.toUpperCase()}</span>
        </div>

        <div class="ocr-raw-view">
          <span class="ocr-raw-label">Recognized Blackboard/Announcement Text:</span>
          <pre class="ocr-raw-pre">${preset.ocrRawText}</pre>
        </div>

        <div class="ocr-fields-grid">
          <div class="ocr-field">
            <label>Subject</label>
            <input type="text" id="ocr-edit-subject" class="form-input" value="${ext.subject}">
          </div>
          <div class="ocr-field">
            <label>Task Title / Work</label>
            <input type="text" id="ocr-edit-title" class="form-input" value="${ext.title}">
          </div>
          <div class="ocr-field">
            <label>Estimated Time</label>
            <input type="number" id="ocr-edit-mins" class="form-input" value="${ext.estimatedMins}">
          </div>
          <div class="ocr-field">
            <label>Difficulty</label>
            <select id="ocr-edit-diff" class="form-select">
              <option value="easy" ${ext.difficulty === 'easy' ? 'selected' : ''}>Easy</option>
              <option value="medium" ${ext.difficulty === 'medium' ? 'selected' : ''}>Medium</option>
              <option value="hard" ${ext.difficulty === 'hard' ? 'selected' : ''}>Hard</option>
            </select>
          </div>
        </div>

        <div class="ocr-action-bar">
          <button class="btn btn-primary-glow" onclick="window.app.confirmOcrTask('${deadlineIso}')">
            ➕ Add to Academic Dashboard
          </button>
        </div>
      </div>
    `;
  }

  confirmOcrTask(deadlineIso) {
    const subject = document.getElementById('ocr-edit-subject').value;
    const title = document.getElementById('ocr-edit-title').value;
    const estimatedMins = document.getElementById('ocr-edit-mins').value;
    const difficulty = document.getElementById('ocr-edit-diff').value;

    const task = window.store.addTask({
      title,
      subject,
      type: 'lab',
      deadline: deadlineIso,
      estimatedMins: Number(estimatedMins),
      difficulty,
      notes: 'Extracted via StudyMate AI Vision & OCR Engine'
    });

    if (window.soundFX) window.soundFX.playSuccess();
    launchConfetti();
    this.showToast('✅ OCR Task Created!', `"${task.title}" added to your academic schedule.`, 'success');

    // Return to dashboard
    window.location.hash = 'dashboard';
  }

  renderParsedStagingTable(tasks) {
    this.parsedStagingTasks = tasks;
    const container = document.getElementById('nlp-parsed-results');
    if (!container) return;

    if (tasks.length === 0) {
      container.innerHTML = `<p class="muted">Could not extract tasks. Try "Complete 3 Java programs before Friday".</p>`;
      return;
    }

    container.innerHTML = `
      <div class="staging-card glass-panel">
        <div class="staging-header">
          <h4>🤖 AI Extracted ${tasks.length} Structured Task${tasks.length > 1 ? 's' : ''}</h4>
          <span class="staging-tag">Review & Add</span>
        </div>
        <div class="staging-table-wrap">
          <table class="staging-table">
            <thead>
              <tr>
                <th>Task Title</th>
                <th>Subject</th>
                <th>Type</th>
                <th>Deadline</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              ${tasks.map((t, idx) => `
                <tr>
                  <td><strong>${t.title}</strong></td>
                  <td><span class="task-subj-pill">${t.subject}</span></td>
                  <td>${t.type.toUpperCase()}</td>
                  <td>${t.deadlineDisplay}</td>
                  <td><span class="priority-badge badge-priority-${t.priority}">● ${t.priority.toUpperCase()}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <div class="staging-footer">
          <button class="btn btn-primary-glow" onclick="window.app.commitStagedTasks()">
            🚀 Add All (${tasks.length}) to My Dashboard
          </button>
        </div>
      </div>
    `;
  }

  commitStagedTasks() {
    if (this.parsedStagingTasks.length === 0) return;

    window.store.addBatchTasks(this.parsedStagingTasks);
    if (window.soundFX) window.soundFX.playSuccess();
    launchConfetti();

    this.showToast('🎉 Tasks Added!', `${this.parsedStagingTasks.length} tasks scheduled on your dashboard.`, 'success');
    this.parsedStagingTasks = [];
    document.getElementById('nlp-parsed-results').innerHTML = '';
    const input = document.getElementById('nlp-task-input');
    if (input) input.value = '';

    window.location.hash = 'dashboard';
  }

  // --- AI Chat Assistant UI ---

  sendChatMessage(customText = null) {
    const input = document.getElementById('chat-input');
    const text = customText || (input ? input.value.trim() : '');
    if (!text) return;

    if (input && !customText) input.value = '';

    const chatList = document.getElementById('chat-messages-container');
    if (!chatList) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append student bubble
    const studentBubble = document.createElement('div');
    studentBubble.className = 'chat-bubble chat-student';
    studentBubble.innerHTML = `
      <div class="chat-avatar student-avatar">🎓</div>
      <div class="chat-body">
        <div class="chat-meta">You • ${timeStr}</div>
        <div class="chat-text">${text}</div>
      </div>
    `;
    chatList.appendChild(studentBubble);
    this.scrollChatToBottom();

    if (window.soundFX) window.soundFX.playChime();

    // Show AI typing indicator
    const typingBubble = document.createElement('div');
    typingBubble.className = 'chat-bubble chat-ai chat-typing';
    typingBubble.id = 'ai-typing-indicator';
    typingBubble.innerHTML = `
      <div class="chat-avatar ai-avatar">🤖</div>
      <div class="chat-body">
        <div class="chat-typing-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;
    chatList.appendChild(typingBubble);
    this.scrollChatToBottom();

    // Generate AI response with brief delay for realistic agent feel
    setTimeout(() => {
      typingBubble.remove();
      const response = window.aiAssistant.generateResponse(text);

      const aiBubble = document.createElement('div');
      aiBubble.className = 'chat-bubble chat-ai';

      let actionsHtml = '';
      if (response.actions && response.actions.length > 0) {
        actionsHtml = `
          <div class="chat-actions-row">
            ${response.actions.map(act => {
              if (act.view) {
                return `<button class="chat-act-btn" onclick="window.location.hash='${act.view}'">${act.label}</button>`;
              }
              if (act.query) {
                return `<button class="chat-act-btn" onclick="window.app.sendChatMessage('${act.query}')">${act.label}</button>`;
              }
              if (act.action === 'complete_task') {
                return `<button class="chat-act-btn" onclick="window.app.toggleTask('${act.taskId}')">${act.label}</button>`;
              }
              if (act.action === 'reschedule_prompt') {
                return `<button class="chat-act-btn" onclick="window.app.promptReschedule('${act.taskId || 'task-1'}')">${act.label}</button>`;
              }
              if (act.action === 'rescue_task') {
                return `<button class="chat-act-btn" onclick="window.app.quickRescueTask('${act.taskId}')">${act.label}</button>`;
              }
              if (act.action === 'add_subtasks') {
                return `<button class="chat-act-btn" onclick="window.app.addSubtasksFromChat()">${act.label}</button>`;
              }
              return `<button class="chat-act-btn">${act.label}</button>`;
            }).join('')}
          </div>
        `;
      }

      // Convert simple markdown bold/italics
      const formattedText = response.text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');

      aiBubble.innerHTML = `
        <div class="chat-avatar ai-avatar">🤖</div>
        <div class="chat-body">
          <div class="chat-meta">
            StudyMate Agent • ${timeStr}
            <button class="chat-speak-btn" title="Read Aloud" onclick="window.aiAssistant.speak('${text.replace(/'/g, "\\'")}')">🔊</button>
          </div>
          <div class="chat-text">${formattedText}</div>
          ${actionsHtml}
        </div>
      `;
      chatList.appendChild(aiBubble);
      this.scrollChatToBottom();

      if (window.soundFX) window.soundFX.playAlert();
    }, 650);
  }

  addSubtasksFromChat() {
    window.store.addBatchTasks([
      { title: 'DBMS Record: Schema & ER Diagrams', subject: 'DBMS', type: 'lab', deadline: getOffsetDate(0, 16, 0), difficulty: 'medium', estimatedMins: 20 },
      { title: 'DBMS Record: Exp 5 Transactions Query', subject: 'DBMS', type: 'lab', deadline: getOffsetDate(0, 18, 0), difficulty: 'hard', estimatedMins: 35 },
      { title: 'DBMS Record: Exp 6 Triggers Implementation', subject: 'DBMS', type: 'lab', deadline: getOffsetDate(1, 12, 0), difficulty: 'hard', estimatedMins: 40 }
    ]);
    this.showToast('✅ 3 Subtasks Created', 'Individual experiment milestones added to your dashboard!', 'success');
  }

  scrollChatToBottom() {
    const chatList = document.getElementById('chat-messages-container');
    if (chatList) {
      chatList.scrollTop = chatList.scrollHeight;
    }
  }

  // --- Subjects Tree View ---

  renderSubjects() {
    const container = document.getElementById('subjects-tree-container');
    if (!container) return;

    const subjects = window.store.state.subjects;
    const tasks = window.store.state.tasks;

    container.innerHTML = subjects.map(sub => {
      const subTasks = tasks.filter(t => t.subject === sub.name);
      const completed = subTasks.filter(t => t.completed).length;
      const progress = subTasks.length > 0 ? Math.round((completed / subTasks.length) * 100) : 100;

      return `
        <div class="subject-card glass-panel">
          <div class="subject-card-header">
            <div class="subj-badge-icon" style="background: ${sub.color}22; color: ${sub.color}; border: 1px solid ${sub.color}44;">
              ${sub.icon}
            </div>
            <div class="subj-info-col">
              <h3 class="subj-name">${sub.name}</h3>
              <span class="subj-code">${sub.code} • ${sub.faculty}</span>
            </div>
            <div class="subj-progress-pill">
              <span class="subj-pct">${progress}%</span>
            </div>
          </div>

          <div class="progress-track" style="margin: 1rem 0;">
            <div class="progress-fill" style="width: ${progress}%; background: ${sub.color};"></div>
          </div>

          <!-- Academic Tree Structure -->
          <div class="subject-task-tree">
            <div class="tree-root-label">📂 Academic Tasks & Submissions</div>
            ${subTasks.length === 0 ? `<p class="tree-leaf muted">No current pending tasks.</p>` : ''}
            ${subTasks.map(t => {
              const statusTag = t.completed ? '✅ Done' : t.priority === 'critical' ? '🔴 Critical' : t.priority === 'high' ? '🟠 Due Soon' : '🟡 Pending';
              return `
                <div class="tree-item ${t.completed ? 'tree-done' : ''}" onclick="window.showTaskDetail('${t.id}')">
                  <span class="tree-branch">├──</span>
                  <span class="tree-icon">${t.type === 'lab' ? '🧪' : t.type === 'assignment' ? '📝' : '📖'}</span>
                  <span class="tree-title">${t.title}</span>
                  <span class="tree-status">${statusTag}</span>
                </div>
              `;
            }).join('')}
          </div>

          <div class="subj-footer-actions">
            <button class="btn btn-sm btn-ghost" onclick="window.app.quickAddForSubject('${sub.name}')">
              ➕ Add Task in ${sub.name}
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  quickAddForSubject(subjectName) {
    window.location.hash = 'add-task';
    const input = document.getElementById('nlp-task-input');
    if (input) {
      input.value = `Submit ${subjectName} assignment on Friday`;
      input.focus();
    }
  }

  // --- Notifications View & WhatsApp Dispatch Simulation ---

  renderNotifications() {
    const list = document.getElementById('notifications-full-list');
    if (!list) return;

    const notifs = window.store.state.notifications;
    if (notifs.length === 0) {
      list.innerHTML = `<div class="empty-state"><p>No alerts in your notification center.</p></div>`;
      return;
    }

    list.innerHTML = notifs.map(n => `
      <div class="notif-card glass-panel ${n.read ? 'read' : 'unread'} notif-${n.type}">
        <div class="notif-icon">
          ${n.type === 'urgent' ? '🔴' : n.type === 'forgetfulness' ? '⚠️' : n.type === 'success' ? '🎉' : '⏰'}
        </div>
        <div class="notif-body">
          <div class="notif-header-row">
            <h4 class="notif-title">${n.title}</h4>
            <span class="notif-time">${formatDateDisplay(n.timestamp)}</span>
          </div>
          <p class="notif-msg">${n.message}</p>
        </div>
      </div>
    `).join('');
  }

  openWhatsAppModal() {
    const modal = document.getElementById('whatsapp-preview-modal');
    if (!modal) return;

    const topTask = window.store.state.tasks.find(t => !t.completed) || window.store.state.tasks[0];
    const previewBox = document.getElementById('whatsapp-bubble-content');
    if (previewBox && topTask) {
      previewBox.innerHTML = `
        <strong>🔔 StudyMate AI Notification</strong><br><br>
        Hi Gayathiri, your <strong>${topTask.title}</strong> is pending submission!<br><br>
        📅 <strong>Deadline:</strong> ${formatDateDisplay(topTask.deadline)}<br>
        ⏱️ <strong>Estimated time:</strong> ${topTask.estimatedMins} minutes<br>
        ⚠️ <strong>Priority:</strong> ${topTask.priority.toUpperCase()}<br><br>
        <em>Reply "DONE" when finished or "RESCHEDULE" to move to tomorrow.</em>
      `;
    }
    modal.classList.add('active');
  }

  // --- Global Event Handlers ---

  setupEventListeners() {
    this.setupAddStudio();

    // Chat submit
    const chatBtn = document.getElementById('chat-send-btn');
    if (chatBtn) {
      chatBtn.addEventListener('click', () => this.sendChatMessage());
    }
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
      chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.sendChatMessage();
      });
    }

    // Modal background close
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('active');
        }
      });
    });

    // Calendar navigation
    const prevCal = document.getElementById('cal-btn-prev');
    const nextCal = document.getElementById('cal-btn-next');
    const todayCal = document.getElementById('cal-btn-today');
    if (prevCal) prevCal.addEventListener('click', () => window.academicCalendar.prev());
    if (nextCal) nextCal.addEventListener('click', () => window.academicCalendar.next());
    if (todayCal) todayCal.addEventListener('click', () => window.academicCalendar.today());

    // Profile save
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        window.store.updateProfile({
          name: document.getElementById('prof-name').value,
          college: document.getElementById('prof-college').value,
          department: document.getElementById('prof-dept').value,
          year: document.getElementById('prof-year').value,
          section: document.getElementById('prof-section').value
        });
        document.getElementById('profile-modal').classList.remove('active');
        this.showToast('👤 Profile Saved', 'Your student credentials have been updated!', 'success');
      });
    }
  }
}

// Global modal helpers
window.showTaskDetail = function(taskId) {
  const task = window.store.state.tasks.find(t => t.id === taskId);
  if (!task) return;

  const modal = document.getElementById('task-detail-modal');
  if (!modal) return;

  document.getElementById('detail-task-title').textContent = task.title;
  document.getElementById('detail-task-subj').textContent = task.subject;
  document.getElementById('detail-task-type').textContent = task.type.toUpperCase();
  document.getElementById('detail-task-deadline').textContent = formatDateDisplay(task.deadline);
  document.getElementById('detail-task-priority').textContent = task.priority.toUpperCase();
  document.getElementById('detail-task-time').textContent = `${task.estimatedMins} mins`;
  document.getElementById('detail-task-postponed').textContent = `${task.postponedCount || 0} times`;
  document.getElementById('detail-task-notes').textContent = task.notes || 'No extra notes provided.';

  const actionContainer = document.getElementById('detail-modal-actions');
  actionContainer.innerHTML = `
    <button class="btn btn-primary-glow" onclick="window.app.toggleTask('${task.id}'); document.getElementById('task-detail-modal').classList.remove('active');">
      ${task.completed ? '↩️ Mark as Incomplete' : '✅ Mark Completed'}
    </button>
    <button class="btn btn-secondary-ghost" onclick="document.getElementById('task-detail-modal').classList.remove('active'); window.app.promptReschedule('${task.id}');">
      🔄 Reschedule
    </button>
    <button class="btn btn-danger-ghost" onclick="window.store.deleteTask('${task.id}'); document.getElementById('task-detail-modal').classList.remove('active');">
      🗑️ Delete
    </button>
  `;

  modal.classList.add('active');
};

window.openDayInspector = function(year, month, day, tasks) {
  const modal = document.getElementById('day-inspector-modal');
  if (!modal) return;

  const d = new Date(year, month, day);
  document.getElementById('day-inspect-date').textContent = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const list = document.getElementById('day-inspect-task-list');
  if (tasks.length === 0) {
    list.innerHTML = `<p class="muted">No academic tasks due on this date.</p>`;
  } else {
    list.innerHTML = tasks.map(t => window.app.renderTaskCardHtml(t)).join('');
  }

  // Pre-seed quick add date
  window.lastInspectedDate = d;
  modal.classList.add('active');
};

window.addEventListener('DOMContentLoaded', () => {
  window.app = new AppController();
});
