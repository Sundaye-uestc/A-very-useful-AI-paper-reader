// Data structure for the extracted paper information (Function 1)
export interface PaperAnalysis {
  basicInfo: {
    title: string;
    authors: string[];
    year: string;
    keywords: string[];
  };
  coreElements: {
    objective: string;
    methods: string;
    dataSource: string;
    conclusion: string;
  };
  academicEvaluation: {
    limitations: string[];
    innovations: string[];
  };
}

// Data structure for Structure View (Function 2)
export interface PaperStructure {
  tldr: string;
  keyPoints: string[]; // 5 bullet points
  researchFlow: string; // Text based flow step -> step
  architectureTree: string; // Text representation of Section -> Subsection
}

// Note generation styles (Function 3)
export enum NoteStyle {
  ACADEMIC = 'Academic Standard',
  REVIEW = 'Review (What/How/Why)',
  REPRODUCTION = 'Experiment Reproduction',
  MINDMAP = 'Textual Mind Map',
  FLASHCARDS = 'Study Flashcards (Q&A)'
}

export type Language = 'en' | 'zh';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

// Interface for our custom chat session
export interface ChatSession {
  sendMessageStream: (text: string) => AsyncGenerator<string, void, unknown>;
}

// Helper type for PDF.js library attached to window
export interface PdfJsLib {
  GlobalWorkerOptions: {
    workerSrc: string;
  };
  getDocument: (src: string | Uint8Array) => {
    promise: Promise<{
      numPages: number;
      getPage: (pageNumber: number) => Promise<{
        getTextContent: () => Promise<{
          items: Array<{ str: string }>;
        }>;
      }>;
    }>;
  };
}

declare global {
  interface Window {
    pdfjsLib: PdfJsLib;
  }
}