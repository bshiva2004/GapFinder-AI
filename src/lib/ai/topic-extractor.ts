import { callGroundedLLM } from './llm-client';
import { retrieveRelevantChunks } from '../rag/retriever';
import { DocumentChunk, TopicItem } from '../types';

/**
 * Extracts topics and subtopics strictly from syllabus content.
 * Never invents topics not present in the source text.
 */
export async function extractTopicsFromSyllabus({
  syllabusText,
  documentId,
  documentTitle = 'Syllabus',
  notesChunks = [],
}: {
  syllabusText: string;
  documentId?: string;
  documentTitle?: string;
  notesChunks?: DocumentChunk[];
}): Promise<TopicItem[]> {
  if (!syllabusText || syllabusText.trim().length === 0) {
    throw new Error('Syllabus content is empty. Cannot extract topics.');
  }

  let extractedTopics: any[] = [];

  // Try LLM extraction if API configured
  try {
    const systemPrompt = `You are a strict syllabus topic extraction engine for college courses.
Extract the Units, Main Topics, and Subtopics strictly from the provided text.
Rules:
1. ONLY extract topics explicitly mentioned in the syllabus text. Never hallucinate or add outside topics.
2. Return a pure JSON array of objects with the following schema:
[
  {
    "name": "Topic or Unit Name",
    "unit": "Unit I or Chapter 1",
    "subtopics": ["Subtopic 1", "Subtopic 2", "Subtopic 3"]
  }
]
Do not wrap in markdown quotes if possible, or use standard \`\`\`json blocks.`;

    const rawResponse = await callGroundedLLM({
      systemInstruction: systemPrompt,
      prompt: `Extract topics from this syllabus text:\n\n${syllabusText.slice(0, 10000)}`,
      temperature: 0.1,
    });

    if (rawResponse) {
      const cleanJson = rawResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
      extractedTopics = JSON.parse(cleanJson);
    }
  } catch (err: any) {
    console.warn('LLM extraction skipped or failed, using deterministic syllabus parser:', err.message);
  }

  // Fallback to deterministic structural regex parser
  if (!extractedTopics || extractedTopics.length === 0) {
    extractedTopics = parseSyllabusDirectly(syllabusText);
  }

  // Associate topics with relevant passages from uploaded notes chunks
  const enrichedTopics: TopicItem[] = await Promise.all(
    extractedTopics.map(async (topic, index) => {
      let matchedPassage: string | null = null;
      let matchedDocTitle = documentTitle;
      let matchedPage = 1;

      if (notesChunks.length > 0) {
        const query = `${topic.name} ${topic.subtopics.slice(0, 3).join(' ')}`;
        const retrieved = await retrieveRelevantChunks({
          query,
          chunks: notesChunks,
          topK: 1,
          minThreshold: 0.05,
        });

        if (retrieved.length > 0) {
          matchedPassage = retrieved[0].content.slice(0, 320) + '...';
          matchedDocTitle = retrieved[0].documentTitle;
          matchedPage = retrieved[0].pageNumber || 1;
        }
      }

      return {
        id: `topic-${index + 1}-${Date.now()}`,
        name: topic.name,
        unit: topic.unit || `Unit ${index + 1}`,
        subtopics: topic.subtopics || [],
        sourcePassageExcerpt: matchedPassage || 'Identified in Course Syllabus curriculum structure.',
        sourceDocTitle: matchedDocTitle,
        sourcePage: matchedPage,
        createdAt: new Date().toISOString(),
      };
    })
  );

  return enrichedTopics;
}

/**
 * Deterministic rule-based syllabus parser
 */
function parseSyllabusDirectly(text: string): any[] {
  const lines = text.split('\n');
  const units: any[] = [];
  let currentUnit: any = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const unitMatch = /^(UNIT\s+[IVXLCDM\d]+|SECTION\s+\d+|MODULE\s+\d+)[:\-]?\s*(.*)/i.exec(line);
    if (unitMatch) {
      if (currentUnit) {
        units.push(currentUnit);
      }
      currentUnit = {
        name: unitMatch[2] ? unitMatch[2].trim() : unitMatch[1],
        unit: unitMatch[1],
        subtopics: [],
      };
      continue;
    }

    if (currentUnit) {
      // Check for bullet points or dashed lists
      const bulletMatch = /^[-\*•\d\.]+\s*(.+)/.exec(line);
      if (bulletMatch) {
        const subtopic = bulletMatch[1].trim();
        if (subtopic.length > 3 && subtopic.length < 120) {
          currentUnit.subtopics.push(subtopic);
        }
      } else if (line.length > 5 && line.length < 100 && !line.startsWith('=')) {
        currentUnit.subtopics.push(line);
      }
    }
  }

  if (currentUnit) {
    units.push(currentUnit);
  }

  // If no unit format found, split by major headers
  if (units.length === 0) {
    const rawBlocks = text.split(/\n\s*\n/).filter((b) => b.trim().length > 30);
    return rawBlocks.slice(0, 6).map((block, idx) => {
      const firstLine = block.split('\n')[0].replace(/[^a-zA-Z0-9\s]/g, '').trim();
      return {
        name: firstLine || `Topic Unit ${idx + 1}`,
        unit: `Module ${idx + 1}`,
        subtopics: block
          .split('\n')
          .slice(1, 5)
          .map((l) => l.trim().replace(/^[-*•]\s*/, ''))
          .filter(Boolean),
      };
    });
  }

  return units;
}
