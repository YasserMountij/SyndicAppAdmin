import { Card, Skeleton } from 'antd';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useRevenueOverTime } from '@/api/hooks';
import { formatCurrency } from '@/utils/format';

export function RevenueChart() {
  const { data, isLoading } = useRevenueOverTime(6);

  const chartData = data?.map((item) => ({
    month: item.month,
    revenue: item.total ?? 0,
    count: item.count ?? 0,
  })) ?? [];

  return (
    <Card 
      title="Revenue" 
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
          <BarChart data={chartData} margin={{ left: -10, right: 5 }}>
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
            <YAxis 
              stroke="#666" 
              fontSize={10}
              tickFormatter={(value) => `${value / 1000}k`}
              width={35}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f1f1f',
                border: '1px solid #303030',
                borderRadius: 6,
              }}
              labelStyle={{ color: '#fff' }}
              formatter={(value) => [formatCurrency(Number(value) || 0), 'Revenue']}
            />
            <Bar 
              dataKey="revenue" 
              fill="#52c41a" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
