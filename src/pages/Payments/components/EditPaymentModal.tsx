import { useEffect } from 'react';
import { Modal, Form, InputNumber, DatePicker, Input, message } from 'antd';
import dayjs from 'dayjs';
import { useUpdatePayment } from '@/api/hooks';
import type { SubscriptionPayment } from '@/api/hooks';

interface EditPaymentModalProps {
  payment: SubscriptionPayment | null;
  onClose: () => void;
}

interface FormValues {
  amount: number;
  paidAt: dayjs.Dayjs;
  note?: string;
}

export function EditPaymentModal({ payment, onClose }: EditPaymentModalProps) {
  const [form] = Form.useForm<FormValues>();
  const updatePayment = useUpdatePayment();

  useEffect(() => {
    if (payment) {
      form.setFieldsValue({
        amount: payment.amount,
        paidAt: dayjs(payment.paidAt),
        note: payment.note ?? '',
      });
    }
  }, [payment, form]);

  const handleSubmit = async (values: FormValues) => {
    if (!payment) return;

    try {
      await updatePayment.mutateAsync({
        paymentId: payment.id,
        data: {
          amount: values.amount,
          paidAt: values.paidAt.toISOString(),
          note: values.note,
        },
      });
      message.success('Payment updated successfully');
      onClose();
    } catch {
      message.error('Failed to update payment');
    }
  };

  return (
    <Modal
      title="Edit Payment"
      open={!!payment}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={updatePayment.isPending}
      okText="Save"
      width={500}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item label="Residence">
          <Input disabled value={payment?.residence?.name ?? '-'} />
        </Form.Item>

        <Form.Item
          name="amount"
          label="Amount (MAD)"
          rules={[{ required: true, message: 'Please enter the amount' }]}
        >
          <InputNumber
            className="w-full"
            min={0}
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
          name="note"
          label="Note"
        >
          <Input.TextArea rows={2} placeholder="Optional note" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
