import AppShell from '@/components/AppShell';
import AskClient from './AskClient';

export const dynamic = 'force-dynamic';

export default function AssistentePage() {
  return (
    <AppShell>
      <AskClient />
    </AppShell>
  );
}
