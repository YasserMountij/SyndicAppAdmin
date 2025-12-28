import { Table, Empty, Spin } from 'antd';
import type { TableProps } from 'antd';

interface DataTableProps<T> extends Omit<TableProps<T>, 'loading'> {
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

export function DataTable<T extends object>({
  loading,
  dataSource,
  hasMore,
  onLoadMore,
  ...props
}: DataTableProps<T>) {
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasMore && !loading && onLoadMore) {
      onLoadMore();
    }
  };

  return (
    <div 
      className="overflow-auto max-h-[calc(100vh-250px)] -mx-4 sm:mx-0" 
      onScroll={handleScroll}
    >
      <Table
        {...props}
        dataSource={dataSource}
        loading={loading ? { indicator: <Spin size="large" /> } : false}
        locale={{
          emptyText: <Empty description="No data found" />,
        }}
        pagination={false}
        scroll={{ x: 'max-content' }}
        className="[&_.ant-table]:bg-transparent! [&_.ant-table-thead>tr>th]:bg-[#1f1f1f]! [&_.ant-table-tbody>tr:hover>td]:bg-[#1f1f1f]! min-w-full"
        size="middle"
      />
      {loading && dataSource && dataSource.length > 0 && (
        <div className="flex justify-center py-4">
          <Spin />
        </div>
      )}
    </div>
  );
}
