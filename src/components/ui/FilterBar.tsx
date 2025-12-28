import { Input, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: {
    key: string;
    placeholder: string;
    options: readonly FilterOption[] | FilterOption[];
    value?: string;
    onChange?: (value: string) => void;
  }[];
  extra?: React.ReactNode;
}

export function FilterBar({
  searchPlaceholder = 'Search...',
  searchValue,
  onSearchChange,
  filters = [],
  extra,
}: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 mb-6">
      <Input
        placeholder={searchPlaceholder}
        prefix={<SearchOutlined className="text-gray-400" />}
        value={searchValue}
        onChange={(e) => onSearchChange?.(e.target.value)}
        className="w-full sm:w-64"
        allowClear
      />
      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
        {filters.map((filter) => (
          <Select
            key={filter.key}
            placeholder={filter.placeholder}
            value={filter.value || undefined}
            onChange={filter.onChange}
            options={[...filter.options]}
            className="min-w-32 flex-1 sm:flex-none"
            allowClear
          />
        ))}
      </div>
      {extra && <div className="sm:ml-auto mt-2 sm:mt-0">{extra}</div>}
    </div>
  );
}
