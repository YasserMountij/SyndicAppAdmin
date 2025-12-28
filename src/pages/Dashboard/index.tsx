import { Row, Col } from 'antd';
import { PageHeader } from '@/components/ui';
import { useDashboardStats, useRecentActivity } from '@/api/hooks';
import { StatsCards } from './components/StatsCards';
import { UsersChart } from './components/UsersChart';
import { RevenueChart } from './components/RevenueChart';
import { RecentActivity } from './components/RecentActivity';

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentActivity, isLoading: activityLoading } = useRecentActivity();

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your SyndicApp platform"
      />

      {/* Stats Cards */}
      <StatsCards stats={stats} loading={statsLoading} />

      {/* Charts */}
      <Row gutter={[16, 16]} className="mt-4 sm:mt-6">
        <Col xs={24} lg={12}>
          <UsersChart />
        </Col>
        <Col xs={24} lg={12}>
          <RevenueChart />
        </Col>
      </Row>

      {/* Recent Activity */}
      <div className="mt-6">
        <RecentActivity data={recentActivity} loading={activityLoading} />
      </div>
    </div>
  );
}
