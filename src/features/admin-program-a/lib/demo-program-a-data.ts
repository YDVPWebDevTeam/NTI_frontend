export const demoProgramAApplications = [
  {
    id: 'demo-program-a-001',
    status: 'SUBMITTED',
    teamName: 'Team Vision',
    callTitle: 'Program A 2026',
    submittedAt: '2026-05-21',
    mentor: null,
    eligibility: '3/4 signals passed',
    nextAction: 'Formal verification',
    lastActivity: '2 days ago',
  },
  {
    id: 'demo-program-a-002',
    status: 'EVALUATING',
    teamName: 'Green Stack',
    callTitle: 'Program A 2026',
    submittedAt: '2026-05-18',
    mentor: null,
    eligibility: '4/4 signals passed',
    nextAction: 'Submit evaluation',
    lastActivity: 'Today',
  },
  {
    id: 'demo-program-a-003',
    status: 'NEEDS_INFO',
    teamName: 'MedFlow',
    callTitle: 'Program A 2026',
    submittedAt: '2026-05-12',
    mentor: null,
    eligibility: '2/4 signals passed',
    nextAction: 'Waiting for team',
    lastActivity: 'Yesterday',
  },
  {
    id: 'demo-program-a-004',
    status: 'APPROVED',
    teamName: 'EduBridge',
    callTitle: 'Program A Spring',
    submittedAt: '2026-04-30',
    mentor: 'Not assigned',
    eligibility: '4/4 signals passed',
    nextAction: 'Assign mentor',
    lastActivity: '4 days ago',
  },
];

export const demoProgramAApplicationDetail = {
  status: 'EVALUATING',
  teamName: 'Green Stack',
  callTitle: 'Program A 2026',
  submittedAt: '2026-05-18',
  lastActivity: 'Today',
  mentor: null,
  eligibility: '4/4 signals passed',
  leaderEmail: 'leader@greenstack.test',
  category: 'Sustainable technology',
  stack: ['Next.js', 'NestJS', 'PostgreSQL'],
};

export const demoProgramASections = [
  {
    title: 'Idea overview',
    content:
      'Green Stack is building a platform for small teams to track energy usage and reduce operational waste.',
  },
  {
    title: 'Execution plan',
    content:
      'The team plans to deliver an MVP dashboard, data import flow, and reporting module during the first delivery phase.',
  },
  {
    title: 'Business case',
    content:
      'The project targets student organizations and small companies that need affordable sustainability reporting.',
  },
];

export const demoProgramADocuments = [
  'Executive summary.pdf',
  'Technical architecture.pdf',
  'Roadmap.pdf',
  'Budget.xlsx',
];

export const demoProgramAEvaluations = [
  {
    evaluator: 'Admin reviewer',
    recommendation: 'APPROVE',
    score: '18/20',
    comment: 'Strong technical concept with realistic delivery scope.',
  },
];

export const demoProgramANeedsInfoItems = [
  {
    status: 'RESOLVED',
    message: 'Please clarify the expected MVP timeline.',
    reply: 'The team added a revised timeline with three delivery milestones.',
  },
];
