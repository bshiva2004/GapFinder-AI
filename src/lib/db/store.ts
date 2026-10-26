import { getInitialSeedData, DEMO_USER } from './seed-data';
import {
  DocumentChunk,
  Quiz,
  QuizAttempt,
  RevisionPlan,
  StudyDocument,
  TopicItem,
  UserProfile,
} from '../types';

interface StoreState {
  users: UserProfile[];
  activeUser: UserProfile;
  documents: StudyDocument[];
  chunks: DocumentChunk[];
  topics: TopicItem[];
  quizzes: Quiz[];
  quizAttempts: QuizAttempt[];
  revisionPlans: RevisionPlan[];
  chatMessages: any[];
}

// Global in-memory storage singleton for server session
let globalStore: StoreState | null = null;

function getStoreInstance(): StoreState {
  if (!globalStore) {
    const seed = getInitialSeedData();
    globalStore = {
      users: [seed.user],
      activeUser: seed.user,
      documents: seed.documents as StudyDocument[],
      chunks: seed.chunks as DocumentChunk[],
      topics: seed.topics as TopicItem[],
      quizzes: [],
      quizAttempts: [],
      revisionPlans: [],
      chatMessages: [],
    };
  }
  return globalStore;
}

export const dbStore = {
  // User Management
  getActiveUser: (): UserProfile => {
    const store = getStoreInstance();
    return store.activeUser || DEMO_USER;
  },

  setActiveUser: (user: UserProfile) => {
    const store = getStoreInstance();
    store.activeUser = user;
    if (!store.users.some((u) => u.id === user.id)) {
      store.users.push(user);
    }
    return user;
  },

  setDemoJudgeUser: (): UserProfile => {
    const store = getStoreInstance();
    store.activeUser = DEMO_USER;
    return DEMO_USER;
  },

  // Documents
  getDocuments: (userId?: string): StudyDocument[] => {
    const store = getStoreInstance();
    return store.documents.filter((d) => !userId || d.userId === userId);
  },

  getDocumentById: (id: string): StudyDocument | undefined => {
    const store = getStoreInstance();
    return store.documents.find((d) => d.id === id);
  },

  addDocument: (doc: StudyDocument): StudyDocument => {
    const store = getStoreInstance();
    store.documents.unshift(doc);
    return doc;
  },

  deleteDocument: (id: string): boolean => {
    const store = getStoreInstance();
    store.documents = store.documents.filter((d) => d.id !== id);
    store.chunks = store.chunks.filter((c) => c.documentId !== id);
    return true;
  },

  // Chunks
  getChunks: (userId?: string): DocumentChunk[] => {
    const store = getStoreInstance();
    const userDocIds = new Set(
      store.documents.filter((d) => !userId || d.userId === userId).map((d) => d.id)
    );
    return store.chunks.filter((c) => userDocIds.has(c.documentId));
  },

  addChunks: (newChunks: DocumentChunk[]): DocumentChunk[] => {
    const store = getStoreInstance();
    store.chunks.push(...newChunks);
    return newChunks;
  },

  // Topics
  getTopics: (userId?: string): TopicItem[] => {
    const store = getStoreInstance();
    return store.topics.filter((t) => !userId || t.userId === userId);
  },

  setTopics: (topics: TopicItem[], userId?: string): TopicItem[] => {
    const store = getStoreInstance();
    store.topics = store.topics.filter((t) => userId && t.userId !== userId);
    store.topics.push(...topics);
    return store.topics;
  },

  addTopic: (topic: TopicItem): TopicItem => {
    const store = getStoreInstance();
    store.topics.push(topic);
    return topic;
  },

  deleteTopic: (id: string): boolean => {
    const store = getStoreInstance();
    store.topics = store.topics.filter((t) => t.id !== id);
    return true;
  },

  // Quizzes & Attempts
  addQuiz: (quiz: Quiz): Quiz => {
    const store = getStoreInstance();
    store.quizzes.unshift(quiz);
    return quiz;
  },

  getQuizById: (id: string): Quiz | undefined => {
    const store = getStoreInstance();
    return store.quizzes.find((q) => q.quizId === id || q.id === id);
  },

  addQuizAttempt: (attempt: QuizAttempt): QuizAttempt => {
    const store = getStoreInstance();
    store.quizAttempts.unshift(attempt);
    return attempt;
  },

  getQuizAttempts: (userId?: string): QuizAttempt[] => {
    const store = getStoreInstance();
    return store.quizAttempts.filter((a) => !userId || a.userId === userId);
  },

  // Revision Plans
  getRevisionPlan: (userId?: string): RevisionPlan | undefined => {
    const store = getStoreInstance();
    return store.revisionPlans.find((p) => !userId || p.userId === userId);
  },

  saveRevisionPlan: (plan: RevisionPlan): RevisionPlan => {
    const store = getStoreInstance();
    store.revisionPlans = store.revisionPlans.filter((p) => p.userId !== plan.userId);
    store.revisionPlans.unshift(plan);
    return plan;
  },

  toggleTaskCompletion: (userId: string, taskId: string) => {
    const store = getStoreInstance();
    const plan = store.revisionPlans.find((p) => !userId || p.userId === userId);
    if (plan && plan.tasks) {
      const task = plan.tasks.find((t) => t.id === taskId);
      if (task) {
        task.isCompleted = !task.isCompleted;
        return task;
      }
    }
    return null;
  },

  // Reset to initial seed
  resetToInitialSeed: () => {
    const seed = getInitialSeedData();
    globalStore = {
      users: [seed.user],
      activeUser: seed.user,
      documents: seed.documents as StudyDocument[],
      chunks: seed.chunks as DocumentChunk[],
      topics: seed.topics as TopicItem[],
      quizzes: [],
      quizAttempts: [],
      revisionPlans: [],
      chatMessages: [],
    };
    return globalStore;
  },
};
