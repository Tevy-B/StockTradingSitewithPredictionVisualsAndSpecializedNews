import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bot, Mic, Send, Volume2, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

type Message = { role: 'user' | 'jarvis'; content: string };
type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

type SpeechRecognitionType = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

const blocked = /(payment|bank|invest|trading|buy stock|sell stock|wire transfer|purchase)/i;
const WAKE_WORD = 'hey jarvis';

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
      content: 'Jarvis online. Say "Hey Jarvis" anytime after microphone permission is granted, then speak your request naturally.',
    },
  ]);
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [isWakeMode, setIsWakeMode] = useState(true);
  const [permissionError, setPermissionError] = useState('');

  const recognitionRef = useRef<SpeechRecognitionType | null>(null);
  const lastSpeechRef = useRef('');
  const shouldRestartRef = useRef(true);

  const canUseSpeechApi = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }, []);

  const speak = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    setVoiceState('speaking');
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onend = () => setVoiceState('listening');
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const processUserMessage = (value: string) => {
    const clean = value.trim();
    if (!clean) return;
    const userMessage: Message = { role: 'user', content: clean };
    const reply = generateJarvisReply(clean);
    const jarvisMessage: Message = { role: 'jarvis', content: reply };
    setMessages((prev) => [...prev, userMessage, jarvisMessage]);
    setPrompt('');
    setLiveTranscript('');
    speak(reply);
  };

  const handleTranscript = (text: string) => {
    const normalized = text.trim();
    setLiveTranscript(normalized);
    if (!normalized || normalized === lastSpeechRef.current) return;

    if (isWakeMode) {
      if (normalized.toLowerCase().includes(WAKE_WORD)) {
        setIsWakeMode(false);
        lastSpeechRef.current = normalized;
        setMessages((prev) => [...prev, { role: 'jarvis', content: 'I’m listening. Tell me what you want me to do.' }]);
      }
      return;
    }

    lastSpeechRef.current = normalized;
    processUserMessage(normalized.replace(/hey jarvis/ig, '').trim());
    setIsWakeMode(true);
  };

  const startListening = () => {
    if (!canUseSpeechApi) {
      setPermissionError('Speech recognition is not supported in this browser. Use Chrome/Edge for voice mode.');
      return;
    }

    const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!recognitionRef.current) {
      const recognition: SpeechRecognitionType = new SpeechRecognitionCtor();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0]?.transcript || '')
          .join(' ')
          .trim();

        if (transcript) {
          setVoiceState('listening');
          handleTranscript(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        setVoiceState('error');
        setPermissionError(event?.error ? `Voice error: ${event.error}` : 'Voice recognition failed.');
      };

      recognition.onend = () => {
        if (shouldRestartRef.current) {
          try {
            recognition.start();
            setVoiceState('listening');
          } catch {
            // ignore browser race when restart is immediate
          }
        }
      };

      recognitionRef.current = recognition;
    }

    try {
      setPermissionError('');
      shouldRestartRef.current = true;
      recognitionRef.current.start();
      setVoiceState('listening');
    } catch {
      setPermissionError('Microphone start failed. If prompted, allow microphone access and try again.');
      setVoiceState('error');
    }
  };

  const stopListening = () => {
    shouldRestartRef.current = false;
    recognitionRef.current?.stop();
    setVoiceState('idle');
  };

  useEffect(() => {
    startListening();
    return () => {
      shouldRestartRef.current = false;
      recognitionRef.current?.stop();
      if (window?.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  const sendPrompt = () => processUserMessage(prompt);

  return (
    <section className="rounded-2xl border border-primary/20 bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div className="flex items-center gap-2">
          <div className={`h-11 w-11 rounded-full flex items-center justify-center ${voiceState === 'listening' ? 'bg-emerald-400/30 shadow-[0_0_45px_14px_rgba(52,211,153,0.45)]' : 'bg-cyan-400/25 shadow-[0_0_40px_12px_rgba(34,211,238,0.35)]'}`}>
            {voiceState === 'processing' ? <Loader2 className="h-5 w-5 animate-spin" /> : <Bot className="h-5 w-5 text-cyan-200" />}
          </div>
          <div>
            <h2 className="text-xl font-semibold">Jarvis</h2>
            <p className="text-xs text-slate-300">Status: <span className="font-semibold uppercase">{voiceState}</span> {isWakeMode ? '· Waiting for “Hey Jarvis”' : '· Command capture mode'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" className="gap-2" onClick={startListening}><Mic className="h-4 w-4" /> Start</Button>
          <Button variant="outline" className="gap-2" onClick={stopListening}><Volume2 className="h-4 w-4" /> Stop</Button>
        </div>
      </div>

      <div className="rounded-xl border border-white/15 bg-black/25 p-3 mb-4">
        <p className="text-xs text-slate-300 mb-1">Live transcript</p>
        <p className="text-sm min-h-6">{liveTranscript || 'Listening will appear here once microphone permission is granted.'}</p>
        {permissionError && <p className="text-xs text-red-300 mt-2">{permissionError}</p>}
      </div>

      <div className="rounded-xl border border-white/15 bg-black/25 p-3 h-[300px] overflow-y-auto space-y-3 mb-4">
        {messages.map((m, i) => (
          <div key={i} className={`max-w-[90%] rounded-lg p-3 text-sm ${m.role === 'user' ? 'ml-auto bg-indigo-500/25 border border-indigo-300/20' : 'bg-slate-800/80 border border-slate-600/40'}`}>
            <p className="text-[11px] uppercase tracking-wide text-slate-300 mb-1">{m.role === 'user' ? 'You' : 'Jarvis'}</p>
            <p className="whitespace-pre-wrap">{m.content}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Tell Jarvis what you want to build..." className="min-h-[90px] bg-slate-900/60 border-slate-600" />
        <div className="flex justify-end">
          <Button onClick={sendPrompt} className="gap-2"><Send className="h-4 w-4" /> Send</Button>
        </div>
      </div>
    </section>
  );
}
