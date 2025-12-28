import { InputNumber, Slider, Tooltip, Card, Row, Col, Button } from 'antd';
import { InfoCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { type ResidenceLimits, DEFAULT_LIMITS, DEMO_LIMITS, LIMIT_FIELDS } from '@/api/hooks';

interface LimitsEditorProps {
  value?: Partial<ResidenceLimits>;
  onChange?: (limits: Partial<ResidenceLimits>) => void;
  isDemo?: boolean;
}

/**
 * Reusable component for editing residence limits
 * Dynamically renders all limit fields from LIMIT_FIELDS metadata
 */
export function LimitsEditor({ value = {}, onChange, isDemo = false }: LimitsEditorProps) {
  const defaults = isDemo ? DEMO_LIMITS : DEFAULT_LIMITS;

  const handleChange = (key: keyof ResidenceLimits, newValue: number | null) => {
    if (newValue === null) return;
    onChange?.({
      ...value,
      [key]: newValue,
    });
  };

  const handleReset = () => {
    onChange?.(isDemo ? { ...DEMO_LIMITS } : { ...DEFAULT_LIMITS });
  };

  const handleResetField = (key: keyof ResidenceLimits) => {
    onChange?.({
      ...value,
      [key]: defaults[key],
    });
  };

  const formatBytes = (bytes: number): string => {
    if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)} GB`;
    if (bytes >= 1048576) return `${Math.round(bytes / 1048576)} MB`;
    return `${bytes} bytes`;
  };

  return (
    <Card
      title={
        <div className="flex justify-between items-center">
          <span>Resource Limits</span>
          <Button
            size="small"
            icon={<ReloadOutlined />}
            onClick={handleReset}
          >
            Reset to {isDemo ? 'Demo' : 'Default'}
          </Button>
        </div>
      }
      className="bg-[#1a1a1a]! border-[#303030]!"
      styles={{
        header: { borderBottom: '1px solid #303030' },
        body: { padding: '16px' },
      }}
    >
      <Row gutter={[16, 16]}>
        {LIMIT_FIELDS.map((field) => {
          const currentValue = value[field.key] ?? defaults[field.key];
          const isStorageField = field.key === 'maxStorageBytes';

          return (
            <Col xs={24} md={12} key={field.key}>
              <div className="mb-2">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-1">
                    <span className="text-white font-medium">{field.label}</span>
                    <Tooltip title={field.description}>
                      <InfoCircleOutlined className="text-gray-500 cursor-help" />
                    </Tooltip>
                  </div>
                  <Button
                    type="text"
                    size="small"
                    onClick={() => handleResetField(field.key)}
                    className="text-gray-500 text-xs"
                  >
                    Reset
                  </Button>
                </div>
                
                <div className="flex items-center gap-3">
                  <Slider
                    className="flex-1"
                    value={currentValue}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    onChange={(val) => handleChange(field.key, val)}
                    tooltip={{
                      formatter: isStorageField
                        ? (val) => formatBytes(val ?? 0)
                        : undefined,
                    }}
                  />
                  {isStorageField ? (
                    <div className="w-20 text-right text-gray-400 text-sm">
                      {formatBytes(currentValue)}
                    </div>
                  ) : (
                    <InputNumber
                      value={currentValue}
                      min={field.min}
                      max={field.max}
                      step={field.step}
                      onChange={(val) => handleChange(field.key, val)}
                      className="w-20"
                    />
                  )}
                </div>
                
                <div className="text-xs text-gray-500 mt-1">
                  Default: {isStorageField ? formatBytes(defaults[field.key]) : defaults[field.key]}
                </div>
              </div>
            </Col>
          );
        })}
      </Row>
    </Card>
  );
}
