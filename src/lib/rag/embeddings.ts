/**
 * Embedding generation with dual support:
 * 1. Cloud LLM Embeddings (Gemini text-embedding-004) if GEMINI_API_KEY is configured.
 * 2. Deterministic high-precision TF-IDF Cosine Embedding fallback.
 */

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from',
  'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself',
  'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most',
  'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our',
  'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than',
  'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this',
  'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when',
  'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'you', 'your', 'yours', 'yourself',
]);

/**
 * Tokenize and normalize text into clean words
 */
export function tokenize(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9_\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

/**
 * Generates deterministic 384-dimensional vector from text tokens using hashing trick
 * and sublinear term frequency with L2 unit normalization.
 */
export function generateLocalEmbedding(text: string, dimensions = 384): number[] {
  const tokens = tokenize(text);
  const vector = new Float32Array(dimensions);
  if (tokens.length === 0) return Array.from(vector);

  // Term frequencies
  const tf: Record<string, number> = {};
  for (const t of tokens) {
    tf[t] = (tf[t] || 0) + 1;
  }

  // FNV-1a hash algorithm to map tokens to vector dimensions
  for (const [token, count] of Object.entries(tf)) {
    let hash = 2166136261;
    for (let i = 0; i < token.length; i++) {
      hash ^= token.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    const idx = Math.abs(hash) % dimensions;
    const sign = (Math.abs(hash >> 16) % 2 === 0) ? 1 : -1;
    // Sublinear term frequency weighting
    const weight = (1 + Math.log(count)) * sign;
    vector[idx] += weight;
  }

  // L2 unit normalization
  let norm = 0;
  for (let i = 0; i < dimensions; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < dimensions; i++) {
      vector[i] /= norm;
    }
  }

  return Array.from(vector);
}

/**
 * Computes Cosine Similarity between two numeric vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * High-level embedding generator.
 * Uses Gemini API when configured, else falls back to local vectorizer.
 */
export async function getEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'models/text-embedding-004',
          content: { parts: [{ text: text.slice(0, 2048) }] },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.embedding && data.embedding.values) {
          return data.embedding.values;
        }
      }
    } catch (err: any) {
      console.warn('Gemini embedding call failed, using deterministic local vectorizer:', err.message);
    }
  }

  return generateLocalEmbedding(text);
}
