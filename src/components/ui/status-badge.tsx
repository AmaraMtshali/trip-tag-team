import { cn } from "@/lib/utils";
import { Member } from "@/types/session";

interface StatusBadgeProps {
  status: Member['status'];
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status) {
      case 'present':
      case 'joined':
        return 'bg-success text-success-foreground';
      case 'missing':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'present':
        return 'Present';
      case 'joined':
        return 'Joined';
      case 'missing':
        return 'Missing';
      default:
        return 'Unknown';
    }
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors",
      getStatusStyles(),
      className
    )}>
      {getStatusText()}
    </span>
  );
}