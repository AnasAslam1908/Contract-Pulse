import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import TopNavbar from '@/components/TopNavbar';
import Spinner from '@/components/Spinner';
import EmptyState from '@/components/EmptyState';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Client { id: number; name: string; email: string; phone: string; }

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);

  const fetchClients = () => {
    api.get('/clients').then((r) => setClients(r.data)).finally(() => setLoading(false));
  };
  useEffect(fetchClients, []);

  const openCreate = () => { setEditing(null); setForm({ name: '', email: '', phone: '' }); setModalOpen(true); };
  const openEdit = (c: Client) => { setEditing(c); setForm({ name: c.name, email: c.email, phone: c.phone }); setModalOpen(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/clients/${editing.id}`, form);
        toast.success('Client updated');
      } else {
        await api.post('/clients', form);
        toast.success('Client created');
      }
      setModalOpen(false);
      fetchClients();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save client');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/clients/${deleteId}`);
      toast.success('Client deleted');
      setDeleteId(null);
      fetchClients();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete client');
    }
  };

  if (loading) return (
    <><TopNavbar title="Clients" /><div className="flex items-center justify-center h-96"><Spinner className="h-8 w-8" /></div></>
  );

  return (
    <>
      <TopNavbar title="Clients" />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">{clients.length} client{clients.length !== 1 ? 's' : ''}</h2>
          <button onClick={openCreate} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity active:scale-[0.97]">
            <Plus className="h-4 w-4" /> Add Client
          </button>
        </div>

        {clients.length === 0 ? (
          <EmptyState title="No clients yet" description="Add your first client to get started" />
        ) : (
          <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground bg-muted/30">
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Phone</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c, i) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-3 font-medium">{c.name}</td>
                    <td className="px-6 py-3 text-muted-foreground">{c.email}</td>
                    <td className="px-6 py-3 text-muted-foreground">{c.phone}</td>
                    <td className="px-6 py-3 text-right space-x-2">
                      <button onClick={() => openEdit(c)} className="text-muted-foreground hover:text-foreground transition-colors"><Pencil className="h-4 w-4 inline" /></button>
                      <button onClick={() => setDeleteId(c.id)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="h-4 w-4 inline" /></button>
                    </td>
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
            <DialogHeader><DialogTitle>{editing ? 'Edit Client' : 'Add Client'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 mt-2">
              <div>
                <label className="text-sm font-medium mb-1 block">Name</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Email</label>
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Phone</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <DialogFooter>
                <button type="submit" disabled={saving} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 active:scale-[0.97]">
                  {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
                </button>
              </DialogFooter>
            </form>
          </motion.div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. Are you sure?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
