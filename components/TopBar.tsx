import Link from 'next/link';

// Barra superior com navegação e logout. Renderizada em Server Components.
export default function TopBar({ title }: { title: string }) {
  return (
    <div className="topbar no-print">
      <span className="tag">Reumatologia</span>
      <h1>{title}</h1>
      <span className="spacer" />
      <Link className="navlink" href="/">Pacientes</Link>
      <Link className="navlink" href="/perfil">Meu perfil</Link>
      <form action="/auth/signout" method="post" style={{ display: 'inline' }}>
        <button className="navlink" type="submit" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
          Sair
        </button>
      </form>
    </div>
  );
}
