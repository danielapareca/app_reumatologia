import NavRail from './NavRail';
import { createClient } from '@/lib/supabase/server';

// Casca das telas autenticadas: rail de navegação à esquerda + conteúdo à direita.
export default async function AppShell({ children }: { children: React.ReactNode }) {
  let isAdmin = false;
  try {
    const supabase = createClient();
    const { data } = await supabase.rpc('is_admin');
    isAdmin = data === true;
  } catch {
    isAdmin = false;
  }
  return (
    <>
      <NavRail isAdmin={isAdmin} />
      <div className="app-main">{children}</div>
    </>
  );
}
