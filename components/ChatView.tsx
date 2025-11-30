import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, Language, ChatSession } from '../types';
import { createChatSession } from '../services/geminiService';
import { Send, User, Bot, Sparkles } from 'lucide-react';
import { parse } from 'marked';

interface ChatViewProps {
  paperText: string;
  lang: Language;
}

const labels = {
  en: {
    placeholder: "Ask about Figure 3, the method, or results...",
    error: "I'm sorry, I encountered an error responding to that.",
    welcome: "I have read the paper. Ask me anything about the methodology, results, or implications!"
  },
  zh: {
    placeholder: "询问关于图表3、研究方法或实验结果...",
    error: "抱歉，我在回复时遇到了错误。",
    welcome: "我已经阅读了这篇论文。关于方法论、结果或结论的任何问题都可以问我！"
  }
};

// Math rendering helper (duplicated here to avoid creating new file for this simple app structure)
const renderMarkdownWithMath = (text: string) => {
  if (!text) return '';

  const mathBlocks: string[] = [];
  const mathInlines: string[] = [];

  let protectedText = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, match) => {
    mathBlocks.push(match);
    return `MATH_BLOCK_PLACEHOLDER_${mathBlocks.length - 1}`;
  });

  protectedText = protectedText.replace(/\$([^$\n]+?)\$/g, (_, match) => {
    mathInlines.push(match);
    return `MATH_INLINE_PLACEHOLDER_${mathInlines.length - 1}`;
  });

  let html = parse(protectedText) as string;

  html = html.replace(/MATH_BLOCK_PLACEHOLDER_(\d+)/g, (_, index) => {
    const tex = mathBlocks[parseInt(index)];
    try {
      return window.katex ? window.katex.renderToString(tex, { displayMode: true, throwOnError: false }) : tex;
    } catch (e) {
      return `$$${tex}$$`;
    }
  });

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

const ChatView: React.FC<ChatViewProps> = ({ paperText, lang }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const t = labels[lang];

  // Initialize chat session on mount or lang change
  useEffect(() => {
    if (paperText) {
      const session = createChatSession(paperText, lang);
      setChatSession(session);
      setMessages([{
        id: 'init',
        role: 'model',
        text: t.welcome,
        timestamp: Date.now()
      }]);
    }
  }, [paperText, lang]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !chatSession) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const stream = chatSession.sendMessageStream(userMsg.text);
      
      const botMsgId = (Date.now() + 1).toString();
      let fullText = '';
      
      // Temporary placeholder message
      setMessages(prev => [...prev, {
        id: botMsgId,
        role: 'model',
        text: '',
        timestamp: Date.now()
      }]);

      for await (const chunk of stream) {
         if (chunk) {
           fullText += chunk;
           setMessages(prev => prev.map(msg => 
             msg.id === botMsgId ? { ...msg, text: fullText } : msg
           ));
         }
      }

    } catch (error) {
      console.error("Chat Error", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: t.error,
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto h-[600px] flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
      
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin bg-slate-50/50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-indigo-600" />
              </div>
            )}
            
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
            }`}>
              {/* Conditional Rendering: Markdown+Math for Bot, Plain Text for User */}
              {msg.role === 'model' ? (
                 <div 
                   className="prose prose-sm prose-indigo max-w-none prose-p:leading-relaxed prose-p:my-1 prose-ul:my-1 prose-li:my-0"
                   dangerouslySetInnerHTML={{ __html: renderMarkdownWithMath(msg.text) }} 
                 />
              ) : (
                 <div className="whitespace-pre-wrap text-sm leading-relaxed text-white">
                   {msg.text}
                 </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-slate-500" />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form onSubmit={handleSend} className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.placeholder}
            className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 transition-all shadow-sm"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
          >
            {isLoading ? <Sparkles className="w-5 h-5 animate-pulse" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatView;