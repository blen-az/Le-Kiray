import React, { useState, useEffect, useRef } from 'react';
import {
  collection, query, where, orderBy, onSnapshot,
  addDoc, serverTimestamp, Timestamp
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../auth/context/AuthContext';

// A conversation is identified by a sorted pair of user IDs joined by '_'
const getConversationId = (uid1: string, uid2: string): string =>
  [uid1, uid2].sort().join('_');

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: Timestamp | null;
}

interface ChatWindowProps {
  recipientId: string;
  recipientName: string;
  onClose: () => void;
  isEmbedded?: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ 
  recipientId, 
  recipientName, 
  onClose,
  isEmbedded = false
}) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const conversationId = currentUser ? getConversationId(currentUser.id, recipientId) : '';

  // Quick Auto-Replies list
  const suggestedReplies = [
    "Is the unit available?",
    "Can you share operator credentials?",
    "Check mobilization checklist.",
    "Logistics transit confirmed."
  ];

  useEffect(() => {
    if (!conversationId) return;
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'asc')
    );
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as Message)));
    });
    return unsub;
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (msgText: string) => {
    if (!msgText.trim() || !currentUser || !conversationId) return;
    setSending(true);
    try {
      await addDoc(collection(db, 'messages'), {
        conversationId,
        participants: [currentUser.id, recipientId],
        senderId: currentUser.id,
        senderName: currentUser.name || 'Anonymous',
        recipientId,
        recipientName: recipientName,
        text: msgText.trim(),
        createdAt: serverTimestamp(),
      });
      setText('');
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const containerClasses = isEmbedded 
    ? "flex-1 flex flex-col h-full bg-white relative"
    : "fixed bottom-24 right-6 z-50 w-80 sm:w-96 h-[500px] flex flex-col bg-white border border-slate-100 rounded-[28px] shadow-[0_30px_60px_-15px_rgba(53,92,255,0.1)] overflow-hidden animate-slide-up";

  return (
    <div className={containerClasses}>
      
      {/* Thread Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-brand-main/5 text-brand-main flex items-center justify-center font-black text-md border border-brand-main/10 shadow-sm">
              {recipientName.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
          </div>
          <div>
            <p className="text-slate-900 text-xs font-black tracking-tight">{recipientName}</p>
            <p className="text-emerald-600 text-[8px] font-black uppercase tracking-wider mt-0.5">Verified Supplier • Active</p>
          </div>
        </div>
        {!isEmbedded && (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all border border-slate-100 cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>

      {/* Sticky Equipment Context Header */}
      <div className="bg-slate-50 border-b border-slate-100 px-6 py-2 flex items-center justify-between text-[9px] font-black text-slate-500 uppercase tracking-wider shrink-0 select-none">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-[#FF8A00] rounded-full" />
          Ref: CAT 320D Excavator Mobilization
        </span>
        <span className="text-[#355CFF] hover:underline cursor-pointer">Specs Vault</span>
      </div>

      {/* Message canvas area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F8FAFC]">
        {messages.length === 0 && (
          <div className="text-center py-10 space-y-2">
            <div className="w-12 h-12 bg-white text-slate-350 rounded-2xl flex items-center justify-center mx-auto border border-slate-150 shadow-sm">
              💬
            </div>
            <p className="text-slate-400 text-[8px] font-black uppercase tracking-[0.2em]">LOGISTICS CHANNEL SECURED</p>
          </div>
        )}
        {messages.map(msg => {
          const isMe = msg.senderId === currentUser?.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div
                  className={`px-5 py-3 rounded-2xl text-xs font-semibold leading-relaxed shadow-sm ${
                    isMe
                      ? 'bg-brand-main text-white rounded-br-none shadow-brand-main/10'
                      : 'bg-white text-slate-800 border border-slate-150 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 px-1 text-[8px] font-black text-slate-350 uppercase tracking-widest">
                  <span>
                    {msg.createdAt ? new Date(msg.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sending...'}
                  </span>
                  {isMe && <span>• Read</span>}
                </div>
              </div>
            </div>
          );
        })}
        {sending && (
          <div className="flex justify-end animate-pulse">
            <span className="text-[8px] font-black text-slate-350 uppercase tracking-widest">typing...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="p-4 bg-white border-t border-slate-100 space-y-3 shrink-0">
        
        {/* Suggested Replies Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {suggestedReplies.map((reply, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setText(reply)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-150 rounded-lg text-[9px] font-extrabold text-slate-600 hover:border-brand-main hover:text-brand-main hover:bg-white transition-all whitespace-nowrap cursor-pointer"
            >
              {reply}
            </button>
          ))}
        </div>

        {/* Input submission Form */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(text); }} className="flex gap-2 items-center">
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Coordinate dispatch logs..."
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none font-bold placeholder:text-slate-400 placeholder:text-[9px] placeholder:font-black placeholder:uppercase placeholder:tracking-widest focus:border-brand-main focus:bg-white transition-all"
          />
          <button
            type="submit"
            disabled={!text.trim() || sending}
            className="w-10 h-10 shrink-0 bg-brand-main hover:bg-brand-main/90 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-30 shadow-md shadow-brand-main/15 cursor-pointer active:scale-95"
          >
            <svg className="w-4 h-4 rotate-90" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </form>
      </div>
      
    </div>
  );
};
