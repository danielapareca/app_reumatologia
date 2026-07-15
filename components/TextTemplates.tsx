'use client';

import { useEffect, useRef, useState } from 'react';

interface Modelo { id: string; titulo: string; corpo: string }

// Modelos de texto reutilizáveis do médico (frases prontas). Guardados no próprio navegador
// (localStorage) — sem banco, funcionam na hora. Cada campo recebe onInsert para inserir o texto.
export default function TextTemplates({
  storageKey,
  onInsert,
  atalho,
}: {
  storageKey: string;
  onInsert: (t: string) => void;
  atalho?: string; // texto atual do campo, para "salvar como modelo" rapidamente
}) {
  const [open, setOpen] = useState(false);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [tit, setTit] = useState('');
  const [corpo, setCorpo] = useState('');
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try { const raw = localStorage.getItem(storageKey); if (raw) setModelos(JSON.parse(raw)); } catch { /* ignora */ }
  }, [storageKey]);

  // Fecha ao clicar fora.
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  function persist(next: Modelo[]) {
    setModelos(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* ignora */ }
  }
  function add(texto: string, titulo: string) {
    const c = texto.trim(); if (!c) return;
    const t = (titulo.trim() || c.slice(0, 28)).trim();
    persist([...modelos, { id: String(Date.now()) + Math.random().toString(36).slice(2, 6), titulo: t, corpo: c }]);
    setTit(''); setCorpo('');
  }
  function remove(id: string) { persist(modelos.filter((m) => m.id !== id)); }

  return (
    <div className="tpl-wrap no-print" ref={boxRef}>
      <button type="button" className="tpl-btn" onClick={() => setOpen((v) => !v)} title="Modelos de texto">
        ＋ Modelos
      </button>
      {open && (
        <div className="tpl-panel">
          {modelos.length === 0 ? (
            <div className="tpl-empty">Nenhum modelo salvo ainda. Crie frases prontas abaixo.</div>
          ) : (
            <div className="tpl-list">
              {modelos.map((m) => (
                <div key={m.id} className="tpl-item">
                  <button type="button" className="tpl-ins" onClick={() => { onInsert(m.corpo); setOpen(false); }} title={m.corpo}>
                    {m.titulo}
                  </button>
                  <button type="button" className="tpl-rm" onClick={() => remove(m.id)} title="Excluir modelo">×</button>
                </div>
              ))}
            </div>
          )}

          <div className="tpl-new">
            <input value={tit} onChange={(e) => setTit(e.target.value)} placeholder="Título (opcional)" />
            <textarea value={corpo} onChange={(e) => setCorpo(e.target.value)} placeholder="Texto do modelo…" />
            <div className="tpl-actions">
              <button type="button" className="btn-primary" onClick={() => add(corpo, tit)}>Salvar modelo</button>
              {atalho && atalho.trim() && (
                <button type="button" className="btn-ghost" onClick={() => add(atalho, tit)} title="Salva o texto que já está no campo como modelo">
                  Usar o texto do campo
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
