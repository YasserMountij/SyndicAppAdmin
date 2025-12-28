import { Select, Spin } from 'antd';
import { useState, useMemo } from 'react';
import { useUsers } from '@/api/hooks';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { formatPhone } from '@/utils/format';

interface UserSelectProps {
  value?: string;
  onChange?: (value: string, user?: { id: string; name: string }) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function UserSelect({
  value,
  onChange,
  placeholder = 'Select user',
  className,
  disabled,
}: UserSelectProps) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useUsers({
    search: debouncedSearch,
  });

  const options = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) =>
      page.users.map((u) => ({
        value: u.id,
        label: `${u.name} (${formatPhone(u.phoneNumber)})`,
        user: u,
      }))
    );
  }, [data]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <Select
      showSearch
      value={value}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      filterOption={false}
      onSearch={setSearch}
      onChange={(val, option) => {
        const selected = Array.isArray(option) ? option[0] : option;
        onChange?.(val, selected?.user);
      }}
      options={options}
      loading={isLoading}
      notFoundContent={isLoading ? <Spin size="small" /> : 'No users found'}
      onPopupScroll={handleScroll}
      dropdownRender={(menu) => (
        <>
          {menu}
          {isFetchingNextPage && (
            <div className="text-center py-2">
              <Spin size="small" />
            </div>
          )}
        </>
      )}
    />
  );
}
