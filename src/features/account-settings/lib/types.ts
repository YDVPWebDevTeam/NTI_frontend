export type FeedbackTone = 'success' | 'info' | 'warning' | 'danger';

export type SecurityFeedback = {
  title: string;
  description: string;
  tone: FeedbackTone;
};
