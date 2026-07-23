'use client';

import { Fragment } from 'react';
import Icon from './Icon';

function renderInline(s: string) {
  return s.split('**').map((p, i) => (i % 2 === 1 ? <b key={i}>{p}</b> : <Fragment key={i}>{p}</Fragment>));
}
function secIcon(title: string): string {
  const t = title.toLowerCase();
  if (/font/.test(t)) return 'clipboard';
  if (/sugest|conduta|pr[óo]xim|plano|tratamento/.test(t)) return 'pill';
  if (/avali|resumo|an[áa]lise/.test(t)) return 'sparkles';
  if (/alert|seguran|aten|alarme|urg/.test(t)) return 'shield';
  return 'chevron';
}

// Renderiza um texto de IA (títulos "## ", listas "- ", **negrito**, e "## Fontes" em chips).
export default function AiText({ text }: { text: string }) {
  const lines = text.split('\n');
  const out: React.ReactNode[] = [];
  let fontes: string[] = [];
  let inFontes = false;
  const flush = (key: string) => {
    if (fontes.length) {
      out.push(<div key={'f' + key} className="ins-chips">{fontes.map((f, j) => <span key={j} className="source-chip">{f}</span>)}</div>);
      fontes = [];
    }
  };
  lines.forEach((raw, i) => {
    const line = raw.trimEnd();
    if (!line.trim()) return;
    if (line.startsWith('## ') || line.startsWith('# ')) {
      flush(String(i));
      const title = line.replace(/^#+\s/, '');
      inFontes = /font/i.test(title);
      out.push(<div key={i} className="ins-head"><Icon name={secIcon(title)} size={14} /> {title}</div>);
      return;
    }
    if (/^[-*]\s+/.test(line)) {
      const content = line.replace(/^[-*]\s+/, '');
      if (inFontes) { fontes.push(content.replace(/\*\*/g, '')); return; }
      out.push(
        <div key={i} className="insight-rec">
          <Icon name="chevron" size={16} style={{ color: 'var(--gold-600)', flexShrink: 0, marginTop: 1 }} />
          <span>{renderInline(content)}</span>
        </div>
      );
      return;
    }
    if (/^\*.+\*$/.test(line)) {
      out.push(<div key={i} className="ins-note">{line.replace(/^\*|\*$/g, '')}</div>);
      return;
    }
    out.push(<p key={i} className="ins-p">{renderInline(line)}</p>);
  });
  flush('end');
  return <div className="ins-body-text">{out}</div>;
}
