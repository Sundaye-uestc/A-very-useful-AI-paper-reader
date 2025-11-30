import React, { useState } from 'react';
import { Upload, FileText, Loader2, Sparkles, Layout, BookOpen, Layers, Globe, MessageCircle, PlusCircle } from 'lucide-react';
import { extractTextFromPdf } from './services/pdfService';
import { analyzePaperContent, analyzePaperStructure } from './services/geminiService';
import { PaperAnalysis, PaperStructure, Language } from './types';
import AnalysisResult from './components/AnalysisResult';
import StructureView from './components/StructureView';
import NotesView from './components/NotesView';
import ChatView from './components/ChatView';

enum Tab {
  INSIGHTS = 'insights',
  STRUCTURE = 'structure',
  NOTES = 'notes',
  CHAT = 'chat',
}

const translations = {
  en: {
    title: "ScholarLens AI",
    subtitle: "Intelligent Research Assistant",
    heroTitle: "Analyze Papers in Seconds",
    heroDesc: "Upload a PDF to get instant summaries, structure breakdown, and automated notes.",
    uploadBtn: "Upload PDF",
    dragDrop: "Click to upload or drag and drop",
    pdfOnly: "PDF files only (Max 20MB)",
    analyzingBtn: "Analyzing...",
    switchingLang: "Translating Content...",
    loadingTitle: "Reading Paper...",
    loadingDesc: "Extracting structure, insights, and building knowledge base.",
    errorUpload: "Please upload a valid PDF file.",
    errorExtract: "Could not extract enough text.",
    uploadNew: "Upload New PDF",
    tabs: {
      [Tab.INSIGHTS]: "Deep Insights",
      [Tab.STRUCTURE]: "Structure",
      [Tab.NOTES]: "Auto-Notes",
      [Tab.CHAT]: "AI Q&A",
    }
  },
  zh: {
    title: "ScholarLens AI",
    subtitle: "智能科研助手",
    heroTitle: "秒级解析科研论文",
    heroDesc: "上传 PDF 文件，获取即时摘要、结构拆解和自动笔记。",
    uploadBtn: "上传 PDF",
    dragDrop: "点击上传或拖拽文件至此",
    pdfOnly: "仅支持 PDF 文件 (最大 20MB)",
    analyzingBtn: "分析中...",
    switchingLang: "正在翻译内容...",
    loadingTitle: "正在阅读论文...",
    loadingDesc: "正在提取结构、洞察并构建知识库。",
    errorUpload: "请上传有效的 PDF 文件。",
    errorExtract: "无法提取足够的文本。",
    uploadNew: "上传新 PDF",
    tabs: {
      [Tab.INSIGHTS]: "深度洞察",
      [Tab.STRUCTURE]: "论文结构",
      [Tab.NOTES]: "自动笔记",
      [Tab.CHAT]: "AI 问答",
    }
  }
};

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data States
  const [paperText, setPaperText] = useState<string>('');
  const [analysis, setAnalysis] = useState<PaperAnalysis | null>(null);
  const [structure, setStructure] = useState<PaperStructure | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.INSIGHTS);
  
  // Settings
  const [language, setLanguage] = useState<Language>('zh'); 
  
  // Input states
  const [fileName, setFileName] = useState<string | null>(null);

  const t = translations[language];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError(t.errorUpload);
      return;
    }

    setFileName(file.name);
    resetState();
    setIsLoading(true);

    try {
      // 1. Extract Text
      const text = await extractTextFromPdf(file);
      if (text.length < 50) throw new Error(t.errorExtract);
      setPaperText(text);

      // 2. Parallel Analysis (Feature 1 + Feature 2)
      const [analysisResult, structureResult] = await Promise.all([
        analyzePaperContent(text, language),
        analyzePaperStructure(text, language)
      ]);

      setAnalysis(analysisResult);
      setStructure(structureResult);
    } catch (err: any) {
      setError(err.message || 'An error occurred during analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setError(null);
    setAnalysis(null);
    setStructure(null);
    setPaperText('');
    setFileName(null);
    setActiveTab(Tab.INSIGHTS);
  };

  const toggleLanguage = async () => {
    const newLang = language === 'en' ? 'zh' : 'en';
    setLanguage(newLang);

    // If we have existing content, we must re-analyze it in the new language
    if (paperText && !isLoading && !isTranslating) {
      setIsTranslating(true);
      try {
        const [analysisResult, structureResult] = await Promise.all([
          analyzePaperContent(paperText, newLang),
          analyzePaperStructure(paperText, newLang)
        ]);
        setAnalysis(analysisResult);
        setStructure(structureResult);
      } catch (err) {
        console.error("Failed to translate content:", err);
        // We don't block the UI switch if translation fails, but we log it
      } finally {
        setIsTranslating(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}>
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800 serif">{t.title}</span>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="text-sm text-slate-500 hidden sm:block mr-2">
              {t.subtitle}
            </div>

            {/* NEW: Upload New PDF Button (Only visible when analysis exists) */}
            {analysis && !isLoading && !isTranslating && (
              <button 
                onClick={resetState}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors text-sm font-medium shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">{t.uploadNew}</span>
              </button>
            )}

            <button 
              onClick={toggleLanguage}
              disabled={isLoading || isTranslating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {isTranslating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
              {language === 'en' ? 'English' : '中文'}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Input / Hero Section - Only show if no results yet */}
        {!analysis && !isLoading && !isTranslating && (
          <>
            <div className="text-center mb-12 max-w-2xl mx-auto animate-fade-in">
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 serif">
                {t.heroTitle}
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed">
                {t.heroDesc}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-w-xl mx-auto">
              <div className="p-8">
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-10 bg-slate-50 hover:bg-indigo-50/30 hover:border-indigo-300 transition-colors relative group">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isLoading}
                  />
                  <div className="bg-white p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                    <FileText className="w-8 h-8 text-indigo-600" />
                  </div>
                  <p className="text-slate-900 font-medium mb-1">
                    {fileName ? fileName : t.dragDrop}
                  </p>
                  <p className="text-slate-500 text-sm">{t.pdfOnly}</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Loading / Translating State */}
        {(isLoading || isTranslating) && (
          <div className="mt-12 flex flex-col items-center justify-center text-slate-500 animate-in fade-in zoom-in duration-300">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
            <p className="text-lg font-medium text-slate-700">
              {isTranslating ? t.switchingLang : t.loadingTitle}
            </p>
            <p className="text-sm mt-1 text-slate-400">
              {isTranslating ? '' : t.loadingDesc}
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-6 mx-auto max-w-xl p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100 text-center animate-fade-in">
            {error}
          </div>
        )}

        {/* Results Dashboard */}
        {analysis && structure && !isLoading && !isTranslating && (
          <div className="animate-fade-in">
             {/* Tab Navigation */}
             <div className="flex flex-wrap justify-center gap-2 mb-8 bg-white p-2 rounded-xl border border-slate-200 shadow-sm w-fit mx-auto">
               {[
                 { id: Tab.INSIGHTS, label: t.tabs[Tab.INSIGHTS], icon: Layout },
                 { id: Tab.STRUCTURE, label: t.tabs[Tab.STRUCTURE], icon: Layers },
                 { id: Tab.NOTES, label: t.tabs[Tab.NOTES], icon: BookOpen },
                 { id: Tab.CHAT, label: t.tabs[Tab.CHAT], icon: MessageCircle },
               ].map((tab) => (
                 <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id)}
                   className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                     activeTab === tab.id
                       ? 'bg-indigo-600 text-white shadow-md'
                       : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                   }`}
                 >
                   <tab.icon className="w-4 h-4" />
                   {tab.label}
                 </button>
               ))}
             </div>

             {/* Tab Content */}
             <div className="min-h-[500px]">
                {activeTab === Tab.INSIGHTS && <AnalysisResult data={analysis} lang={language} />}
                {activeTab === Tab.STRUCTURE && <StructureView data={structure} lang={language} />}
                {activeTab === Tab.NOTES && <NotesView paperText={paperText} lang={language} />}
                {activeTab === Tab.CHAT && <ChatView paperText={paperText} lang={language} />}
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;