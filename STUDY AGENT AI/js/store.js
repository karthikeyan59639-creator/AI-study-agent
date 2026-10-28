// StudyMate AI - State Management & Storage Engine

// Helper to format ISO date strings for current demo baseline (Oct 2026)
function getOffsetDate(daysOffset = 0, hour = 18, minute = 0) {
  // Baseline is current time from system context: October 26, 2026
  const date = new Date(2026, 9, 26 + daysOffset, hour, minute);
  return date.toISOString();
}

function formatDateDisplay(isoString) {
  const d = new Date(isoString);
  const today = new Date(2026, 9, 26);
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today, ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Tomorrow, ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === -1) return 'Yesterday (Overdue)';
  if (diffDays < -1) return `${Math.abs(diffDays)} days ago (Overdue)`;
  if (diffDays > 1 && diffDays < 7) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return `${days[d.getDay()]}, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

class Store {
  constructor() {
    this.STORAGE_KEY = 'studymate_ai_state_v1';
    this.listeners = [];
    this.state = this.loadState();
  }

  getDefaultState() {
    return {
      studentProfile: {
        name: 'Gayathiri',
        college: 'National Institute of Technology',
        department: 'Computer Science & Engineering',
        year: '3rd Year',
        section: 'A',
        email: 'gayathiri.cse@college.edu',
        dailyStudyGoal: 4,
        avatar: 'G'
      },
      subjects: [
        { id: 'dbms', name: 'DBMS', code: 'CS301', icon: '🗄️', color: '#3b82f6', faculty: 'Dr. Ramesh' },
        { id: 'java', name: 'Java Programming', code: 'CS302', icon: '☕', color: '#f59e0b', faculty: 'Prof. Sharma' },
        { id: 'maths', name: 'Mathematics III', code: 'MA301', icon: '📐', color: '#10b981', faculty: 'Dr. Anita' },
        { id: 'os', name: 'Operating Systems', code: 'CS303', icon: '💻', color: '#8b5cf6', faculty: 'Prof. Vikram' },
        { id: 'cn', name: 'Computer Networks', code: 'CS304', icon: '🌐', color: '#ec4899', faculty: 'Dr. Preethi' }
      ],
      tasks: [
        {
          id: 'task-1',
          title: 'DBMS Lab Record (Exp 5 & 6)',
          subject: 'DBMS',
          type: 'lab', // lab, assignment, homework, classwork, exam, project, seminar
          deadline: getOffsetDate(0, 17, 0), // Today
          priority: 'critical', // critical, high, medium, low
          difficulty: 'hard',
          estimatedMins: 90,
          completed: false,
          progress: 30,
          postponedCount: 1,
          notes: 'Transactions & Triggers experiments with schema diagrams. Hard copy required.',
          createdAt: getOffsetDate(-3)
        },
        {
          id: 'task-2',
          title: 'Java Assignment: 3 Multithreading Programs',
          subject: 'Java Programming',
          type: 'assignment',
          deadline: getOffsetDate(1, 16, 0), // Tomorrow
          priority: 'high',
          difficulty: 'medium',
          estimatedMins: 120,
          completed: false,
          progress: 10,
          postponedCount: 0,
          notes: 'Producer-Consumer, Thread Pool, and Socket client implementation.',
          createdAt: getOffsetDate(-2)
        },
        {
          id: 'task-3',
          title: 'Maths Classwork: Vector Calculus & Green Theorem',
          subject: 'Mathematics III',
          type: 'classwork',
          deadline: getOffsetDate(0, 20, 0), // Today evening
          priority: 'medium',
          difficulty: 'medium',
          estimatedMins: 45,
          completed: false,
          progress: 50,
          postponedCount: 0,
          notes: 'Problems 14 to 22 from textbook Chapter 4.',
          createdAt: getOffsetDate(-1)
        },
        {
          id: 'task-4',
          title: 'OS Lab Record: Memory Management & Deadlocks',
          subject: 'Operating Systems',
          type: 'lab',
          deadline: getOffsetDate(2, 11, 0), // In 2 days
          priority: 'critical', // Upgraded due to postponedCount = 2
          difficulty: 'hard',
          estimatedMins: 100,
          completed: false,
          progress: 0,
          postponedCount: 2,
          notes: "Banker's Algorithm & Page Replacement (LRU, FIFO) simulation code.",
          createdAt: getOffsetDate(-4)
        },
        {
          id: 'task-5',
          title: 'Computer Networks Seminar: Zero Trust Architecture',
          subject: 'Computer Networks',
          type: 'seminar',
          deadline: getOffsetDate(4, 14, 0), // In 4 days
          priority: 'medium',
          difficulty: 'medium',
          estimatedMins: 180,
          completed: false,
          progress: 25,
          postponedCount: 0,
          notes: '12-slide PPT + 2 page handout for peer review.',
          createdAt: getOffsetDate(-2)
        },
        {
          id: 'task-6',
          title: 'OS Internal Exam - Unit 1 & 2',
          subject: 'Operating Systems',
          type: 'exam',
          deadline: getOffsetDate(6, 9, 30), // In 6 days
          priority: 'high',
          difficulty: 'hard',
          estimatedMins: 240,
          completed: false,
          progress: 40,
          postponedCount: 0,
          notes: 'CPU Scheduling, Process Synchronization, Semaphores & Monitored locks.',
          createdAt: getOffsetDate(-5)
        },
        // Already completed historical tasks for realistic analytics
        {
          id: 'task-c1',
          title: 'Java Record Exp 1 & 2 (Collections & OOP)',
          subject: 'Java Programming',
          type: 'lab',
          deadline: getOffsetDate(-2),
          priority: 'high',
          difficulty: 'medium',
          estimatedMins: 75,
          completed: true,
          completedAt: getOffsetDate(-2, 15, 0),
          progress: 100,
          postponedCount: 0,
          notes: 'Signed by faculty.',
          createdAt: getOffsetDate(-6)
        },
        {
          id: 'task-c2',
          title: 'DBMS Assignment 1: Relational Algebra & SQL',
          subject: 'DBMS',
          type: 'assignment',
          deadline: getOffsetDate(-4),
          priority: 'medium',
          difficulty: 'medium',
          estimatedMins: 60,
          completed: true,
          completedAt: getOffsetDate(-4, 18, 30),
          progress: 100,
          postponedCount: 0,
          notes: 'Submitted via Google Classroom.',
          createdAt: getOffsetDate(-8)
        },
        {
          id: 'task-c3',
          title: 'Maths Homework: Matrices & Eigenvalues',
          subject: 'Mathematics III',
          type: 'homework',
          deadline: getOffsetDate(-5),
          priority: 'low',
          difficulty: 'easy',
          estimatedMins: 40,
          completed: true,
          completedAt: getOffsetDate(-5, 21, 0),
          progress: 100,
          postponedCount: 0,
          notes: 'Completed in homework notebook.',
          createdAt: getOffsetDate(-9)
        },
        {
          id: 'task-c4',
          title: 'Computer Networks Packet Tracer Lab 1',
          subject: 'Computer Networks',
          type: 'lab',
          deadline: getOffsetDate(-7),
          priority: 'medium',
          difficulty: 'medium',
          estimatedMins: 90,
          completed: true,
          completedAt: getOffsetDate(-7, 14, 0),
          progress: 100,
          postponedCount: 0,
          notes: 'Topology verified with faculty.',
          createdAt: getOffsetDate(-12)
        }
      ],
      notifications: [
        {
          id: 'notif-1',
          type: 'urgent',
          title: '🔴 Critical Deadline Today!',
          message: 'DBMS Lab Record (Exp 5 & 6) is due today at 5:00 PM. Not submitted yet.',
          timestamp: getOffsetDate(0, 9, 0),
          read: false,
          taskId: 'task-1'
        },
        {
          id: 'notif-2',
          type: 'forgetfulness',
          title: '⚠️ Forgetfulness Protection Warning',
          message: 'OS Lab Record has been postponed 2 times and is due in 2 days. 0% completed.',
          timestamp: getOffsetDate(0, 8, 30),
          read: false,
          taskId: 'task-4'
        },
        {
          id: 'notif-3',
          type: 'upcoming',
          title: '🟠 Due Tomorrow',
          message: 'Java Assignment (3 Programs) is due tomorrow at 4:00 PM. Have you started coding?',
          timestamp: getOffsetDate(0, 7, 0),
          read: true,
          taskId: 'task-2'
        }
      ],
      chatHistory: [
        {
          sender: 'ai',
          text: 'Good day Gayathiri! 👋 I am StudyMate, your Academic Task Agent. I am monitoring 6 active academic deadlines for you today. How can I assist your study plan?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ],
      settings: {
        sound: true,
        notify3Days: true,
        notify1Day: true,
        notifyDeadlineDay: true,
        autoReschedulePolicy: 'prompt', // prompt or automatic
        theme: 'dark'
      }
    };
  }

  loadState() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        return { ...this.getDefaultState(), ...parsed };
      }
    } catch (e) {
      console.error('Failed to load state from localStorage', e);
    }
    return this.getDefaultState();
  }

  saveState() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
      this.notifyListeners();
    } catch (e) {
      console.error('Failed to save state', e);
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.state);
      } catch (err) {
        console.error('Error in store listener', err);
      }
    });
  }

  // --- Task Methods ---

  calculatePriority(task) {
    const now = new Date(2026, 9, 26);
    const deadline = new Date(task.deadline);
    const diffDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return 'critical';
    if (diffDays === 1) return 'critical';
    if (diffDays === 2) {
      return (task.postponedCount >= 1 || task.difficulty === 'hard') ? 'critical' : 'high';
    }
    if (diffDays <= 5) {
      return (task.postponedCount >= 2) ? 'high' : 'medium';
    }
    return 'low';
  }

  addTask(taskData) {
    const id = 'task-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const newTask = {
      id,
      title: taskData.title || 'Untitled Academic Task',
      subject: taskData.subject || 'General',
      type: taskData.type || 'assignment',
      deadline: taskData.deadline || getOffsetDate(1, 17, 0),
      difficulty: taskData.difficulty || 'medium',
      estimatedMins: Number(taskData.estimatedMins) || 60,
      completed: false,
      progress: 0,
      postponedCount: 0,
      notes: taskData.notes || '',
      createdAt: new Date().toISOString()
    };
    newTask.priority = taskData.priority || this.calculatePriority(newTask);

    this.state.tasks.unshift(newTask);

    // Add notification
    this.addNotification({
      type: 'info',
      title: '📝 New Task Added',
      message: `"${newTask.title}" added under ${newTask.subject}. Priority: ${newTask.priority.toUpperCase()}`,
      taskId: newTask.id
    });

    this.saveState();
    return newTask;
  }

  addBatchTasks(tasksArray) {
    const created = [];
    tasksArray.forEach(taskData => {
      const id = 'task-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
      const newTask = {
        id,
        title: taskData.title,
        subject: taskData.subject || 'General',
        type: taskData.type || 'assignment',
        deadline: taskData.deadline || getOffsetDate(2, 17, 0),
        difficulty: taskData.difficulty || 'medium',
        estimatedMins: Number(taskData.estimatedMins) || 60,
        completed: false,
        progress: 0,
        postponedCount: 0,
        notes: taskData.notes || '',
        createdAt: new Date().toISOString()
      };
      newTask.priority = taskData.priority || this.calculatePriority(newTask);
      this.state.tasks.unshift(newTask);
      created.push(newTask);
    });

    this.addNotification({
      type: 'info',
      title: `⚡ ${created.length} Tasks Created`,
      message: `Structured tasks were generated by AI StudyMate.`,
      taskId: created[0]?.id
    });

    this.saveState();
    return created;
  }

  toggleTaskComplete(taskId) {
    const task = this.state.tasks.find(t => t.id === taskId);
    if (!task) return null;

    task.completed = !task.completed;
    if (task.completed) {
      task.progress = 100;
      task.completedAt = new Date().toISOString();
      this.addNotification({
        type: 'success',
        title: '🎉 Task Completed!',
        message: `Great job finishing "${task.title}"! Keep up the momentum!`,
        taskId: task.id
      });
    } else {
      task.progress = 0;
      delete task.completedAt;
    }

    this.saveState();
    return task;
  }

  updateTask(taskId, updates) {
    const task = this.state.tasks.find(t => t.id === taskId);
    if (!task) return null;

    Object.assign(task, updates);
    task.priority = this.calculatePriority(task);
    this.saveState();
    return task;
  }

  deleteTask(taskId) {
    this.state.tasks = this.state.tasks.filter(t => t.id !== taskId);
    this.saveState();
  }

  rescheduleTask(taskId, newDeadlineIso, reason = 'Student requested reschedule') {
    const task = this.state.tasks.find(t => t.id === taskId);
    if (!task) return null;

    task.deadline = newDeadlineIso;
    task.postponedCount = (task.postponedCount || 0) + 1;
    task.priority = this.calculatePriority(task);

    this.addNotification({
      type: 'reschedule',
      title: '🔄 Schedule Optimized',
      message: `"${task.title}" postponed to ${formatDateDisplay(newDeadlineIso)}. Reminder set.`,
      taskId: task.id
    });

    this.saveState();
    return task;
  }

  // --- Forgetfulness Protection Engine ---

  getForgetfulnessAlerts() {
    const now = new Date(2026, 9, 26);
    const alerts = [];

    this.state.tasks.forEach(task => {
      if (task.completed) return;
      const d = new Date(task.deadline);
      const diffDays = Math.ceil((d - now) / (1000 * 60 * 60 * 24));

      // Rule 1: Repeatedly postponed tasks
      if (task.postponedCount >= 2) {
        alerts.push({
          task,
          severity: 'high',
          badge: '⚠️ Postponed Multiple Times',
          headline: `"${task.title}" postponed ${task.postponedCount} times!`,
          recommendation: `This task is at critical risk of last-minute panic. Complete a small portion (e.g. 20 mins) today.`
        });
      }
      // Rule 2: Due within 2 days with 0% progress
      else if (diffDays <= 2 && (task.progress || 0) === 0) {
        alerts.push({
          task,
          severity: 'critical',
          badge: '🔴 Urgent: Not Started',
          headline: `"${task.title}" is due ${diffDays === 0 ? 'TODAY' : diffDays === 1 ? 'TOMORROW' : 'in 2 days'} and hasn't been started!`,
          recommendation: `Estimated time is ${task.estimatedMins} mins. Begin right now before other deadlines clash.`
        });
      }
      // Rule 3: Lab records or assignments with high difficulty nearing deadline
      else if (diffDays <= 3 && task.difficulty === 'hard' && (task.progress || 0) < 50) {
        alerts.push({
          task,
          severity: 'medium',
          badge: '⏳ Heavy Workload Alert',
          headline: `Hard difficulty task "${task.title}" due soon.`,
          recommendation: `Lab records and long assignments usually take longer than estimated. Start Experiment prep today.`
        });
      }
    });

    return alerts;
  }

  // --- Notifications ---

  addNotification(notif) {
    const newNotif = {
      id: 'notif-' + Date.now(),
      type: notif.type || 'info',
      title: notif.title,
      message: notif.message,
      timestamp: notif.timestamp || new Date().toISOString(),
      read: false,
      taskId: notif.taskId || null
    };
    this.state.notifications.unshift(newNotif);
    // Keep max 30 notifications
    if (this.state.notifications.length > 30) {
      this.state.notifications.pop();
    }
  }

  markAllNotificationsRead() {
    this.state.notifications.forEach(n => n.read = true);
    this.saveState();
  }

  clearNotifications() {
    this.state.notifications = [];
    this.saveState();
  }

  // --- Profile & Subjects ---

  updateProfile(profileData) {
    this.state.studentProfile = { ...this.state.studentProfile, ...profileData };
    this.saveState();
  }

  addSubject(subjectData) {
    const id = subjectData.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const newSubj = {
      id,
      name: subjectData.name,
      code: subjectData.code || 'SUB' + Math.floor(100 + Math.random() * 900),
      icon: subjectData.icon || '📚',
      color: subjectData.color || '#3b82f6',
      faculty: subjectData.faculty || 'Instructor'
    };
    this.state.subjects.push(newSubj);
    this.saveState();
    return newSubj;
  }

  resetToDefault() {
    this.state = this.getDefaultState();
    this.saveState();
  }
}

window.store = new Store();
