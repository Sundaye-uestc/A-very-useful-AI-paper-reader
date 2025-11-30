import React from 'react';
import { PaperAnalysis, Language } from '../types';
import { 
  Users, 
  Calendar, 
  Tag, 
  Target, 
  FlaskConical, 
  Database, 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle 
} from 'lucide-react';

interface AnalysisResultProps {
  data: PaperAnalysis;
  lang: Language;
}

const labels = {
  en: {
    objective: "Research Objective",
    methods: "Methodology",
    dataSource: "Data Source / Dataset",
    conclusion: "Conclusion",
    innovations: "Innovations & Contributions",
    limitations: "Limitations"
  },
  zh: {
    objective: "研究目的",
    methods: "研究方法",
    dataSource: "数据来源 / 数据集",
    conclusion: "研究结论",
    innovations: "创新与贡献",
    limitations: "研究局限"
  }
};

const AnalysisResult: React.FC<AnalysisResultProps> = ({ data, lang }) => {
  const { basicInfo, coreElements, academicEvaluation } = data;
  const t = labels[lang];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header Section: Basic Info */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 serif leading-tight">
            {basicInfo.title}
          </h2>
          
          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>{basicInfo.authors.join(', ')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>{basicInfo.year}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            {basicInfo.keywords.map((kw, idx) => (
              <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                <Tag className="w-3 h-3 mr-1" />
                {kw}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Core Elements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Objective */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-3 text-indigo-700 font-semibold">
            <Target className="w-5 h-5" />
            <h3>{t.objective}</h3>
          </div>
          <p className="text-slate-700 leading-relaxed text-sm md:text-base">
            {coreElements.objective}
          </p>
        </div>

        {/* Methods */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-3 text-indigo-700 font-semibold">
            <FlaskConical className="w-5 h-5" />
            <h3>{t.methods}</h3>
          </div>
          <p className="text-slate-700 leading-relaxed text-sm md:text-base">
            {coreElements.methods}
          </p>
        </div>

        {/* Data Source */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-3 text-indigo-700 font-semibold">
            <Database className="w-5 h-5" />
            <h3>{t.dataSource}</h3>
          </div>
          <p className="text-slate-700 leading-relaxed text-sm md:text-base">
            {coreElements.dataSource}
          </p>
        </div>

        {/* Conclusion */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-3 text-indigo-700 font-semibold">
            <CheckCircle className="w-5 h-5" />
            <h3>{t.conclusion}</h3>
          </div>
          <p className="text-slate-700 leading-relaxed text-sm md:text-base">
            {coreElements.conclusion}
          </p>
        </div>
      </div>

      {/* Academic Evaluation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Innovations */}
         <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-6">
          <div className="flex items-center gap-2 mb-4 text-emerald-800 font-semibold">
            <Lightbulb className="w-5 h-5" />
            <h3>{t.innovations}</h3>
          </div>
          <ul className="space-y-2">
            {academicEvaluation.innovations.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-emerald-900 text-sm md:text-base">
                <span className="mt-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Limitations */}
        <div className="bg-amber-50 rounded-xl border border-amber-100 p-6">
          <div className="flex items-center gap-2 mb-4 text-amber-800 font-semibold">
            <AlertTriangle className="w-5 h-5" />
            <h3>{t.limitations}</h3>
          </div>
          <ul className="space-y-2">
            {academicEvaluation.limitations.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-amber-900 text-sm md:text-base">
                <span className="mt-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResult;