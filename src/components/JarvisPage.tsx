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

  return `I understood your request: "${input}".

Plan:
1) Clarify the task goal
2) Break it into actionable steps
3) Ask approval before edits/git actions

Tell me if you want me to produce the exact implementation steps now.`;
}

export function JarvisPage() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([{ role: 'jarvis', content: 'Jarvis online. Say "Hey Jarvis", pause after your command, and I will respond.' }]);
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [isWakeMode, setIsWakeMode] = useState(true);
  const [permissionError, setPermissionError] = useState('');

  const recognitionRef = useRef<SpeechRecognitionType | null>(null);
  const shouldRestartRef = useRef(true);
  const finalBufferRef = useRef('');
  const pauseTimerRef = useRef<number | null>(null);
  const lastProcessedRef = useRef('');

  const canUseSpeechApi = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }, []);

  const speak = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    setVoiceState('speaking');
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setVoiceState('listening');
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const processUserMessage = (value: string) => {
    const clean = value.trim();
    if (!clean || clean === lastProcessedRef.current) return;
    lastProcessedRef.current = clean;
    setVoiceState('processing');

    const userMessage: Message = { role: 'user', content: clean };
    const reply = generateJarvisReply(clean);
    const jarvisMessage: Message = { role: 'jarvis', content: reply };
    setMessages((prev) => [...prev, userMessage, jarvisMessage]);
    setPrompt('');
    setLiveTranscript('');
    speak(reply);
  };

  const finishOnPause = () => {
    if (pauseTimerRef.current) window.clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = window.setTimeout(() => {
      const captured = finalBufferRef.current.trim();
      if (!captured) return;

      if (isWakeMode) {
        if (captured.toLowerCase().includes(WAKE_WORD)) {
          setIsWakeMode(false);
          setMessages((prev) => [...prev, { role: 'jarvis', content: 'I’m listening. Say your command now, then pause.' }]);
          finalBufferRef.current = '';
          setLiveTranscript('');
        }
        return;
      }

      const command = captured.replace(/hey jarvis/ig, '').trim();
      finalBufferRef.current = '';
      setIsWakeMode(true);
      processUserMessage(command);
    }, 900);
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
        let interim = '';
        let finals = '';

        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const text = event.results[i][0]?.transcript || '';
          if (event.results[i].isFinal) finals += ` ${text}`;
          else interim += ` ${text}`;
        }

        if (finals.trim()) {
          finalBufferRef.current = `${finalBufferRef.current} ${finals}`.trim();
        }

        const visible = `${finalBufferRef.current} ${interim}`.trim();
        setLiveTranscript(visible);
        setVoiceState('listening');
        finishOnPause();
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
            // browser restart race
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
      setPermissionError('Microphone start failed. Allow microphone access and try again.');
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
      if (pauseTimerRef.current) window.clearTimeout(pauseTimerRef.current);
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
            <p className="text-xs text-slate-300">Status: <span className="font-semibold uppercase">{voiceState}</span> {isWakeMode ? '· Waiting for “Hey Jarvis”' : '· Listening for your command'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" className="gap-2" onClick={startListening}><Mic className="h-4 w-4" /> Start</Button>
          <Button variant="outline" className="gap-2" onClick={stopListening}><Volume2 className="h-4 w-4" /> Stop</Button>
        </div>
      </div>

      <div className="rounded-xl border border-white/15 bg-black/25 p-3 mb-4">
        <p className="text-xs text-slate-300 mb-1">Live transcript</p>
        <p className="text-sm min-h-6">{liveTranscript || 'Say “Hey Jarvis”, then your command. Pause for ~1 second to submit.'}</p>
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
