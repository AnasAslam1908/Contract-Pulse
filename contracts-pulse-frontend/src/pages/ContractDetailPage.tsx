import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Plus, Trash2, Download, Sparkles, Copy, Check } from 'lucide-react';
import api from '@/lib/api';
import TopNavbar from '@/components/TopNavbar';
import StatusBadge from '@/components/StatusBadge';
import Spinner from '@/components/Spinner';
import EmptyState from '@/components/EmptyState';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [contract, setContract] = useState<any>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msModalOpen, setMsModalOpen] = useState(false);
  const [msForm, setMsForm] = useState({ title: '', amount: '', dueDate: '', orderIndex: '0' });
  const [saving, setSaving] = useState(false);
  const [deleteMs, setDeleteMs] = useState<number | null>(null);
  const [aiModal, setAiModal] = useState<{ title: string; content: string } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showFollowupPicker, setShowFollowupPicker] = useState(false);

  const fetchData = async () => {
    try {
      const [cr, ms] = await Promise.all([
        api.get(`/contracts/${id}`),
        api.get(`/contracts/${id}/milestones`),
      ]);
      setContract(cr.data);
      setMilestones(ms.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const updateStatus = async (status: string) => {
    try {
      await api.patch(`/contracts/${id}/status?status=${status}`);
      toast.success('Status updated');
      fetchData();
    } catch { toast.error('Failed to update status'); }
  };

  const updateMsStatus = async (msId: number, status: string) => {
    try {
      await api.patch(`/contracts/${id}/milestones/${msId}/status?status=${status}`);
      toast.success('Milestone status updated');
      fetchData();
    } catch { toast.error('Failed to update'); }
  };

  const deleteMilestone = async () => {
    if (!deleteMs) return;
    try {
      await api.delete(`/contracts/${id}/milestones/${deleteMs}`);
      toast.success('Milestone deleted');
      setDeleteMs(null);
      fetchData();
    } catch { toast.error('Failed to delete'); }
  };

  const createMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post(`/contracts/${id}/milestones`, {
        title: msForm.title,
        amount: Number(msForm.amount),
        dueDate: msForm.dueDate,
        orderIndex: Number(msForm.orderIndex),
      });
      toast.success('Milestone created');
      setMsModalOpen(false);
      fetchData();
    } catch { toast.error('Failed to create milestone'); }
    finally { setSaving(false); }
  };

  const generateInvoice = async (milestoneId: number) => {
    try {
      await api.post(`/invoices/generate/${milestoneId}`);
      toast.success('Invoice generated');
      fetchData();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to generate invoice'); }
  };

  const updateInvoiceStatus = async (invoiceId: number, status: string) => {
    try {
      await api.patch(`/invoices/${invoiceId}/status?status=${status}`);
      toast.success('Invoice status updated');
      fetchData();
    } catch { toast.error('Failed to update invoice status'); }
  };

  const downloadPdf = async (invoiceId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8081/api/invoices/${invoiceId}/pdf`, {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` },
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch { toast.error('Failed to download PDF'); }
  };

  const aiSummary = async () => {
    setAiLoading(true);
    try {
      const res = await api.get(`/ai/summary/${id}`);
      setAiModal({ title: 'Contract Summary', content: res.data.summary || res.data });
    } catch { toast.error('AI request failed'); }
    finally { setAiLoading(false); }
  };

  const aiRisk = async () => {
    setAiLoading(true);
    try {
      const res = await api.get(`/ai/risk/${id}`);
      setAiModal({ title: 'Payment Risk Assessment', content: res.data.risk || res.data });
    } catch { toast.error('AI request failed'); }
    finally { setAiLoading(false); }
  };

  const aiFollowup = async (invoiceId: string) => {
    setAiLoading(true);
    setShowFollowupPicker(false);
    try {
      const res = await api.get(`/ai/followup/${invoiceId}`);
      setAiModal({ title: 'Follow-up Email Draft', content: res.data.email || res.data });
    } catch { toast.error('AI request failed'); }
    finally { setAiLoading(false); }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <><TopNavbar title="Contract Detail" /><div className="flex items-center justify-center h-96"><Spinner className="h-8 w-8" /></div></>
  );

  if (!contract) return <><TopNavbar title="Contract Detail" /><EmptyState title="Contract not found" /></>;

  const allInvoices = milestones.flatMap((m) => (m.invoice ? [{ ...m.invoice, milestoneTitle: m.title }] : m.invoices ? m.invoices.map((inv: any) => ({ ...inv, milestoneTitle: m.title })) : []));

  return (
    <>
      <TopNavbar title="Contract Detail" />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="p-8 space-y-8">
        {/* Header */}
        <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">{contract.title}</h2>
              <p className="text-muted-foreground text-sm mt-1">{contract.clientName}</p>
              {contract.description && <p className="text-sm text-muted-foreground mt-2 max-w-xl">{contract.description}</p>}
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={contract.status} />
              <select
                value={contract.status}
                onChange={(e) => updateStatus(e.target.value)}
                className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {['DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 text-sm">
            <div><span className="text-muted-foreground">Total Value</span><p className="font-semibold tabular-nums">PKR {(contract.totalValue || 0).toLocaleString()}</p></div>
            <div><span className="text-muted-foreground">Start Date</span><p className="font-medium">{contract.startDate || '—'}</p></div>
            <div><span className="text-muted-foreground">End Date</span><p className="font-medium">{contract.endDate || '—'}</p></div>
            <div><span className="text-muted-foreground">Status</span><p><StatusBadge status={contract.status} /></p></div>
          </div>
        </div>

        {/* Milestones */}
        <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold">Milestones</h3>
            <button onClick={() => { setMsForm({ title: '', amount: '', dueDate: '', orderIndex: String(milestones.length) }); setMsModalOpen(true); }} className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-medium hover:opacity-90 active:scale-[0.97]">
              <Plus className="h-3.5 w-3.5" /> Add Milestone
            </button>
          </div>
          {milestones.length === 0 ? (
            <EmptyState title="No milestones" description="Add milestones to track progress" />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Title</th>
                  <th className="pb-2 font-medium">Amount (PKR)</th>
                  <th className="pb-2 font-medium">Due Date</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {milestones.map((m) => (
                  <tr key={m.id} className="border-b border-border/50">
                    <td className="py-3 font-medium">{m.title}</td>
                    <td className="py-3 tabular-nums">PKR {(m.amount || 0).toLocaleString()}</td>
                    <td className="py-3 text-muted-foreground">{m.dueDate || '—'}</td>
                    <td className="py-3">
                      <select value={m.status} onChange={(e) => updateMsStatus(m.id, e.target.value)} className="rounded border border-input bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring">
                        {['PENDING', 'IN_PROGRESS', 'COMPLETED'].map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                      </select>
                    </td>
                    <td className="py-3 text-right space-x-2">
                      {!m.invoice && !(m.invoices && m.invoices.length > 0) && (
                        <button onClick={() => generateInvoice(m.id)} className="text-xs text-primary hover:underline">Generate Invoice</button>
                      )}
                      <button onClick={() => setDeleteMs(m.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5 inline" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Invoices */}
        {allInvoices.length > 0 && (
          <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm">
            <h3 className="text-base font-semibold mb-4">Invoices</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Invoice #</th>
                  <th className="pb-2 font-medium">Milestone</th>
                  <th className="pb-2 font-medium">Amount (PKR)</th>
                  <th className="pb-2 font-medium">Issued Date</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allInvoices.map((inv: any) => (
                  <tr key={inv.id} className="border-b border-border/50">
                    <td className="py-3 font-medium">{inv.invoiceNumber || inv.id}</td>
                    <td className="py-3 text-muted-foreground">{inv.milestoneTitle}</td>
                    <td className="py-3 tabular-nums">PKR {(inv.amount || 0).toLocaleString()}</td>
                    <td className="py-3 text-muted-foreground">{inv.issuedDate || inv.createdAt || '—'}</td>
                    <td className="py-3">
                      <select value={inv.status} onChange={(e) => updateInvoiceStatus(inv.id, e.target.value)} className="rounded border border-input bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring">
                        {['PENDING', 'PAID', 'OVERDUE'].map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="py-3 text-right">
                      <button onClick={() => downloadPdf(inv.id)} className="text-primary hover:underline text-xs flex items-center gap-1 ml-auto">
                        <Download className="h-3.5 w-3.5" /> PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* AI Panel */}
        <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold">AI Assistant</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={aiSummary} disabled={aiLoading} className="bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors disabled:opacity-50 active:scale-[0.97]">
              {aiLoading ? <Spinner className="h-4 w-4 inline mr-1" /> : null}
              Summarize Contract
            </button>
            <button onClick={aiRisk} disabled={aiLoading} className="bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors disabled:opacity-50 active:scale-[0.97]">
              {aiLoading ? <Spinner className="h-4 w-4 inline mr-1" /> : null}
              Assess Payment Risk
            </button>
            <div className="relative">
              <button onClick={() => setShowFollowupPicker(!showFollowupPicker)} disabled={aiLoading || allInvoices.length === 0} className="bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors disabled:opacity-50 active:scale-[0.97]">
                {aiLoading ? <Spinner className="h-4 w-4 inline mr-1" /> : null}
                Draft Follow-up Email
              </button>
              {showFollowupPicker && (
                <div className="absolute top-full mt-1 left-0 bg-card border border-border rounded-lg shadow-lg z-10 min-w-[280px]">
                  {allInvoices.map((inv: any) => (
                    <button key={inv.id} onClick={() => aiFollowup(inv.id)} className="block w-full text-left px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors first:rounded-t-lg last:rounded-b-lg">
                      <span className="font-medium">{inv.invoiceNumber || `Invoice #${inv.id}`}</span>
                      <span className="text-muted-foreground ml-2">· <StatusBadge status={inv.status} /> · PKR {(inv.amount || 0).toLocaleString()}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          {aiLoading && <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><Spinner /> Processing...</div>}
        </div>
      </motion.div>

      {/* Milestone modal */}
      <Dialog open={msModalOpen} onOpenChange={setMsModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Milestone</DialogTitle></DialogHeader>
          <form onSubmit={createMilestone} className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium mb-1 block">Title</label>
              <input required value={msForm.title} onChange={(e) => setMsForm({ ...msForm, title: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Amount</label>
                <input type="number" required value={msForm.amount} onChange={(e) => setMsForm({ ...msForm, amount: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Due Date</label>
                <input type="date" required value={msForm.dueDate} onChange={(e) => setMsForm({ ...msForm, dueDate: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Order</label>
                <input type="number" value={msForm.orderIndex} onChange={(e) => setMsForm({ ...msForm, orderIndex: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
            <DialogFooter>
              <button type="submit" disabled={saving} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 active:scale-[0.97]">
                {saving ? 'Creating...' : 'Create Milestone'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete milestone confirm */}
      <AlertDialog open={!!deleteMs} onOpenChange={() => setDeleteMs(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Milestone</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteMilestone} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AI result modal */}
      <Dialog open={!!aiModal} onOpenChange={() => setAiModal(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{aiModal?.title}</DialogTitle></DialogHeader>
          <div className="mt-2 text-sm whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto">
            {aiModal?.content}
          </div>
          <DialogFooter>
            <button onClick={() => copyToClipboard(aiModal?.content || '')} className="flex items-center gap-2 bg-muted text-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted/80 active:scale-[0.97]">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
