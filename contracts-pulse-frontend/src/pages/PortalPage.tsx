import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import axios from 'axios';
import StatusBadge from '@/components/StatusBadge';
import Spinner from '@/components/Spinner';

export default function PortalPage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`http://localhost:8081/api/portal/${token}`)
      .then((res) => setData(res.data))
      .catch(() => setError('Invalid or expired portal link'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Spinner className="h-8 w-8" /></div>;
  if (error) return <div className="flex items-center justify-center min-h-screen text-destructive">{error}</div>;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <span className="text-lg font-bold text-primary">ContractPulse</span>
        </div>
        <span className="text-sm text-muted-foreground font-medium">Client Portal</span>
      </header>

      <motion.main
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-3xl mx-auto p-8 space-y-8 flex-1 w-full"
      >
        <p className="text-sm text-muted-foreground">Shared with you by <span className="font-medium text-foreground">{data.freelancerName}</span></p>

        <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold">{data.contractTitle}</h1>
              <p className="text-muted-foreground text-sm mt-1">Client: {data.clientName}</p>
            </div>
            <StatusBadge status={data.status} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div><span className="text-muted-foreground">Total Value</span><p className="font-semibold tabular-nums">PKR {(data.totalValue || 0).toLocaleString()}</p></div>
            <div><span className="text-muted-foreground">Start Date</span><p className="font-medium">{data.startDate || '—'}</p></div>
            <div><span className="text-muted-foreground">End Date</span><p className="font-medium">{data.endDate || '—'}</p></div>
          </div>
        </div>

        {data.milestones && data.milestones.length > 0 && (
          <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm">
            <h2 className="text-base font-semibold mb-4">Milestones</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Title</th>
                  <th className="pb-2 font-medium">Amount (PKR)</th>
                  <th className="pb-2 font-medium">Due Date</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.milestones.map((m: any, i: number) => (
                  <motion.tr
                    key={m.id || i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.06 }}
                    className="border-b border-border/50"
                  >
                    <td className="py-3 font-medium">{m.title}</td>
                    <td className="py-3 tabular-nums">PKR {(m.amount || 0).toLocaleString()}</td>
                    <td className="py-3 text-muted-foreground">{m.dueDate || '—'}</td>
                    <td className="py-3"><StatusBadge status={m.status} /></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        Powered by <span className="font-medium text-primary">ContractPulse</span>
      </footer>
    </div>
  );
}