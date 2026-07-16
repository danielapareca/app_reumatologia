'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Ajuda a aparecer no console também.
    console.error('Erro na aplicação:', error);
  }, [error]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: '-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif', background: '#EEF1F6' }}>
      <div style={{ maxWidth: 460, width: '100%', background: '#fff', border: '1px solid #E1E7F0', borderRadius: 16, padding: 26, boxShadow: '0 8px 30px rgba(15,30,51,.08)' }}>
        <h2 style={{ margin: '0 0 6px', fontSize: 20, color: '#152233' }}>Algo deu errado</h2>
        <p style={{ margin: '0 0 14px', fontSize: 14, color: '#5E6D82' }}>
          Recarregue a página. Se continuar, tire um print desta mensagem e envie ao suporte:
        </p>
        <pre style={{ background: '#F7F9FC', border: '1px solid #E1E7F0', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#9B2D22', whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: '0 0 16px' }}>
          {(error?.message || 'Erro desconhecido')}{error?.digest ? `\n(código: ${error.digest})` : ''}
        </pre>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => reset()} style={{ background: 'linear-gradient(180deg,#1E3A5F,#0F1E33)', color: '#fff', border: 0, borderRadius: 10, padding: '10px 16px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Tentar de novo</button>
          <a href="/" style={{ background: '#fff', color: '#152233', border: '1px solid #E1E7F0', borderRadius: 10, padding: '10px 16px', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Voltar ao início</a>
        </div>
      </div>
    </div>
  );
}
