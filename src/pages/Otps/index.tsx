import { Table, Tag, Empty, Button, Tooltip, message } from 'antd';
import { SyncOutlined, CopyOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { PageHeader } from '@/components/ui';
import { useOtps, type PendingOtp } from '@/api/hooks';
import { formatPhone } from '@/utils/format';

export default function Otps() {
  const { data, isLoading } = useOtps();

  const otps = data?.otps ?? [];

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    message.success('OTP copied to clipboard');
  };

  const columns: ColumnsType<PendingOtp> = [
    {
      title: 'Phone Number',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      render: (phone: string) => (
        <span className="text-gray-300 font-medium">{formatPhone(phone)}</span>
      ),
    },
    {
      title: 'OTP Code',
      dataIndex: 'code',
      key: 'code',
      render: (code: string) => (
        <div className="flex items-center gap-2">
          <span className="text-2xl font-mono font-bold text-emerald-400 tracking-widest">
            {code}
          </span>
          <Tooltip title="Copy OTP">
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined />}
              onClick={() => handleCopy(code)}
              className="text-gray-400 hover:text-white!"
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="OTP Codes"
        subtitle={`${otps.length} pending OTP${otps.length !== 1 ? 's' : ''}`}
        extra={
          <Tag icon={<SyncOutlined spin />} color="processing">
            Live
          </Tag>
        }
      />

      {otps.length === 0 && !isLoading ? (
        <Empty
          description={
            <span className="text-gray-400">
              No pending OTPs. Codes appear here when users request login.
            </span>
          }
          className="mt-16"
        />
      ) : (
        <Table
          dataSource={otps}
          columns={columns}
          rowKey="phoneNumber"
          loading={isLoading}
          pagination={false}
          className="[&_.ant-table]:bg-transparent! [&_.ant-table-thead>tr>th]:bg-[#1f1f1f]! [&_.ant-table-tbody>tr:hover>td]:bg-[#1f1f1f]!"
          size="middle"
        />
      )}

      <p className="text-gray-500 text-sm mt-4">
        OTPs are automatically cleared after viewing and expire after 5 minutes.
      </p>
    </div>
  );
}
