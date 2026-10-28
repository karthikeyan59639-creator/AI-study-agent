// StudyMate AI - Interactive Conversational Copilot & Intelligent Rescheduler

class AIAssistant {
  constructor() {
    this.speechSynth = window.speechSynthesis || null;
  }

  speak(text) {
    if (!this.speechSynth || !window.soundFX?.enabled) return;
    this.speechSynth.cancel();
    // Strip markdown characters for clean speech
    const clean = text.replace(/[*_#`~🔴🟠🟡🟢⚠️🧪📚📝📖🎯📊]/g, '');
    const utter = new SpeechSynthesisUtterance(clean);
    utter.rate = 1.05;
    utter.pitch = 1.0;
    this.speechSynth.speak(utter);
  }

  generateResponse(query) {
    const q = query.toLowerCase().trim();
    const tasks = window.store.state.tasks;
    const pendingTasks = tasks.filter(t => !t.completed);
    const today = new Date(2026, 9, 26);

    // 1. Rescheduling intent: "I couldn't finish / complete my DBMS record today"
    if (q.includes("couldn't finish") || q.includes("could not complete") || q.includes("didn't finish") || q.includes("reschedule") || q.includes("postpone") || q.includes("cant complete")) {
      // Find matching task
      let targetTask = null;
      if (q.includes("dbms")) {
        targetTask = pendingTasks.find(t => t.subject.toLowerCase().includes("dbms") || t.title.toLowerCase().includes("dbms"));
      } else if (q.includes("java")) {
        targetTask = pendingTasks.find(t => t.subject.toLowerCase().includes("java") || t.title.toLowerCase().includes("java"));
      } else if (q.includes("math") || q.includes("calculus")) {
        targetTask = pendingTasks.find(t => t.subject.toLowerCase().includes("math") || t.title.toLowerCase().includes("math"));
      } else if (q.includes("os") || q.includes("operating")) {
        targetTask = pendingTasks.find(t => t.subject.toLowerCase().includes("os") || t.title.toLowerCase().includes("os"));
      } else {
        // Grab the most critical task due today
        targetTask = pendingTasks.find(t => {
          const d = new Date(t.deadline);
          return Math.abs(d.getDate() - 26) <= 1;
        }) || pendingTasks[0];
      }

      if (targetTask) {
        // Automatically reschedule to tomorrow
        const tomorrowIso = new Date(2026, 9, 27, 17, 0).toISOString();
        window.store.rescheduleTask(targetTask.id, tomorrowIso, 'Rescheduled via AI Chatbot');

        if (window.soundFX) window.soundFX.playAlert();

        return {
          text: `No problem at all! 😊 Academic workloads can be intense. 

I've automatically moved **"${targetTask.title}"** to **Tomorrow at 5:00 PM** and re-balanced your daily study plan.

🔄 **Updated Plan for Tomorrow:**
• **${targetTask.title}** (Postponed ×${targetTask.postponedCount || 1})
• Focus block: 60 minutes in the afternoon.

⚠️ *StudyMate Agent Note:* Repeatedly postponing increases cramming risk. Try dedicating just 25 minutes tonight for the first experiment!`,
          actions: [
            { label: 'View in Calendar 📅', view: 'calendar' },
            { label: 'Start 20m Timer ⏱️', action: 'focus_mode', taskId: targetTask.id }
          ]
        };
      }
    }

    // 2. What do I need to finish today?
    if (q.includes("finish today") || q.includes("due today") || q.includes("today's task") || q.includes("what do i have today")) {
      const todayTasks = pendingTasks.filter(t => {
        const d = new Date(t.deadline);
        return d.getDate() === 26 && d.getMonth() === 9;
      });

      const tomorrowTasks = pendingTasks.filter(t => {
        const d = new Date(t.deadline);
        return d.getDate() === 27 && d.getMonth() === 9;
      });

      let responseText = `You have **${todayTasks.length} tasks due today**`;
      if (tomorrowTasks.length > 0) {
        responseText += ` and **${tomorrowTasks.length} tasks due tomorrow**:`;
      } else {
        responseText += `:`;
      }

      todayTasks.forEach(t => {
        const pIcon = t.priority === 'critical' ? '🔴' : t.priority === 'high' ? '🟠' : '🟡';
        responseText += `\n• ${pIcon} **${t.title}** (${t.subject}) — *Due Today (${t.estimatedMins}m est)*`;
      });

      tomorrowTasks.forEach(t => {
        const pIcon = t.priority === 'critical' ? '🔴' : t.priority === 'high' ? '🟠' : '🟡';
        responseText += `\n• ${pIcon} **${t.title}** (${t.subject}) — *Due Tomorrow*`;
      });

      const topTask = todayTasks[0] || tomorrowTasks[0];
      if (topTask) {
        responseText += `\n\n💡 **AI Agent Recommendation:** Start with **${topTask.title}** first because it carries the highest urgency score.`;
      }

      return {
        text: responseText,
        actions: [
          { label: 'Mark Top Task Done ✅', action: 'complete_task', taskId: topTask?.id },
          { label: 'Reschedule Today\'s Work 🔄', action: 'reschedule_prompt' }
        ]
      };
    }

    // 3. What should I do right now? / Where to start?
    if (q.includes("what should i do") || q.includes("where should i start") || q.includes("prioritize") || q.includes("what next")) {
      const sorted = [...pendingTasks].sort((a, b) => {
        const pWeight = { critical: 4, high: 3, medium: 2, low: 1 };
        return (pWeight[b.priority] || 1) - (pWeight[a.priority] || 1);
      });

      const primary = sorted[0];
      const secondary = sorted[1];

      return {
        text: `Here is your optimized AI Execution Strategy:

🎯 **Immediate Priority #1:**
**${primary.title}** (${primary.subject})
• Priority: **${primary.priority.toUpperCase()}**
• Est. Time: **${primary.estimatedMins} minutes**
• Why: Highest urgency and submission risk.

Next up: **${secondary ? secondary.title : 'Take a 15-minute break'}**.

Would you like me to start a focused 25-minute study sprint timer?`,
        actions: [
          { label: `Focus on ${primary.subject} 🎯`, action: 'focus_task', taskId: primary.id },
          { label: 'Mark Completed ✅', action: 'complete_task', taskId: primary.id }
        ]
      };
    }

    // 4. Forgetfulness Protection / Risk audit
    if (q.includes("forget") || q.includes("risk") || q.includes("warning") || q.includes("postpone")) {
      const alerts = window.store.getForgetfulnessAlerts();
      if (alerts.length === 0) {
        return {
          text: `🛡️ **Forgetfulness Protection Status: SAFE**\n\nAll your academic deadlines are nicely distributed with no neglected or repeatedly postponed tasks. Keep up this disciplined study routine!`,
          actions: [{ label: 'View Analytics 📈', view: 'analytics' }]
        };
      }

      let text = `🛡️ **Forgetfulness Protection Active Warning:**\n\nI detected **${alerts.length} high-risk academic items**:`;
      alerts.forEach(a => {
        text += `\n\n${a.badge}\n**${a.headline}**\n👉 *AI Advice:* ${a.recommendation}`;
      });

      return {
        text,
        actions: [
          { label: 'Rescue Riskiest Task 🚨', action: 'rescue_task', taskId: alerts[0]?.task?.id },
          { label: 'Auto-Reschedule 🔄', action: 'reschedule_prompt' }
        ]
      };
    }

    // 5. Break down task (e.g., "Break down my DBMS record")
    if (q.includes("break down") || q.includes("split") || q.includes("subtasks") || q.includes("steps")) {
      return {
        text: `Here is the step-by-step breakdown generated by StudyMate AI:

📑 **DBMS Lab Record (Exp 5 & 6) Milestone Plan:**
1. **Schema Design & ER Diagram** (15 mins)
2. **Transaction Isolation Queries (Exp 5)** (25 mins)
3. **PL/SQL Trigger Implementation (Exp 6)** (30 mins)
4. **Verification & Hard Copy Printout** (20 mins)

Would you like me to add these as individual sub-items into your task queue?`,
        actions: [
          { label: 'Add Subtasks to Queue ➕', action: 'add_subtasks' },
          { label: 'Set Reminders ⏰', view: 'notifications' }
        ]
      };
    }

    // 6. Generic academic inquiry / Fallback
    return {
      text: `I've analyzed your academic schedule. You currently have **${pendingTasks.length} pending academic obligations**.

Here's how I can assist right now:
• Ask: *"What do I need to finish today?"*
• Ask: *"I couldn't finish my DBMS record today"* (I'll automatically reschedule)
• Ask: *"What should I do right now?"*
• Ask: *"Show my forgetfulness warnings"*

How can I help you conquer your coursework?`,
      actions: [
        { label: 'Today\'s Deadlines 🔴', query: 'What do I need to finish today?' },
        { label: 'Smart Reschedule 🔄', query: 'I couldn\'t complete my DBMS record today' },
        { label: 'Forgetfulness Check ⚠️', query: 'Show my forgetfulness warnings' }
      ]
    };
  }
}

window.aiAssistant = new AIAssistant();
