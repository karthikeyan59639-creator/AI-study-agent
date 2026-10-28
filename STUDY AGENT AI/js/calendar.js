// StudyMate AI - Academic Calendar Module

class AcademicCalendar {
  constructor() {
    this.currentDate = new Date(2026, 9, 26); // Baseline Oct 26, 2026
    this.viewMode = 'month'; // 'month' or 'week'
    this.filterSubject = 'all';
    this.filterType = 'all';
  }

  setSubjectFilter(subject) {
    this.filterSubject = subject;
    this.render();
  }

  setTypeFilter(type) {
    this.filterType = type;
    this.render();
  }

  prev() {
    if (this.viewMode === 'month') {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    } else {
      this.currentDate.setDate(this.currentDate.getDate() - 7);
    }
    this.render();
  }

  next() {
    if (this.viewMode === 'month') {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    } else {
      this.currentDate.setDate(this.currentDate.getDate() + 7);
    }
    this.render();
  }

  today() {
    this.currentDate = new Date(2026, 9, 26);
    this.render();
  }

  getTypeIcon(type) {
    const map = {
      lab: '🧪',
      assignment: '📝',
      homework: '📚',
      classwork: '📖',
      exam: '🎯',
      project: '📊',
      seminar: '🗣️'
    };
    return map[type] || '📌';
  }

  render() {
    const container = document.getElementById('calendar-grid');
    const headerTitle = document.getElementById('calendar-month-year');
    if (!container || !headerTitle) return;

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    headerTitle.textContent = `${monthNames[month]} ${year}`;

    const tasks = window.store.state.tasks.filter(t => {
      if (this.filterSubject !== 'all' && t.subject !== this.filterSubject) return false;
      if (this.filterType !== 'all' && t.type !== this.filterType) return false;
      return true;
    });

    if (this.viewMode === 'month') {
      this.renderMonthView(container, year, month, tasks);
    } else {
      this.renderWeekView(container, tasks);
    }
  }

  renderMonthView(container, year, month, tasks) {
    container.innerHTML = '';
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    // Previous month filler days
    for (let i = firstDay - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const cell = document.createElement('div');
      cell.className = 'cal-day other-month';
      cell.innerHTML = `<span class="cal-day-num">${dayNum}</span>`;
      container.appendChild(cell);
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const cell = document.createElement('div');
      const isToday = (year === 2026 && month === 9 && d === 26);
      cell.className = `cal-day ${isToday ? 'cal-today' : ''}`;
      cell.setAttribute('data-day', d);
      cell.setAttribute('data-month', month);
      cell.setAttribute('data-year', year);

      // Find tasks for this day
      const dayTasks = tasks.filter(t => {
        const tDate = new Date(t.deadline);
        return tDate.getFullYear() === year && tDate.getMonth() === month && tDate.getDate() === d;
      });

      let badgesHtml = '';
      dayTasks.forEach(t => {
        const icon = this.getTypeIcon(t.type);
        const priorityClass = t.completed ? 'p-completed' : `p-${t.priority}`;
        badgesHtml += `
          <div class="cal-task-pill ${priorityClass}" title="${t.title} (${t.subject})" onclick="event.stopPropagation(); window.showTaskDetail('${t.id}')">
            <span class="cal-pill-icon">${icon}</span>
            <span class="cal-pill-title">${t.title}</span>
          </div>
        `;
      });

      cell.innerHTML = `
        <div class="cal-day-header">
          <span class="cal-day-num">${d}</span>
          ${isToday ? '<span class="today-tag">TODAY</span>' : ''}
          ${dayTasks.length > 0 ? `<span class="task-count-badge">${dayTasks.length}</span>` : ''}
        </div>
        <div class="cal-tasks-container">
          ${badgesHtml}
        </div>
      `;

      cell.onclick = () => {
        window.openDayInspector(year, month, d, dayTasks);
      };

      container.appendChild(cell);
    }

    // Next month filler
    const totalCells = firstDay + daysInMonth;
    const remaining = (7 - (totalCells % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const cell = document.createElement('div');
      cell.className = 'cal-day other-month';
      cell.innerHTML = `<span class="cal-day-num">${i}</span>`;
      container.appendChild(cell);
    }
  }

  renderWeekView(container, tasks) {
    container.innerHTML = '';
    // Generate 7 days around current date
    const startOfWeek = new Date(this.currentDate);
    startOfWeek.setDate(this.currentDate.getDate() - this.currentDate.getDay());

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);

      const cell = document.createElement('div');
      const isToday = (d.getFullYear() === 2026 && d.getMonth() === 9 && d.getDate() === 26);
      cell.className = `cal-day week-col ${isToday ? 'cal-today' : ''}`;

      const dayTasks = tasks.filter(t => {
        const tDate = new Date(t.deadline);
        return tDate.getFullYear() === d.getFullYear() && tDate.getMonth() === d.getMonth() && tDate.getDate() === d.getDate();
      });

      let badgesHtml = '';
      dayTasks.forEach(t => {
        const icon = this.getTypeIcon(t.type);
        const priorityClass = t.completed ? 'p-completed' : `p-${t.priority}`;
        badgesHtml += `
          <div class="cal-task-pill ${priorityClass}" onclick="event.stopPropagation(); window.showTaskDetail('${t.id}')">
            <span class="cal-pill-icon">${icon}</span>
            <span class="cal-pill-title">${t.title}</span>
          </div>
        `;
      });

      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      cell.innerHTML = `
        <div class="cal-day-header">
          <span class="week-name">${dayNames[d.getDay()]}</span>
          <span class="cal-day-num">${d.getDate()}</span>
          ${isToday ? '<span class="today-tag">TODAY</span>' : ''}
        </div>
        <div class="cal-tasks-container">
          ${badgesHtml}
        </div>
      `;

      cell.onclick = () => {
        window.openDayInspector(d.getFullYear(), d.getMonth(), d.getDate(), dayTasks);
      };

      container.appendChild(cell);
    }
  }
}

window.academicCalendar = new AcademicCalendar();
