import { Card, Typography } from 'antd';
import type { ReactNode } from 'react';

const { Title, Text } = Typography;

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  extra?: ReactNode;
}

export function PageHeader({ title, subtitle, extra }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      <div>
        <Title level={2} className="mb-0! text-white! text-xl sm:text-2xl">
          {title}
        </Title>
        {subtitle && <Text type="secondary">{subtitle}</Text>}
      </div>
      {extra && <div className="w-full sm:w-auto">{extra}</div>}
    </div>
  );
}

interface PageCardProps {
  children: ReactNode;
  className?: string;
}

export function PageCard({ children, className = '' }: PageCardProps) {
  return (
    <Card className={`bg-[#141414]! border-[#303030]! ${className}`}>
      {children}
    </Card>
  );
}
