import { Card, Skeleton } from 'antd';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useUsersOverTime } from '@/api/hooks';

export function UsersChart() {
  const { data, isLoading } = useUsersOverTime(6);

  const chartData = data?.map((item) => ({
    month: item.month,
    users: item.count ?? 0,
  })) ?? [];

  return (
    <Card 
      title="User Growth" 
      className="bg-[#141414]! border-[#303030]!"
      styles={{ header: { borderBottom: '1px solid #303030' } }}
    >
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : chartData.length === 0 ? (
        <div className="h-[200px] sm:h-[300px] flex items-center justify-center text-gray-500">
          No data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={window.innerWidth < 640 ? 200 : 300}>
          <AreaChart data={chartData} margin={{ left: -10, right: 5 }}>
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1677ff" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#1677ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#303030" />
            <XAxis 
              dataKey="month" 
              stroke="#666" 
              fontSize={10}
              tickFormatter={(value) => {
                const [year, month] = value.split('-');
                return `${month}/${year.slice(2)}`;
              }}
            />
            <YAxis stroke="#666" fontSize={10} width={30} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f1f1f',
                border: '1px solid #303030',
                borderRadius: 6,
              }}
              labelStyle={{ color: '#fff' }}
            />
            <Area
              type="monotone"
              dataKey="users"
              stroke="#1677ff"
              fillOpacity={1}
              fill="url(#colorUsers)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
