import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import TopNavbar from '@/components/TopNavbar';
import StatusBadge from '@/components/StatusBadge';
import Spinner from '@/components/Spinner';
import EmptyState from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type InvoiceStatus = 'PENDING' | 'PAID' | 'OVERDUE';

type Invoice = {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: InvoiceStatus;
  issuedDate: string;
  dueDate: string | null;
  contractTitle: string;
  milestoneTitle: string;
  contractId: string;
  milestoneId: string;
  createdAt: string;
};

const statusOptions: { value: InvoiceStatus; label: string }[] = [
  { value: 'PENDING', label: 'Mark as Pending' },
  { value: 'PAID', label: 'Mark as Paid' },
  { value: 'OVERDUE', label: 'Mark as Overdue' },
];

const formatDate = (value: string | null) => (value ? new Date(`${value}T00:00:00`).toLocaleDateString() : '—');

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchInvoices = async () => {
    try {
      const response = await api.get<Invoice[]>('/invoices');
      setInvoices(response.data ?? []);
    } catch {
      toast.error('Failed to load invoices');
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchInvoices();
      setLoading(false);
    };

    load();
  }, []);

  const updateStatus = async (invoiceId: string, status: InvoiceStatus) => {
    try {
      await api.patch(`/invoices/${invoiceId}/status?status=${status}`);
      await fetchInvoices();

      const statsRes = await api.get('/dashboard/stats');
      window.dispatchEvent(new CustomEvent('dashboard-stats-refresh', { detail: statsRes.data }));

      toast.success('Invoice status updated');
    } catch { toast.error('Failed to update status'); }
  };

  const downloadPdf = async (id: string, invoiceNumber: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8081/api/invoices/${id}/pdf`, {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Check if response is actually a PDF
      if (response.data.type !== 'application/pdf') {
        toast.error('Invalid PDF received');
        return;
      }

      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('PDF download error:', error);
      toast.error('Failed to download PDF');
    }
  };

  if (loading) return (
    <><TopNavbar title="Invoices" /><div className="flex items-center justify-center h-96"><Spinner className="h-8 w-8" /></div></>
  );

  return (
    <>
      <TopNavbar title="Invoices" />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="p-8">
        <div className="bg-card rounded-xl border border-border/50 p-6 shadow-sm">
          {invoices.length === 0 ? (
            <div className="flex flex-col items-center">
              <EmptyState
                title="No invoices yet."
                description="Generate invoices from the Contract Detail page."
              />
              <Button type="button" onClick={() => navigate('/contracts')}>
                Go to Contracts
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Invoice Number</th>
                    <th className="pb-2 font-medium">Contract Title</th>
                    <th className="pb-2 font-medium">Milestone</th>
                    <th className="pb-2 font-medium">Amount</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Issued Date</th>
                    <th className="pb-2 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv, i) => (
                    <motion.tr
                      key={inv.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-border/50"
                    >
                      <td className="py-3 font-medium">{inv.invoiceNumber || inv.id}</td>
                      <td className="py-3 text-muted-foreground">{inv.contractTitle}</td>
                      <td className="py-3 text-muted-foreground">{inv.milestoneTitle}</td>
                      <td className="py-3 tabular-nums">PKR {(inv.amount || 0).toLocaleString()}</td>
                      <td className="py-3">
                        <StatusBadge status={inv.status} />
                      </td>
                      <td className="py-3 text-muted-foreground">{formatDate(inv.issuedDate)}</td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={inv.status}
                            onChange={(e) => updateStatus(inv.id, e.target.value as InvoiceStatus)}
                            className="rounded border border-input bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                          >
                            {statusOptions.map((option) => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                          <button onClick={() => downloadPdf(inv.id, inv.invoiceNumber)} className="text-primary hover:underline text-xs flex items-center gap-1">
                            <Download className="h-3.5 w-3.5" /> PDF
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
