import { useAuth } from '@/hooks/useAuth';

export default function TopNavbar({ title }: { title: string }) {
  const { user } = useAuth();
  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-8">
      <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      <span className="text-sm text-muted-foreground">{user?.email}</span>
    </header>
  );
}
