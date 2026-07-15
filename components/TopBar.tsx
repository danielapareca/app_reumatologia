import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

// Barra superior com navegação e logout. Server Component (assíncrono).
// Mostra "Painel do gestor" apenas para administradores.
export default async function TopBar({ title }: { title: string }) {
  let isAdmin = false;
  try {
    const supabase = createClient();
    const { data } = await supabase.rpc('is_admin');
    isAdmin = data === true;
  } catch {
    isAdmin = false; // função ainda não criada no banco → simplesmente não mostra o link
  }

  return (
    <div className="topbar no-print">
      <span className="tag">Condutas</span>
      <h1>{title}</h1>
      <span className="spacer" />
      <Link className="navlink" href="/">Pacientes</Link>
      {isAdmin && <Link className="navlink" href="/gestor">Painel do gestor</Link>}
      <Link className="navlink" href="/perfil">Meu perfil</Link>
      <form action="/auth/signout" method="post" style={{ display: 'inline' }}>
        <button className="navlink" type="submit" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
          Sair
        </button>
      </form>
    </div>
  );
}
