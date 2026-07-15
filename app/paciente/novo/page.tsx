'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import NavRail from '@/components/NavRail';
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

export default function NovoPaciente() {
  const [state, formAction] = useFormState(createPatient, initial);
  const [nascimento, setNascimento] = useState('');
  const [idade, setIdade] = useState('');

  function onNascimento(v: string) {
    setNascimento(v);
    const calc = idadeFromNascimento(v);
    if (calc) setIdade(calc);
  }

  return (
    <>
      <NavRail isAdmin={false} />
      <div className="app-main">
      <div className="page">
        <p className="eyebrow">Novo paciente</p>
        <h2>Cadastro de paciente</h2>
        <p className="psub">Dados básicos do paciente. Você poderá editar e atender em seguida.</p>

        <form action={formAction} style={{ maxWidth: 560 }}>
          {state.error && <div className="auth-err">{state.error}</div>}

          <div className="field">
            <label>Nome do paciente *</label>
            <input name="nome" placeholder="Nome completo" required autoFocus />
          </div>
          <div className="row2">
            <div className="field">
              <label>Data de nascimento</label>
              <input name="nascimento" type="date" value={nascimento} onChange={(e) => onNascimento(e.target.value)} />
            </div>
            <div className="field">
              <label>Idade (preenchida pela data)</label>
              <input name="idade" value={idade} onChange={(e) => setIdade(e.target.value)} placeholder="ex.: 54 anos" />
            </div>
          </div>
          <div className="row2">
            <div className="field">
              <label>WhatsApp</label>
              <input name="whats" placeholder="(11) 90000-0000" />
            </div>
            <div className="field">
              <label>CPF</label>
              <input name="cpf" placeholder="000.000.000-00" />
            </div>
          </div>
          <div className="field">
            <label>E-mail</label>
            <input name="email" type="email" placeholder="email@exemplo.com" />
          </div>

          <div className="field">
            <label>Endereço (rua, número, bairro)</label>
            <input name="endereco" placeholder="Rua Exemplo, 123, Centro" />
          </div>
          <div className="row2">
            <div className="field">
              <label>Cidade</label>
              <input name="cidade" placeholder="Cidade" />
            </div>
            <div className="field">
              <label>Estado (UF)</label>
              <input name="estado" placeholder="SP" maxLength={2} />
            </div>
          </div>
          <div className="field" style={{ maxWidth: 200 }}>
            <label>CEP</label>
            <input name="cep" placeholder="00000-000" />
          </div>

          <SaveBtn />
        </form>
      </div>
      </div>
    </>
  );
}
