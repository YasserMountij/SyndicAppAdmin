import { useState, useMemo } from 'react';
import { Table, Button, Tooltip, message } from 'antd';
import { EyeOutlined, StopOutlined, CheckOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import type { ColumnsType } from 'antd/es/table';
import { PageHeader, FilterBar, ConfirmModal, BannedBadge } from '@/components/ui';
import { useUsers, useDeleteUser, useBanUser, useUnbanUser, type User } from '@/api/hooks';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { formatDate, formatPhone } from '@/utils/format';

export default function Users() {
  const navigate = useNavigate();

  // Filters
  const [search, setSearch] = useState('');
  const [isBanned, setIsBanned] = useState<string>('');
  const debouncedSearch = useDebouncedValue(search, 300);

  // Modals
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [banningUser, setBanningUser] = useState<User | null>(null);
  const [unbanningUser, setUnbanningUser] = useState<User | null>(null);

  // API
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useUsers({
    search: debouncedSearch,
    isBanned: isBanned === '' ? undefined : isBanned === 'true',
  });

  const deleteUser = useDeleteUser();
  const banUser = useBanUser();
  const unbanUser = useUnbanUser();

  const users = useMemo(() => {
    return data?.pages.flatMap((page) => page.users) ?? [];
  }, [data]);

  const totalCount = data?.pages[0]?.totalCount ?? 0;

  const handleDelete = async () => {
    if (!deletingUser) return;

    try {
      await deleteUser.mutateAsync(deletingUser.id);
      message.success('User deleted successfully');
      setDeletingUser(null);
    } catch {
      message.error('Failed to delete user');
    }
  };

  const handleBan = async () => {
    if (!banningUser) return;

    try {
      await banUser.mutateAsync({
        userId: banningUser.id,
        data: { reason: 'Banned by admin' },
      });
      message.success('User banned successfully');
      setBanningUser(null);
    } catch {
      message.error('Failed to ban user');
    }
  };

  const handleUnban = async () => {
    if (!unbanningUser) return;

    try {
      await unbanUser.mutateAsync(unbanningUser.id);
      message.success('User unbanned successfully');
      setUnbanningUser(null);
    } catch {
      message.error('Failed to unban user');
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record) => (
        <div className="flex items-center">
          <span className="font-medium text-white">{name}</span>
          <div className="flex items-center gap-1 ml-2">
            {record.isBanned && <BannedBadge />}
          </div>
        </div>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      render: (phone: string) => (
        <span className="text-gray-400">{formatPhone(phone)}</span>
      ),
    },
    {
      title: 'Residences',
      key: 'residences',
      render: (_, record) => (
        <span className="text-gray-400">{record._count?.residencyMembers ?? 0}</span>
      ),
    },
    {
      title: 'Joined',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <div className="flex items-center gap-1">
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/users/${record.id}`)}
            />
          </Tooltip>
          {record.isBanned ? (
            <Tooltip title="Unban">
              <Button
                type="text"
                icon={<CheckOutlined className="text-green-500" />}
                onClick={() => setUnbanningUser(record)}
              />
            </Tooltip>
          ) : (
            <Tooltip title="Ban">
              <Button
                type="text"
                icon={<StopOutlined className="text-yellow-500" />}
                onClick={() => setBanningUser(record)}
              />
            </Tooltip>
          )}
          <Tooltip title="Delete">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => setDeletingUser(record)}
            />
          </Tooltip>
        </div>
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
        title="Users"
        subtitle={`${totalCount} users total`}
      />

      <FilterBar
        searchPlaceholder="Search by name or phone..."
        searchValue={search}
        onSearchChange={setSearch}
        filters={[
          {
            key: 'isBanned',
            placeholder: 'Status',
            options: [
              { label: 'All', value: '' },
              { label: 'Banned', value: 'true' },
              { label: 'Active', value: 'false' },
            ],
            value: isBanned,
            onChange: setIsBanned,
          },
        ]}
      />

      <div 
        className="overflow-auto max-h-[calc(100vh-280px)]" 
        onScroll={handleScroll}
      >
        <Table
          dataSource={users}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          pagination={false}
          scroll={{ x: 'max-content' }}
          className="[&_.ant-table]:bg-transparent! [&_.ant-table-thead>tr>th]:bg-[#1f1f1f]! [&_.ant-table-tbody>tr:hover>td]:bg-[#1f1f1f]!"
          size="middle"
        />
        {isFetchingNextPage && (
          <div className="text-center py-4 text-gray-400">Loading more...</div>
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmModal
        open={!!deletingUser}
        title="Delete User"
        content={
          <p>
            Are you sure you want to delete <strong>{deletingUser?.name}</strong>?
            This action cannot be undone.
          </p>
        }
        onConfirm={handleDelete}
        onCancel={() => setDeletingUser(null)}
        confirmLoading={deleteUser.isPending}
        confirmText="Delete"
      />

      {/* Ban Confirmation */}
      <ConfirmModal
        open={!!banningUser}
        title="Ban User"
        content={
          <p>
            Are you sure you want to ban <strong>{banningUser?.name}</strong>?
            They will not be able to access the app.
          </p>
        }
        onConfirm={handleBan}
        onCancel={() => setBanningUser(null)}
        confirmLoading={banUser.isPending}
        confirmText="Ban User"
        danger={false}
      />

      {/* Unban Confirmation */}
      <ConfirmModal
        open={!!unbanningUser}
        title="Unban User"
        content={
          <p>
            Are you sure you want to unban <strong>{unbanningUser?.name}</strong>?
            They will be able to access the app again.
          </p>
        }
        onConfirm={handleUnban}
        onCancel={() => setUnbanningUser(null)}
        confirmLoading={unbanUser.isPending}
        confirmText="Unban User"
        danger={false}
      />
    </div>
  );
}
