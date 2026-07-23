// Verificador de interações medicamentosas / associações a evitar (apoio ao médico).
// Alerta forte (não bloqueio rígido — o médico decide), destacando combinações perigosas.

function norm(t: string): string {
  return (t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export type NivelInteracao = 'grave' | 'cautela';
interface RegraInteracao { a: string[]; b: string[]; nivel: NivelInteracao; msg: string }

const AINE = ['aine', 'anti-inflamatorio', 'naproxeno', 'ibuprofeno', 'diclofenaco', 'cetoprofeno', 'meloxicam', 'nimesulida', 'piroxicam', 'celecoxibe', 'etoricoxibe', 'indometacina', 'aspirina', 'aas'];
const ANTICOAG = ['varfarina', 'warfarina', 'marevan', 'rivaroxabana', 'apixabana', 'dabigatrana', 'edoxabana', 'heparina', 'enoxaparina'];
const BIOLOGICOS = ['adalimumabe', 'etanercepte', 'infliximabe', 'golimumabe', 'certolizumabe', 'anti-tnf', 'tocilizumabe', 'anakinra', 'canaquinumabe', 'abatacepte', 'rituximabe', 'secuquinumabe', 'ixequizumabe'];

const REGRAS: RegraInteracao[] = [
  { a: ['metotrexato'], b: ['sulfametoxazol', 'trimetoprim', 'bactrim', 'cotrimoxazol', 'sulfa '], nivel: 'grave',
    msg: 'Metotrexato + sulfametoxazol-trimetoprima (Bactrim): risco de pancitopenia/mielotoxicidade grave. Evitar a associação.' },
  { a: ['azatioprina'], b: ['alopurinol'], nivel: 'grave',
    msg: 'Azatioprina + alopurinol: inibição da xantina oxidase → mielotoxicidade grave. Evitar; se imprescindível, reduzir azatioprina a ~25% e monitorar hemograma.' },
  { a: ['colchicina'], b: ['claritromicina', 'eritromicina', 'cetoconazol', 'itraconazol', 'ciclosporina', 'verapamil'], nivel: 'grave',
    msg: 'Colchicina + inibidor de CYP3A4/P-gp (claritromicina, eritromicina, azólicos, ciclosporina, verapamil): toxicidade grave da colchicina. Evitar/ajustar, sobretudo em disfunção renal.' },
  { a: ['colchicina'], b: ['sinvastatina', 'atorvastatina', 'rosuvastatina', 'estatina'], nivel: 'cautela',
    msg: 'Colchicina + estatina: maior risco de miopatia/rabdomiólise. Vigiar CPK e sintomas musculares.' },
  { a: ['metotrexato'], b: AINE, nivel: 'cautela',
    msg: 'Metotrexato + AINE: reduz a excreção do MTX (risco em doses altas / função renal reduzida). Cautela; evitar em disfunção renal.' },
  { a: ['leflunomida'], b: ['metotrexato'], nivel: 'cautela',
    msg: 'Leflunomida + metotrexato: hepatotoxicidade aditiva. Monitorar transaminases de perto.' },
  { a: ANTICOAG, b: AINE, nivel: 'grave',
    msg: 'Anticoagulante + AINE: risco importante de sangramento. Evitar a associação.' },
  { a: BIOLOGICOS, b: BIOLOGICOS, nivel: 'grave',
    msg: 'Dois imunobiológicos associados (ex.: anti-TNF + anti-IL-1 ou anti-IL-6): não combinar — risco infeccioso elevado.' },
  { a: ['aine', 'naproxeno', 'ibuprofeno', 'diclofenaco'], b: ['litio', 'lítio'], nivel: 'cautela',
    msg: 'AINE + lítio: aumenta a litemia (risco de toxicidade). Monitorar níveis.' },
  { a: ['ciclosporina'], b: AINE, nivel: 'cautela',
    msg: 'Ciclosporina + AINE: nefrotoxicidade aditiva. Monitorar função renal.' },
];

// Recebe uma lista de textos (medicamentos da receita + medicações em uso) e devolve os alertas.
export function checkInteracoes(textos: string[]): { nivel: NivelInteracao; msg: string }[] {
  const t = textos.map(norm).filter(Boolean);
  const contem = (kws: string[]) => kws.some((k) => t.some((x) => x.includes(k)));
  const out: { nivel: NivelInteracao; msg: string }[] = [];
  const vistos = new Set<string>();
  for (const r of REGRAS) {
    if (contem(r.a) && contem(r.b) && !vistos.has(r.msg)) {
      vistos.add(r.msg);
      out.push({ nivel: r.nivel, msg: r.msg });
    }
  }
  // grave primeiro
  return out.sort((x, y) => (x.nivel === 'grave' ? -1 : 1) - (y.nivel === 'grave' ? -1 : 1));
}
