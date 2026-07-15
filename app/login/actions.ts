'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export interface AuthResult {
  error?: string;
  message?: string;
}

export async function login(_prev: AuthResult, formData: FormData): Promise<AuthResult> {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  if (!email || !password) return { error: 'Preencha e-mail e senha.' };

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: 'E-mail ou senha inválidos.' };
  }
  redirect('/');
}

export async function signup(_prev: AuthResult, formData: FormData): Promise<AuthResult> {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const nome = String(formData.get('nome') || '').trim();
  if (!email || !password) return { error: 'Preencha e-mail e senha.' };
  if (password.length < 6) return { error: 'A senha precisa ter ao menos 6 caracteres.' };

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nome } },
  });
  if (error) {
    return { error: error.message };
  }

  // Se o e-mail já vier confirmado (confirmação desativada), cria o perfil e entra.
  if (data.session) {
    await supabase.from('profiles').upsert({ id: data.user!.id, nome, especialidade: 'Reumatologia' });
    redirect('/');
  }
  return { message: 'Conta criada. Verifique seu e-mail para confirmar o cadastro e depois faça login.' };
}
