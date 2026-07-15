import type { MedicationEvent, MedEventTipo } from '@/lib/types';

function norm(t: string): string {
  return (t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Nome-base do medicamento (sem a dose) para casar receita ↔ linha do tempo.
// "Metotrexato 2,5 mg" → "metotrexato" · "Ácido fólico 5 mg" → "acido folico".
export function baseMed(m: string): string {
  return norm(m).split(/\s+\d/)[0].trim();
}

// Ignora linhas que não são um medicamento concreto (alternativas, combinações, fisioterapia).
export function pareceMedicamento(m: string): boolean {
  const s = (m || '').trim();
  if (s.length < 3) return false;
  if (/^ou\b/i.test(s)) return false;
  if (/^combina/i.test(s)) return false;
  if (/(fisioterapia|exerc[ií]cio|encaminh)/i.test(s)) return false;
  return true;
}

export interface NovoEvento { medicamento: string; evento: MedEventTipo; dose: string }

// A partir da receita e da linha do tempo atual, deriva os eventos novos.
// - medicamento inédito → 'inicio'
// - mesmo medicamento com texto/dose diferente → 'troca'
// - sem mudança → ignora (não duplica)
// Nunca gera 'suspensao' automaticamente (omitir da receita não significa suspender).
export function derivarEventosReceita(
  receita: { m: string; q?: string }[],
  historico: MedicationEvent[],
): NovoEvento[] {
  const lastByBase = new Map<string, MedicationEvent>();
  for (const e of historico) {
    const b = baseMed(e.medicamento);
    const cur = lastByBase.get(b);
    if (!cur || e.data > cur.data) lastByBase.set(b, e);
  }
  const novos: NovoEvento[] = [];
  const vistos = new Set<string>();
  for (const it of receita) {
    const m = (it.m || '').trim();
    if (!m || !pareceMedicamento(m)) continue;
    const base = baseMed(m);
    if (!base || vistos.has(base)) continue;
    vistos.add(base);
    const last = lastByBase.get(base);
    if (!last) {
      novos.push({ medicamento: m, evento: 'inicio', dose: it.q || '' });
    } else if (last.medicamento.trim() !== m) {
      novos.push({ medicamento: m, evento: 'troca', dose: it.q || '' });
    }
  }
  return novos;
}
