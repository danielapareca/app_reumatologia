'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { saveProfile, type SaveResult } from './actions';
import type { Profile } from '@/lib/types';

function SaveBtn() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending} style={{ maxWidth: 220 }}>
      {pending ? 'Salvando…' : 'Salvar cabeçalho'}
    </button>
  );
}

const initialState: SaveResult = {};

export default function ProfileForm({ initial, email }: { initial: Partial<Profile>; email: string }) {
  const [state, formAction] = useFormState(saveProfile, initialState);

  return (
    <form action={formAction} style={{ maxWidth: 560 }}>
      {state.ok && <div className="auth-ok">Cabeçalho salvo com sucesso.</div>}
      {state.error && <div className="auth-err">{state.error}</div>}

      <div className="field">
        <label>E-mail de acesso</label>
        <input value={email} disabled />
      </div>
      <div className="field">
        <label>Nome do médico</label>
        <input name="nome" defaultValue={initial.nome || ''} placeholder="Dr(a). Nome Sobrenome" />
      </div>
      <div className="row2">
        <div className="field">
          <label>Especialidade</label>
          <input name="especialidade" defaultValue={initial.especialidade || 'Reumatologia'} />
        </div>
        <div className="field">
          <label>CRM (com UF)</label>
          <input name="crm" defaultValue={initial.crm || ''} placeholder="CRM/SP 000000" />
        </div>
      </div>
      <div className="field">
        <label>Clínica / instituição</label>
        <input name="clinica" defaultValue={initial.clinica || ''} placeholder="Nome da clínica" />
      </div>
      <div className="field">
        <label>Endereço / contato</label>
        <input name="endereco" defaultValue={initial.endereco || ''} placeholder="Rua, nº · telefone" />
      </div>
      <div className="row2">
        <div className="field">
          <label>Cidade</label>
          <input name="cidade" defaultValue={initial.cidade || ''} placeholder="Cidade - UF" />
        </div>
        <div className="field">
          <label>CNES (para LME)</label>
          <input name="cnes" defaultValue={initial.cnes || ''} placeholder="0000000" />
        </div>
      </div>
      <div className="field">
        <label>CNS do médico (para LME)</label>
        <input name="cns_medico" defaultValue={initial.cns_medico || ''} placeholder="000 0000 0000 0000" />
      </div>

      <SaveBtn />
    </form>
  );
}
