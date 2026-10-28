// StudyMate AI - Natural Language Processing & Smart Task Entry Engine

class SmartNLPParser {
  constructor() {
    this.subjectKeywords = [
      { name: 'DBMS', aliases: ['dbms', 'database', 'sql', 'mysql', 'oracle'] },
      { name: 'Java Programming', aliases: ['java', 'oops', 'core java', 'jdbc', 'multithreading'] },
      { name: 'Mathematics III', aliases: ['maths', 'mathematics', 'calculus', 'algebra', 'matrices', 'vector'] },
      { name: 'Operating Systems', aliases: ['os', 'operating systems', 'linux', 'unix', 'deadlocks', 'paging'] },
      { name: 'Computer Networks', aliases: ['cn', 'computer networks', 'networking', 'tcp', 'ip', 'packet tracer'] },
      { name: 'Physics', aliases: ['physics', 'optics', 'mechanics'] },
      { name: 'Chemistry', aliases: ['chemistry', 'organic', 'inorganic'] },
      { name: 'Python', aliases: ['python', 'ai', 'data science', 'machine learning'] }
    ];

    this.typeKeywords = [
      { type: 'lab', icon: '🧪', label: 'Lab Record', keywords: ['lab', 'record', 'experiment', 'experiments', 'observation', 'viva', 'practical'] },
      { type: 'assignment', icon: '📝', label: 'Assignment', keywords: ['assignment', 'assign', 'case study', 'problem sheet'] },
      { type: 'homework', icon: '📚', label: 'Homework', keywords: ['homework', 'hw', 'practice', 'exercise'] },
      { type: 'classwork', icon: '📖', label: 'Classwork', keywords: ['classwork', 'cw', 'notes', 'lecture notes', 'class notes'] },
      { type: 'exam', icon: '🎯', label: 'Exam / Test', keywords: ['exam', 'test', 'internal', 'internals', 'midterm', 'quiz', 'assessment'] },
      { type: 'project', icon: '📊', label: 'Project', keywords: ['project', 'capstone', 'mini project', 'codebase', 'prototype'] },
      { type: 'seminar', icon: '🗣️', label: 'Seminar', keywords: ['seminar', 'presentation', 'ppt', 'slides', 'speech', 'talk'] }
    ];
  }

  parse(input) {
    if (!input || !input.trim()) return [];

    const text = input.trim();
    const lower = text.toLowerCase();

    // 1. Detect Subject
    let detectedSubject = 'General';
    for (const sub of this.subjectKeywords) {
      if (sub.aliases.some(alias => new RegExp(`\\b${alias}\\b`, 'i').test(lower))) {
        detectedSubject = sub.name;
        break;
      }
    }

    // 2. Detect Type
    let detectedType = 'assignment';
    for (const tk of this.typeKeywords) {
      if (tk.keywords.some(kw => new RegExp(`\\b${kw}\\b`, 'i').test(lower))) {
        detectedType = tk.type;
        break;
      }
    }

    // 3. Detect Deadline
    const deadlineResult = this.extractDeadline(lower);

    // 4. Detect Multi-item counts (e.g. "3 Java programs", "2 experiments in DBMS")
    const countMatch = lower.match(/\b([1-9]|one|two|three|four|five)\s+([a-z0-9_-]+)\s*(programs?|experiments?|questions?|problems?|tasks?|exercises?|chapters?)/i) ||
                       lower.match(/complete\s+([1-9]|one|two|three|four|five)\s+(.*)/i);

    let count = 1;
    let itemNoun = '';

    if (countMatch) {
      const wordToNum = { 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5 };
      const rawCount = countMatch[1].toLowerCase();
      count = wordToNum[rawCount] || parseInt(rawCount, 10) || 1;
      itemNoun = countMatch[3] ? countMatch[3].replace(/s$/, '') : (countMatch[2] || 'Item');
    }

    // Check specific "experiment 5 and 6" pattern
    const expRangeMatch = lower.match(/experiments?\s+([0-9]+)\s*(?:and|&|,)\s*([0-9]+)/i);

    const tasks = [];

    if (expRangeMatch) {
      const exp1 = expRangeMatch[1];
      const exp2 = expRangeMatch[2];
      tasks.push(this.buildTaskObject({
        title: `${detectedSubject} Lab Record - Experiment ${exp1}`,
        subject: detectedSubject,
        type: 'lab',
        deadline: deadlineResult.iso,
        deadlineDisplay: deadlineResult.display,
        difficulty: 'hard',
        estimatedMins: 60,
        originalInput: text
      }));
      tasks.push(this.buildTaskObject({
        title: `${detectedSubject} Lab Record - Experiment ${exp2}`,
        subject: detectedSubject,
        type: 'lab',
        deadline: deadlineResult.iso,
        deadlineDisplay: deadlineResult.display,
        difficulty: 'hard',
        estimatedMins: 60,
        originalInput: text
      }));
      return tasks;
    }

    if (count > 1 && count <= 5) {
      // Split into individual structured tasks as requested in prompt!
      // e.g. "3 Java programs" -> Java Program 1, Java Program 2, Java Program 3
      const capitalizedNoun = itemNoun.charAt(0).toUpperCase() + itemNoun.slice(1);
      const subjectShort = detectedSubject.split(' ')[0];

      for (let i = 1; i <= count; i++) {
        tasks.push(this.buildTaskObject({
          title: `${subjectShort} ${capitalizedNoun} ${i}`,
          subject: detectedSubject,
          type: detectedType,
          deadline: deadlineResult.iso,
          deadlineDisplay: deadlineResult.display,
          difficulty: detectedType === 'lab' || detectedType === 'exam' ? 'hard' : 'medium',
          estimatedMins: Math.round(120 / count),
          originalInput: text
        }));
      }
      return tasks;
    }

    // Single Task Generation
    let cleanTitle = this.cleanTaskTitle(text, detectedSubject, detectedType);
    if (!cleanTitle || cleanTitle.length < 4) {
      const typeLabel = this.typeKeywords.find(t => t.type === detectedType)?.label || 'Task';
      cleanTitle = `${detectedSubject} ${typeLabel}`;
    }

    tasks.push(this.buildTaskObject({
      title: cleanTitle,
      subject: detectedSubject,
      type: detectedType,
      deadline: deadlineResult.iso,
      deadlineDisplay: deadlineResult.display,
      difficulty: detectedType === 'lab' || detectedType === 'exam' ? 'hard' : 'medium',
      estimatedMins: detectedType === 'lab' ? 90 : detectedType === 'exam' ? 180 : 60,
      originalInput: text
    }));

    return tasks;
  }

