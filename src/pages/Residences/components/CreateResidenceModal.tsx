import { useState } from 'react';
import { Modal, Form, Input, DatePicker, Switch, message, Collapse } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useCreateResidence } from '@/api/hooks';
import { LimitsEditor } from '@/components/ui';
import { type ResidenceLimits, DEFAULT_LIMITS, DEMO_LIMITS } from '@/api/hooks';

interface CreateResidenceModalProps {
  open: boolean;
  onClose: () => void;
}

interface FormValues {
  name: string;
  address?: string;
  expirationDate: dayjs.Dayjs;
  isDemo: boolean;
}

export function CreateResidenceModal({ open, onClose }: CreateResidenceModalProps) {
  const [form] = Form.useForm<FormValues>();
  const createResidence = useCreateResidence();
  const [limits, setLimits] = useState<Partial<ResidenceLimits>>({});
  const [isDemo, setIsDemo] = useState(false);

  const handleSubmit = async (values: FormValues) => {
    try {
      await createResidence.mutateAsync({
        name: values.name,
        address: values.address,
        expirationDate: values.expirationDate.toISOString(),
        isDemo: values.isDemo,
        limits: Object.keys(limits).length > 0 ? limits : undefined,
      });
      message.success('Residence created successfully');
      form.resetFields();
      setLimits({});
      setIsDemo(false);
      onClose();
    } catch {
      message.error('Failed to create residence');
    }
  };

  const handleDemoChange = (checked: boolean) => {
    setIsDemo(checked);
    // Reset limits to demo/default values when toggling
    setLimits(checked ? { ...DEMO_LIMITS } : { ...DEFAULT_LIMITS });
  };

  const handleClose = () => {
    form.resetFields();
    setLimits({});
    setIsDemo(false);
    onClose();
  };

  return (
    <Modal
      title="Create New Residence"
      open={open}
      onCancel={handleClose}
      onOk={() => form.submit()}
      confirmLoading={createResidence.isPending}
      okText="Create"
      width={700}
      styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          isDemo: false,
          expirationDate: dayjs().add(1, 'year'),
        }}
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
            className="w-full!" 
            format="DD/MM/YYYY"
            disabledDate={(current) => current && current < dayjs().startOf('day')}
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
          items={[
            {
              key: 'limits',
              label: (
                <span className="text-gray-400">
                  <SettingOutlined className="mr-2" />
                  Resource Limits (Advanced)
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
