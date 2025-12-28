import { useState, useMemo } from 'react';
import { Button, Table, Tooltip, Tag, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { PageHeader, FilterBar, ConfirmModal, ResidenceSelect } from '@/components/ui';
import { usePayments, useDeletePayment } from '@/api/hooks';
import { formatDate, formatCurrency } from '@/utils/format';
import { CreatePaymentModal } from './components/CreatePaymentModal';
import { EditPaymentModal } from './components/EditPaymentModal';
import type { SubscriptionPayment } from '@/api/hooks';

export default function Payments() {
  const [residenceId, setResidenceId] = useState<string>('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<SubscriptionPayment | null>(null);
  const [deletingPayment, setDeletingPayment] = useState<SubscriptionPayment | null>(null);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePayments({ residenceId: residenceId || undefined });

  const deletePayment = useDeletePayment();

  const payments = useMemo(() => {
    return data?.pages.flatMap((page) => page.payments) ?? [];
  }, [data]);

  const totalCount = data?.pages[0]?.totalCount ?? 0;

  const handleDelete = async () => {
    if (!deletingPayment) return;

    try {
      await deletePayment.mutateAsync(deletingPayment.id);
      message.success('Payment deleted successfully');
      setDeletingPayment(null);
    } catch {
      message.error('Failed to delete payment');
    }
  };

  const columns: ColumnsType<SubscriptionPayment> = [
    {
      title: 'Residence',
      key: 'residence',
      render: (_, record) => (
        <span className="font-medium text-white">{record.residence?.name ?? '-'}</span>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <Tag color="green">{formatCurrency(amount)}</Tag>
      ),
    },
    {
      title: 'Payment Date',
      dataIndex: 'paidAt',
      key: 'paidAt',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Note',
      dataIndex: 'note',
      key: 'note',
      render: (note: string) => (
        <span className="text-gray-400">{note || '-'}</span>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <div className="flex items-center gap-1">
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => setEditingPayment(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => setDeletingPayment(record)}
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
        title="Payments"
        subtitle={`${totalCount} payments total`}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalOpen(true)}
          >
            Add Payment
          </Button>
        }
      />

      <FilterBar
        searchPlaceholder="Filter by residence..."
        extra={
          <ResidenceSelect
            value={residenceId}
            onChange={setResidenceId}
            placeholder="Filter by residence"
            className="w-64"
          />
        }
      />

      <div 
        className="overflow-auto max-h-[calc(100vh-280px)]" 
        onScroll={handleScroll}
      >
        <Table
          dataSource={payments}
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

      <CreatePaymentModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      <EditPaymentModal
        payment={editingPayment}
        onClose={() => setEditingPayment(null)}
      />

      <ConfirmModal
        open={!!deletingPayment}
        title="Delete Payment"
        content={
          <p>
            Are you sure you want to delete this payment of{' '}
            <strong>{deletingPayment ? formatCurrency(deletingPayment.amount) : ''}</strong>?
          </p>
        }
        onConfirm={handleDelete}
        onCancel={() => setDeletingPayment(null)}
        confirmLoading={deletePayment.isPending}
        confirmText="Delete"
      />
    </div>
  );
}
