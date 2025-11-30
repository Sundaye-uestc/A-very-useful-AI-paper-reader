import { GoogleGenAI, Type } from "@google/genai";
import { PaperAnalysis, PaperStructure, NoteStyle, Language, ChatSession } from "../types";

// Initialize the Google GenAI client lazily to ensure environment variables are ready
let aiInstance: GoogleGenAI | null = null;
const MODEL_NAME = "gemini-2.5-flash";

const getAi = (): GoogleGenAI => {
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return aiInstance;
};

// --- HELPERS ---

const getLangInstruction = (lang: Language) => 
  lang === 'zh' ? "Respond in Simplified Chinese (简体中文)." : "Respond in English.";

// --- ANALYSIS FUNCTIONS ---

export const analyzePaperContent = async (text: string, lang: Language): Promise<PaperAnalysis> => {
  const prompt = `Analyze this research paper. ${getLangInstruction(lang)}
  Extract the basic info, core elements, and academic evaluation based on the text provided.
  Paper text (truncated): ${text.substring(0, 30000)}`;

  const ai = getAi();
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          basicInfo: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              authors: { type: Type.ARRAY, items: { type: Type.STRING } },
              year: { type: Type.STRING },
              keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            }
          },
          coreElements: {
            type: Type.OBJECT,
            properties: {
              objective: { type: Type.STRING },
              methods: { type: Type.STRING },
              dataSource: { type: Type.STRING },
              conclusion: { type: Type.STRING },
            }
          },
          academicEvaluation: {
            type: Type.OBJECT,
            properties: {
              limitations: { type: Type.ARRAY, items: { type: Type.STRING } },
              innovations: { type: Type.ARRAY, items: { type: Type.STRING } },
            }
          }
        }
      }
    }
  });

  if (!response.text) throw new Error("No response from AI");
  return JSON.parse(response.text) as PaperAnalysis;
};

export const analyzePaperStructure = async (text: string, lang: Language): Promise<PaperStructure> => {
  const prompt = `Analyze the structure of this paper. ${getLangInstruction(lang)}
  Provide a TL;DR, 5 key points, a research process flow (text based arrows), and an architecture tree (text based indentation).
  Paper text (truncated): ${text.substring(0, 30000)}`;

  const ai = getAi();
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          tldr: { type: Type.STRING },
          keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          researchFlow: { type: Type.STRING },
          architectureTree: { type: Type.STRING },
        }
      }
    }
  });

  if (!response.text) throw new Error("No response from AI");
  return JSON.parse(response.text) as PaperStructure;
};

// --- NOTES GENERATION ---

export const generatePaperNotes = async (text: string, style: NoteStyle, lang: Language): Promise<string> => {
  let styleInstruction = "";
  switch (style) {
    case NoteStyle.ACADEMIC:
      styleInstruction = "Create structured Academic Notes: Abstract, Introduction, Methods, Results, Discussion. Use rigorous academic tone.";
      break;
    case NoteStyle.REVIEW:
      styleInstruction = "Create a Review Note using the What/How/Why framework. What did they do? How did they do it? Why does it matter?";
      break;
    case NoteStyle.REPRODUCTION:
      styleInstruction = "Create an Experiment Reproduction Guide. List exact datasets, hyperparameters, model architectures, and steps needed to reproduce the results.";
      break;
    case NoteStyle.MINDMAP:
      styleInstruction = "Create a Textual Mind Map using nested bullet points and indentation to show the hierarchy of concepts.";
      break;
    case NoteStyle.FLASHCARDS:
      styleInstruction = "Generate 5-7 Q&A Flashcards. Format: '**Q:** ... **A:** ...'";
      break;
  }

  const prompt = `You are a research tutor. ${styleInstruction} ${getLangInstruction(lang)}
  Use Markdown formatting for the output.
  Paper text (truncated): ${text.substring(0, 30000)}`;

  const ai = getAi();
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt
  });

  return response.text || "";
};

// --- CHAT SESSION ---

export const createChatSession = (text: string, lang: Language): ChatSession => {
  const ai = getAi();
  const chat = ai.chats.create({
    model: MODEL_NAME,
    config: {
      systemInstruction: `You are a helpful academic assistant. ${getLangInstruction(lang)}
      Use the provided paper context to answer questions.
      Context: ${text.substring(0, 30000)}`
    }
  });

  return {
    sendMessageStream: async function* (message: string) {
      const result = await chat.sendMessageStream({ message });
      for await (const chunk of result) {
        if (chunk.text) {
          yield chunk.text;
        }
      }
    }
  };
};