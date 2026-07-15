import type { MedicationEvent, ExamValue } from '@/lib/types';

function norm(t: string): string {
  return (t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
function diffDays(a: string, b: string): number {
  const pa = a.match(/^(\d{4})-(\d{2})-(\d{2})$/), pb = b.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!pa || !pb) return 0;
  const da = Date.UTC(+pa[1], +pa[2] - 1, +pa[3]);
  const db = Date.UTC(+pb[1], +pb[2] - 1, +pb[3]);
  return Math.round((db - da) / 86400000);
}

// Medicamentos que exigem monitorização laboratorial periódica (hemograma + transaminases).
const MONITORADOS = ['metotrexato', 'leflunomida', 'azatioprina', 'sulfassalazina', 'ciclofosfamida', 'micofenolato'];
// Marcadores que contam como hemograma/transaminases.
const LAB = ['hemoglobina', 'leucocito', 'plaqueta', 'hemograma', 'tgo', 'tgp', 'ast', 'alt'];

// Alertas simples de monitorização atrasada. `hoje` em YYYY-MM-DD.
export function computeMonitorAlerts(meds: MedicationEvent[], exams: ExamValue[], hoje: string): string[] {
  if (!hoje) return [];
  // último evento por medicamento
  const byMed = new Map<string, MedicationEvent>();
  for (const m of meds) {
    const cur = byMed.get(norm(m.medicamento));
    if (!cur || m.data > cur.data) byMed.set(norm(m.medicamento), m);
  }
  const ativos = Array.from(byMed.values()).filter((m) => m.evento !== 'suspensao');
  const precisam = ativos.filter((m) => MONITORADOS.some((k) => norm(m.medicamento).includes(k)));
  if (precisam.length === 0) return [];

  const labDatas = exams
    .filter((e) => LAB.some((k) => norm(e.marcador).includes(k)))
    .map((e) => e.data)
    .sort();
  const ultimo = labDatas.length ? labDatas[labDatas.length - 1] : null;
  const nomes = Array.from(new Set(precisam.map((m) => m.medicamento))).join(', ');

  if (!ultimo) {
    return [`Monitorização: paciente em ${nomes} sem hemograma/transaminases registrados. Considere solicitar e lançar os valores.`];
  }
  const dias = diffDays(ultimo, hoje);
  if (dias > 90) {
    return [`Monitorização possivelmente atrasada: último hemograma/transaminases há ${dias} dias (paciente em ${nomes}). Diretriz sugere reavaliação periódica.`];
  }
  return [];
}
