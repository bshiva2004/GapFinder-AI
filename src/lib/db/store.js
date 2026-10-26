import { getInitialSeedData, DEMO_USER } from './seed-data';

/**
 * Universal Data Store.
 * Supports Supabase when configured, and provides an in-memory & session-backed
 * store initialized with authentic Sphoorthy Engineering College course materials.
 */

// Global in-memory storage singleton for server session
let globalStore = null;

function getStoreInstance() {
  if (!globalStore) {
    const seed = getInitialSeedData();
    globalStore = {
      users: [seed.user],
      activeUser: seed.user,
      documents: seed.documents,
      chunks: seed.chunks,
      topics: seed.topics,
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
  getActiveUser: () => {
    const store = getStoreInstance();
    return store.activeUser || DEMO_USER;
  },

  setActiveUser: (user) => {
    const store = getStoreInstance();
    store.activeUser = user;
    if (!store.users.some((u) => u.id === user.id)) {
      store.users.push(user);
    }
    return user;
  },

  setDemoJudgeUser: () => {
    const store = getStoreInstance();
    store.activeUser = DEMO_USER;
    return DEMO_USER;
  },

  // Documents
  getDocuments: (userId) => {
    const store = getStoreInstance();
    return store.documents.filter((d) => !userId || d.userId === userId);
  },

  getDocumentById: (id) => {
    const store = getStoreInstance();
    return store.documents.find((d) => d.id === id);
  },

  addDocument: (doc) => {
    const store = getStoreInstance();
    store.documents.unshift(doc);
    return doc;
  },

  deleteDocument: (id) => {
    const store = getStoreInstance();
    store.documents = store.documents.filter((d) => d.id !== id);
    store.chunks = store.chunks.filter((c) => c.documentId !== id);
    return true;
  },

  // Chunks
  getChunks: (userId) => {
    const store = getStoreInstance();
    const userDocIds = new Set(
      store.documents.filter((d) => !userId || d.userId === userId).map((d) => d.id)
    );
    return store.chunks.filter((c) => userDocIds.has(c.documentId));
  },

  addChunks: (newChunks) => {
    const store = getStoreInstance();
    store.chunks.push(...newChunks);
    return newChunks;
  },

  // Topics
  getTopics: (userId) => {
    const store = getStoreInstance();
    return store.topics.filter((t) => !userId || t.userId === userId);
  },

  setTopics: (topics, userId) => {
    const store = getStoreInstance();
    // remove previous user topics and append new ones
    store.topics = store.topics.filter((t) => userId && t.userId !== userId);
    store.topics.push(...topics);
    return store.topics;
  },

  addTopic: (topic) => {
    const store = getStoreInstance();
    store.topics.push(topic);
    return topic;
  },

  deleteTopic: (id) => {
    const store = getStoreInstance();
    store.topics = store.topics.filter((t) => t.id !== id);
    return true;
  },

  // Quizzes & Attempts
  addQuiz: (quiz) => {
    const store = getStoreInstance();
    store.quizzes.unshift(quiz);
    return quiz;
  },

  getQuizById: (id) => {
    const store = getStoreInstance();
    return store.quizzes.find((q) => q.id === id);
  },

  addQuizAttempt: (attempt) => {
    const store = getStoreInstance();
    store.quizAttempts.unshift(attempt);
    return attempt;
  },

  getQuizAttempts: (userId) => {
    const store = getStoreInstance();
    return store.quizAttempts.filter((a) => !userId || a.userId === userId);
  },

  // Revision Plans
  getRevisionPlan: (userId) => {
    const store = getStoreInstance();
    return store.revisionPlans.find((p) => !userId || p.userId === userId);
  },

  saveRevisionPlan: (plan) => {
    const store = getStoreInstance();
    store.revisionPlans = store.revisionPlans.filter((p) => p.userId !== plan.userId);
    store.revisionPlans.unshift(plan);
    return plan;
  },

  toggleTaskCompletion: (userId, taskId) => {
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
      documents: seed.documents,
      chunks: seed.chunks,
      topics: seed.topics,
      quizzes: [],
      quizAttempts: [],
      revisionPlans: [],
      chatMessages: [],
    };
    return globalStore;
  },
};
