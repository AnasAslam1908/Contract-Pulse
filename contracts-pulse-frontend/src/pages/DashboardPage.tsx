import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FileText, Zap, Clock, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import TopNavbar from '@/components/TopNavbar';
import StatusBadge from '@/components/StatusBadge';
import Spinner from '@/components/Spinner';
import EmptyState from '@/components/EmptyState';

interface Contract {
  id: string;
  title: string;
  clientName?: string;
  status: string;
  totalValue?: number;
}

interface DashboardStats {
  totalContracts: number;
  activeContracts: number;
  pendingInvoices: number;
  totalEarned: number;
}

const cardVariants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  visible: (i: number) => ({
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

export default function DashboardPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [dashStats, setDashStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDashboardStats = async () => {
    const statsResponse = await api.get('/dashboard/stats');
    setDashStats(statsResponse.data);
  };

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const contractsResponse = await api.get('/contracts');
        setContracts(contractsResponse.data);
        await fetchDashboardStats();
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();

    const onDashboardStatsRefresh = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail) {
        setDashStats(customEvent.detail);
        return;
      }

      fetchDashboardStats();
    };

    window.addEventListener('dashboard-stats-refresh', onDashboardStatsRefresh);
    return () => window.removeEventListener('dashboard-stats-refresh', onDashboardStatsRefresh);
  }, []);

  const chartData = ['DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map((status) => ({
    status,
    count: contracts.filter((c) => c.status === status).length,
  }));

  const stats = [
    { label: 'Total Contracts', value: dashStats?.totalContracts ?? 0, icon: FileText, color: 'text-primary' },
    { label: 'Active Contracts', value: dashStats?.activeContracts ?? 0, icon: Zap, color: 'text-primary' },
    { label: 'Pending Invoices', value: dashStats?.pendingInvoices ?? 0, icon: Clock, color: 'text-warning' },
    { label: 'Total Earned (PKR)', value: `PKR ${(dashStats?.totalEarned ?? 0).toLocaleString()}`, icon: DollarSign, color: 'text-success' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-screen"><Spinner className="h-8 w-8" /></div>
  );

  return (
    <>
      <TopNavbar title="Dashboard" />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="p-8 space-y-8"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} custom={i} variants={cardVariants} initial="hidden" animate="visible" className="stat-card">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold tabular-nums">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="bg-card rounded-xl border border-border/50 p-6 shadow-sm"
          >
            <h3 className="text-sm font-semibold mb-4">Contracts by Status</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
                <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(224 76% 53%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="bg-card rounded-xl border border-border/50 p-6 shadow-sm"
          >
            <h3 className="text-sm font-semibold mb-4">Recent Contracts</h3>
            {contracts.length === 0 ? (
              <EmptyState title="No contracts yet" description="Create your first contract to get started" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="pb-2 font-medium">Title</th>
                      <th className="pb-2 font-medium">Client</th>
                      <th className="pb-2 font-medium">Status</th>
                      <th className="pb-2 font-medium text-right">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contracts.slice(0, 5).map((c, i) => (
                      <motion.tr
                        key={c.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 + i * 0.08 }}
                        className="border-b border-border/50 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => navigate(`/contracts/${c.id}`)}
                      >
                        <td className="py-3 font-medium">{c.title}</td>
                        <td className="py-3 text-muted-foreground">{c.clientName || '—'}</td>
                        <td className="py-3"><StatusBadge status={c.status} /></td>
                        <td className="py-3 text-right tabular-nums">PKR {(c.totalValue || 0).toLocaleString()}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
