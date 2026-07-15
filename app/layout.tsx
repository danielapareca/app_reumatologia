import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'App Reumatologia',
  description: 'Gerador de pedidos, receitas e LME — apoio ao médico reumatologista.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
