'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from './Icon';

// Barra de navegação vertical (rail) à esquerda — identidade Condutas.
export default function NavRail({ isAdmin }: { isAdmin: boolean }) {
  const path = usePathname() || '/';
  const items: { href: string; icon: string; label: string; on: boolean }[] = [
    { href: '/', icon: 'users', label: 'Pacientes', on: path === '/' || path.startsWith('/paciente') },
    ...(isAdmin ? [{ href: '/gestor', icon: 'dashboard', label: 'Gestor', on: path.startsWith('/gestor') }] : []),
    { href: '/perfil', icon: 'user', label: 'Perfil', on: path.startsWith('/perfil') },
  ];

  return (
    <nav className="navrail no-print" aria-label="Navegação">
      <Link href="/" className="nr-logo" title="Condutas"><Icon name="activity" size={22} /></Link>
      <div className="nr-items">
        {items.map((it) => (
          <Link key={it.href} href={it.href} className={'nr-link' + (it.on ? ' on' : '')} title={it.label} aria-label={it.label}>
            <Icon name={it.icon} size={20} />
            <span className="nr-label">{it.label}</span>
          </Link>
        ))}
      </div>
      <form action="/auth/signout" method="post" className="nr-out">
        <button type="submit" className="nr-link" title="Sair" aria-label="Sair"><Icon name="logout" size={20} /><span className="nr-label">Sair</span></button>
      </form>
    </nav>
  );
}
