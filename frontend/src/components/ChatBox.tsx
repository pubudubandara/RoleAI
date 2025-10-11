import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { sendChatMessage } from '../api/chatApi';
import type { ChatMessage } from '../api/chatApi';

interface ChatBoxProps {
  selectedRoles: number[];
  selectedModel: string;
  roles?: { id?: number; name: string }[];
}

const ChatBox: React.FC<ChatBoxProps> = ({ selectedRoles, selectedModel, roles }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || selectedRoles.length === 0 || !selectedModel) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // helper to get role name
    const getRoleName = (rid: number) => roles?.find(r => r.id === rid)?.name || `Role ${rid}`;

    const roleIds = selectedRoles.slice(0, 3); // enforce max 3

    for (const rid of roleIds) {
      try {
        console.log('ChatBox: Sending for role:', { roleId: rid, model: selectedModel, message: input });
        const aiResponse: ChatMessage = await sendChatMessage(rid, input, selectedModel);
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
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">
            Select up to 3 roles and a model, then start chatting!
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-white'
                }`}
              >
                {message.sender === 'ai' && (message as any).role && (
                  <div className="text-xs text-gray-300 mb-2 font-medium opacity-80">
                    {(message as any).role}
                  </div>
                )}
                <div className="text-sm prose prose-invert max-w-none">
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
          <div className="text-center text-gray-400">
            AI is thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-700 ">
        <div className="flex space-x-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 p-2 border border-gray-600 rounded-lg bg-gray-700 text-white resize-none"
            rows={3}
            disabled={selectedRoles.length === 0 || !selectedModel}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading || selectedRoles.length === 0 || !selectedModel}
            className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-full transition-colors flex items-center justify-center"
          >
            <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;