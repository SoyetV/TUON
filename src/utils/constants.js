export const RANKS = [
  { name: "Initiate",    min: 0,    max: 499,      color: "#94a3b8", cls: "rank-initiate"    },
  { name: "Scholar",     min: 500,  max: 1499,     color: "#00f5ff", cls: "rank-scholar"     },
  { name: "Sage",        min: 1500, max: 2999,     color: "#8b5cf6", cls: "rank-sage"        },
  { name: "Arcanist",    min: 3000, max: 5999,     color: "#f59e0b", cls: "rank-arcanist"    },
  { name: "Grandmaster", min: 6000, max: Infinity, color: "#ffb4ab", cls: "rank-grandmaster" },
];

export const ACHIEVEMENTS = [
  { id: "first_quiz",    icon: "⚡", name: "First Spark",    desc: "Complete your first quiz",  xp: 50  },
  { id: "perfect_score", icon: "💎", name: "Diamond Mind",   desc: "Score 100% on any quiz",    xp: 150 },
  { id: "streak_3",      icon: "🔥", name: "On Fire",        desc: "3-day study streak",         xp: 75  },
  { id: "streak_7",      icon: "⚔️", name: "Weekly Warrior", desc: "7-day study streak",         xp: 200 },
  { id: "pdf_upload",    icon: "📄", name: "PDF Pilot",      desc: "Upload your first PDF",      xp: 30  },
  { id: "five_subjects", icon: "🗂️", name: "Domain Master",  desc: "Create 5 subjects",          xp: 100 },
  { id: "quiz_marathon", icon: "🏃", name: "Marathon",       desc: "Complete 10 quizzes total",  xp: 150 },
];

export const SUBJECT_COLORS = [
  "#39bdf8", "#8b5cf6", "#00f5ff", "#10b981",
  "#f59e0b", "#ffb4ab", "#d0bcff", "#63f7ff",
];
