'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useState } from 'react';
import Icon from '@/components/Icon';
import { login, signup, type AuthResult } from './actions';
import { DISCLAIMER_LONGO } from '@/lib/disclaimer';

function SubmitBtn({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? 'Aguarde…' : label}
    </button>
  );
}

const initial: AuthResult = {};

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const action = mode === 'login' ? login : signup;
  const [state, formAction] = useFormState(action, initial);

  return (
    <div className="auth-split">
      <div className="auth-left">
        <div className="auth-brand"><span className="auth-logo"><Icon name="activity" size={22} /></span> Condutas</div>
        <div className="auth-left-mid">
          <h2 className="auth-headline">O raciocínio clínico em reumatologia, do exame à conduta.</h2>
          <p className="auth-tagline">Anamnese guiada, escores e calculadoras, insight fundamentado em diretrizes e documentos oficiais — em um só atendimento.</p>
        </div>
        <div className="auth-safety"><Icon name="shield" size={16} /> Apoio ao médico — não substitui o médico.</div>
      </div>
      <div className="auth-right">
      <div className="auth-card">
        <span className="tag auth-card-brand">Condutas</span>
        <h1 style={{ marginTop: 4 }}>{mode === 'login' ? 'Entrar' : 'Criar conta de médico'}</h1>
        <p className="sub">
          {mode === 'login'
            ? 'Apoio ao reumatologista — anamnese, escores, insight, receita, exames e LME.'
            : 'Cadastre-se para começar a atender.'}
        </p>

        {state.error && <div className="auth-err">{state.error}</div>}
        {state.message && <div className="auth-ok">{state.message}</div>}

        <form action={formAction}>
          {mode === 'signup' && (
            <div className="field">
              <label>Nome do médico</label>
              <input name="nome" placeholder="Dr(a). Nome Sobrenome" autoComplete="name" />
            </div>
          )}
          <div className="field">
            <label>E-mail</label>
            <input name="email" type="email" placeholder="voce@exemplo.com" autoComplete="email" required />
          </div>
          <div className="field">
            <label>Senha</label>
            <input name="password" type="password" placeholder="••••••••" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required />
          </div>
          <SubmitBtn label={mode === 'login' ? 'Entrar' : 'Criar conta'} />
        </form>

        <div className="auth-switch">
          {mode === 'login' ? (
            <>
              Ainda não tem conta?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); setMode('signup'); }}>
                Criar conta
              </a>
            </>
          ) : (
            <>
              Já tem conta?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); setMode('login'); }}>
                Entrar
              </a>
            </>
          )}
        </div>
        <p style={{ fontSize: 10.5, color: 'var(--muted)', lineHeight: 1.5, marginTop: 16, textAlign: 'center' }}>
          {DISCLAIMER_LONGO}
        </p>
      </div>
      </div>
    </div>
  );
}
