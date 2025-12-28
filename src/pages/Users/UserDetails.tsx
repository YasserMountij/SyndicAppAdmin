import { useParams, useNavigate } from 'react-router';
import { Card, Descriptions, Table, Button, Tag, Spin, Empty, message } from 'antd';
import { ArrowLeftOutlined, StopOutlined, CheckOutlined, DeleteOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useUser, useBanUser, useUnbanUser, useDeleteUser } from '@/api/hooks';
import { PageHeader, ConfirmModal, BannedBadge, SyndicBadge, ResidentBadge } from '@/components/ui';
import { formatDate, formatPhone } from '@/utils/format';

export default function UserDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showUnbanModal, setShowUnbanModal] = useState(false);

  const { data: user, isLoading, error } = useUser(id!);
  const banUser = useBanUser();
  const unbanUser = useUnbanUser();
  const deleteUser = useDeleteUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Empty description="User not found" />
        <Button onClick={() => navigate('/users')} className="mt-4">
          Back to Users
        </Button>
      </div>
    );
  }

  const handleBan = async () => {
    try {
      await banUser.mutateAsync({ userId: user.id, data: { reason: 'Banned by admin' } });
      message.success('User banned successfully');
      setShowBanModal(false);
    } catch {
      message.error('Failed to ban user');
    }
  };

  const handleUnban = async () => {
    try {
      await unbanUser.mutateAsync(user.id);
      message.success('User unbanned successfully');
      setShowUnbanModal(false);
    } catch {
      message.error('Failed to unban user');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser.mutateAsync(user.id);
      message.success('User deleted successfully');
      navigate('/users');
    } catch {
      message.error('Failed to delete user');
    }
  };

  return (
    <div>
      <PageHeader
        title={user.name}
        extra={
          <div className="flex flex-wrap gap-2">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/users')}
            >
              Back
            </Button>
            {user.isBanned ? (
              <Button
                icon={<CheckOutlined />}
                onClick={() => setShowUnbanModal(true)}
              >
                Unban User
              </Button>
            ) : (
              <Button
                icon={<StopOutlined />}
                onClick={() => setShowBanModal(true)}
              >
                Ban User
              </Button>
            )}
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => setShowDeleteModal(true)}
            >
              Delete
            </Button>
          </div>
        }
      />

      {/* User Info */}
      <Card className="bg-[#141414]! border-[#303030]! mb-6">
        <Descriptions column={{ xs: 1, sm: 2, lg: 3 }}>
          <Descriptions.Item label="Status">
            <div className="flex items-center gap-2">
              {user.isBanned ? <BannedBadge /> : <Tag color="green">Active</Tag>}
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Phone">
            {formatPhone(user.phoneNumber)}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {user.email || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Joined">
            {formatDate(user.createdAt)}
          </Descriptions.Item>
          <Descriptions.Item label="Residences">
            {user.residencyMembers?.length ?? 0}
          </Descriptions.Item>
          {user.isBanned && user.bannedAt && (
            <Descriptions.Item label="Banned At">
              {formatDate(user.bannedAt)}
            </Descriptions.Item>
          )}
          {user.isBanned && user.banReason && (
            <Descriptions.Item label="Ban Reason">
              {user.banReason}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* Residences */}
      {user.residencyMembers && user.residencyMembers.length > 0 && (
        <Card 
          title="Residences" 
          className="bg-[#141414]! border-[#303030]!"
          styles={{ header: { borderBottom: '1px solid #303030' } }}
        >
          <Table
            dataSource={user.residencyMembers}
            rowKey="id"
            pagination={false}
            columns={[
              {
                title: 'Residence',
                dataIndex: ['residence', 'name'],
                key: 'residence',
                render: (name: string, record) => (
                  <Button
                    type="link"
                    className="p-0"
                    onClick={() => navigate(`/residences/${record.residence.id}`)}
                  >
                    {name}
                  </Button>
                ),
              },
              {
                title: 'Role',
                dataIndex: 'role',
                key: 'role',
                render: (role: string) => role === 'SYNDIC' ? <SyndicBadge /> : <ResidentBadge />,
              },
            ]}
          />
        </Card>
      )}

      {/* Modals */}
      <ConfirmModal
        open={showDeleteModal}
        title="Delete User"
        content={
          <p>
            Are you sure you want to delete <strong>{user.name}</strong>?
            This action cannot be undone.
          </p>
        }
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        confirmLoading={deleteUser.isPending}
        confirmText="Delete"
      />

      <ConfirmModal
        open={showBanModal}
        title="Ban User"
        content={
          <p>
            Are you sure you want to ban <strong>{user.name}</strong>?
            They will not be able to access the app.
          </p>
        }
        onConfirm={handleBan}
        onCancel={() => setShowBanModal(false)}
        confirmLoading={banUser.isPending}
        confirmText="Ban User"
        danger={false}
      />

      <ConfirmModal
        open={showUnbanModal}
        title="Unban User"
        content={
          <p>
            Are you sure you want to unban <strong>{user.name}</strong>?
          </p>
        }
        onConfirm={handleUnban}
        onCancel={() => setShowUnbanModal(false)}
        confirmLoading={unbanUser.isPending}
        confirmText="Unban User"
        danger={false}
      />
    </div>
  );
}
