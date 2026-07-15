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
