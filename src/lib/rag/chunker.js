/**
 * Splits raw document text into meaningful, overlapping chunks.
 * Preserves page numbers, section headers, and document citations.
 */
export function chunkDocumentText({
  documentId,
  documentTitle,
  text,
  chunkSize = 1200,
  overlap = 200,
}) {
  if (!text || typeof text !== 'string') return [];

  // Check if text already has structured section markers like:
  // [Document: ... | Page: X | Section: Y]
  const explicitSectionRegex =
    /\[Document:\s*([^|]+)\|\s*Page:\s*(\d+)\|\s*Section:\s*([^\]]+)\]/gi;

  const chunks = [];
  let currentSection = 'General Content';
  let currentPage = 1;

  // Split into paragraphs / natural blocks first
  const paragraphs = text.split(/\n\s*\n/);
  let currentChunkText = '';
  let chunkIndex = 0;

  for (let i = 0; i < paragraphs.length; i++) {
    const para = paragraphs[i].trim();
    if (!para) continue;

    // Check for explicit markers
    const markerMatch = /\[Document:\s*([^|]+)\|\s*Page:\s*(\d+)\|\s*Section:\s*([^\]]+)\]/i.exec(para);
    if (markerMatch) {
      currentPage = parseInt(markerMatch[2], 10) || currentPage;
      currentSection = markerMatch[3].trim();
    } else {
      // Check for Unit / Section headers
      const unitMatch = /^(UNIT\s+[IVXLCDM\d]+|SECTION\s+\d+|COURSE OBJECTIVES|COURSE SYLLABUS)/i.exec(para);
      if (unitMatch) {
        currentSection = para.slice(0, 80).replace(/\n/g, ' ');
      }
    }

    if ((currentChunkText + '\n\n' + para).length > chunkSize && currentChunkText.length > 0) {
      chunks.push({
        id: `${documentId}-chk-${chunkIndex}`,
        documentId,
        documentTitle,
        pageNumber: currentPage,
        section: currentSection,
        chunkIndex,
        content: currentChunkText.trim(),
        createdAt: new Date().toISOString(),
      });
      chunkIndex++;

      // Retain overlap from end of current chunk
      const overlapStart = Math.max(0, currentChunkText.length - overlap);
      const overlapText = currentChunkText.slice(overlapStart);
      currentChunkText = overlapText + '\n\n' + para;
    } else {
      if (currentChunkText.length > 0) {
        currentChunkText += '\n\n' + para;
      } else {
        currentChunkText = para;
      }
    }
  }

  // Final chunk
  if (currentChunkText.trim().length > 0) {
    chunks.push({
      id: `${documentId}-chk-${chunkIndex}`,
      documentId,
      documentTitle,
      pageNumber: currentPage,
      section: currentSection,
      chunkIndex,
      content: currentChunkText.trim(),
      createdAt: new Date().toISOString(),
    });
  }

  return chunks;
}
