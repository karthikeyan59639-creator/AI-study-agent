// StudyMate AI - Vision & Document OCR Engine

class OCREngine {
  constructor() {
    this.samplePresets = {
      blackboard: {
        id: 'sample-blackboard',
        name: 'Blackboard Notice (DBMS Lab)',
        imagePath: 'assets/sample_blackboard.jpg',
        ocrRawText: `DBMS LAB - Complete
Complete Experiment 5 & 6 (Transactions and Triggers) in Lab Record.
Final submission due Wednesday 10:00 AM.
Late submissions will not be accepted.`,
        extracted: {
          subject: 'DBMS',
          title: 'DBMS Lab Record (Exp 5 & 6 - Transactions & Triggers)',
          type: 'lab',
          deadlineDays: 2, // Wednesday relative to Monday
          deadlineHour: 10,
          priority: 'high',
          difficulty: 'hard',
          estimatedMins: 90,
          confidence: 99.4,
          notes: 'Extracted from Classroom Blackboard photo. Hard copy mandatory.'
        }
      },
      whatsapp: {
        id: 'sample-whatsapp',
        name: 'WhatsApp Announcement (Java Class)',
        imagePath: 'assets/sample_whatsapp.jpg',
        ocrRawText: `Reminder from Prof. Sharma:
Submit 3 Java Programs (Multithreading, Socket Programming, JDBC) before this Friday 5:00 PM.
Hard copy of lab record required.`,
        extracted: {
          subject: 'Java Programming',
          title: 'Java Lab Programs (Multithreading, Sockets, JDBC)',
          type: 'lab',
          deadlineDays: 4, // Friday
          deadlineHour: 17,
          priority: 'high',
          difficulty: 'hard',
          estimatedMins: 120,
          confidence: 98.8,
          notes: 'Extracted from WhatsApp group "B.Tech CSE - 3rd Year Official". Prof. Sharma.'
        }
      },
      classroom: {
        id: 'sample-classroom',
        name: 'Classroom Notice (OS Assignment)',
        imagePath: '', // fallback to stylized canvas badge if no custom image
        ocrRawText: `Operating Systems (CS303) - Assignment 2
Deadlock Avoidance & Banker's Algorithm Implementation.
Due Date: Next Monday 11:59 PM.
Individual submission required on portal.`,
        extracted: {
          subject: 'Operating Systems',
          title: 'OS Assignment 2: Banker\'s Algorithm & Deadlocks',
          type: 'assignment',
          deadlineDays: 7,
          deadlineHour: 23,
          priority: 'medium',
          difficulty: 'medium',
          estimatedMins: 90,
          confidence: 97.6,
          notes: 'Extracted from Google Classroom announcement.'
        }
      }
    };
  }

  getSample(key) {
    return this.samplePresets[key] || this.samplePresets.blackboard;
  }

  processCustomImage(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      // Perform simulated OCR analysis based on filename or standard academic patterns
      const fileName = file.name.toLowerCase();
      let subject = 'General';
      let type = 'assignment';
      let title = `Academic Task (${file.name.replace(/\.[^/.]+$/, '')})`;

      if (fileName.includes('dbms') || fileName.includes('sql')) {
        subject = 'DBMS';
        type = 'lab';
        title = 'DBMS Lab Record Submission';
      } else if (fileName.includes('java')) {
        subject = 'Java Programming';
        type = 'assignment';
        title = 'Java Programming Problem Set';
      } else if (fileName.includes('math') || fileName.includes('calculus')) {
        subject = 'Mathematics III';
        type = 'homework';
        title = 'Maths Homework Exercise';
      } else if (fileName.includes('os') || fileName.includes('linux')) {
        subject = 'Operating Systems';
        type = 'lab';
        title = 'OS Lab Experiment';
      } else if (fileName.includes('exam') || fileName.includes('test')) {
        type = 'exam';
        title = 'Semester Internal Exam Preparation';
      }

      const simulatedOcr = {
        name: file.name,
        imagePath: dataUrl,
        ocrRawText: `[Document Scan OCR: ${file.name}]\nSubject Identified: ${subject}\nAcademic Unit: Unit 3 Assessment & Laboratory Record\nSubmission Window: Next 48 Hours\nStrict Deadline Enforced by Dept.`,
        extracted: {
          subject,
          title,
          type,
          deadlineDays: 2,
          deadlineHour: 17,
          priority: 'high',
          difficulty: 'medium',
          estimatedMins: 75,
          confidence: 96.2,
          notes: `Extracted from uploaded student document: ${file.name}`
        }
      };

      callback(simulatedOcr);
    };
    reader.readAsDataURL(file);
  }
}

window.ocrEngine = new OCREngine();
