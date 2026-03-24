import { Outlet } from 'react-router-dom';
import AppSidebar from '@/components/AppSidebar';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div className="ml-64">
        <Outlet />
      </div>
    </div>
  );
}
