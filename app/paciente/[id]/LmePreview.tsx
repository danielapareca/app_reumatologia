'use client';

// Réplica oficial da LME (Componente Especializado) com campos editáveis.
// Portado de renderLME() de gerador_v3.html.

export interface LmeMed {
  m: string;
  q: string;
}

export interface LmeFields {
  cnes: string;
  estab: string;
  paciente: string;
  mae: string;
  peso: string;
  altura: string;
  cid: string;
  diagnostico: string;
  anamnese: string;
  medico: string;
  cnsMed: string;
  data: string;
  telefone: string;
  documento: string;
  email: string;
}

export default function LmePreview({
  fields,
  setField,
  meds,
  setMeds,
  onDownload,
  downloading,
  onGerarAnamnese,
  gerandoAnamnese,
}: {
  fields: LmeFields;
  setField: (k: keyof LmeFields, v: string) => void;
  meds: LmeMed[];
  setMeds: (meds: LmeMed[]) => void;
  onDownload: () => void;
  downloading: boolean;
  onGerarAnamnese?: () => void;
  gerandoAnamnese?: boolean;
}) {
  // 6 linhas fixas de medicamento.
  const rows = Array.from({ length: 6 }, (_, i) => meds[i] || { m: '', q: '' });

  const updMed = (i: number, patch: Partial<LmeMed>) => {
    const next = rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r));
    setMeds(next);
  };

  return (
    <div className="doc-wrap" id="wrapLME">
      <div className="doc-tools no-print">
        <span className="dt-name">LME — Componente Especializado</span>
        <span className="dt-btns">
          <button className="btn-primary" onClick={onDownload} disabled={downloading}>
            {downloading ? 'Gerando…' : 'Baixar PDF oficial'}
          </button>
        </span>
      </div>
      <article className="doc lme-doc" id="docLME">
        <div className="lme2">
          <div className="hdr">
            <div className="sus">SUS</div>
            <div className="gov">Sistema Único de Saúde<br />Ministério da Saúde<br />Secretaria de Estado da Saúde</div>
          </div>
          <div className="titlebar">COMPONENTE ESPECIALIZADO DA ASSISTÊNCIA FARMACÊUTICA</div>
          <div className="titlebar">LAUDO DE SOLICITAÇÃO, AVALIAÇÃO E AUTORIZAÇÃO DE MEDICAMENTO(S)</div>
          <div className="subbar dark2">SOLICITAÇÃO DE MEDICAMENTO(S)</div>
          <div className="subbar">CAMPOS DE PREENCHIMENTO EXCLUSIVO PELO MÉDICO SOLICITANTE</div>

          <div className="g2a">
            <div className="cell"><span className="lbl">1- Número do CNES*</span><input className="f" value={fields.cnes} onChange={(e) => setField('cnes', e.target.value)} /></div>
            <div className="cell bl"><span className="lbl">2- Nome do estabelecimento de saúde solicitante</span><input className="f" value={fields.estab} onChange={(e) => setField('estab', e.target.value)} /></div>
          </div>

          <div className="g2b">
            <div className="cell"><span className="lbl">3- Nome completo do Paciente*</span><input className="f" value={fields.paciente} onChange={(e) => setField('paciente', e.target.value)} /></div>
            <div className="cell bl"><span className="lbl">5- Peso do paciente*</span><input className="f" style={{ width: 'calc(100% - 20px)' }} value={fields.peso} onChange={(e) => setField('peso', e.target.value)} /> kg</div>
          </div>
          <div className="g2b">
            <div className="cell"><span className="lbl">4- Nome da Mãe do Paciente*</span><input className="f" value={fields.mae} onChange={(e) => setField('mae', e.target.value)} /></div>
            <div className="cell bl"><span className="lbl">6- Altura do paciente*</span><input className="f" style={{ width: 'calc(100% - 22px)' }} value={fields.altura} onChange={(e) => setField('altura', e.target.value)} /> cm</div>
          </div>

          <table className="med">
            <thead>
              <tr><td className="rn"></td><td rowSpan={2} className="mh">7- Medicamento(s)*</td><td colSpan={6} className="mh">8- Quantidade solicitada*</td></tr>
              <tr><td className="rn"></td><td>1º mês</td><td>2º mês</td><td>3º mês</td><td>4º mês</td><td>5º mês</td><td>6º mês</td></tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td className="rn">{i + 1}</td>
                  <td><input className="f" value={r.m} onChange={(e) => updMed(i, { m: e.target.value })} /></td>
                  <td><input className="f qm" value={r.q} onChange={(e) => updMed(i, { q: e.target.value })} /></td>
                  <td><input className="f qm" /></td>
                  <td><input className="f qm" /></td>
                  <td><input className="f qm" /></td>
                  <td><input className="f qm" /></td>
                  <td><input className="f qm" /></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="g2c">
            <div className="cell"><span className="lbl">9- CID-10*</span><input className="f" value={fields.cid} onChange={(e) => setField('cid', e.target.value)} /></div>
            <div className="cell bl"><span className="lbl">10- Diagnóstico</span><input className="f" value={fields.diagnostico} onChange={(e) => setField('diagnostico', e.target.value)} /></div>
          </div>

          <div className="cell">
            <span className="lbl">11- Anamnese*</span>
            {onGerarAnamnese && (
              <button className="btn-ghost no-print" onClick={onGerarAnamnese} disabled={gerandoAnamnese} style={{ float: 'right', padding: '3px 8px', fontSize: 11 }}>
                {gerandoAnamnese ? 'Gerando…' : 'Redigir com IA'}
              </button>
            )}
            <textarea className="f ta" value={fields.anamnese} onChange={(e) => setField('anamnese', e.target.value)} />
          </div>

          <div className="cell">
            <span className="lbl">12- Paciente realizou tratamento prévio ou está em tratamento da doença?*</span>
            <label className="chk"><input type="checkbox" /> NÃO</label>
            <label className="chk"><input type="checkbox" /> SIM. Relatar:</label>
            <input className="f" style={{ width: '55%' }} />
          </div>

          <div className="cell">
            <span className="lbl ctr">13- Atestado de capacidade*</span>
            <div className="fine">A solicitação do medicamento deverá ser realizada pelo paciente. Entretanto, fica dispensada a obrigatoriedade da presença física do paciente considerado incapaz de acordo com os artigos 3º e 4º do Código Civil. O paciente é considerado incapaz?</div>
            <label className="chk"><input type="checkbox" /> NÃO</label>
            <label className="chk"><input type="checkbox" /> SIM. Indicar o nome do responsável, o qual poderá realizar a solicitação</label>
            <div style={{ marginTop: 3 }}><span className="lbl">Nome do responsável:</span> <input className="f" style={{ width: '70%' }} /></div>
          </div>

          <div className="g2d">
            <div className="cell"><span className="lbl">14- Nome do médico solicitante*</span><input className="f" value={fields.medico} onChange={(e) => setField('medico', e.target.value)} /></div>
            <div className="cell bl"><span className="lbl">17- Assinatura e carimbo do médico*</span><div className="sign"></div></div>
          </div>
          <div className="g2e">
            <div className="cell"><span className="lbl">15- Número do Cartão Nacional de Saúde (CNS) do médico solicitante*</span><input className="f" value={fields.cnsMed} onChange={(e) => setField('cnsMed', e.target.value)} /></div>
            <div className="cell bl"><span className="lbl">16- Data da solicitação*</span><input className="f" value={fields.data} onChange={(e) => setField('data', e.target.value)} /></div>
          </div>

          <div className="subbar left">18- CAMPOS ABAIXO PREENCHIDOS POR*:
            <label className="chk"><input type="checkbox" /> Paciente</label>
            <label className="chk"><input type="checkbox" /> Mãe do paciente</label>
            <label className="chk"><input type="checkbox" /> Responsável (item 13)</label>
            <label className="chk"><input type="checkbox" /> Médico solicitante</label>
            <label className="chk"><input type="checkbox" /> Outro:</label><input className="f" style={{ width: 120 }} /> e CPF <input className="f" style={{ width: 120 }} />
          </div>

          <div className="g2c">
            <div className="cell">
              <span className="lbl">19- Raça/Cor/Etnia informado pelo paciente ou responsável*</span>
              <label className="chk"><input type="checkbox" /> Branca</label>
              <label className="chk"><input type="checkbox" /> Preta</label>
              <label className="chk"><input type="checkbox" /> Parda</label>
              <label className="chk"><input type="checkbox" /> Amarela</label>
              <label className="chk"><input type="checkbox" /> Indígena. Etnia:</label><input className="f" style={{ width: '40%' }} />
            </div>
            <div className="cell bl"><span className="lbl">20- Telefone(s) para contato do paciente</span><input className="f" value={fields.telefone} onChange={(e) => setField('telefone', e.target.value)} /></div>
          </div>

          <div className="g2c">
            <div className="cell">
              <span className="lbl">21- Número do documento do paciente</span>
              <label className="chk"><input type="checkbox" /> CPF</label>
              <label className="chk"><input type="checkbox" /> CNS</label>
              <input className="f" style={{ width: '55%' }} value={fields.documento} onChange={(e) => setField('documento', e.target.value)} />
            </div>
            <div className="cell bl"><span className="lbl">23- Assinatura do responsável pelo preenchimento*</span><div className="sign"></div></div>
          </div>
          <div className="cell"><span className="lbl">22- Correio eletrônico do paciente</span><input className="f" value={fields.email} onChange={(e) => setField('email', e.target.value)} /></div>

          <div className="foot">* CAMPOS DE PREENCHIMENTO OBRIGATÓRIO</div>
        </div>
      </article>
    </div>
  );
}
