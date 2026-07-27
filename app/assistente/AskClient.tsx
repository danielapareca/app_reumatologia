'use client';

import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/Icon';
import AiText from '@/components/AiText';

const SUGESTOES = [
  'Quando indicar anabólico de início na osteoporose?',
  'Como interpretar T-score e Z-score na densitometria?',
  'Critérios de Budapeste para dor complexa regional',
  'Rastreio de uveíte na artrite idiopática juvenil',
  'Quando pensar em linfoma no Sjögren?',
];

type Msg = { role: 'user' | 'assistant'; content: string };

export default function AskClient() {
  const [pergunta, setPergunta] = useState('');
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const fimRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fimRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [msgs, loading]);

  async function enviar(q?: string) {
    const texto = (q ?? pergunta).trim();
    if (texto.length < 3 || loading) return;
    const novo: Msg[] = [...msgs, { role: 'user', content: texto }];
    setMsgs(novo);
    setPergunta('');
    setLoading(true); setErro('');
    try {
      const res = await fetch('/api/ask', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: novo }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || 'Falha ao responder.');
      setMsgs((m) => [...m, { role: 'assistant', content: j.resposta || '' }]);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao responder.');
      // devolve a pergunta ao campo para o médico tentar de novo
      setMsgs((m) => m.slice(0, -1));
      setPergunta(texto);
    } finally {
      setLoading(false);
    }
  }

  const vazio = msgs.length === 0;

  return (
    <div className="page" style={{ maxWidth: 760 }}>
      <p className="eyebrow" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="sparkles" size={15} /> Assistente clínico</span>
        {!vazio && <button className="eb-link" onClick={() => { setMsgs([]); setErro(''); }}>Nova conversa</button>}
      </p>
      <h2>Converse com a IA</h2>
      <p className="psub">Faça perguntas clínicas e <b>continue a conversa</b> (a IA lembra o que já foi dito). Responde com apoio na base do app (PCDTs, diretrizes e protocolos), <b>citando a fonte</b>. É apoio — não substitui o médico.</p>

      {/* conversa */}
      {!vazio && (
        <div className="chat">
          {msgs.map((m, i) => (
            m.role === 'user' ? (
              <div key={i} className="chat-user"><div className="cu-bubble">{m.content}</div></div>
            ) : (
              <div key={i} className="chat-ai">
                <div className="insight-mark" style={{ flexShrink: 0 }}>✦</div>
                <div className="chat-ai-body"><AiText text={m.content} /></div>
              </div>
            )
          ))}
          {loading && (
            <div className="chat-ai">
              <div className="insight-mark" style={{ flexShrink: 0 }}>✦</div>
              <div className="chat-ai-body">
                <div className="skel-shimmer" style={{ height: 12, width: '70%', marginBottom: 8 }} />
                <div className="skel-shimmer" style={{ height: 12, width: '95%', marginBottom: 8 }} />
                <div className="skel-shimmer" style={{ height: 12, width: '85%' }} />
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>Consultando a base e redigindo…</div>
              </div>
            </div>
          )}
          <div ref={fimRef} />
        </div>
      )}

      {erro && <div className="auth-err">{erro}</div>}

      {/* sugestões (só no início) */}
      {vazio && !loading && (
        <div className="card" style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--faint)', fontWeight: 800, marginBottom: 8 }}>Exemplos para começar</div>
          <div className="chips">
            {SUGESTOES.map((s) => (
              <span key={s} className="chip" onClick={() => enviar(s)}>{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* caixa de envio */}
      <div className="card ask-box">
        <textarea
          className="ask-input"
          value={pergunta}
          onChange={(e) => setPergunta(e.target.value)}
          onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') enviar(); }}
          placeholder={vazio ? 'Ex.: Qual o esquema de monitorização da colchicina na FMF?' : 'Continue a conversa ou faça outra pergunta…'}
          rows={3}
        />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 8 }}>
          <button className="btn-primary" onClick={() => enviar()} disabled={loading || pergunta.trim().length < 3} style={{ height: 42 }}>
            {loading ? 'Consultando…' : (<><Icon name="sparkles" size={16} /> {vazio ? 'Perguntar' : 'Enviar'}</>)}
          </button>
          <span style={{ fontSize: 11.5, color: 'var(--faint)' }}>Ctrl/⌘ + Enter para enviar</span>
        </div>
      </div>
    </div>
  );
}
