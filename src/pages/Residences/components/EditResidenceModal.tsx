import { useMemo, useState } from 'react';
import { Modal, Form, Input, DatePicker, Switch, message, Collapse } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useUpdateResidence } from '@/api/hooks';
import { LimitsEditor } from '@/components/ui';
import type { Residence, ResidenceLimits } from '@/api/hooks';

interface EditResidenceModalProps {
  residence: Residence | null;
  onClose: () => void;
}

interface FormValues {
  name: string;
  address?: string;
  expirationDate: dayjs.Dayjs;
  isDemo: boolean;
}

// Inner component that resets when residence changes
function EditResidenceForm({ 
  residence, 
  onClose 
}: { 
  residence: Residence; 
  onClose: () => void;
}) {
  const updateResidence = useUpdateResidence();
  
  // Initialize state directly from props - no useEffect needed
  const [limits, setLimits] = useState<Partial<ResidenceLimits>>(
    () => residence.limits ?? {}
  );
  const [isDemo, setIsDemo] = useState(() => residence.isDemo);

  const initialValues = useMemo(() => ({
    name: residence.name,
    address: residence.address ?? '',
    expirationDate: dayjs(residence.expirationDate),
    isDemo: residence.isDemo,
  }), [residence]);

  const [form] = Form.useForm<FormValues>();

  const handleSubmit = async (values: FormValues) => {
    if (!residence) return;

    try {
      await updateResidence.mutateAsync({
        residenceId: residence.id,
        data: {
          name: values.name,
          address: values.address,
          expirationDate: values.expirationDate.toISOString(),
          isDemo: values.isDemo,
          limits: Object.keys(limits).length > 0 ? limits : undefined,
        },
      });
      message.success('Residence updated successfully');
      onClose();
    } catch {
      message.error('Failed to update residence');
    }
  };

  const handleDemoChange = (checked: boolean) => {
    setIsDemo(checked);
  };

  return (
    <Modal
      title="Edit Residence"
      open={true}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={updateResidence.isPending}
      okText="Save"
      width={700}
      styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={handleSubmit}
      >
        <Form.Item
          name="name"
          label="Residence Name"
          rules={[{ required: true, message: 'Please enter the residence name' }]}
        >
          <Input placeholder="e.g., Résidence Al Manar" />
        </Form.Item>

        <Form.Item
          name="address"
          label="Address"
        >
          <Input placeholder="e.g., Casablanca, Morocco" />
        </Form.Item>

        <Form.Item
          name="expirationDate"
          label="Expiration Date"
          rules={[{ required: true, message: 'Please select an expiration date' }]}
        >
          <DatePicker 
            className="w-full" 
            format="DD/MM/YYYY"
          />
        </Form.Item>

        <Form.Item
          name="isDemo"
          label="Demo Residence"
          valuePropName="checked"
          extra="Demo residences have restricted limits and are for app store testing"
        >
          <Switch onChange={handleDemoChange} />
        </Form.Item>

        <Collapse
          ghost
          defaultActiveKey={['limits']}
          items={[
            {
              key: 'limits',
              label: (
                <span className="text-gray-400">
                  <SettingOutlined className="mr-2" />
                  Resource Limits
                </span>
              ),
              children: (
                <LimitsEditor
                  value={limits}
                  onChange={setLimits}
                  isDemo={isDemo}
                />
              ),
            },
          ]}
        />
      </Form>
    </Modal>
  );
}

// Exported wrapper component - uses key to reset inner component when residence changes
export function EditResidenceModal({ residence, onClose }: EditResidenceModalProps) {
  if (!residence) return null;
  
  // key={residence.id} ensures the inner component resets completely when editing a different residence
  return <EditResidenceForm key={residence.id} residence={residence} onClose={onClose} />;
}
