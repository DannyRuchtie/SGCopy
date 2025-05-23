"use client";
import { useEffect, useState } from 'react';
import ChatInterface from '@/components/ChatInterface';

export default function Home() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('sgcopy_authed') === 'true') {
        setAuthed(true);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      localStorage.setItem('sgcopy_authed', 'true');
      setAuthed(true);
    } else {
      setError('Incorrect password.');
    }
  };

  if (!authed) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white dark:bg-black pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
        <form onSubmit={handleSubmit} className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white p-8 rounded-2xl shadow-lg flex flex-col gap-4 min-w-[320px]">
          <div className="text-lg font-semibold mb-2">Password Required</div>
          <div className="text-sm mb-4">Reach out to Design Team to get a password.</div>
          <input
            type="password"
            className="rounded px-3 py-2 bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter password"
            required
          />
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <button type="submit" className="bg-[#563F8E] text-white rounded py-2 font-semibold">Unlock</button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-black pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      <ChatInterface />
    </main>
  );
}
