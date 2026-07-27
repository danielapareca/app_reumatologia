'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import NavRail from '@/components/NavRail';
import Icon from '@/components/Icon';
import { createPatient, type NewPatientResult } from './actions';
import { idadeFromNascimento } from '@/lib/util';

function SaveBtn() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending} style={{ maxWidth: 240 }}>
      {pending ? 'Cadastrando…' : 'Cadastrar e atender'}
    </button>
  );
}

const initial: NewPatientResult = {};

type Campos = {
  nome: string; nascimento: string; idade: string; whats: string; cpf: string;
  email: string; endereco: string; cidade: string; estado: string; cep: string;
};
const vazio: Campos = { nome: '', nascimento: '', idade: '', whats: '', cpf: '', email: '', endereco: '', cidade: '', estado: '', cep: '' };

export default function NovoPaciente() {
  const [state, formAction] = useFormState(createPatient, initial);
  const [f, setF] = useState<Campos>(vazio);
  const upd = (k: keyof Campos, v: string) => setF((p) => ({ ...p, [k]: v }));

  function onNascimento(v: string) {
    setF((p) => {
      const calc = idadeFromNascimento(v);
      return { ...p, nascimento: v, idade: calc || p.idade };
    });
  }

  // Leitura de print da tela do sistema da clínica → pré-preenche o cadastro.
  const [lendo, setLendo] = useState(false);
  const [leituraErr, setLeituraErr] = useState('');
  const [leituraOk, setLeituraOk] = useState('');

  async function lerPrint(file: File) {
    setLeituraErr(''); setLeituraOk('');
    if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) { setLeituraErr('Envie uma foto ou print (JPG, PNG ou WEBP).'); return; }
    if (file.size > 6 * 1024 * 1024) { setLeituraErr('Imagem muito grande (máx 6 MB).'); return; }
    setLendo(true);
    try {
      const b64 = await new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(String(r.result).split(',')[1] || '');
        r.onerror = () => rej(new Error('Falha ao ler o arquivo.'));
        r.readAsDataURL(file);
      });
      const resp = await fetch('/api/extract-paciente', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: b64, mediaType: file.type }),
      });
      const j = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(j.error || 'Falha ao ler a imagem.');
      const d = (j.dados || {}) as Partial<Campos>;
      const idade = d.idade || (d.nascimento ? idadeFromNascimento(d.nascimento) || '' : '');
      setF((p) => ({
        nome: d.nome || p.nome,
        nascimento: d.nascimento || p.nascimento,
        idade: idade || p.idade,
        whats: d.whats || p.whats,
        cpf: d.cpf || p.cpf,
        email: d.email || p.email,
        endereco: d.endereco || p.endereco,
        cidade: d.cidade || p.cidade,
        estado: d.estado || p.estado,
        cep: d.cep || p.cep,
      }));
      const achou = Object.values(d).filter((x) => String(x || '').trim()).length;
      if (!achou) setLeituraErr('Não consegui ler dados do paciente nessa imagem. Confira o print ou preencha manualmente.');
      else setLeituraOk(`Li os dados do print (${achou} campo(s)). Revise abaixo antes de cadastrar.`);
    } catch (e) {
      setLeituraErr(e instanceof Error ? e.message : 'Falha ao ler a imagem.');
    } finally {
      setLendo(false);
    }
  }

  return (
    <>
      <NavRail isAdmin={false} />
      <div className="app-main">
      <div className="page">
        <p className="eyebrow">Novo paciente</p>
        <h2>Cadastro de paciente</h2>
        <p className="psub">Dados básicos do paciente. Você pode <b>preencher sozinho</b> ou <b>tirar um print da tela do seu sistema</b> e deixar a IA preencher. Você revisa e edita antes de cadastrar.</p>

        <div className="ler-print">
          <div className="lp-head"><Icon name="sparkles" size={16} /> Abrir a ficha a partir do seu sistema</div>
          <p className="lp-sub">Anexe um <b>print da tela</b> (ou foto) do cadastro do paciente no sistema da clínica. A IA lê os dados e preenche o formulário — sem redigitar tudo.</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <label className={'btn-ghost' + (lendo ? ' disabled' : '')} style={{ cursor: lendo ? 'default' : 'pointer', height: 38, padding: '0 14px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              Anexar print / imagem
              <input type="file" accept="image/*" disabled={lendo} style={{ display: 'none' }}
                onChange={(e) => { const file = e.target.files?.[0]; if (file) lerPrint(file); e.target.value = ''; }} />
            </label>
            <label className={'btn-ghost' + (lendo ? ' disabled' : '')} style={{ cursor: lendo ? 'default' : 'pointer', height: 38, padding: '0 14px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              Tirar foto
              <input type="file" accept="image/*" capture="environment" disabled={lendo} style={{ display: 'none' }}
                onChange={(e) => { const file = e.target.files?.[0]; if (file) lerPrint(file); e.target.value = ''; }} />
            </label>
            {lendo && <span style={{ fontSize: 12, color: 'var(--muted)' }}>Lendo a imagem com IA…</span>}
          </div>
          {leituraErr && <div className="auth-err" style={{ marginTop: 8 }}>{leituraErr}</div>}
          {leituraOk && <div className="lp-ok">{leituraOk}</div>}
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

          <SaveBtn />
        </form>
      </div>
      </div>
    </>
  );
}
