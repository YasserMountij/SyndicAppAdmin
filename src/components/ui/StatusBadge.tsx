import { Tag } from 'antd';

type StatusType = 'success' | 'warning' | 'error' | 'info' | 'default';

interface StatusBadgeProps {
  status: StatusType;
  text: string;
}

const statusColors: Record<StatusType, string> = {
  success: 'green',
  warning: 'gold',
  error: 'red',
  info: 'blue',
  default: 'default',
};

export function StatusBadge({ status, text }: StatusBadgeProps) {
  return <Tag color={statusColors[status]}>{text}</Tag>;
}

// Convenience components
export function ActiveBadge() {
  return <StatusBadge status="success" text="Active" />;
}

export function ExpiredBadge() {
  return <StatusBadge status="error" text="Expired" />;
}

export function ExpiringSoonBadge() {
  return <StatusBadge status="warning" text="Expiring Soon" />;
}

export function DemoBadge() {
  return <StatusBadge status="info" text="Demo" />;
}

export function BannedBadge() {
  return <StatusBadge status="error" text="Banned" />;
}

export function SyndicBadge() {
  return <StatusBadge status="info" text="Syndic" />;
}

export function ResidentBadge() {
  return <StatusBadge status="default" text="Resident" />;
}
