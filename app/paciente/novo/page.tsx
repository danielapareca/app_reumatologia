'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { createPatient, type NewPatientResult } from './actions';

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

  return (
    <>
      <div className="topbar no-print">
        <span className="tag">Reumatologia</span>
        <h1>Novo paciente</h1>
        <span className="spacer" />
        <Link className="navlink" href="/">Voltar</Link>
      </div>
      <div className="page">
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
              <label>Idade</label>
              <input name="idade" placeholder="ex.: 54 anos" />
            </div>
            <div className="field">
              <label>Data de nascimento</label>
              <input name="nascimento" type="date" />
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
            <label>Endereço</label>
            <input name="endereco" placeholder="Rua, nº, bairro, cidade - UF" />
          </div>

          <SaveBtn />
        </form>
      </div>
    </>
  );
}
