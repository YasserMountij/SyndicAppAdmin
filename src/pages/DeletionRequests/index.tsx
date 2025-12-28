import { useMemo } from 'react';
import { Table, Button, Tag, message, Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { PageHeader } from '@/components/ui';
import { useDeletionRequests, useProcessDeletionRequest } from '@/api/hooks';
import { formatDate, formatPhone, formatRelativeTime } from '@/utils/format';
import type { DeletionRequest } from '@/api/hooks';

export default function DeletionRequests() {
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useDeletionRequests();

  const processRequest = useProcessDeletionRequest();

  const requests = useMemo(() => {
    return data?.pages.flatMap((page) => page.requests) ?? [];
  }, [data]);

  const totalCount = data?.pages[0]?.totalCount ?? 0;

  const handleProcess = async (requestId: string) => {
    try {
      await processRequest.mutateAsync(requestId);
      message.success('User account deleted successfully');
    } catch {
      message.error('Failed to process deletion request');
    }
  };

  const columns: ColumnsType<DeletionRequest> = [
    {
      title: 'User',
      key: 'user',
      render: (_, record) => (
        <div>
          <span className="font-medium text-white">{record.user.name}</span>
          <div className="text-gray-500 text-sm">
            {formatPhone(record.user.phoneNumber)}
          </div>
        </div>
      ),
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      render: (reason: string) => (
        <Tag color="orange">{reason}</Tag>
      ),
    },
    {
      title: 'Details',
      dataIndex: 'details',
      key: 'details',
      render: (details: string) => (
        <span className="text-gray-400">{details || '-'}</span>
      ),
    },
    {
      title: 'Residences',
      key: 'residences',
      render: (_, record) => {
        const residences = record.user.residencyMembers;
        if (!residences || residences.length === 0) {
          return <span className="text-gray-500">None</span>;
        }
        return (
          <div className="flex flex-wrap gap-1">
            {residences.slice(0, 2).map((member) => (
              <Tag key={member.residence.id}>{member.residence.name}</Tag>
            ))}
            {residences.length > 2 && (
              <Tag>+{residences.length - 2} more</Tag>
            )}
          </div>
        );
      },
    },
    {
      title: 'Requested',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (
        <div>
          <span>{formatDate(date)}</span>
          <div className="text-gray-500 text-xs">{formatRelativeTime(date)}</div>
        </div>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Popconfirm
          title="Delete User Account"
          description={
            <div>
              <p>Are you sure you want to delete <strong>{record.user.name}</strong>'s account?</p>
              <p className="text-red-400 mt-2">This action cannot be undone.</p>
            </div>
          }
          onConfirm={() => handleProcess(record.id)}
          okText="Delete Account"
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
        >
          <Button
            danger
            icon={<DeleteOutlined />}
            loading={processRequest.isPending}
          >
            Process
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <div>
      <PageHeader
        title="Deletion Requests"
        subtitle={`${totalCount} pending requests`}
      />

      <div 
        className="overflow-auto max-h-[calc(100vh-200px)]" 
        onScroll={handleScroll}
      >
        <Table
          dataSource={requests}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          pagination={false}
          scroll={{ x: 'max-content' }}
          className="[&_.ant-table]:bg-transparent! [&_.ant-table-thead>tr>th]:bg-[#1f1f1f]! [&_.ant-table-tbody>tr:hover>td]:bg-[#1f1f1f]!"
          size="middle"
          locale={{
            emptyText: (
              <div className="py-8 text-gray-500">
                No deletion requests pending
              </div>
            ),
          }}
        />
        {isFetchingNextPage && (
          <div className="text-center py-4 text-gray-400">Loading more...</div>
        )}
      </div>
    </div>
  );
}
