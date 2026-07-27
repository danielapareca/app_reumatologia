'use client';

import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/Icon';
import AiText from '@/components/AiText';

type Msg = { role: 'user' | 'assistant'; content: string };

// Conversa com a IA no contexto desta consulta (usa os dados do paciente já preenchidos).
// Apoio — cita a base e não substitui o médico.
export default function ConsultaChat({ buildContexto }: { buildContexto: () => string }) {
  const [pergunta, setPergunta] = useState('');
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const fimRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fimRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, [msgs, loading]);

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
        body: JSON.stringify({ messages: novo, contexto: buildContexto() }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || 'Falha ao responder.');
      setMsgs((m) => [...m, { role: 'assistant', content: j.resposta || '' }]);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao responder.');
      setMsgs((m) => m.slice(0, -1));
      setPergunta(texto);
    } finally {
      setLoading(false);
    }
  }

  const vazio = msgs.length === 0;
  const SUG = ['Resuma o caso e os próximos passos.', 'Há algum alerta de segurança neste paciente?', 'Esta conduta está alinhada ao PCDT?'];

  return (
    <div className="card">
      <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="sparkles" size={16} /> Conversar com a IA sobre a consulta</h3>
      <p className="sub">Pergunte no contexto deste paciente (usa os dados já preenchidos). A IA lembra a conversa e cita a fonte. Apoio — não substitui o médico.</p>

      {!vazio && (
        <div className="chat" style={{ marginBottom: 12 }}>
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
                <div className="skel-shimmer" style={{ height: 12, width: '75%', marginBottom: 8 }} />
                <div className="skel-shimmer" style={{ height: 12, width: '92%' }} />
              </div>
            </div>
          )}
          <div ref={fimRef} />
        </div>
      )}

      {erro && <div className="auth-err">{erro}</div>}

      {vazio && !loading && (
        <div className="chips" style={{ marginBottom: 10 }}>
          {SUG.map((s) => <span key={s} className="chip" onClick={() => enviar(s)}>{s}</span>)}
        </div>
      )}

      <div className="fieldrow">
        <textarea value={pergunta} onChange={(e) => setPergunta(e.target.value)}
          onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') enviar(); }}
          placeholder="Ex.: Diante desses exames, qual o próximo passo?" rows={2} style={{ width: '100%' }} />
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
        <button className="btn-primary" onClick={() => enviar()} disabled={loading || pergunta.trim().length < 3} style={{ height: 40 }}>
          {loading ? 'Consultando…' : (<><Icon name="sparkles" size={15} /> {vazio ? 'Perguntar' : 'Enviar'}</>)}
        </button>
        {!vazio && <button className="btn-ghost" onClick={() => { setMsgs([]); setErro(''); }} style={{ height: 40, padding: '0 12px', fontSize: 12.5 }}>Nova conversa</button>}
      </div>
    </div>
  );
}
