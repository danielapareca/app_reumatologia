'use client';

import { useState } from 'react';
import Icon from '@/components/Icon';
import AiText from '@/components/AiText';

const SUGESTOES = [
  'Quando indicar anabólico de início na osteoporose?',
  'Como interpretar T-score e Z-score na densitometria?',
  'Critérios de Budapeste para dor complexa regional',
  'Rastreio de uveíte na artrite idiopática juvenil',
  'Quando pensar em linfoma no Sjögren?',
];

export default function AskClient() {
  const [pergunta, setPergunta] = useState('');
  const [resposta, setResposta] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  async function perguntar(q?: string) {
    const texto = (q ?? pergunta).trim();
    if (texto.length < 3) return;
    if (q) setPergunta(q);
    setLoading(true); setErro(''); setResposta('');
    try {
      const res = await fetch('/api/ask', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pergunta: texto }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || 'Falha ao responder.');
      setResposta(j.resposta || '');
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao responder.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page" style={{ maxWidth: 760 }}>
      <p className="eyebrow"><Icon name="sparkles" size={15} /> Assistente clínico</p>
      <h2>Pergunte à IA</h2>
      <p className="psub">Faça uma pergunta clínica livre. A IA responde com apoio na base do app (PCDTs, diretrizes e protocolos), <b>citando a fonte</b>. É apoio — não substitui o médico.</p>

      <div className="card">
        <textarea
          className="ask-input"
          value={pergunta}
          onChange={(e) => setPergunta(e.target.value)}
          onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') perguntar(); }}
          placeholder="Ex.: Qual o esquema de monitorização da colchicina na febre familiar do Mediterrâneo?"
          rows={3}
        />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 8 }}>
          <button className="btn-primary" onClick={() => perguntar()} disabled={loading || pergunta.trim().length < 3} style={{ height: 42 }}>
            {loading ? 'Consultando…' : (<><Icon name="sparkles" size={16} /> Perguntar</>)}
          </button>
          <span style={{ fontSize: 11.5, color: 'var(--faint)' }}>Ctrl/⌘ + Enter para enviar</span>
        </div>

        {!resposta && !loading && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--faint)', fontWeight: 800, marginBottom: 8 }}>Exemplos</div>
            <div className="chips">
              {SUGESTOES.map((s) => (
                <span key={s} className="chip" onClick={() => perguntar(s)}>{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {erro && <div className="auth-err">{erro}</div>}

      {loading && (
        <div className="card">
          <div className="skel-shimmer" style={{ height: 13, width: '65%', marginBottom: 10 }} />
          <div className="skel-shimmer" style={{ height: 13, width: '100%', marginBottom: 8 }} />
          <div className="skel-shimmer" style={{ height: 13, width: '90%', marginBottom: 8 }} />
          <div className="skel-shimmer" style={{ height: 13, width: '80%' }} />
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12 }}>Consultando a base e redigindo a resposta…</div>
        </div>
      )}

      {resposta && !loading && (
        <div className="insight">
          <div className="insight-head">
            <div className="insight-mark">✦</div>
            <div className="insight-title">
              <div className="ih-t">Resposta — apoio</div>
              <div className="ih-s">Fundamentada na base do app, citando a fonte</div>
            </div>
            <span className="insight-seal">Apoio · não substitui o médico</span>
          </div>
          <div className="insight-body">
            <AiText text={resposta} />
          </div>
        </div>
      )}
    </div>
  );
}
