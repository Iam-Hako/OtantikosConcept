import { Metadata } from 'next';
import { actionGetUsers } from '@/app/actions/ecommerce-actions';
import AdminUsersClientView from './AdminUsersClientView';

export const metadata: Metadata = {
  title: 'Kullanıcılar & Yetkilendirme | Otantik Konsept Yönetim',
  description: 'Kayıtlı kullanıcıları ve yönetici rollerini yönetin.',
};

export const dynamic = 'force-dynamic';

export default async function KullanicilarPage() {
  const res = await actionGetUsers();
  const initialUsers = res.success && res.data ? res.data : [];
  const initialCurrentUserId = res.currentUserId || null;

  return (
    <AdminUsersClientView 
      initialUsers={initialUsers} 
      initialCurrentUserId={initialCurrentUserId} 
    />
  );
}
