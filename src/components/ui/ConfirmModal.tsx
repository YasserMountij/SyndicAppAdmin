import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  content: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLoading?: boolean;
  danger?: boolean;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmModal({
  open,
  title,
  content,
  onConfirm,
  onCancel,
  confirmLoading,
  danger = true,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      title={
        <div className="flex items-center gap-2">
          <ExclamationCircleOutlined className={danger ? 'text-red-500' : 'text-yellow-500'} />
          <span>{title}</span>
        </div>
      }
      onOk={onConfirm}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      okText={confirmText}
      cancelText={cancelText}
      okButtonProps={{ danger }}
    >
      {content}
    </Modal>
  );
}
