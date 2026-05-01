import React, { useState } from 'react';
import { Bot, Mic, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

type Message = { role: 'user' | 'jarvis'; content: string };

const blocked = /(payment|bank|invest|trading|buy stock|sell stock|wire transfer|purchase)/i;

function generateJarvisReply(input: string): string {
  if (blocked.test(input)) {
    return 'I can’t assist with money movement, banking, purchases, investing, or trading actions. I can still help with project strategy, specs, coding, and GitHub workflows.';
  }

  return `Understood. Here is a practical next step:\n\n1) I’ll draft a short execution plan for: "${input}"\n2) I’ll identify files/components to touch\n3) I’ll ask for your approval before any edit, branch, PR, or risky command.`;
}

export function JarvisPage() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'jarvis',
      content: 'Jarvis online. I can help with software engineering, project planning, GitHub workflow prep, and Codex-ready prompts. What should we build?',
    },
  ]);

  const sendPrompt = () => {
    const value = prompt.trim();
    if (!value) return;

    const userMessage: Message = { role: 'user', content: value };
    const jarvisMessage: Message = { role: 'jarvis', content: generateJarvisReply(value) };
    setMessages((prev) => [...prev, userMessage, jarvisMessage]);
    setPrompt('');
  };

  return (
    <section className="rounded-2xl border border-primary/20 bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div className="flex items-center gap-2">
          <div className="h-11 w-11 rounded-full bg-cyan-400/25 shadow-[0_0_40px_12px_rgba(34,211,238,0.35)] flex items-center justify-center">
            <Bot className="h-5 w-5 text-cyan-200" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Jarvis</h2>
            <p className="text-xs text-slate-300">Embedded assistant for planning, coding strategy, and approvals.</p>
          </div>
        </div>
        <Button variant="secondary" className="gap-2"><Mic className="h-4 w-4" /> Start Talking</Button>
      </div>

      <div className="rounded-xl border border-white/15 bg-black/25 p-3 h-[340px] overflow-y-auto space-y-3 mb-4">
        {messages.map((m, i) => (
          <div key={i} className={`max-w-[90%] rounded-lg p-3 text-sm ${m.role === 'user' ? 'ml-auto bg-indigo-500/25 border border-indigo-300/20' : 'bg-slate-800/80 border border-slate-600/40'}`}>
            <p className="text-[11px] uppercase tracking-wide text-slate-300 mb-1">{m.role === 'user' ? 'You' : 'Jarvis'}</p>
            <p className="whitespace-pre-wrap">{m.content}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Tell Jarvis what you want to build..."
          className="min-h-[90px] bg-slate-900/60 border-slate-600"
        />
        <div className="flex justify-end">
          <Button onClick={sendPrompt} className="gap-2"><Send className="h-4 w-4" /> Send</Button>
        </div>
      </div>
    </section>
  );
}
