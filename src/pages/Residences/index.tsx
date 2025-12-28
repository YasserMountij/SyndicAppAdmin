import { useState, useMemo } from 'react';
import { Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { PageHeader, FilterBar, ConfirmModal } from '@/components/ui';
import { useResidences, useDeleteResidence, type Residence } from '@/api/hooks';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { RESIDENCE_STATUS_OPTIONS } from '@/utils/constants';
import { ResidenceTable } from './components/ResidenceTable';
import { CreateResidenceModal } from './components/CreateResidenceModal';
import { EditResidenceModal } from './components/EditResidenceModal';

export default function Residences() {
  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [isDemo, setIsDemo] = useState<string>('');
  const debouncedSearch = useDebouncedValue(search, 300);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingResidence, setEditingResidence] = useState<Residence | null>(null);
  const [deletingResidence, setDeletingResidence] = useState<Residence | null>(null);

  // API
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useResidences({
    search: debouncedSearch,
    status: status || undefined,
    isDemo: isDemo === '' ? undefined : isDemo === 'true',
  });

  const deleteResidence = useDeleteResidence();

  const residences = useMemo(() => {
    return data?.pages.flatMap((page) => page.residences) ?? [];
  }, [data]);

  const totalCount = data?.pages[0]?.totalCount ?? 0;

  const handleDelete = async () => {
    if (!deletingResidence) return;

    try {
      await deleteResidence.mutateAsync(deletingResidence.id);
      message.success('Residence deleted successfully');
      setDeletingResidence(null);
    } catch {
      message.error('Failed to delete residence');
    }
  };

  return (
    <div>
      <PageHeader
        title="Residences"
        subtitle={`${totalCount} residences total`}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalOpen(true)}
          >
            Add Residence
          </Button>
        }
      />

      <FilterBar
        searchPlaceholder="Search by name or address..."
        searchValue={search}
        onSearchChange={setSearch}
        filters={[
          {
            key: 'status',
            placeholder: 'Status',
            options: RESIDENCE_STATUS_OPTIONS,
            value: status,
            onChange: setStatus,
          },
          {
            key: 'isDemo',
            placeholder: 'Type',
            options: [
              { label: 'All', value: '' },
              { label: 'Demo Only', value: 'true' },
              { label: 'Real Only', value: 'false' },
            ],
            value: isDemo,
            onChange: setIsDemo,
          },
        ]}
      />

      <ResidenceTable
        residences={residences}
        loading={isLoading}
        hasMore={hasNextPage}
        loadingMore={isFetchingNextPage}
        onLoadMore={fetchNextPage}
        onEdit={setEditingResidence}
        onDelete={setDeletingResidence}
      />

      {/* Create Modal */}
      <CreateResidenceModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      {/* Edit Modal */}
      <EditResidenceModal
        residence={editingResidence}
        onClose={() => setEditingResidence(null)}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        open={!!deletingResidence}
        title="Delete Residence"
        content={
          <p>
            Are you sure you want to delete <strong>{deletingResidence?.name}</strong>?
            This will permanently delete all associated data including buildings, apartments,
            members, contributions, and expenses.
          </p>
        }
        onConfirm={handleDelete}
        onCancel={() => setDeletingResidence(null)}
        confirmLoading={deleteResidence.isPending}
        confirmText="Delete"
      />
    </div>
  );
}
