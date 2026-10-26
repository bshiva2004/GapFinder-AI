/**
 * Text and PDF Extractor with scanned document detection and section recognition.
 */
export async function extractDocumentContent({ buffer, fileName, mimeType }) {
  if (!buffer || buffer.length === 0) {
    throw new Error('Uploaded file is empty.');
  }

  // 15 MB limit
  const MAX_SIZE = 15 * 1024 * 1024;
  if (buffer.length > MAX_SIZE) {
    throw new Error('File exceeds the 15MB size limit.');
  }

  const isPdf =
    mimeType === 'application/pdf' ||
    (fileName && fileName.toLowerCase().endsWith('.pdf'));

  if (isPdf) {
    try {
      const pdfModule = await import('pdf-parse');
      const pdfParse = pdfModule.default || pdfModule;
      const data = await pdfParse(buffer);
      const text = (data.text || '').trim();

      // Scanned PDF detection: if the PDF has pages but virtually no extracted text
      if (text.length < 50 && data.numpages >= 1) {
        throw new Error(
          'Scanned PDF detected. This document appears to be an image-only scan without selectable text. Please upload an OCR-processed PDF or text file.'
        );
      }

      return {
        text,
        pageCount: data.numpages || 1,
        meta: {
          info: data.info,
          version: data.version,
        },
      };
    } catch (err) {
      if (err.message && err.message.includes('Scanned PDF')) {
        throw err;
      }
      throw new Error(
        `Failed to parse PDF (${fileName}): ${err.message || 'File corrupted or unsupported structure.'}`
      );
    }
  }

  // Plain text / Markdown / Syllabus text files
  try {
    const text = buffer.toString('utf-8').trim();
    if (!text || text.length === 0) {
      throw new Error('The text file does not contain readable content.');
    }

    // Estimate page count (~500 words per academic page)
    const words = text.split(/\s+/).length;
    const pageCount = Math.max(1, Math.ceil(words / 450));

    return {
      text,
      pageCount,
      meta: { wordCount: words },
    };
  } catch (err) {
    throw new Error(`Failed to read text file (${fileName}): ${err.message}`);
  }
}
