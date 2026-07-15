'use client';

import { useEffect, useRef, useState } from 'react';

// Ditado por voz (Web Speech API — Chrome/Edge). Anexa o texto final ao campo.
export default function VoiceMic({ onText }: { onText: (chunk: string) => void }) {
  const [supported, setSupported] = useState(true);
  const [rec, setRec] = useState(false);
  const recogRef = useRef<any>(null);

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) setSupported(false);
    return () => {
      try { recogRef.current?.stop(); } catch { /* ignore */ }
    };
  }, []);

  function toggle() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    if (recogRef.current) {
      try { recogRef.current.stop(); } catch { /* ignore */ }
      recogRef.current = null;
      setRec(false);
      return;
    }
    const recog = new SR();
    recog.lang = 'pt-BR';
    recog.continuous = true;
    recog.interimResults = true;
    recog.onresult = (ev: any) => {
      let fin = '';
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        if (ev.results[i].isFinal) fin += ev.results[i][0].transcript;
      }
      if (fin) onText(fin.trim());
    };
    recog.onerror = () => { setRec(false); };
    recog.onend = () => { setRec(false); recogRef.current = null; };
    recogRef.current = recog;
    try { recog.start(); setRec(true); } catch { setRec(false); }
  }

  return (
    <button
      type="button"
      className={'mic' + (rec ? ' rec' : '') + (supported ? '' : ' off')}
      onClick={toggle}
      disabled={!supported}
      title={supported ? 'Ditar por voz' : 'Ditado indisponível neste navegador (use Chrome/Edge)'}
    >
      🎙️
    </button>
  );
}
