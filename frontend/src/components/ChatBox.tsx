import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { sendChatMessage } from '../api/chatApi';
import * as chatSessionApi from '../api/chatSessionApi';
import type { ChatMessage } from '../api/chatApi';

interface ChatBoxProps {
  selectedRoles: number[];
  roles?: { id?: number; name: string }[];
  selectedModelConfigId?: number;
  sessionId?: string;
  onAfterUserMessage?: () => Promise<void> | void;
}

const ChatBox: React.FC<ChatBoxProps> = ({ selectedRoles, roles, selectedModelConfigId, sessionId, onAfterUserMessage }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  // Load messages when session changes
  useEffect(() => {
    const load = async () => {
      if (!sessionId) {
        setMessages([]);
        return;
      }
      try {
        const items = await chatSessionApi.getMessages(sessionId);
        const mapped: ChatMessage[] = items.map((m) => {
          const isAi = m.sender === 'ai';
          const base: ChatMessage = {
            id: String(m.id),
            text: m.content,
            sender: isAi ? 'ai' : 'user',
            timestamp: new Date(m.createdAt),
          };
          if (isAi && m.roleId) {
            const roleName = roles?.find(r => r.id === m.roleId)?.name;
            (base as any).role = roleName || `Role ${m.roleId}`;
          }
          return base;
        });
        setMessages(mapped);
      } catch (e) {
        console.error('Failed to load messages for session', sessionId, e);
        setMessages([]);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const sendMessage = async () => {
    if (!input.trim() || selectedRoles.length === 0 || !selectedModelConfigId) return;
    // Require a sessionId so messages persist under a chat
    if (!sessionId) {
      console.warn('No sessionId present; cannot persist messages.');
      return;
    }

    const prompt = input; // capture before clearing
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: prompt,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Persist user message if we have a session
    try {
      await chatSessionApi.addMessage(sessionId, { sender: 'user', content: userMessage.text });
      // Inform parent so it can refresh sidebar (for title auto-generation on first prompt)
      onAfterUserMessage?.();
    } catch (e) {
      console.error('Failed to persist user message', e);
    }

    // helper to get role name
    const getRoleName = (rid: number) => roles?.find(r => r.id === rid)?.name || `Role ${rid}`;

    const roleIds = selectedRoles.slice(0, 3); // enforce max 3

    for (const rid of roleIds) {
      try {
  console.log('ChatBox: Sending for role:', { roleId: rid, message: prompt, modelConfigId: selectedModelConfigId, sessionId });
  const aiResponse: ChatMessage = await sendChatMessage(rid, prompt, " ", selectedModelConfigId, sessionId);
        // Attach role name so it renders in header
        (aiResponse as any).role = getRoleName(rid);
        setMessages(prev => [...prev, aiResponse]);
      } catch (error) {
        console.error('ChatBox: Failed to send message for role', rid, error);
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1 + rid).toString(),
          text: `Error for ${getRoleName(rid)}: ` + (error instanceof Error ? error.message : String(error)),
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    }
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-slate-400 mt-8">
              Select up to 3 roles and add a model configuration, then start chatting!
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                <div
                  className={`max-w-sm lg:max-w-3xl px-4 py-3 rounded-2xl shadow-lg ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                      : 'bg-slate-800/90 text-white border border-slate-700'
                  }`}
                >
                  {message.sender === 'ai' && (message as any).role && (
                    <div className="text-xs text-slate-300 mb-2 font-medium opacity-80">
                      {(message as any).role}
                    </div>
                  )}
                  <div className="text-base prose prose-invert max-w-none whitespace-pre-wrap break-words leading-tight">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                    >
                      {message.text}
                    </ReactMarkdown>
                  </div>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="text-center text-slate-400">
              AI is thinking...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="p-3 border-t border-slate-800 bg-slate-950/30">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 h-12 px-4 border border-slate-700 rounded-xl bg-slate-800/50 text-white placeholder-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-slate-800"
              disabled={selectedRoles.length === 0 || !selectedModelConfigId}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading || selectedRoles.length === 0 || !selectedModelConfigId}
              className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:from-slate-700 disabled:to-slate-700 disabled:opacity-50 text-white rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/30 disabled:shadow-none flex items-center justify-center flex-shrink-0"
            >
              <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;