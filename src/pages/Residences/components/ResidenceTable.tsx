import { Table, Button, Tooltip } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import type { ColumnsType } from 'antd/es/table';
import type { Residence } from '@/api/hooks';
import {
  ActiveBadge,
  ExpiredBadge,
  ExpiringSoonBadge,
  DemoBadge,
} from '@/components/ui';
import { formatDate, isExpired, isExpiringSoon, getDaysUntilExpiration } from '@/utils/format';

interface ResidenceTableProps {
  residences: Residence[];
  loading: boolean;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  onEdit: (residence: Residence) => void;
  onDelete: (residence: Residence) => void;
}

export function ResidenceTable({
  residences,
  loading,
  hasMore,
  loadingMore,
  onLoadMore,
  onEdit,
  onDelete,
}: ResidenceTableProps) {
  const navigate = useNavigate();

  const columns: ColumnsType<Residence> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record) => (
        <div>
          <span className="font-medium text-white">{name}</span>
          {record.isDemo && <DemoBadge />}
        </div>
      ),
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      render: (address: string) => (
        <span className="text-gray-400">{address || '-'}</span>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        if (isExpired(record.expirationDate)) {
          return <ExpiredBadge />;
        }
        if (isExpiringSoon(record.expirationDate)) {
          return <ExpiringSoonBadge />;
        }
        return <ActiveBadge />;
      },
    },
    {
      title: 'Expiration',
      dataIndex: 'expirationDate',
      key: 'expirationDate',
      render: (date: string) => {
        const expired = isExpired(date);
        const expiringSoon = isExpiringSoon(date);
        const daysLeft = getDaysUntilExpiration(date);

        return (
          <div>
            <span className={expired ? 'text-red-400' : expiringSoon ? 'text-yellow-400' : 'text-gray-400'}>
              {formatDate(date)}
            </span>
            {!expired && (
              <span className="text-gray-500 text-xs ml-2">
                ({daysLeft} days)
              </span>
            )}
          </div>
        );
      },
    },
    {
      title: 'Members',
      key: 'members',
      render: (_, record) => (
        <span className="text-gray-400">{record._count?.members ?? 0}</span>
      ),
    },
    {
      title: 'Buildings',
      key: 'buildings',
      render: (_, record) => (
        <span className="text-gray-400">{record._count?.buildings ?? 0}</span>
      ),
    },
    {
      title: 'Apartments',
      key: 'apartments',
      render: (_, record) => (
        <span className="text-gray-400">{record._count?.apartments ?? 0}</span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <div className="flex items-center gap-1">
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/residences/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDelete(record)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasMore && !loadingMore && onLoadMore) {
      onLoadMore();
    }
  };

  return (
    <div 
      className="overflow-auto max-h-[calc(100vh-280px)]" 
      onScroll={handleScroll}
    >
      <Table
        dataSource={residences}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={false}
        scroll={{ x: 'max-content' }}
        className="[&_.ant-table]:bg-transparent! [&_.ant-table-thead>tr>th]:bg-[#1f1f1f]! [&_.ant-table-tbody>tr:hover>td]:bg-[#1f1f1f]!"
        size="middle"
      />
      {loadingMore && (
        <div className="text-center py-4 text-gray-400">Loading more...</div>
      )}
    </div>
  );
}
