import { Row, Col, Card, Skeleton } from 'antd';
import {
  UserOutlined,
  HomeOutlined,
  DollarOutlined,
  DeleteOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import type { DashboardStats } from '@/api/hooks';
import { formatCurrency } from '@/utils/format';

interface StatsCardsProps {
  stats?: DashboardStats;
  loading: boolean;
}

export function StatsCards({ stats, loading }: StatsCardsProps) {
  if (loading) {
    return (
      <Row gutter={[12, 12]}>
        {[...Array(5)].map((_, i) => (
          <Col xs={12} sm={12} md={8} lg={4} key={i}>
            <Card className="bg-[#141414]! border-[#303030]!">
              <Skeleton active paragraph={false} />
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  const cards = [
    {
      title: 'Total Users',
      value: stats?.users.total ?? 0,
      suffix: stats?.users.thisMonth ? `+${stats.users.thisMonth} this month` : undefined,
      icon: <UserOutlined className="text-xl sm:text-2xl text-blue-500" />,
      color: 'blue',
    },
    {
      title: 'Active Residences',
      value: stats?.residences.active ?? 0,
      suffix: `${stats?.residences.total ?? 0} total`,
      icon: <HomeOutlined className="text-xl sm:text-2xl text-green-500" />,
      color: 'green',
    },
    {
      title: 'Expiring Soon',
      value: stats?.residences.expiringSoon ?? 0,
      icon: <WarningOutlined className="text-xl sm:text-2xl text-yellow-500" />,
      color: 'yellow',
    },
    {
      title: 'Revenue This Month',
      value: formatCurrency(stats?.revenue.thisMonth ?? 0),
      suffix: `${formatCurrency(stats?.revenue.total ?? 0)} total`,
      icon: <DollarOutlined className="text-xl sm:text-2xl text-emerald-500" />,
      color: 'emerald',
      isFormatted: true,
    },
    {
      title: 'Deletion Requests',
      value: stats?.deletionRequests.pending ?? 0,
      icon: <DeleteOutlined className="text-xl sm:text-2xl text-red-500" />,
      color: 'red',
    },
  ];

  return (
    <Row gutter={[12, 12]}>
      {cards.map((card) => (
        <Col xs={12} sm={12} md={8} lg={4} xl={4} key={card.title}>
          <Card className="bg-[#141414]! border-[#303030]! h-full">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-gray-400 text-xs sm:text-sm mb-1 truncate">{card.title}</p>
                <p className="text-lg sm:text-2xl font-bold text-white truncate">
                  {card.isFormatted ? card.value : card.value.toLocaleString()}
                </p>
                {card.suffix && (
                  <p className="text-gray-500 text-xs mt-1 truncate hidden sm:block">{card.suffix}</p>
                )}
              </div>
              <div className="p-1.5 sm:p-2 rounded-lg bg-[#1f1f1f] shrink-0">
                {card.icon}
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
