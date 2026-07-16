// Controle simples de custo/uso da IA: limite diário de chamadas por médico.
// Se a tabela ai_usage ainda não existir, não bloqueia (o app segue funcionando).

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DB = any;

export const AI_DAILY_LIMIT = Number(process.env.AI_DAILY_LIMIT || 40);

function inicioDoDiaISO(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

// Retorna true se o médico já atingiu o limite diário.
export async function limiteAtingido(supabase: DB, userId: string): Promise<boolean> {
  try {
    const { count, error } = await supabase
      .from('ai_usage')
      .select('*', { count: 'exact', head: true })
      .eq('doctor_id', userId)
      .gte('created_at', inicioDoDiaISO());
    if (error) return false; // tabela ausente ou erro → não bloqueia
    return (count || 0) >= AI_DAILY_LIMIT;
  } catch {
    return false;
  }
}

// Registra uma chamada de IA (para contagem/limite). Falha silenciosa.
export async function registrarUso(supabase: DB, userId: string, kind: string, model?: string): Promise<void> {
  try {
    await supabase.from('ai_usage').insert({ doctor_id: userId, kind, model: model || null });
  } catch {
    /* ignora */
  }
}
