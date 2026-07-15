// Tipos da lógica clínica portada do protótipo gerador_v3.

export interface RxItem {
  m: string; // medicamento / conduta
  p: string; // posologia / orientação
  q?: string; // quantidade (ex.: "24 comprimidos")
  ceaf?: boolean; // exige LME (Componente Especializado)
  aviso?: boolean; // receituário de controle especial
}

export interface Etapa {
  id: string;
  label: string;
  sub?: string;
  alerta?: boolean;
  itens: RxItem[];
  nota?: string;
}

export interface Disease {
  n: string; // nome
  cid: string;
  conf: string[]; // exames de confirmação
  basal?: string[]; // avaliação pré-tratamento
  etapas: Etapa[];
}

export type Diseases = Record<string, Disease>;

// Estado do questionário de avaliação.
export interface QState {
  consulta: 'primeira' | 'retorno';
  gestacao: 'nao' | 'sim' | 'na';
  renal: 'normal' | 'baixa' | 'desc';
  hepato: 'normal' | 'alt' | 'desc';
  infec: 'nao' | 'sim';
  comorb: string[]; // drc, hepato, gi, icc, tb
  alergia: string;
}

export const defaultQState: QState = {
  consulta: 'primeira',
  gestacao: 'nao',
  renal: 'normal',
  hepato: 'normal',
  infec: 'nao',
  comorb: [],
  alergia: '',
};
