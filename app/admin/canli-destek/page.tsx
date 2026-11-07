import { Metadata } from 'next';
import { DataService, deduplicateLiveChatMessages } from '@/lib/data/store-data';
import AdminLiveChatClientView from './AdminLiveChatClientView';

export const metadata: Metadata = {
  title: 'Canlı Destek Masası | Otantik Konsept Yönetim',
  description: 'Müşterilerle gerçek zamanlı canlı destek mesajlaşması.',
};

export const dynamic = 'force-dynamic';

export default async function AdminLiveChatPage() {
  const rawList = await DataService.getChatSessions();
  const initialSessions = rawList.map((s) => ({
    ...s,
    messages: s.messages ? deduplicateLiveChatMessages(s.messages) : [],
  }));

  return <AdminLiveChatClientView initialSessions={initialSessions} />;
}
