import { requireAuth } from '@/lib/auth/guards';
import SelfCheckDefaultsEditor from '@/components/admin/SelfCheckDefaultsEditor';

export default async function SelfCheckDefaultsPage() {
  await requireAuth('admin');

  return <SelfCheckDefaultsEditor />;
}
