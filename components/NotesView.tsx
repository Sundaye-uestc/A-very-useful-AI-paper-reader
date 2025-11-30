import React, { useState, useEffect } from 'react';
import { NoteStyle, Language } from '../types';
import { generatePaperNotes } from '../services/geminiService';
import { BookMarked, PenTool, RefreshCw, Copy, Check } from 'lucide-react';
import { parse } from 'marked';

interface NotesViewProps {
  paperText: string;
  lang: Language;
}

const labels = {
  en: {
    styleLabel: "Note Style:",
    generateBtn: "Generate Notes",
    generating: "Writing...",
    copy: "Copy",
    copied: "Copied",
    emptyState: "Select a style and click generate to create custom notes.",
    styles: {
      [NoteStyle.ACADEMIC]: "Academic Standard",
      [NoteStyle.REVIEW]: "Review (What/How/Why)",
      [NoteStyle.REPRODUCTION]: "Experiment Reproduction",
      [NoteStyle.MINDMAP]: "Textual Mind Map",
      [NoteStyle.FLASHCARDS]: "Study Flashcards (Q&A)"
    }
  },
  zh: {
    styleLabel: "笔记风格:",
    generateBtn: "生成笔记",
    generating: "生成中...",
    copy: "复制",
    copied: "已复制",
    emptyState: "请选择一种风格并点击生成，即可创建定制化笔记。",
    styles: {
      [NoteStyle.ACADEMIC]: "学术标准笔记",
      [NoteStyle.REVIEW]: "复盘式笔记 (What/How/Why)",
      [NoteStyle.REPRODUCTION]: "实验复现指南",
      [NoteStyle.MINDMAP]: "文本思维导图",
      [NoteStyle.FLASHCARDS]: "复习卡片 (Q&A)"
    }
  }
};

const renderMarkdownWithMath = (text: string) => {
  if (!text) return '';

  const mathBlocks: string[] = [];
  const mathInlines: string[] = [];

  // 1. Protect Block Math $$...$$
  // We use a placeholder that won't be messed up by markdown parser
  let protectedText = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, match) => {
    mathBlocks.push(match);
    return `MATH_BLOCK_PLACEHOLDER_${mathBlocks.length - 1}`;
  });

  // 2. Protect Inline Math $...$
  // Be careful not to match simple currency symbols like $100
  protectedText = protectedText.replace(/\$([^$\n]+?)\$/g, (_, match) => {
    mathInlines.push(match);
    return `MATH_INLINE_PLACEHOLDER_${mathInlines.length - 1}`;
  });

  // 3. Parse Markdown
  let html = parse(protectedText) as string;

  // 4. Restore and Render Block Math
  html = html.replace(/MATH_BLOCK_PLACEHOLDER_(\d+)/g, (_, index) => {
    const tex = mathBlocks[parseInt(index)];
    try {
      return window.katex ? window.katex.renderToString(tex, { displayMode: true, throwOnError: false }) : tex;
    } catch (e) {
      return `$$${tex}$$`;
    }
  });

  // 5. Restore and Render Inline Math
  html = html.replace(/MATH_INLINE_PLACEHOLDER_(\d+)/g, (_, index) => {
    const tex = mathInlines[parseInt(index)];
    try {
      return window.katex ? window.katex.renderToString(tex, { displayMode: false, throwOnError: false }) : tex;
    } catch (e) {
      return `$${tex}$`;
    }
  });

  return html;
};

const NotesView: React.FC<NotesViewProps> = ({ paperText, lang }) => {
  const [selectedStyle, setSelectedStyle] = useState<NoteStyle>(NoteStyle.ACADEMIC);
  const [notes, setNotes] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const t = labels[lang];

  // Reset notes if language changes to avoid mismatch
  useEffect(() => {
    setNotes("");
  }, [lang]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setNotes(""); 
    try {
      const result = await generatePaperNotes(paperText, selectedStyle, lang);
      setNotes(result);
    } catch (error) {
      setNotes(lang === 'zh' ? "**生成笔记时出错。** 请重试。" : "**Error generating notes.** Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(notes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <BookMarked className="text-indigo-600 w-5 h-5" />
          <span className="font-semibold text-slate-700">{t.styleLabel}</span>
          <select 
            value={selectedStyle}
            onChange={(e) => setSelectedStyle(e.target.value as NoteStyle)}
            className="flex-1 md:w-64 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            {Object.values(NoteStyle).map((style) => (
              <option key={style} value={style}>{t.styles[style]}</option>
            ))}
          </select>
        </div>
        
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full md:w-auto px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <PenTool className="w-4 h-4" />}
          {isGenerating ? t.generating : t.generateBtn}
        </button>
      </div>

      {/* Output Area */}
      {notes && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
          <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-semibold text-slate-700">{t.styles[selectedStyle]}</h3>
            <button 
              onClick={copyToClipboard}
              className="text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1 text-sm"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? t.copied : t.copy}
            </button>
          </div>
          <div className="p-8 max-w-none">
            <div 
              className="prose prose-indigo max-w-none prose-p:leading-relaxed prose-headings:text-slate-800 prose-p:text-slate-700 prose-li:text-slate-700 prose-strong:text-slate-900"
              dangerouslySetInnerHTML={{ __html: renderMarkdownWithMath(notes) }} 
            />
          </div>
        </div>
      )}

      {!notes && !isGenerating && (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-slate-400">
          <PenTool className="w-10 h-10 mb-3 opacity-20" />
          <p>{t.emptyState}</p>
        </div>
      )}
    </div>
  );
};

export default NotesView;