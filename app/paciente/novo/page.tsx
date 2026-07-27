'use client';

import { useEffect, useRef, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import NavRail from '@/components/NavRail';
import Icon from '@/components/Icon';
import { createClient } from '@/lib/supabase/client';
import { createPatient, type NewPatientResult } from './actions';
import { addExamValue } from '@/app/paciente/[id]/examActions';
import { idadeFromNascimento } from '@/lib/util';

function SaveBtn({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending} style={{ maxWidth: 280 }}>
      {pending ? 'Cadastrando…' : label}
    </button>
  );
}

const initial: NewPatientResult = {};

type Campos = {
  nome: string; nascimento: string; idade: string; whats: string; cpf: string;
  email: string; endereco: string; cidade: string; estado: string; cep: string;
};
const vazio: Campos = { nome: '', nascimento: '', idade: '', whats: '', cpf: '', email: '', endereco: '', cidade: '', estado: '', cep: '' };

type ExamePend = { marcador: string; valor: string; unidade: string; data: string; incluir: boolean };
type ArqPend = { file: File; nome: string };

function hojeISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function NovoPaciente() {
  const router = useRouter();
  const [state, formAction] = useFormState(createPatient, initial);
  const [f, setF] = useState<Campos>(vazio);
  const upd = (k: keyof Campos, v: string) => setF((p) => ({ ...p, [k]: v }));
  const today = hojeISO();

  function onNascimento(v: string) {
    setF((p) => {
      const calc = idadeFromNascimento(v);
      return { ...p, nascimento: v, idade: calc || p.idade };
    });
  }

  // ---- leitura de print dos DADOS DO PACIENTE ----
  const [lendoDados, setLendoDados] = useState(false);
  const [dadosErr, setDadosErr] = useState('');
  const [dadosOk, setDadosOk] = useState('');

  async function lerDados(file: File) {
    setDadosErr(''); setDadosOk('');
    if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) { setDadosErr('Para os dados do paciente, envie um print/foto (JPG, PNG ou WEBP).'); return; }
    if (file.size > 6 * 1024 * 1024) { setDadosErr('Imagem muito grande (máx 6 MB).'); return; }
    setLendoDados(true);
    try {
      const b64 = await lerBase64(file);
      const resp = await fetch('/api/extract-paciente', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: b64, mediaType: file.type }),
      });
      const j = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(j.error || 'Falha ao ler a imagem.');
      const d = (j.dados || {}) as Partial<Campos>;
      const idade = d.idade || (d.nascimento ? idadeFromNascimento(d.nascimento) || '' : '');
      setF((p) => ({
        nome: d.nome || p.nome, nascimento: d.nascimento || p.nascimento, idade: idade || p.idade,
        whats: d.whats || p.whats, cpf: d.cpf || p.cpf, email: d.email || p.email,
        endereco: d.endereco || p.endereco, cidade: d.cidade || p.cidade,
        estado: d.estado || p.estado, cep: d.cep || p.cep,
      }));
      const achou = Object.values(d).filter((x) => String(x || '').trim()).length;
      if (!achou) setDadosErr('Não consegui ler dados do paciente nessa imagem. Confira o print ou preencha manualmente.');
      else setDadosOk(`Li os dados do print (${achou} campo(s)). Revise abaixo.`);
    } catch (e) {
      setDadosErr(e instanceof Error ? e.message : 'Falha ao ler a imagem.');
    } finally {
      setLendoDados(false);
    }
  }

  // ---- leitura de EXAMES (PDF ou foto), múltiplos, guardados até cadastrar ----
  const [lendoEx, setLendoEx] = useState(false);
  const [exErr, setExErr] = useState('');
  const [exames, setExames] = useState<ExamePend[]>([]);
  const [arquivos, setArquivos] = useState<ArqPend[]>([]);
  const updEx = (i: number, patch: Partial<ExamePend>) => setExames((a) => a.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));

  async function lerExames(files: File[]) {
    setExErr('');
    for (const file of files) {
      const isPdf = file.type === 'application/pdf';
      const isImg = /^image\/(jpeg|png|webp|gif)$/.test(file.type);
      if (!isPdf && !isImg) { setExErr('Envie exames em PDF ou foto (JPG, PNG ou WEBP).'); continue; }
      if (file.size > 6 * 1024 * 1024) { setExErr(`"${file.name}" é muito grande (máx 6 MB).`); continue; }
      setLendoEx(true);
      try {
        const b64 = await lerBase64(file);
        const payload = isPdf ? { pdfBase64: b64 } : { imageBase64: b64, mediaType: file.type };
        const resp = await fetch('/api/extract-exames', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const j = await resp.json().catch(() => ({}));
        if (!resp.ok) throw new Error(j.error || 'Falha ao ler o exame.');
        const vals: ExamePend[] = (j.valores || []).map((v: { marcador?: string; valor?: number; unidade?: string; data?: string }) => ({
          marcador: String(v.marcador || ''), valor: String(v.valor ?? ''), unidade: String(v.unidade || ''),
          data: v.data || today, incluir: true,
        }));
        setArquivos((a) => [...a, { file, nome: file.name || 'exame' }]);
        if (vals.length) setExames((a) => [...a, ...vals]);
        else setExErr((prev) => prev || `Nenhum valor numérico foi reconhecido em "${file.name}". O arquivo será guardado mesmo assim.`);
      } catch (e) {
        setExErr(e instanceof Error ? e.message : 'Falha ao ler o exame.');
      } finally {
        setLendoEx(false);
      }
    }
  }

  // ---- após cadastrar: salva exames e arquivos no paciente novo, depois abre a ficha ----
  const [finalizando, setFinalizando] = useState(false);
  const jaFinalizou = useRef(false);
  useEffect(() => {
    if (!state.id || jaFinalizou.current) return;
    jaFinalizou.current = true;
    const pid = state.id;
    (async () => {
      setFinalizando(true);
      // 1) salva os valores de exame revisados
      for (const e of exames) {
        if (!e.incluir) continue;
        const n = parseFloat((e.valor || '').replace(',', '.'));
        if (!e.marcador.trim() || !isFinite(n) || !e.data) continue;
        try { await addExamValue({ patientId: pid, marcador: e.marcador, valor: n, unidade: e.unidade, data: e.data, tipo: 'lab' }); } catch { /* ignora */ }
      }
      // 2) guarda os arquivos originais (best-effort)
      if (arquivos.length) {
        try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            for (const { file, nome } of arquivos) {
              const safe = nome.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 60);
              const path = `${user.id}/${pid}/${Date.now()}-${safe}`;
              const up = await supabase.storage.from('exames').upload(path, file, { contentType: file.type || 'application/octet-stream', upsert: false });
              if (!up.error) {
                await supabase.from('exam_files').insert({ patient_id: pid, doctor_id: user.id, path, filename: nome, data: today });
              }
            }
          }
        } catch { /* ignora — segue para a ficha */ }
      }
      router.push(`/paciente/${pid}`);
    })();
  }, [state.id, exames, arquivos, router, today]);

  const incluidos = exames.filter((e) => e.incluir).length;

  return (
    <>
      <NavRail isAdmin={false} />
      <div className="app-main">
      <div className="page">
        <p className="eyebrow">Novo paciente</p>
        <h2>Cadastro de paciente</h2>
        <p className="psub">Um lugar só: mande o <b>print do sistema</b> e os <b>exames</b> (PDF ou foto) e a IA preenche. Você também pode <b>preencher sozinho</b>. Tudo é revisado antes de cadastrar.</p>

        {/* CENTRAL DE DOCUMENTOS — tudo num lugar */}
        <div className="docs-central">
          <div className="dc-head"><Icon name="sparkles" size={17} /> Central de documentos — a IA preenche pra você</div>

          <div className="dc-grid">
            {/* Dados do paciente */}
            <div className="dc-col">
              <div className="dc-t"><Icon name="user" size={14} /> Dados do paciente</div>
              <p className="dc-s">Print/foto da tela de cadastro do seu sistema. Preenche o formulário abaixo.</p>
              <div className="dc-btns">
                <label className={'btn-ghost' + (lendoDados ? ' disabled' : '')}>
                  Anexar print
                  <input type="file" accept="image/*" disabled={lendoDados} style={{ display: 'none' }}
                    onChange={(e) => { const file = e.target.files?.[0]; if (file) lerDados(file); e.target.value = ''; }} />
                </label>
                <label className={'btn-ghost' + (lendoDados ? ' disabled' : '')}>
                  Tirar foto
                  <input type="file" accept="image/*" capture="environment" disabled={lendoDados} style={{ display: 'none' }}
                    onChange={(e) => { const file = e.target.files?.[0]; if (file) lerDados(file); e.target.value = ''; }} />
                </label>
              </div>
              {lendoDados && <div className="dc-busy">Lendo a imagem com IA…</div>}
              {dadosErr && <div className="auth-err" style={{ marginTop: 8 }}>{dadosErr}</div>}
              {dadosOk && <div className="dc-ok">{dadosOk}</div>}
            </div>

            {/* Exames */}
            <div className="dc-col">
              <div className="dc-t"><Icon name="chart" size={14} /> Exames</div>
              <p className="dc-s">PDF ou foto dos laudos (pode mandar vários). Viram gráfico e ficam guardados na ficha.</p>
              <div className="dc-btns">
                <label className={'btn-ghost' + (lendoEx ? ' disabled' : '')}>
                  Anexar PDF/foto
                  <input type="file" accept="application/pdf,image/*" multiple disabled={lendoEx} style={{ display: 'none' }}
                    onChange={(e) => { const fs = Array.from(e.target.files || []); if (fs.length) lerExames(fs); e.target.value = ''; }} />
                </label>
                <label className={'btn-ghost' + (lendoEx ? ' disabled' : '')}>
                  Tirar foto
                  <input type="file" accept="image/*" capture="environment" disabled={lendoEx} style={{ display: 'none' }}
                    onChange={(e) => { const fs = Array.from(e.target.files || []); if (fs.length) lerExames(fs); e.target.value = ''; }} />
                </label>
              </div>
              {lendoEx && <div className="dc-busy">Lendo os exames com IA…</div>}
              {exErr && <div className="auth-err" style={{ marginTop: 8 }}>{exErr}</div>}
              {arquivos.length > 0 && <div className="dc-ok">{arquivos.length} arquivo(s) anexado(s){incluidos > 0 ? ` · ${incluidos} valor(es) de exame lidos` : ''}. Serão salvos ao cadastrar.</div>}
            </div>
          </div>

          {/* revisão dos exames lidos */}
          {exames.length > 0 && (
            <div className="dc-exlist">
              <div className="dc-exhead">Exames lidos — revise, corrija e desmarque o que não quiser:</div>
              {exames.map((e, i) => (
                <div key={i} className="dc-exrow">
                  <input type="checkbox" checked={e.incluir} onChange={(ev) => updEx(i, { incluir: ev.target.checked })} />
                  <input value={e.marcador} onChange={(ev) => updEx(i, { marcador: ev.target.value })} placeholder="Exame" style={{ width: 140 }} />
                  <input value={e.valor} onChange={(ev) => updEx(i, { valor: ev.target.value })} placeholder="Valor" inputMode="decimal" style={{ width: 70 }} />
                  <input value={e.unidade} onChange={(ev) => updEx(i, { unidade: ev.target.value })} placeholder="Un." style={{ width: 64 }} />
                  <input type="date" value={e.data} onChange={(ev) => updEx(i, { data: ev.target.value })} style={{ width: 150 }} />
                </div>
              ))}
            </div>
          )}
        </div>

        <form action={formAction} style={{ maxWidth: 560 }}>
          {state.error && <div className="auth-err">{state.error}</div>}

          <div className="field">
            <label>Nome do paciente *</label>
            <input name="nome" placeholder="Nome completo" required autoFocus value={f.nome} onChange={(e) => upd('nome', e.target.value)} />
          </div>
          <div className="row2">
            <div className="field">
              <label>Data de nascimento</label>
              <input name="nascimento" type="date" value={f.nascimento} onChange={(e) => onNascimento(e.target.value)} />
            </div>
            <div className="field">
              <label>Idade (preenchida pela data)</label>
              <input name="idade" value={f.idade} onChange={(e) => upd('idade', e.target.value)} placeholder="ex.: 54 anos" />
            </div>
          </div>
          <div className="row2">
            <div className="field">
              <label>WhatsApp</label>
              <input name="whats" placeholder="(11) 90000-0000" value={f.whats} onChange={(e) => upd('whats', e.target.value)} />
            </div>
            <div className="field">
              <label>CPF</label>
              <input name="cpf" placeholder="000.000.000-00" value={f.cpf} onChange={(e) => upd('cpf', e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label>E-mail</label>
            <input name="email" type="email" placeholder="email@exemplo.com" value={f.email} onChange={(e) => upd('email', e.target.value)} />
          </div>

          <div className="field">
            <label>Endereço (rua, número, bairro)</label>
            <input name="endereco" placeholder="Rua Exemplo, 123, Centro" value={f.endereco} onChange={(e) => upd('endereco', e.target.value)} />
          </div>
          <div className="row2">
            <div className="field">
              <label>Cidade</label>
              <input name="cidade" placeholder="Cidade" value={f.cidade} onChange={(e) => upd('cidade', e.target.value)} />
            </div>
            <div className="field">
              <label>Estado (UF)</label>
              <input name="estado" placeholder="SP" maxLength={2} value={f.estado} onChange={(e) => upd('estado', e.target.value)} />
            </div>
          </div>
          <div className="field" style={{ maxWidth: 200 }}>
            <label>CEP</label>
            <input name="cep" placeholder="00000-000" value={f.cep} onChange={(e) => upd('cep', e.target.value)} />
          </div>

          <label className="consent-box">
            <input type="checkbox" name="consent" />
            <span>O paciente <b>consente</b> com o registro e o tratamento dos seus dados de saúde para acompanhamento clínico, conforme a LGPD. <span className="consent-hint">(A data e hora ficam registradas.)</span></span>
          </label>

          {finalizando
            ? <button type="button" className="btn-primary" disabled style={{ maxWidth: 280 }}>Salvando exames e abrindo a ficha…</button>
            : <SaveBtn label={incluidos > 0 || arquivos.length > 0 ? 'Cadastrar, salvar exames e atender' : 'Cadastrar e atender'} />}
        </form>
      </div>
      </div>
    </>
  );
}

function lerBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result).split(',')[1] || '');
    r.onerror = () => rej(new Error('Falha ao ler o arquivo.'));
    r.readAsDataURL(file);
  });
}
