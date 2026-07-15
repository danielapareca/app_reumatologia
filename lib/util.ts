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
