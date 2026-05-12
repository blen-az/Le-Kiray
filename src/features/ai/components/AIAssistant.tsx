import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleConsult = async () => {
    if (!query.trim()) return;
    
    const userMsg = query;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setQuery('');
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: `You are Le'Kiray Fleet Assistant. A customer is asking for equipment advice. 
        Context: Marketplace has EXCAVATOR, DOZER, LOADER, CRANE, DUMP_TRUCK, COMPACTOR categories.
        Task: Recommend the right equipment category based on this project: "${userMsg}". 
        Be concise and professional. Mention that heavy equipment rentals are handled via quote requests.`,
      });
      
      setMessages(prev => [...prev, { role: 'bot', text: response.text || 'I am having trouble analyzing that project. Please try again.' }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Error connecting to fleet intelligence. Please check your network.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-2xl shadow-indigo-500/40 flex items-center justify-center z-[100] transition-transform hover:scale-110"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 md:w-96 h-[500px] bg-white border-2 border-slate-100 rounded-[32px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.25)] z-[100] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="p-5 border-b border-slate-50 bg-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-sm shadow-emerald-500/50"></div>
              <span className="font-black text-slate-900 text-sm tracking-tight uppercase tracking-widest">Fleet Intelligence AI</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30 scroll-smooth">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-white border border-slate-100 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/5">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p className="text-slate-500 text-xs font-black uppercase tracking-widest px-8 leading-relaxed">Describe your project and I'll recommend the right heavy equipment.</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${
                  m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 p-4 rounded-2xl flex gap-1.5 shadow-sm">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-slate-50">
            <div className="flex gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-100 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleConsult()}
                placeholder="Ask about project equipment..."
                className="flex-1 bg-transparent px-4 py-2 text-sm text-slate-900 outline-none font-medium placeholder:text-slate-400"
              />
              <button 
                onClick={handleConsult}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant;
