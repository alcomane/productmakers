'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant' | 'error';
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '👋 Hello! I\'m running locally on your computer. Ask me anything!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const checkConnection = async () => {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'test', checkOnly: true })
      });
      setIsConnected(res.ok);
    } catch (error) {
      setIsConnected(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      setIsConnected(true);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'error', 
        content: `⚠️ Error: ${error instanceof Error ? error.message : 'Unknown error'}. Make sure Ollama is running!` 
      }]);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="max-w-4xl mx-auto h-screen flex flex-col py-8">
        
        <div className="bg-white rounded-t-2xl shadow-2xl p-6">
          <h1 className="text-3xl font-bold text-center" suppressHydrationWarning>
            Product Makers
          </h1>
          <p className="text-center text-gray-600 mt-2">
            Product Innovation with AI: Prototyping
          </p>
          
          <div className="flex items-center justify-center gap-2 mt-4 text-sm">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className={isConnected ? 'text-green-600' : 'text-gray-500'}>
              {isConnected ? 'Connected to Ollama' : 'Not connected'}
            </span>
          </div>
        </div>

        <div className="flex-1 bg-gray-50 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white prose-invert'
                    : msg.role === 'error'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-white text-gray-800 shadow-md'
                }`}
              >
                <ReactMarkdown
                  components={{
                    p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-2 space-y-1" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal ml-4 mb-2 space-y-1" {...props} />,
                    li: ({node, ...props}) => <li {...props} />,
                    code: ({node, className, children, ...props}: any) => {
                      const isInline = !className;
                      return isInline ? (
                        <code 
                          className={`px-1.5 py-0.5 rounded text-sm font-mono ${
                            msg.role === 'user' 
                              ? 'bg-white/20 text-white' 
                              : 'bg-gray-100 text-gray-800'
                          }`} 
                          {...props}
                        >
                          {children}
                        </code>
                      ) : (
                        <code 
                          className="block bg-gray-900 text-gray-100 p-3 rounded my-2 text-sm font-mono overflow-x-auto" 
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                    strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                    em: ({node, ...props}) => <em className="italic" {...props} />,
                    h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-2 mt-3" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-2 mt-2" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-base font-bold mb-1 mt-2" {...props} />,
                    blockquote: ({node, ...props}) => (
                      <blockquote className="border-l-4 border-gray-300 pl-3 italic my-2" {...props} />
                    ),
                    a: ({node, ...props}) => (
                      <a 
                        className="underline hover:no-underline" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        {...props} 
                      />
                    ),
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl px-4 py-3 shadow-md">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="bg-white rounded-b-2xl shadow-2xl p-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message here..."
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}