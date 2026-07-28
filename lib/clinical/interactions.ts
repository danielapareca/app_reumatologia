// Verificador de interações medicamentosas / associações a evitar (apoio ao médico).
// Alerta forte (não bloqueio rígido — o médico decide), destacando combinações perigosas.
// Conteúdo de APOIO — o Dr. Willian valida antes de considerar oficial.

function norm(t: string): string {
  // minúsculas + remove acentos (NFD). IMPORTANTE: as palavras-chave abaixo são SEM acento.
  return (t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export type NivelInteracao = 'grave' | 'cautela';
// mesmo=true: regra de "dois da mesma classe" (dispara só com ≥ 2 medicamentos distintos da lista a).
interface RegraInteracao { a: string[]; b: string[]; nivel: NivelInteracao; msg: string; mesmo?: boolean }

// ----- listas de palavras-chave (todas SEM acento) -----
const AINE = ['aine', 'anti-inflamatorio', 'naproxeno', 'ibuprofeno', 'diclofenaco', 'cetoprofeno', 'meloxicam', 'nimesulida', 'piroxicam', 'tenoxicam', 'celecoxibe', 'etoricoxibe', 'indometacina', 'cetorolaco', 'aspirina', 'aas'];
const AINE_NOMES = ['naproxeno', 'ibuprofeno', 'diclofenaco', 'cetoprofeno', 'meloxicam', 'nimesulida', 'piroxicam', 'tenoxicam', 'celecoxibe', 'etoricoxibe', 'indometacina', 'cetorolaco'];
const ANTICOAG = ['varfarina', 'warfarina', 'marevan', 'rivaroxabana', 'apixabana', 'dabigatrana', 'edoxabana', 'heparina', 'enoxaparina'];
const BIOLOGICOS = ['adalimumabe', 'etanercepte', 'infliximabe', 'golimumabe', 'certolizumabe', 'anti-tnf', 'tocilizumabe', 'sarilumabe', 'anakinra', 'canaquinumabe', 'abatacepte', 'rituximabe', 'secuquinumabe', 'ixequizumabe', 'guselcumabe', 'ustequinumabe', 'belimumabe'];
const BIOLOGICOS_NOMES = ['adalimumabe', 'etanercepte', 'infliximabe', 'golimumabe', 'certolizumabe', 'tocilizumabe', 'sarilumabe', 'anakinra', 'canaquinumabe', 'abatacepte', 'rituximabe', 'secuquinumabe', 'ixequizumabe', 'guselcumabe', 'ustequinumabe', 'belimumabe'];
const JAK = ['tofacitinibe', 'baricitinibe', 'upadacitinibe', 'filgotinibe'];
const ESTATINA = ['sinvastatina', 'atorvastatina', 'rosuvastatina', 'pravastatina', 'lovastatina', 'estatina'];
const AZOLICOS = ['fluconazol', 'itraconazol', 'cetoconazol', 'voriconazol', 'posaconazol', 'miconazol'];
const XANTINA_OX = ['alopurinol', 'febuxostate', 'febuxostat'];
const TIOPURINA = ['azatioprina', 'mercaptopurina', '6-mp', '6 mp'];
const CORTICOIDE = ['prednisona', 'prednisolona', 'metilprednisolona', 'dexametasona', 'betametasona', 'deflazacorte', 'corticoide', 'corticosteroide'];
const IECA_BRA = ['enalapril', 'captopril', 'lisinopril', 'ramipril', 'perindopril', 'losartana', 'valsartana', 'candesartana', 'olmesartana', 'telmisartana', 'irbesartana'];
const DIURETICO = ['hidroclorotiazida', 'clortalidona', 'indapamida', 'furosemida', 'espironolactona'];
const FLUOROQUINOLONA = ['ciprofloxacino', 'levofloxacino', 'moxifloxacino', 'norfloxacino', 'gatifloxacino'];
const IBP = ['omeprazol', 'pantoprazol', 'esomeprazol', 'lansoprazol', 'rabeprazol'];
const FIBRATO = ['genfibrozila', 'ciprofibrato', 'fenofibrato', 'bezafibrato'];
const ISRS = ['fluoxetina', 'sertralina', 'paroxetina', 'citalopram', 'escitalopram', 'venlafaxina', 'duloxetina'];
const QT_LONGO = ['azitromicina', 'claritromicina', 'ondansetrona', 'amiodarona', 'sotalol', 'haloperidol', 'quetiapina', 'citalopram', 'escitalopram', 'metadona', 'domperidona'];
const CYP3A4_PGP = ['claritromicina', 'eritromicina', 'cetoconazol', 'itraconazol', 'voriconazol', 'fluconazol', 'ciclosporina', 'verapamil', 'diltiazem', 'ritonavir'];
const IMUNOSSUPRES = ['metotrexato', 'leflunomida', 'azatioprina', 'mercaptopurina', 'ciclosporina', 'tacrolimus', 'micofenolato', 'ciclofosfamida', ...BIOLOGICOS_NOMES, ...JAK];
const VACINA_VIVA = ['vacina viva', 'virus vivo', 'febre amarela', 'triplice viral', 'tetra viral', 'sarampo', 'caxumba', 'rubeola', 'varicela', 'catapora', 'herpes zoster vivo', 'zoster vivo', 'bcg', 'febre tifoide oral', 'rotavirus', 'poliomielite oral', 'vopc', 'sabin', 'dengue'];

const REGRAS: RegraInteracao[] = [
  // ---------------- GRAVE ----------------
  { a: ['metotrexato'], b: ['sulfametoxazol', 'trimetoprim', 'trimetoprima', 'bactrim', 'cotrimoxazol', 'sulfa '], nivel: 'grave',
    msg: 'Metotrexato + sulfametoxazol-trimetoprima (Bactrim): risco de pancitopenia/mielotoxicidade grave. Evitar a associação.' },
  { a: TIOPURINA, b: XANTINA_OX, nivel: 'grave',
    msg: 'Azatioprina/mercaptopurina + alopurinol ou febuxostate: inibição da xantina oxidase → mielotoxicidade grave. Evitar; se imprescindível, reduzir a tiopurina a ~25% e monitorar hemograma.' },
  { a: ['colchicina'], b: CYP3A4_PGP, nivel: 'grave',
    msg: 'Colchicina + inibidor de CYP3A4/P-gp (claritromicina, eritromicina, azólicos, ciclosporina, verapamil, diltiazem): toxicidade grave da colchicina. Evitar/ajustar, sobretudo em disfunção renal/hepática.' },
  { a: ANTICOAG, b: AINE, nivel: 'grave',
    msg: 'Anticoagulante + AINE: risco importante de sangramento (GI e outros). Evitar a associação.' },
  { a: ['varfarina', 'warfarina', 'marevan'], b: ['sulfametoxazol', 'bactrim', 'cotrimoxazol', 'metronidazol', ...AZOLICOS, 'amiodarona'], nivel: 'grave',
    msg: 'Varfarina + sulfa/metronidazol/azólico/amiodarona: aumenta muito o INR (risco de sangramento). Evitar ou monitorar o INR de perto e ajustar a dose.' },
  { a: ['ciclosporina', 'tacrolimus'], b: ESTATINA, nivel: 'grave',
    msg: 'Ciclosporina/tacrolimus + estatina: risco elevado de miopatia/rabdomiólise. Evitar (sobretudo sinvastatina); se necessário, usar menor dose de estatina e vigiar CPK.' },
  { a: BIOLOGICOS_NOMES, b: BIOLOGICOS_NOMES, nivel: 'grave', mesmo: true,
    msg: 'Dois imunobiológicos associados: não combinar — risco infeccioso elevado sem ganho de eficácia.' },
  { a: BIOLOGICOS, b: JAK, nivel: 'grave',
    msg: 'Imunobiológico + inibidor de JAK: não combinar — imunossupressão excessiva e risco infeccioso.' },
  { a: IMUNOSSUPRES, b: VACINA_VIVA, nivel: 'grave',
    msg: 'Imunossupressor/biológico/JAK + vacina de vírus VIVO (febre amarela, tríplice viral, varicela, zoster vivo, BCG, febre tifoide oral): contraindicado sob imunossupressão. Programar a vacina antes ou respeitar o intervalo de segurança.' },
  { a: AINE_NOMES, b: AINE_NOMES, nivel: 'grave', mesmo: true,
    msg: 'Dois AINEs juntos: soma a toxicidade gastrointestinal e renal sem ganho. Usar apenas um.' },

  // ---------------- CAUTELA ----------------
  { a: ['metotrexato'], b: AINE, nivel: 'cautela',
    msg: 'Metotrexato + AINE: reduz a excreção do MTX (risco em doses altas / função renal reduzida). Cautela; evitar em disfunção renal.' },
  { a: ['metotrexato'], b: IBP, nivel: 'cautela',
    msg: 'Metotrexato (dose alta) + inibidor de bomba de prótons: pode reduzir a depuração do MTX. Cautela em doses altas; nas doses da reumatologia o risco é menor.' },
  { a: ['leflunomida'], b: ['metotrexato'], nivel: 'cautela',
    msg: 'Leflunomida + metotrexato: hepatotoxicidade aditiva. Monitorar transaminases de perto.' },
  { a: ['sulfassalazina'], b: TIOPURINA, nivel: 'cautela',
    msg: 'Sulfassalazina + azatioprina/mercaptopurina: mielotoxicidade aditiva. Monitorar hemograma.' },
  { a: ['colchicina'], b: ESTATINA, nivel: 'cautela',
    msg: 'Colchicina + estatina: maior risco de miopatia/rabdomiólise. Vigiar CPK e sintomas musculares.' },
  { a: ['colchicina'], b: FIBRATO, nivel: 'cautela',
    msg: 'Colchicina + fibrato (genfibrozila, ciprofibrato): risco aumentado de miopatia. Vigiar CPK e sintomas musculares.' },
  { a: ['ciclosporina', 'tacrolimus'], b: AINE, nivel: 'cautela',
    msg: 'Ciclosporina/tacrolimus + AINE: nefrotoxicidade aditiva. Monitorar função renal.' },
  { a: CORTICOIDE, b: AINE, nivel: 'cautela',
    msg: 'Corticoide + AINE: maior risco de úlcera/sangramento gastrointestinal. Considerar protetor gástrico e evitar uso prolongado.' },
  { a: CORTICOIDE, b: FLUOROQUINOLONA, nivel: 'cautela',
    msg: 'Corticoide + fluoroquinolona (cipro/levofloxacino): risco aumentado de tendinite/ruptura de tendão, sobretudo em idosos.' },
  { a: AINE, b: IECA_BRA, nivel: 'cautela',
    msg: 'AINE + IECA/BRA: reduz o efeito anti-hipertensivo e soma nefrotoxicidade. Monitorar PA e função renal (atenção à “tripla” com diurético).' },
  { a: AINE, b: DIURETICO, nivel: 'cautela',
    msg: 'AINE + diurético: reduz o efeito diurético/anti-hipertensivo e piora a função renal. Cautela, sobretudo com IECA/BRA associado (tripla whammy).' },
  { a: AINE, b: ['litio'], nivel: 'cautela',
    msg: 'AINE + lítio: aumenta a litemia (risco de toxicidade). Monitorar níveis de lítio.' },
  { a: AINE, b: ISRS, nivel: 'cautela',
    msg: 'AINE + antidepressivo serotoninérgico (ISRS/duloxetina/venlafaxina): risco aumentado de sangramento gastrointestinal. Considerar proteção gástrica.' },
  { a: ['hidroxicloroquina', 'cloroquina'], b: QT_LONGO, nivel: 'cautela',
    msg: 'Hidroxicloroquina/cloroquina + droga que prolonga o QT (azitromicina, ondansetrona, amiodarona, alguns antipsicóticos/ISRS): risco de prolongamento do QT. Avaliar ECG em pacientes de risco.' },
  { a: ['hidroxicloroquina', 'cloroquina'], b: ['digoxina'], nivel: 'cautela',
    msg: 'Hidroxicloroquina + digoxina: pode aumentar a digoxinemia. Monitorar níveis de digoxina.' },
];

// Recebe uma lista de textos (medicamentos da receita + medicações em uso + antecedentes) e devolve os alertas.
export function checkInteracoes(textos: string[]): { nivel: NivelInteracao; msg: string }[] {
  const t = textos.map(norm).filter(Boolean);
  const presentes = (kws: string[]) => kws.filter((k) => t.some((x) => x.includes(k)));
  const contem = (kws: string[]) => presentes(kws).length > 0;
  const out: { nivel: NivelInteracao; msg: string }[] = [];
  const vistos = new Set<string>();
  for (const r of REGRAS) {
    const hit = r.mesmo ? presentes(r.a).length >= 2 : (contem(r.a) && contem(r.b));
    if (hit && !vistos.has(r.msg)) {
      vistos.add(r.msg);
      out.push({ nivel: r.nivel, msg: r.msg });
    }
  }
  // grave primeiro
  return out.sort((x, y) => (x.nivel === 'grave' ? 0 : 1) - (y.nivel === 'grave' ? 0 : 1));
}
