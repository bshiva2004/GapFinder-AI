import { generateLocalEmbedding, cosineSimilarity, tokenize } from './embeddings';
import { DocumentChunk } from '../types';

export interface RetrievedChunk {
  id: string;
  documentId: string;
  documentTitle: string;
  pageNumber: number;
  section: string;
  content: string;
  score: number;
}

/**
 * Real Retrieval-Augmented Generation (RAG) retriever.
 * Computes hybrid vector similarity + BM25 keyword matching against stored document chunks.
 */
export async function retrieveRelevantChunks({
  query,
  chunks = [],
  topK = 5,
  minThreshold = 0.05,
}: {
  query: string;
  chunks: DocumentChunk[];
  topK?: number;
  minThreshold?: number;
}): Promise<RetrievedChunk[]> {
  if (!query || chunks.length === 0) return [];

  const queryVector = generateLocalEmbedding(query);
  const queryTokens = new Set(tokenize(query));

  const scored: RetrievedChunk[] = chunks.map((chunk) => {
    // Vector similarity
    const chunkVector =
      chunk.embedding && chunk.embedding.length === queryVector.length
        ? chunk.embedding
        : generateLocalEmbedding(chunk.content);

    const vectorSim = cosineSimilarity(queryVector, chunkVector);

    // Keyword overlap score (BM25 inspired)
    const chunkTokens = tokenize(chunk.content);
    let matchedTokens = 0;
    for (const t of chunkTokens) {
      if (queryTokens.has(t)) {
        matchedTokens++;
      }
    }
    const keywordScore = queryTokens.size > 0 ? matchedTokens / (queryTokens.size * 3 + chunkTokens.length * 0.1) : 0;

    // Hybrid combined score: 65% vector semantic + 35% keyword
    const finalScore = vectorSim * 0.65 + keywordScore * 0.35;

    return {
      id: chunk.id,
      documentId: chunk.documentId,
      documentTitle: chunk.documentTitle,
      pageNumber: chunk.pageNumber || 1,
      section: chunk.section || 'General',
      content: chunk.content,
      score: finalScore,
    };
  });

  // Sort descending by relevance score
  const filtered = scored
    .filter((item) => item.score >= minThreshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return filtered;
}
