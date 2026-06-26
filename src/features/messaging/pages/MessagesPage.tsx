import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
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
    <div className="min-h-screen bg-[#F8FAFC] pb-24 pt-24 px-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="space-y-1">
          <p className="text-[10px] font-black text-[#FF8A00] uppercase tracking-[0.2em]">DIRECT SECURE COMMS</p>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Messages</h1>
          <p className="text-slate-500 text-xs font-semibold">Coordinate operational timelines and machinery dispatch logs with fleet operators</p>
        </div>

        {/* Messaging Layout Panel */}
        <div className="flex flex-col md:flex-row gap-6 h-[580px]">
          
          {/* Threads List Sidebar */}
          <div className="w-full md:w-[280px] flex flex-col bg-white rounded-[28px] border border-slate-100 shadow-dribbble overflow-hidden shrink-0">
            <div className="p-5 border-b border-slate-50">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ACTIVE CHANNELS</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-none">
              {loading ? (
                <div className="py-20 text-center">
                  <div className="w-8 h-8 border-4 border-brand-main border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="py-20 text-center px-4 space-y-3">
                  <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center mx-auto text-slate-350">
                    ✉️
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">No active channels</p>
                </div>
              ) : (
                conversations.map(convo => {
                  const isActive = selectedRecipient?.id === convo.otherPartyId;
                  return (
                    <button
                      key={convo.id}
                      onClick={() => setSelectedRecipient({id: convo.otherPartyId, name: convo.otherPartyName})}
                      className={`w-full group relative p-4 rounded-2xl transition-all flex items-center gap-3 cursor-pointer text-left ${
                        isActive 
                          ? 'bg-brand-main/5 border border-brand-main/15' 
                          : 'border border-transparent hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-md border shrink-0 ${
                        isActive 
                          ? 'bg-brand-main text-white border-brand-main shadow shadow-brand-main/20' 
                          : 'bg-slate-50 border-slate-200 text-slate-450'
                      }`}>
                        {convo.otherPartyName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-black text-xs truncate ${isActive ? 'text-slate-900' : 'text-slate-900'}`}>
                          {convo.otherPartyName}
                        </p>
                        <p className="text-[10px] font-semibold truncate mt-0.5 text-slate-400">
                          {convo.lastMessage}
                        </p>
                      </div>
                      {isActive && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#FF8A00] shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Active Chat Canvas */}
          <div className="flex-1 bg-white rounded-[28px] border border-slate-100 shadow-dribbble overflow-hidden relative min-h-[350px]">
            {selectedRecipient ? (
              <ChatWindow 
                recipientId={selectedRecipient.id} 
                recipientName={selectedRecipient.name} 
                onClose={() => setSelectedRecipient(null)}
                isEmbedded={true}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 dots-grid">
                <div className="w-20 h-20 bg-slate-50 border border-slate-200 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
                  <svg className="w-8 h-8 text-slate-350" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">Select a secure feed channel</h3>
                <p className="text-slate-400 text-xs font-semibold mt-1 max-w-xs mx-auto leading-relaxed">
                  Choose a dispatcher thread to coordinate deployment times, gate passes, or operator logistics.
                </p>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
