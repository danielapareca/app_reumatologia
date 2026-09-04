// Dias decorridos entre duas datas (aceita ISO com ou sem hora). Positivo = b depois de a.
export function diasDesde(dataISO: string, hojeISO: string): number | null {
  if (!dataISO || !hojeISO) return null;
  const a = Date.parse(dataISO.slice(0, 10) + 'T00:00:00Z');
  const b = Date.parse(hojeISO.slice(0, 10) + 'T00:00:00Z');
  if (isNaN(a) || isNaN(b)) return null;
  return Math.round((b - a) / 86400000);
}

// Acima de quantos dias sem consulta consideramos o retorno possivelmente atrasado (regra branda).
export const DIAS_RETORNO_ATRASADO = 120;

// Frase amigável de "há quanto tempo" a partir de dias.
export function haQuantoTempo(dias: number | null): string {
  if (dias === null) return '';
  if (dias <= 0) return 'hoje';
  if (dias === 1) return 'ontem';
  if (dias < 30) return `há ${dias} dias`;
  const meses = Math.round(dias / 30);
  if (meses < 12) return `há ${meses} ${meses === 1 ? 'mês' : 'meses'}`;
  const anos = Math.floor(dias / 365);
  return `há ${anos} ${anos === 1 ? 'ano' : 'anos'}`;
}

// Iniciais (1–2 letras) a partir do nome, para avatares.
export function iniciais(nome: string): string {
  const parts = (nome || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '—';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Capitaliza nome próprio para documentos (receita/cabeçalho), mesmo que salvo em
// minúsculo ou maiúsculo. Mantém conectores (de, da, do, e...) em minúsculo.
export function nomeProprio(nome: string | null | undefined): string {
  const s = (nome || '').trim();
  if (!s) return '';
  const conect = new Set(['de', 'da', 'do', 'dos', 'das', 'e', 'di', 'du', 'del', 'la', 'van', 'von', 'y']);
  const cap = (p: string) => (p ? p.charAt(0).toLocaleUpperCase('pt-BR') + p.slice(1) : p);
  return s.toLocaleLowerCase('pt-BR').split(/\s+/).map((w, i) => {
    if (i > 0 && conect.has(w)) return w;
    return w.split('-').map(cap).join('-'); // capitaliza cada parte de nomes com hífen
  }).join(' ');
}

// Calcula a idade em anos a partir da data de nascimento (YYYY-MM-DD).
export function idadeFromNascimento(nascimento: string): string {
  if (!nascimento) return '';
  const m = nascimento.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return '';
  const y = parseInt(m[1], 10), mo = parseInt(m[2], 10), d = parseInt(m[3], 10);
  const hoje = new Date();
  let anos = hoje.getFullYear() - y;
  const antesDoAniversario =
    hoje.getMonth() + 1 < mo || (hoje.getMonth() + 1 === mo && hoje.getDate() < d);
  if (antesDoAniversario) anos--;
  if (anos < 0 || anos > 130) return '';
  return anos + ' anos';
}
