import type { Metadata } from 'next';
import { Manrope, Source_Serif_4 } from 'next/font/google';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-ui-src',
  display: 'swap',
});
const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-doc-src',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Condutas — apoio ao reumatologista',
  description: 'Anamnese guiada, escores, insight fundamentado em diretrizes, receita, exames e LME — apoio ao médico reumatologista.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${manrope.variable} ${sourceSerif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
