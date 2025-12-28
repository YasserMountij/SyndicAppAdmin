import { Modal, Form, InputNumber, DatePicker, Input, message } from 'antd';
import dayjs from 'dayjs';
import { useCreatePayment } from '@/api/hooks';
import { ResidenceSelect } from '@/components/ui';

interface CreatePaymentModalProps {
  open: boolean;
  onClose: () => void;
}

interface FormValues {
  residenceId: string;
  amount: number;
  paidAt: dayjs.Dayjs;
  note?: string;
  extendMonths?: number;
}

export function CreatePaymentModal({ open, onClose }: CreatePaymentModalProps) {
  const [form] = Form.useForm<FormValues>();
  const createPayment = useCreatePayment();

  const handleSubmit = async (values: FormValues) => {
    try {
      await createPayment.mutateAsync({
        residenceId: values.residenceId,
        amount: values.amount,
        paidAt: values.paidAt.toISOString(),
        note: values.note,
        extendMonths: values.extendMonths,
      });
      message.success('Payment created successfully');
      form.resetFields();
      onClose();
    } catch {
      message.error('Failed to create payment');
    }
  };

  return (
    <Modal
      title="Record New Payment"
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={createPayment.isPending}
      okText="Create"
      width={500}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          paidAt: dayjs(),
        }}
      >
        <Form.Item
          name="residenceId"
          label="Residence"
          rules={[{ required: true, message: 'Please select a residence' }]}
        >
          <ResidenceSelect className="w-full" excludeDemo />
        </Form.Item>

        <Form.Item
          name="amount"
          label="Amount (MAD)"
          rules={[{ required: true, message: 'Please enter the amount' }]}
        >
          <InputNumber
            className="w-full"
            min={0}
            placeholder="e.g., 1000"
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          />
        </Form.Item>

        <Form.Item
          name="paidAt"
          label="Payment Date"
          rules={[{ required: true, message: 'Please select the payment date' }]}
        >
          <DatePicker className="w-full" format="DD/MM/YYYY" />
        </Form.Item>

        <Form.Item
          name="extendMonths"
          label="Extend Subscription (Months)"
          extra="Leave empty to not extend the subscription"
        >
          <InputNumber
            className="w-full"
            min={1}
            max={24}
            placeholder="e.g., 12"
          />
        </Form.Item>

        <Form.Item
          name="note"
          label="Note"
        >
          <Input.TextArea rows={2} placeholder="Optional note about this payment" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
