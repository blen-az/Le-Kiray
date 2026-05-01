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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !currentUser || !conversationId) return;
    setSending(true);
    try {
      await addDoc(collection(db, 'messages'), {
        conversationId,
        participants: [currentUser.id, recipientId],
        senderId: currentUser.id,
        senderName: currentUser.name || 'Anonymous',
        recipientId,
        recipientName: recipientName,
        text: text.trim(),
        createdAt: serverTimestamp(),
      });
      setText('');
    } finally {
      setSending(false);
    }
  };

  const containerClasses = isEmbedded 
    ? "flex-1 flex flex-col h-full bg-white"
    : "fixed bottom-24 right-6 z-50 w-80 sm:w-96 h-[500px] flex flex-col bg-white border-2 border-slate-100 rounded-[40px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] overflow-hidden animate-slide-up";

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 bg-white border-b border-slate-50">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-lg border-2 border-white shadow-sm">
              {recipientName.charAt(0)}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
          </div>
          <div>
            <p className="text-slate-900 text-sm font-black tracking-tight">{recipientName}</p>
            <p className="text-emerald-600 text-[9px] font-black uppercase tracking-widest mt-0.5">Verified Agent • Active</p>
          </div>
        </div>
        {!isEmbedded && (
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all border border-slate-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#fbfcfd]">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-14 h-14 bg-white text-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-slate-50 shadow-sm">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            </div>
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em]">Encrypted Channel Active</p>
          </div>
        )}
        {messages.map(msg => {
          const isMe = msg.senderId === currentUser?.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[80%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div
                  className={`px-6 py-3.5 rounded-[24px] text-[13px] font-bold leading-relaxed shadow-sm ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-indigo-500/10'
                      : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
                <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-2 px-1">
                  {msg.createdAt ? new Date(msg.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sending...'}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-6 bg-white border-t border-slate-50">
        <div className="flex gap-3 p-2 bg-slate-50 rounded-[28px] border border-slate-100 focus-within:ring-4 focus-within:ring-indigo-500/5 transition-all">
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Write a message..."
            className="flex-1 px-5 py-3 bg-transparent text-sm text-slate-900 outline-none font-bold placeholder:text-slate-300 placeholder:font-black placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest"
          />
          <button
            type="submit"
            disabled={!text.trim() || sending}
            className="w-12 h-12 flex-shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl flex items-center justify-center transition-all disabled:opacity-30 shadow-xl shadow-indigo-600/20 active:scale-95"
          >
            <svg className="w-5 h-5 rotate-90" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};
