import { createClient } from '@/lib/supabase/server';
import AppShell from '@/components/AppShell';
import ProfileForm from './ProfileForm';
import type { Profile } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function PerfilPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .maybeSingle();

  const initial: Partial<Profile> = profile || {
    nome: (user?.user_metadata?.nome as string) || '',
    especialidade: 'Reumatologia',
  };

  return (
    <AppShell>
      <div className="page">
        <p className="eyebrow">Meu perfil</p>
        <h2>Cabeçalho do médico</h2>
        <p className="psub">
          Estes dados formam o cabeçalho das receitas e dos pedidos, e preenchem a LME automaticamente.
          Ficam salvos e valem para todos os atendimentos.
        </p>
        <ProfileForm initial={initial} email={user?.email || ''} />
      </div>
    </AppShell>
  );
}
