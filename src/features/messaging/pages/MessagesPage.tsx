
import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../auth/context/AuthContext';
import { ChatWindow } from '../components/ChatWindow';
import { useLocation } from 'react-router-dom';

interface Conversation {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageAt: any;
  otherPartyName: string;
  otherPartyId: string;
}

const MessagesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<{id: string, name: string} | null>(
    location.state?.recipientId ? { id: location.state.recipientId, name: location.state.recipientName } : null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'messages'),
      where('participants', 'array-contains', currentUser.id),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      const convosMap: Record<string, Conversation> = {};
      
      snap.docs.forEach(doc => {
        const data = doc.data();
        const cid = data.conversationId;
        if (!convosMap[cid]) {
          const otherId = data.senderId === currentUser.id ? data.recipientId : data.senderId;
          const otherName = data.senderId === currentUser.id ? (data.recipientName || 'Agent') : (data.senderName || 'User');
          
          convosMap[cid] = {
            id: cid,
            participants: [currentUser.id, otherId],
            lastMessage: data.text,
            lastMessageAt: data.createdAt,
            otherPartyId: otherId,
            otherPartyName: otherName
          };
        }
      });

      setConversations(Object.values(convosMap));
      setLoading(false);
    });

    return unsub;
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-[#fbfcfd] pt-24 pb-12 px-4">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-160px)]">
          {/* Sidebar: Threads List */}
          <div className="w-full lg:w-[380px] flex flex-col bg-white rounded-[40px] border border-slate-100 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="p-8 border-b border-slate-50">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Direct Messages</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Active Conversations</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {loading ? (
                <div className="py-20 text-center">
                  <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="py-20 text-center px-8">
                  <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                  </div>
                  <p className="text-sm font-bold text-slate-400">No active threads found.</p>
                </div>
              ) : (
                conversations.map(convo => (
                  <button
                    key={convo.id}
                    onClick={() => setSelectedRecipient({id: convo.otherPartyId, name: convo.otherPartyName})}
                    className={`w-full group relative p-5 rounded-[32px] transition-all flex items-center gap-4 ${
                      selectedRecipient?.id === convo.otherPartyId 
                        ? 'bg-indigo-600 shadow-xl shadow-indigo-600/20' 
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl border-2 ${
                      selectedRecipient?.id === convo.otherPartyId ? 'bg-white/10 border-white/20 text-white' : 'bg-slate-50 border-white text-slate-400'
                    }`}>
                      {convo.otherPartyName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className={`font-black tracking-tight ${selectedRecipient?.id === convo.otherPartyId ? 'text-white' : 'text-slate-900'}`}>
                        {convo.otherPartyName}
                      </p>
                      <p className={`text-[11px] font-medium truncate mt-1 ${selectedRecipient?.id === convo.otherPartyId ? 'text-indigo-100/70' : 'text-slate-400'}`}>
                        {convo.lastMessage}
                      </p>
                    </div>
                    {selectedRecipient?.id !== convo.otherPartyId && (
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 bg-white rounded-[40px] border border-slate-100 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] overflow-hidden relative">
            {selectedRecipient ? (
              <ChatWindow 
                recipientId={selectedRecipient.id} 
                recipientName={selectedRecipient.name} 
                onClose={() => setSelectedRecipient(null)}
                isEmbedded={true}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-12">
                <div className="w-32 h-32 bg-slate-50 rounded-[48px] flex items-center justify-center mb-10 shadow-inner">
                  <svg className="w-12 h-12 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"/></svg>
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-3">Secure Messaging</h2>
                <p className="text-sm text-slate-400 font-medium max-w-xs leading-relaxed uppercase tracking-widest text-[9px]">Select a conversation to coordinate your heavy machinery rental.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
