import { Modal, Form, Input, Select } from 'antd';
import { MEMBER_ROLES } from '@/utils/constants';
import { validateMoroccanPhone, createPhoneValidator } from '@/utils/phoneValidation';

interface InviteUserModalProps {
  open: boolean;
  onClose: () => void;
  onInvite: (phoneNumber: string, role: 'SYNDIC' | 'RESIDENT') => void;
  loading: boolean;
}

interface FormValues {
  phoneNumber: string;
  role: 'SYNDIC' | 'RESIDENT';
}

export function InviteUserModal({ open, onClose, onInvite, loading }: InviteUserModalProps) {
  const [form] = Form.useForm<FormValues>();

  const handleSubmit = (values: FormValues) => {
    // Normalize phone number before submitting
    const phoneResult = validateMoroccanPhone(values.phoneNumber);
    const normalizedPhone = phoneResult.isValid ? phoneResult.normalized : values.phoneNumber;
    
    onInvite(normalizedPhone, values.role);
    form.resetFields();
  };

  return (
    <Modal
      title="Invite User to Residence"
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText="Send Invitation"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ role: 'RESIDENT' }}
      >
        <Form.Item
          name="phoneNumber"
          label="Phone Number"
          rules={[
            { required: true, message: 'Please enter a phone number' },
            { validator: createPhoneValidator() },
          ]}
          extra="Morocco format: 06XXXXXXXX or 07XXXXXXXX"
        >
          <Input placeholder="0612345678" />
        </Form.Item>

        <Form.Item
          name="role"
          label="Role"
          rules={[{ required: true, message: 'Please select a role' }]}
        >
          <Select options={[...MEMBER_ROLES]} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
