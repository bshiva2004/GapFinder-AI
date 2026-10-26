'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import {
  Upload,
  FileText,
  Trash2,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  Layers,
  FileCode,
  FileSearch,
  Sparkles,
} from 'lucide-react';

export default function MaterialsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [errorBanner, setErrorBanner] = useState('');
  const [successBanner, setSuccessBanner] = useState('');

  // Form states
  const [selectedFile, setSelectedFile] = useState(null);
  const [category, setCategory] = useState('notes');
  const [title, setTitle] = useState('');

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/materials');
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
      setErrorBanner('');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorBanner('Please select a PDF or TXT document to upload.');
      return;
    }

    setUploading(true);
    setErrorBanner('');
    setSuccessBanner('');

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('category', category);
    formData.append('title', title);

    try {
      const res = await fetch('/api/materials/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to upload document.');
      }

      setSuccessBanner(result.message || 'Document uploaded and chunked successfully!');
      setSelectedFile(null);
      setTitle('');
      // reset file input
      const fileInput = document.getElementById('file-input');
      if (fileInput) fileInput.value = '';

      await loadDocuments();
    } catch (err) {
      setErrorBanner(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id, docTitle) => {
    if (!confirm(`Delete document "${docTitle}" and its indexed chunks?`)) return;

    try {
      const res = await fetch(`/api/materials?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSuccessBanner(`Deleted "${docTitle}".`);
        await loadDocuments();
      }
    } catch (err) {
      setErrorBanner('Failed to delete document.');
    }
  };

  return (
    <AppShell
      title="My Study Materials"
      description="Upload your course syllabi, lecture notes, textbook extracts, and question papers for real RAG chunking and vector retrieval."
    >
      {/* Notifications */}
      {errorBanner && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-sm">Document Processing Error</div>
            <div className="text-xs text-rose-700 mt-0.5 leading-relaxed">{errorBanner}</div>
          </div>
        </div>
      )}

      {successBanner && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-sm">Success</div>
            <div className="text-xs text-emerald-700 mt-0.5">{successBanner}</div>
          </div>
        </div>
      )}

      {/* Grid: Upload Form (Left) & Document List (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-bold text-slate-900 text-base mb-1">Upload New Material</h3>
          <p className="text-xs text-slate-500 mb-5">
            Supports selectable PDF (.pdf) and plain text (.txt, .md). Max 15MB.
          </p>

          <form onSubmit={handleUpload} className="space-y-4">
            {/* File Dropzone / Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Document File</label>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center hover:border-indigo-400 transition-colors bg-slate-50/50">
                <input
                  id="file-input"
                  type="file"
                  accept=".pdf,.txt,.text,.md"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="file-input"
                  className="cursor-pointer flex flex-col items-center justify-center"
                >
                  <Upload className="h-8 w-8 text-indigo-500 mb-2" />
                  <span className="text-xs font-semibold text-indigo-600">
                    {selectedFile ? selectedFile.name : 'Choose PDF or TXT file'}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1">
                    {selectedFile
                      ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                      : 'or drag and drop here'}
                  </span>
                </label>
              </div>
            </div>

            {/* Document Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Document Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Unit 3 Trees & Graphs Lecture Notes"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Document Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="syllabus">Course Syllabus / Curriculum</option>
                <option value="notes">Lecture Notes / Class Handout</option>
                <option value="textbook">Textbook Chapter / Reference</option>
                <option value="pyq">Previous Exam Question Paper</option>
                <option value="other">Other Academic Document</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uploading}
              className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/30 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Extracting & Chunking...</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>Upload & Process Document</span>
                </>
              )}
            </button>
          </form>

          {/* Scanned PDF notice */}
          <div className="mt-5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
            <span className="font-semibold text-slate-700">Notice on Scanned PDFs:</span> Optical Character Recognition (OCR) is required for scanned photo documents. If you upload an image-only scan, GapFinder AI will prompt you to provide selectable text.
          </div>
        </div>

        {/* Uploaded Documents List (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Indexed Documents ({documents.length})</h3>
              <p className="text-xs text-slate-500">Each document is stored, chunked, and vectorized for grounded retrieval.</p>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading documents...</div>
          ) : documents.length === 0 ? (
            <div className="py-12 text-center">
              <FileSearch className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <div className="text-sm font-semibold text-slate-700">No documents indexed yet</div>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Upload a syllabus or study notes, or click "Reset Sample Demo Data" in the top bar to load the Sphoorthy CS301PC demo set.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {documents.map((doc) => {
                const categoryBadges = {
                  syllabus: 'bg-purple-50 text-purple-700 border-purple-200',
                  notes: 'bg-blue-50 text-blue-700 border-blue-200',
                  textbook: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  pyq: 'bg-amber-50 text-amber-700 border-amber-200',
                  other: 'bg-slate-50 text-slate-700 border-slate-200',
                };

                return (
                  <div
                    key={doc.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 transition-colors flex items-start justify-between gap-4 bg-slate-50/30"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="h-10 w-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-slate-900">{doc.title}</span>
                          <span
                            className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                              categoryBadges[doc.category] || categoryBadges.other
                            }`}
                          >
                            {doc.category}
                          </span>
                          <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium border border-emerald-200">
                            Ready
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-1.5 flex-wrap">
                          <span>{doc.fileName}</span>
                          <span>•</span>
                          <span>{(doc.fileSize / 1024).toFixed(1)} KB</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-medium text-slate-600">
                            <Layers className="h-3 w-3" /> {doc.chunkCount} RAG chunks
                          </span>
                          <span>•</span>
                          <span>{doc.pageCount || 1} pages</span>
                        </div>

                        {doc.contentSummary && (
                          <p className="text-xs text-slate-500 mt-2 line-clamp-1 italic">
                            "{doc.contentSummary}"
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(doc.id, doc.title)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                      title="Delete document"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
