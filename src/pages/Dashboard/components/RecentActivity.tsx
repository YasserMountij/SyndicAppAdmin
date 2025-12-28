import { Card, Tabs, List, Skeleton, Tag, Empty } from 'antd';
import { useNavigate } from 'react-router';
import type { RecentActivity as RecentActivityType } from '@/api/hooks';
import { formatDate, formatCurrency, formatRelativeTime, getDaysUntilExpiration } from '@/utils/format';

interface RecentActivityProps {
  data?: RecentActivityType;
  loading: boolean;
}

export function RecentActivity({ data, loading }: RecentActivityProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card className="bg-[#141414]! border-[#303030]!">
        <Skeleton active paragraph={{ rows: 8 }} />
      </Card>
    );
  }

  const items = [
    {
      key: 'payments',
      label: 'Payments',
      children: (
        <List
          dataSource={data?.recentPayments ?? []}
          locale={{ emptyText: <Empty description="No recent payments" /> }}
          renderItem={(item) => (
            <List.Item className="border-[#303030]!">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-1 sm:gap-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
                  <span className="text-white font-medium truncate">{item.residence.name}</span>
                  <span className="text-gray-500 text-xs sm:text-sm">
                    {formatRelativeTime(item.paidAt)}
                  </span>
                </div>
                <Tag color="green" className="shrink-0 w-fit">{formatCurrency(item.amount)}</Tag>
              </div>
            </List.Item>
          )}
        />
      ),
    },
    {
      key: 'users',
      label: 'Users',
      children: (
        <List
          dataSource={data?.recentUsers ?? []}
          locale={{ emptyText: <Empty description="No new users" /> }}
          renderItem={(item) => (
            <List.Item 
              className="border-[#303030]! cursor-pointer hover:bg-[#1f1f1f] transition-colors"
              onClick={() => navigate(`/users/${item.id}`)}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-1 sm:gap-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
                  <span className="text-white font-medium truncate">{item.name}</span>
                  <span className="text-gray-500 text-xs sm:text-sm">{item.phoneNumber}</span>
                </div>
                <span className="text-gray-500 text-xs sm:text-sm shrink-0">
                  {formatRelativeTime(item.createdAt)}
                </span>
              </div>
            </List.Item>
          )}
        />
      ),
    },
    {
      key: 'residences',
      label: 'Residences',
      children: (
        <List
          dataSource={data?.recentResidences ?? []}
          locale={{ emptyText: <Empty description="No new residences" /> }}
          renderItem={(item) => (
            <List.Item 
              className="border-[#303030]! cursor-pointer hover:bg-[#1f1f1f] transition-colors"
              onClick={() => navigate(`/residences/${item.id}`)}
            >
              <div className="flex items-center justify-between w-full gap-2">
                <span className="text-white font-medium truncate">{item.name}</span>
                <span className="text-gray-500 text-xs sm:text-sm shrink-0">
                  {formatRelativeTime(item.createdAt)}
                </span>
              </div>
            </List.Item>
          )}
        />
      ),
    },
    {
      key: 'expiring',
      label: (
        <span className="flex items-center gap-1">
          Expiring
          {data?.expiringSoon && data.expiringSoon.length > 0 && (
            <Tag color="warning" className="ms-1">{data.expiringSoon.length}</Tag>
          )}
        </span>
      ),
      children: (
        <List
          dataSource={data?.expiringSoon ?? []}
          locale={{ emptyText: <Empty description="No residences expiring soon" /> }}
          renderItem={(item) => {
            const daysLeft = getDaysUntilExpiration(item.expirationDate);
            return (
              <List.Item 
                className="border-[#303030]! cursor-pointer hover:bg-[#1f1f1f] transition-colors"
                onClick={() => navigate(`/residences/${item.id}`)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-1 sm:gap-2">
                  <span className="text-white font-medium truncate">{item.name}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-gray-500 text-xs sm:text-sm hidden sm:inline">
                      {formatDate(item.expirationDate)}
                    </span>
                    <Tag color={daysLeft <= 3 ? 'error' : 'warning'}>
                      {daysLeft} days
                    </Tag>
                  </div>
                </div>
              </List.Item>
            );
          }}
        />
      ),
    },
  ];

  return (
    <Card 
      title="Recent Activity" 
      className="bg-[#141414]! border-[#303030]!"
      styles={{ header: { borderBottom: '1px solid #303030' } }}
    >
      <Tabs items={items} size="small" />
    </Card>
  );
}
