import { Loader2 } from 'lucide-react';

export default function Spinner({ className = '' }: { className?: string }) {
  return <Loader2 className={`h-5 w-5 animate-spin text-primary ${className}`} />;
}
