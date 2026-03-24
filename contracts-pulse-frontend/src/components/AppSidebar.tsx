import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, LogOut, Zap, Receipt } from 'lucide-react';
import { motion } from 'framer-motion';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/clients', label: 'Clients', icon: Users },
  { to: '/contracts', label: 'Contracts', icon: FileText },
  { to: '/invoices', label: 'Invoices', icon: Receipt },
];

export default function AppSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-sidebar text-sidebar-foreground flex flex-col z-30">
      <div className="p-6 flex items-center gap-2">
        <Zap className="h-6 w-6 text-sidebar-primary" />
        <span className="text-xl font-bold text-sidebar-primary">ContractPulse</span>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {links.map((link) => {
          const active = location.pathname.startsWith(link.to);
          return (
            <motion.div key={link.to} whileHover={{ x: 4 }} transition={{ duration: 0.15 }}>
              <RouterNavLink
                to={link.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </RouterNavLink>
            </motion.div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <p className="text-sm font-medium truncate">{user?.name}</p>
        <p className="text-xs text-sidebar-muted truncate">{user?.email}</p>
        <button
          onClick={handleLogout}
          className="mt-3 flex items-center gap-2 text-sm text-sidebar-muted hover:text-destructive transition-colors w-full"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
