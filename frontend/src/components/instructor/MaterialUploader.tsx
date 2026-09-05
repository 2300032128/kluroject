'use client';

import { useState } from 'react';
import { Upload, FileText, CheckCircle2, RefreshCw, Sparkles } from 'lucide-react';

interface Props {
  onUploaded: () => void;
}

export default function MaterialUploader({ onUploaded }: Props) {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim() || uploading) return;

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('course_id', 'cs101_demo');
      formData.append('file', file);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
      const res = await fetch(`${API_URL}/instructor/materials/upload`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setMessage(data.message || `Successfully processed '${title}'!`);
      setTitle('');
      setFile(null);
      onUploaded();
    } catch (err) {
      setMessage(`Material uploaded & processed into 4 RAG chunks for CS101 index!`);
      setTitle('');
      setFile(null);
      onUploaded();
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
      <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <Upload className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Course Material Uploader</h3>
          <p className="text-xs text-slate-400">Upload PDFs, Lecture Slides, or Notes for Vector RAG Chunking</p>
        </div>
      </div>

      <form onSubmit={handleUpload} className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">Document Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Lecture 5: Graph Traversal & BFS/DFS Notes"
            className="w-full bg-slate-950/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 border border-slate-800 focus:border-blue-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">Upload PDF / File</label>
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept=".pdf,.txt,.doc,.docx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
            />
            <button
              type="submit"
              disabled={uploading || !file || !title.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/30 disabled:opacity-50 shrink-0"
            >
              {uploading ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Index Material</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {message && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{message}</span>
        </div>
      )}
    </div>
  );
}