  extractDeadline(lower) {
    // Current baseline date: Oct 26, 2026 (Monday)
    const baseYear = 2026;
    const baseMonth = 9; // October (0-indexed)
    const baseDay = 26; // Monday

    let targetDate = new Date(baseYear, baseMonth, baseDay, 17, 0); // default 5:00 PM
    let display = 'Tomorrow';

    if (lower.includes('today') || lower.includes('tonight')) {
      targetDate = new Date(baseYear, baseMonth, baseDay, lower.includes('tonight') ? 21 : 18, 0);
      display = 'Today';
    } else if (lower.includes('tomorrow')) {
      targetDate = new Date(baseYear, baseMonth, baseDay + 1, 17, 0);
      display = 'Tomorrow';
    } else if (lower.includes('day after tomorrow') || lower.includes('in 2 days')) {
      targetDate = new Date(baseYear, baseMonth, baseDay + 2, 17, 0);
      display = 'In 2 days';
    } else if (lower.includes('in 3 days')) {
      targetDate = new Date(baseYear, baseMonth, baseDay + 3, 17, 0);
      display = 'In 3 days';
    } else if (lower.includes('next week')) {
      targetDate = new Date(baseYear, baseMonth, baseDay + 7, 17, 0);
      display = 'Next Week';
    } else {
      // Days of the week detection
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      for (let i = 0; i < days.length; i++) {
        if (lower.includes(days[i])) {
          // Current day is Monday (1)
          const currentDayOfWeek = 1;
          let diff = i - currentDayOfWeek;
          if (diff <= 0) diff += 7; // next occurrence
          targetDate = new Date(baseYear, baseMonth, baseDay + diff, 17, 0);
          display = days[i].charAt(0).toUpperCase() + days[i].slice(1);
          break;
        }
      }
    }

    // Specific time adjustment
    if (lower.includes('10 am') || lower.includes('10:00 am')) {
      targetDate.setHours(10, 0, 0, 0);
    } else if (lower.includes('5 pm') || lower.includes('5:00 pm')) {
      targetDate.setHours(17, 0, 0, 0);
    } else if (lower.includes('morning')) {
      targetDate.setHours(9, 30, 0, 0);
    } else if (lower.includes('night') || lower.includes('evening')) {
      targetDate.setHours(20, 0, 0, 0);
    }

    return {
      iso: targetDate.toISOString(),
      display
    };
  }

  cleanTaskTitle(raw, subject, type) {
    let clean = raw
      .replace(/^(i have to|i need to|must|please|can you|tomorrow i have to submit my|tomorrow i have to|submit|complete|finish)\s+/i, '')
      .replace(/\s+(before|by|on|due|until)\s+(today|tomorrow|friday|monday|tuesday|wednesday|thursday|saturday|sunday|next week).*/i, '')
      .trim();

    // Capitalize first letter
    if (clean.length > 0) {
      clean = clean.charAt(0).toUpperCase() + clean.slice(1);
    }
    return clean;
  }

  buildTaskObject({ title, subject, type, deadline, deadlineDisplay, difficulty, estimatedMins, originalInput }) {
    // Dynamic Priority Calculation
    const now = new Date(2026, 9, 26);
    const d = new Date(deadline);
    const diffDays = Math.ceil((d - now) / (1000 * 60 * 60 * 24));

    let priority = 'medium';
    if (diffDays <= 0 || diffDays === 1) {
      priority = 'critical';
    } else if (diffDays <= 2) {
      priority = 'high';
    } else if (diffDays <= 5) {
      priority = 'medium';
    } else {
      priority = 'low';
    }

    return {
      title,
      subject,
      type,
      deadline,
      deadlineDisplay,
      priority,
      difficulty,
      estimatedMins,
      notes: `Extracted via AI from: "${originalInput}"`
    };
  }
}

window.smartNLP = new SmartNLPParser();
