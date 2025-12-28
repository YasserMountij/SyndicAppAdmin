import { useParams, useNavigate } from 'react-router';
import { Card, Descriptions, Table, Button, Tag, Spin, Empty, message, Popconfirm } from 'antd';
import { ArrowLeftOutlined, UserAddOutlined, DeleteOutlined } from '@ant-design/icons';
import { useState, useMemo } from 'react';
import { useResidence, useCreateInvitation, useDeleteInvitation, useInvitations, useMembers, usePayments } from '@/api/hooks';
import { PageHeader } from '@/components/ui';
import {
  ActiveBadge,
  ExpiredBadge,
  ExpiringSoonBadge,
  DemoBadge,
  SyndicBadge,
  ResidentBadge,
} from '@/components/ui';
import { formatDate, formatCurrency, formatPhone, isExpired, isExpiringSoon } from '@/utils/format';
import { InviteUserModal } from './components/InviteUserModal';

export default function ResidenceDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  // Separate queries for isolation
  const { data: residence, isLoading: isLoadingResidence, error } = useResidence(id!);
  const { data: membersData, isLoading: isLoadingMembers } = useMembers({ residenceId: id });
  const { data: paymentsData, isLoading: isLoadingPayments } = usePayments({ residenceId: id });
  const { data: invitationsData, isLoading: isLoadingInvitations } = useInvitations({ 
    residenceId: id,
    status: 'PENDING'
  });

  const createInvitation = useCreateInvitation();
  const deleteInvitation = useDeleteInvitation();

  // Flatten paginated data
  const members = useMemo(() => 
    membersData?.pages.flatMap(page => page.members) || [], 
    [membersData]
  );
  const payments = useMemo(() => 
    paymentsData?.pages.flatMap(page => page.payments) || [], 
    [paymentsData]
  );
  const invitations = useMemo(() => 
    invitationsData?.pages.flatMap(page => page.invitations) || [], 
    [invitationsData]
  );

  if (isLoadingResidence) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !residence) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Empty description="Residence not found" />
        <Button onClick={() => navigate('/residences')} className="mt-4">
          Back to Residences
        </Button>
      </div>
    );
  }

  const getStatusBadge = () => {
    if (isExpired(residence.expirationDate)) return <ExpiredBadge />;
    if (isExpiringSoon(residence.expirationDate)) return <ExpiringSoonBadge />;
    return <ActiveBadge />;
  };

  const handleInvite = async (phoneNumber: string, role: 'SYNDIC' | 'RESIDENT') => {
    try {
      await createInvitation.mutateAsync({
        phoneNumber,
        role,
        residenceId: residence.id,
      });
      message.success('Invitation sent successfully');
      setInviteModalOpen(false);
    } catch {
      message.error('Failed to send invitation');
    }
  };

  const handleDeleteInvitation = async (invitationId: string) => {
    try {
      await deleteInvitation.mutateAsync(invitationId);
      message.success('Invitation deleted successfully');
    } catch {
      message.error('Failed to delete invitation');
    }
  };

  return (
    <div>
      <PageHeader
        title={residence.name}
        extra={
          <div className="flex flex-wrap gap-2">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/residences')}
            >
              Back
            </Button>
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={() => setInviteModalOpen(true)}
            >
              Invite User
            </Button>
          </div>
        }
      />

      {/* Residence Info */}
      <Card className="bg-[#141414]! border-[#303030]! mb-6">
        <Descriptions column={{ xs: 1, sm: 2, lg: 3 }}>
          <Descriptions.Item label="Status">
            <div className="flex items-center gap-2">
              {getStatusBadge()}
              {residence.isDemo && <DemoBadge />}
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Address">
            {residence.address || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Expiration Date">
            {formatDate(residence.expirationDate)}
          </Descriptions.Item>
          <Descriptions.Item label="Buildings">
            {residence._count?.buildings ?? 0}
          </Descriptions.Item>
          <Descriptions.Item label="Apartments">
            {residence._count?.apartments ?? 0}
          </Descriptions.Item>
          <Descriptions.Item label="Members">
            {residence._count?.members ?? 0}
          </Descriptions.Item>
          <Descriptions.Item label="Created">
            {formatDate(residence.createdAt)}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Members */}
      <Card 
        title="Members" 
        className="bg-[#141414]! border-[#303030]! mb-6!"
        styles={{ header: { borderBottom: '1px solid #303030' } }}
        loading={isLoadingMembers}
      >
        <Table
          dataSource={members}
          rowKey="id"
          pagination={false}
          columns={[
            {
              title: 'Name',
              dataIndex: ['user', 'name'],
              key: 'name',
            },
            {
              title: 'Phone',
              dataIndex: ['user', 'phoneNumber'],
              key: 'phone',
              render: (phone: string) => formatPhone(phone),
            },
            {
              title: 'Role',
              dataIndex: 'role',
              key: 'role',
              render: (role: string) => role === 'SYNDIC' ? <SyndicBadge /> : <ResidentBadge />,
            },
            {
              title: 'Joined',
              dataIndex: 'joinedAt',
              key: 'joinedAt',
              render: (date: string) => formatDate(date),
            },
            {
              title: 'Status',
              key: 'status',
              render: (_, record) => (
                <div className="flex items-center gap-2">
                  {record.user.isBanned && <Tag color="red">Banned</Tag>}
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* Pending Invitations */}
      <Card 
        title="Pending Invitations" 
        className="bg-[#141414]! border-[#303030]! mb-6"
        styles={{ header: { borderBottom: '1px solid #303030' } }}
        loading={isLoadingInvitations}
      >
        <Table
          dataSource={invitations}
            rowKey="id"
            pagination={false}
            columns={[
              {
                title: 'Phone Number',
                dataIndex: 'phoneNumber',
                key: 'phoneNumber',
                render: (phone: string) => formatPhone(phone),
              },
              {
                title: 'Role',
                dataIndex: 'role',
                key: 'role',
                render: (role: string) => role === 'SYNDIC' ? <SyndicBadge /> : <ResidentBadge />,
              },
              {
                title: 'Sent',
                dataIndex: 'createdAt',
                key: 'createdAt',
                render: (date: string) => formatDate(date),
              },
              {
                title: 'Actions',
                key: 'actions',
                render: (_, record) => (
                  <Popconfirm
                    title="Delete Invitation"
                    description="Are you sure you want to delete this invitation?"
                    onConfirm={() => handleDeleteInvitation(record.id)}
                    okText="Yes"
                    cancelText="No"
                    okButtonProps={{ danger: true }}
                  >
                    <Button 
                      type="text" 
                      danger 
                      icon={<DeleteOutlined />} 
                      loading={deleteInvitation.isPending && deleteInvitation.variables === record.id}
                    />
                  </Popconfirm>
                ),
              },
            ]}
          />
        </Card>


      {/* Recent Payments */}
      <Card 
        title="Recent Payments" 
        className="bg-[#141414]! border-[#303030]!"
        styles={{ header: { borderBottom: '1px solid #303030' } }}
        loading={isLoadingPayments}
      >
        <Table
          dataSource={payments}
          rowKey="id"
          pagination={false}
          columns={[
            {
              title: 'Amount',
              dataIndex: 'amount',
              key: 'amount',
              render: (amount: number) => (
                <Tag color="green">{formatCurrency(amount)}</Tag>
              ),
            },
            {
              title: 'Date',
              dataIndex: 'paidAt',
              key: 'paidAt',
              render: (date: string) => formatDate(date),
            },
            {
              title: 'Note',
              dataIndex: 'note',
              key: 'note',
              render: (note: string) => note || '-',
            },
          ]}
        />
      </Card>

      {/* Invite Modal */}
      <InviteUserModal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onInvite={handleInvite}
        loading={createInvitation.isPending}
      />
    </div>
  );
}
