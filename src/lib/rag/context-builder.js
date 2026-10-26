/**
 * Formats retrieved document chunks into grounded context with citations.
 */
export function buildGroundedContext(retrievedChunks = []) {
  if (!retrievedChunks || retrievedChunks.length === 0) {
    return {
      contextText: '',
      hasContext: false,
      citations: [],
    };
  }

  const citations = retrievedChunks.map((chunk) => ({
    docTitle: chunk.documentTitle,
    pageOrSection: chunk.section
      ? `Page ${chunk.pageNumber || 1} • ${chunk.section}`
      : `Page ${chunk.pageNumber || 1}`,
    excerpt: chunk.content.slice(0, 240) + '...',
  }));

  const contextBlocks = retrievedChunks.map((chunk, index) => {
    return `[SOURCE ${index + 1}]
Document: "${chunk.documentTitle}"
Page: ${chunk.pageNumber || 1}
Section: "${chunk.section || 'General'}"
Passage:
${chunk.content}
--------------------------------------------------`;
  });

  return {
    contextText: contextBlocks.join('\n\n'),
    hasContext: true,
    citations,
  };
}

export const CANNOT_BE_SUPPORTED_MESSAGE =
  'The answer cannot be supported by the uploaded sources. Please upload study materials covering this topic or verify your document contents.';
