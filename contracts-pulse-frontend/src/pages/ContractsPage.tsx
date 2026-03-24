import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import TopNavbar from '@/components/TopNavbar';
import StatusBadge from '@/components/StatusBadge';
import Spinner from '@/components/Spinner';
import EmptyState from '@/components/EmptyState';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export default function ContractsPage() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '', description: '', clientId: '', totalValue: '', startDate: '', endDate: '',
  });

  useEffect(() => {
    Promise.all([api.get('/contracts'), api.get('/clients')])
      .then(([cr, cl]) => { setContracts(cr.data); setClients(cl.data); })
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/contracts', {
        ...form,
        clientId: Number(form.clientId),
        totalValue: Number(form.totalValue),
      });
      toast.success('Contract created');
      setModalOpen(false);
      const res = await api.get('/contracts');
      setContracts(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create contract');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <><TopNavbar title="Contracts" /><div className="flex items-center justify-center h-96"><Spinner className="h-8 w-8" /></div></>
  );

  return (
    <>
      <TopNavbar title="Contracts" />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">{contracts.length} contract{contracts.length !== 1 ? 's' : ''}</h2>
          <button onClick={() => { setForm({ title: '', description: '', clientId: '', totalValue: '', startDate: '', endDate: '' }); setModalOpen(true); }} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 active:scale-[0.97]">
            <Plus className="h-4 w-4" /> New Contract
          </button>
        </div>

        {contracts.length === 0 ? (
          <EmptyState title="No contracts yet" description="Create your first contract" />
        ) : (
          <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground bg-muted/30">
                  <th className="px-6 py-3 font-medium">Title</th>
                  <th className="px-6 py-3 font-medium">Client</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Total Value</th>
                  <th className="px-6 py-3 font-medium">Start Date</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((c, i) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => navigate(`/contracts/${c.id}`)}
                  >
                    <td className="px-6 py-3 font-medium">{c.title}</td>
                    <td className="px-6 py-3 text-muted-foreground">{c.clientName || '—'}</td>
                    <td className="px-6 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-6 py-3 text-right tabular-nums">PKR {(c.totalValue || 0).toLocaleString()}</td>
                    <td className="px-6 py-3 text-muted-foreground">{c.startDate || '—'}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent asChild>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}>
            <DialogHeader><DialogTitle>New Contract</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-2">
              <div>
                <label className="text-sm font-medium mb-1 block">Title</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring min-h-[80px]" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Client</label>
                <select required value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Select client</option>
                  {clients.map((cl) => <option key={cl.id} value={cl.id}>{cl.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Total Value</label>
                  <input type="number" required value={form.totalValue} onChange={(e) => setForm({ ...form, totalValue: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Start Date</label>
                  <input type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">End Date</label>
                  <input type="date" required value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <DialogFooter>
                <button type="submit" disabled={saving} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 active:scale-[0.97]">
                  {saving ? 'Creating...' : 'Create Contract'}
                </button>
              </DialogFooter>
            </form>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
}
