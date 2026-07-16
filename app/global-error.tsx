'use client';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, fontFamily: '-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif', background: '#EEF1F6' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ maxWidth: 460, width: '100%', background: '#fff', border: '1px solid #E1E7F0', borderRadius: 16, padding: 26 }}>
            <h2 style={{ margin: '0 0 6px', fontSize: 20, color: '#152233' }}>Algo deu errado</h2>
            <p style={{ margin: '0 0 14px', fontSize: 14, color: '#5E6D82' }}>Recarregue a página. Se continuar, tire um print desta mensagem:</p>
            <pre style={{ background: '#F7F9FC', border: '1px solid #E1E7F0', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#9B2D22', whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: '0 0 16px' }}>
              {(error?.message || 'Erro desconhecido')}{error?.digest ? `\n(código: ${error.digest})` : ''}
            </pre>
            <button onClick={() => reset()} style={{ background: 'linear-gradient(180deg,#1E3A5F,#0F1E33)', color: '#fff', border: 0, borderRadius: 10, padding: '10px 16px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Tentar de novo</button>
          </div>
        </div>
      </body>
    </html>
  );
}
