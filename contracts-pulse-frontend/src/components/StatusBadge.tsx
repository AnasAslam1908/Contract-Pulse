import { cn } from '@/lib/utils';

const statusMap: Record<string, string> = {
  DRAFT: 'status-draft',
  ACTIVE: 'status-active',
  COMPLETED: 'status-completed',
  CANCELLED: 'status-cancelled',
  PENDING: 'status-pending',
  PAID: 'status-paid',
  OVERDUE: 'status-overdue',
  IN_PROGRESS: 'status-in_progress',
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', statusMap[status] || 'status-draft')}>
      {status.replace('_', ' ')}
    </span>
  );
}
