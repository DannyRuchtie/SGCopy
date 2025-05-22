'use client';

import { useState, useRef, useEffect, DragEvent, ChangeEvent } from 'react';

interface Message {
  role: 'user' | 'assistant' | 'image';
  content: string;
  imageUrl?: string;
}

const WELCOME_MESSAGE = `Hello! I'm your Safeguard Global Copy Assistant. I'm here to help you write clear, consistent, and user-friendly UI copy. 

I can help you with:
• Writing clear error messages
• Creating effective button labels
• Crafting helpful tooltips
• Improving form field labels
• Writing empty state messages
• And much more!

What would you like help with today?`;

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: WELCOME_MESSAGE }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Only send user/assistant/system messages
      const allowedRoles = ['user', 'assistant', 'system'];
      const filteredMessages = [...messages, userMessage].filter(
        (m) => allowedRoles.includes(m.role)
      );
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: filteredMessages }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();
      setMessages((prev) => [...prev, data]);
    } catch {
      setError('Sorry, something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await handleImageUpload(file);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      await handleImageUpload(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleImageUpload = async (file: File) => {
    setError(null);
    setIsLoading(true);
    const imageUrl = URL.createObjectURL(file);
    setMessages((prev) => [
      ...prev,
      { role: 'image', content: '', imageUrl },
      { role: 'assistant', content: 'Analyzing image...' }
    ]);

    // Only send user/assistant/system messages
    const allowedRoles = ['user', 'assistant', 'system'];
    const filteredMessages = messages.filter(
      (m) => allowedRoles.includes(m.role)
    );
    const formData = new FormData();
    formData.append('image', file);
    formData.append('messages', JSON.stringify(filteredMessages));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }
      const data = await response.json();
      setMessages((prev) => [
        ...prev.slice(0, -1), // remove "Analyzing image..."
        data
      ]);
    } catch {
      setError('Sorry, something went wrong analyzing the image.');
      setMessages((prev) => prev.slice(0, -1)); // remove "Analyzing image..."
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      <div
        className={`flex-1 overflow-y-auto mb-4 flex flex-col space-y-2 px-4 pr-8 ${dragActive ? 'ring-4 ring-[#563F8E]/30' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-chat-pop-in`}
          >
            {message.role === 'image' && message.imageUrl ? (
              <img
                src={message.imageUrl}
                alt="Uploaded"
                className="max-w-xs max-h-60 rounded-4xl border border-gray-200 shadow"
              />
            ) : (
              <div
                className={`max-w-[80%] rounded-4xl p-4 whitespace-pre-line ${
                  message.role === 'user'
                    ? 'bg-[#563F8E] text-white'
                    : 'bg-gray-100 text-gray-800'
                } markdown-tight`}
              >
                {message.content}
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-chat-pop-in">
            <div className="bg-gray-100 text-gray-800 rounded-4xl p-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {error && (
        <div className="text-red-500 mb-2 p-2 bg-red-50 rounded-4xl animate-chat-pop-in">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-4xl border border-gray-200 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#563F8E]"
          aria-label="Upload image"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-[#563F8E]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V7.5m0 0L8.25 11.25M12 7.5l3.75 3.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Request copywriting help or upload an image"
          className="flex-1 p-3 border border-gray-300 rounded-4xl focus:outline-none focus:ring-2 focus:ring-[#563F8E] resize-none min-h-[44px] max-h-40 text-black"
          disabled={isLoading}
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e as React.FormEvent);
            }
          }}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-[#563F8E] text-white rounded-4xl hover:bg-[#47326e] focus:outline-none focus:ring-2 focus:ring-[#563F8E] disabled:opacity-50 transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
} 