import React from 'react';
import { PaperStructure, Language } from '../types';
import { Zap, List, GitGraph, FolderTree } from 'lucide-react';

interface StructureViewProps {
  data: PaperStructure;
  lang: Language;
}

const labels = {
  en: {
    tldr: "TL;DR",
    keyPoints: "Key Takeaways",
    flow: "Research Process Flow",
    tree: "Paper Structure"
  },
  zh: {
    tldr: "一句话总结 (TL;DR)",
    keyPoints: "关键要点",
    flow: "研究流程",
    tree: "论文架构"
  }
};

const formatText = (text: string) => {
  if (!text) return '';
  return text.replace(/\\n/g, '\n');
};

const StructureView: React.FC<StructureViewProps> = ({ data, lang }) => {
  const t = labels[lang];
  // Defensive: Ensure keyPoints is an array
  const points = Array.isArray(data.keyPoints) ? data.keyPoints : [];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
      
      {/* TL;DR Section */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-2 font-bold opacity-90">
          <Zap className="w-5 h-5" />
          <h3>{t.tldr}</h3>
        </div>
        <p className="text-lg font-medium leading-relaxed">
          {data.tldr || "..."}
        </p>
      </div>

      {/* 5 Key Points */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold text-lg">
          <List className="w-5 h-5 text-indigo-600" />
          <h3>{t.keyPoints}</h3>
        </div>
        <ul className="space-y-3">
          {points.length > 0 ? (
            points.map((point, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="text-slate-700">{point}</span>
              </li>
            ))
          ) : (
            <li className="text-slate-400 italic text-sm">No key points extracted.</li>
          )}
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Research Flowchart */}
        <div className="bg-slate-900 rounded-xl p-6 text-slate-100 shadow-md flex flex-col h-[400px]">
          <div className="flex items-center gap-2 mb-4 text-emerald-400 font-bold flex-shrink-0">
            <GitGraph className="w-5 h-5" />
            <h3>{t.flow}</h3>
          </div>
          <div className="flex-1 font-mono text-sm leading-7 whitespace-pre overflow-x-auto scrollbar-thin opacity-90 bg-slate-800/50 p-4 rounded-lg border border-slate-700">
            {formatText(data.researchFlow || '')}
          </div>
        </div>

        {/* Paper Architecture Tree */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-[400px]">
          <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold flex-shrink-0">
            <FolderTree className="w-5 h-5 text-indigo-600" />
            <h3>{t.tree}</h3>
          </div>
          <div className="flex-1 font-mono text-xs md:text-sm leading-6 whitespace-pre overflow-auto scrollbar-thin text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-100">
            {formatText(data.architectureTree || '')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StructureView;