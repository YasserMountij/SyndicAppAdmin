import { Select, Spin } from 'antd';
import { useState, useMemo } from 'react';
import { useResidences } from '@/api/hooks';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

interface ResidenceSelectProps {
  value?: string;
  onChange?: (value: string, residence?: { id: string; name: string }) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  excludeDemo?: boolean;
}

export function ResidenceSelect({
  value,
  onChange,
  placeholder = 'Select residence',
  className,
  disabled,
  excludeDemo = false,
}: ResidenceSelectProps) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useResidences({
    search: debouncedSearch,
    isDemo: excludeDemo ? false : undefined,
  });

  const options = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) =>
      page.residences.map((r) => ({
        value: r.id,
        label: r.name,
        residence: r,
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
        onChange?.(val, selected?.residence);
      }}
      options={options}
      loading={isLoading}
      notFoundContent={isLoading ? <Spin size="small" /> : 'No residences found'}
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
