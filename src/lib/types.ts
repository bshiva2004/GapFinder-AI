export type DocumentCategory = 'syllabus' | 'notes' | 'textbook' | 'pyq' | 'other';

export interface DocumentChunk {
  id: string;
  documentId: string;
  documentTitle: string;
  pageNumber?: number;
  section?: string;
  chunkIndex: number;
  content: string;
  embedding?: number[];
  createdAt: string;
}

export interface StudyDocument {
  id: string;
  userId: string;
  title: string;
  category: DocumentCategory;
  fileName: string;
  fileSize: number;
  fileType: string;
  status: 'processing' | 'ready' | 'error';
  errorMessage?: string;
  pageCount?: number;
  chunkCount: number;
  createdAt: string;
  updatedAt: string;
  contentSummary?: string;
}

export interface TopicItem {
  id: string;
  userId?: string;
  documentId?: string;
  name: string;
  unit?: string;
  subtopics: string[];
  sourcePassageExcerpt?: string;
  sourceDocTitle?: string;
  sourcePage?: number;
  createdAt?: string;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  topic: string;
  question: string;
  options: [string, string, string, string] | string[];
  correctOptionIndex: number;
  explanation: string;
  sourceDocTitle: string;
  sourcePageOrSection: string;
  sourcePassageExcerpt: string;
}

export interface Quiz {
  id?: string;
  quizId: string;
  userId?: string;
  title: string;
  topic?: string;
  documentIds?: string[];
  questions: QuizQuestion[];
  totalQuestions?: number;
  createdAt?: string;
}

export interface SubmittedAnswer {
  questionId: string;
  selectedOptionIndex: number;
  isCorrect: boolean;
  questionText: string;
  topic: string;
  correctOptionIndex: number;
  options: [string, string, string, string] | string[];
  explanation: string;
  incorrectExplanation?: string | null;
  sourceDocTitle: string;
  sourcePageOrSection: string;
  sourcePassageExcerpt: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  quizTitle: string;
  totalQuestions: number;
  correctAnswersCount: number;
  scorePercentage: number;
  submittedAnswers: SubmittedAnswer[];
  completedAt: string;
}

export type TopicStrength = 'weak' | 'medium' | 'strong' | 'insufficient_data';

export interface TopicGapReportItem {
  topic: string;
  questionsAttempted: number;
  questionsCorrect: number;
  accuracyPercentage: number;
  classification: TopicStrength;
  classificationReason: string;
  recommendedAction: string;
  relevantPassages: {
    docTitle: string;
    pageOrSection: string;
    excerpt: string;
  }[];
}

export interface GapReport {
  overallAccuracy: number;
  totalQuestionsAttempted: number;
  weakCount: number;
  mediumCount: number;
  strongCount: number;
  insufficientDataCount: number;
  topicReports: TopicGapReportItem[];
  generatedAt: string;
}

export interface RevisionTask {
  id: string;
  topic: string;
  classification: TopicStrength;
  durationMinutes: number;
  taskType: 'concept_review' | 'deep_dive' | 'practice_quiz' | 'quick_refresh';
  description: string;
  citedPassages: {
    docTitle: string;
    pageOrSection: string;
    excerpt: string;
  }[];
  isCompleted: boolean;
}

export interface RevisionPlan {
  id?: string;
  userId?: string;
  dailyAvailableMinutes: number;
  examDate?: string | null;
  totalPlannedMinutes: number;
  tasks: RevisionTask[];
  createdAt: string;
  updatedAt?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  institution: string;
  role: 'student' | 'judge' | 'admin';
  isDemoUser?: boolean;
}

