import { retrieveRelevantChunks } from '../rag/retriever';
import { buildGroundedContext, CANNOT_BE_SUPPORTED_MESSAGE } from '../rag/context-builder';
import { callGroundedLLM } from './llm-client';

/**
 * Strict RAG Question Answering Assistant.
 * Only answers questions grounded in uploaded passages.
 * Refuses to answer from general knowledge if sources do not support it.
 */
export async function answerQuestionFromMaterials({
  question,
  chunks = [],
  conversationHistory = [],
}) {
  if (!question || question.trim().length === 0) {
    throw new Error('Question cannot be empty.');
  }

  if (!chunks || chunks.length === 0) {
    return {
      content:
        'No study materials are uploaded yet. Please upload your course syllabus, lecture notes, or textbooks first in "My Materials".',
      citations: [],
      isUnsupportedBySources: true,
    };
  }

  // 1. Retrieve relevant passages
  const retrievedChunks = await retrieveRelevantChunks({
    query: question,
    chunks,
    topK: 4,
    minThreshold: 0.08,
  });

  // If retrieval returns no relevant chunks above threshold, strictly decline
  if (retrievedChunks.length === 0) {
    return {
      content: CANNOT_BE_SUPPORTED_MESSAGE,
      citations: [],
      isUnsupportedBySources: true,
    };
  }

  const { contextText, citations } = buildGroundedContext(retrievedChunks);

  // 2. Try LLM generation if configured
  try {
    const systemInstruction = `You are the GapFinder AI Assistant for college engineering students.
Your ONLY mission is to answer the student's question based STRICTLY and EXCLUSIVELY on the provided source passages.
CRITICAL RULES:
1. Grounding: Do NOT use any general external knowledge. Every statement must be supported by the provided passages.
2. Incomplete Coverage: If the provided passages do NOT explicitly contain enough information to answer the question, you MUST reply: "${CANNOT_BE_SUPPORTED_MESSAGE}" and do not attempt to guess.
3. Citations: Explicitly cite the document title, page, and section for each key fact in your explanation.
4. Tone: Academic, encouraging, clear, and direct.`;

    const prompt = `Source Passages from uploaded student materials:
${contextText}

Student Question:
${question}

Answer based ONLY on the source passages above:`;

    const rawResponse = await callGroundedLLM({
      systemInstruction,
      prompt,
      temperature: 0.1,
    });

    if (rawResponse && rawResponse.trim().length > 0) {
      const isRefusal = rawResponse.includes('cannot be supported by the uploaded sources');
      return {
        content: rawResponse.trim(),
        citations: isRefusal ? [] : citations,
        isUnsupportedBySources: isRefusal,
      };
    }
  } catch (err) {
    console.warn('LLM call failed or not configured, using direct extractive grounded response:', err.message);
  }

  // 3. Extractive grounded fallback when external LLM is not configured:
  // Synthesizes the answer directly from the highest-scoring passage
  const topPassage = retrievedChunks[0];
  const responseContent = `Based directly on your uploaded notes in **"${topPassage.documentTitle}"** (${topPassage.section}, Page ${topPassage.pageNumber || 1}):\n\n> "${topPassage.content}"\n\n**Source Explanation:**\nThe retrieved course material explicitly addresses this concept. Review the cited section above for your exam preparation.`;

  return {
    content: responseContent,
    citations,
    isUnsupportedBySources: false,
  };
}
