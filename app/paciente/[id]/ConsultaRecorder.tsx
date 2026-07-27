'use client';

import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/Icon';

// Grava a consulta inteira e transcreve ao vivo (Web Speech API — grátis, Chrome/Edge).
// Reinicia sozinho se o navegador pausar, para não perder a conversa numa consulta longa.
// O texto final vai para o campo alvo (ex.: observações) e é salvo com a consulta.
// Áudio processado pelo navegador — não sobe arquivo para servidor do app.
export default function ConsultaRecorder({ onText }: { onText: (chunk: string) => void }) {
  const [supported, setSupported] = useState(true);
  const [rec, setRec] = useState(false);
  const [seg, setSeg] = useState(0);
  const [previa, setPrevia] = useState('');
  const recogRef = useRef<any>(null);
  const wantOnRef = useRef(false);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) setSupported(false);
    return () => {
      wantOnRef.current = false;
      try { recogRef.current?.stop(); } catch { /* ignore */ }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function novoRecog() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recog = new SR();
    recog.lang = 'pt-BR';
    recog.continuous = true;
    recog.interimResults = true;
    recog.onresult = (ev: any) => {
      let fin = '';
      let interim = '';
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const t = ev.results[i][0].transcript;
        if (ev.results[i].isFinal) fin += t; else interim += t;
      }
      if (fin) { onText(fin.trim()); setPrevia(''); }
      else setPrevia(interim);
    };
    recog.onerror = (e: any) => {
      // 'no-speech'/'aborted' são recuperáveis: o onend reinicia se ainda quisermos gravar.
      if (e?.error === 'not-allowed' || e?.error === 'service-not-allowed') {
        wantOnRef.current = false; pararTudo();
      }
    };
    recog.onend = () => {
      // Reinicia automaticamente enquanto o médico não parou.
      if (wantOnRef.current) {
        try { recog.start(); } catch { /* tenta de novo no próximo ciclo */ }
      } else {
        setRec(false);
      }
    };
    return recog;
  }

  function iniciar() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    wantOnRef.current = true;
    const recog = novoRecog();
    recogRef.current = recog;
    try { recog.start(); } catch { /* ignore */ }
    setRec(true);
    setSeg(0);
    timerRef.current = setInterval(() => setSeg((s) => s + 1), 1000);
  }

  function pararTudo() {
    wantOnRef.current = false;
    try { recogRef.current?.stop(); } catch { /* ignore */ }
    recogRef.current = null;
    setRec(false);
    setPrevia('');
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }

  function toggle() {
    if (rec) pararTudo(); else iniciar();
  }

  const mm = String(Math.floor(seg / 60)).padStart(2, '0');
  const ss = String(seg % 60).padStart(2, '0');

  if (!supported) {
    return (
      <div className="consulta-rec off">
        <div className="cr-head"><Icon name="mic" size={16} /> Gravar a consulta</div>
        <p className="cr-sub">A transcrição ao vivo funciona no <b>Chrome</b> ou <b>Edge</b> (celular ou computador). Neste navegador não está disponível — use o ditado por voz ou digite.</p>
      </div>
    );
  }

  return (
    <div className={'consulta-rec' + (rec ? ' on' : '')}>
      <div className="cr-row">
        <button type="button" className={'cr-btn' + (rec ? ' rec' : '')} onClick={toggle}>
          {rec ? <>■ Parar</> : <><span className="cr-mic">🎙️</span> Gravar a consulta</>}
        </button>
        {rec && <span className="cr-live"><span className="cr-dot" /> Gravando {mm}:{ss}</span>}
      </div>
      <p className="cr-sub">
        Transcreve a conversa ao vivo e joga nas <b>Observações</b> (salvo com a consulta). Grátis — o áudio é processado pelo navegador, não sobe arquivo. {' '}
        <b>Peça o consentimento do paciente para gravar.</b>
      </p>
      {rec && previa && <div className="cr-previa">{previa}…</div>}
    </div>
  );
}
