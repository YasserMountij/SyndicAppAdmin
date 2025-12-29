import { useState } from 'react';
import { Table, Button, Tag, Modal, Form, Input, message, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined, UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { useAdminUsers, useCreateAdmin, useDeleteAdmin, type AdminUser, type CreateAdminInput } from '@/api/hooks/useAdminUsers';
import { useAuth } from '@/context/AuthContext';
import dayjs from 'dayjs';

export default function AdminUsers() {
    const { user: currentUser } = useAuth();
    const { data, isLoading } = useAdminUsers();
    const createMutation = useCreateAdmin();
    const deleteMutation = useDeleteAdmin();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    const handleCreate = async (values: CreateAdminInput) => {
        try {
            await createMutation.mutateAsync(values);
            message.success('Admin user created successfully');
            setIsModalOpen(false);
            form.resetFields();
        } catch (error) {
            const errorMessage = (error as { response?: { data?: { error?: { message?: string } } } })
                ?.response?.data?.error?.message ?? 'Failed to create admin user';
            message.error(errorMessage);
        }
    };

    const handleDelete = async (adminId: string) => {
        try {
            await deleteMutation.mutateAsync(adminId);
            message.success('Admin user deleted successfully');
        } catch (error) {
            const errorMessage = (error as { response?: { data?: { error?: { message?: string } } } })
                ?.response?.data?.error?.message ?? 'Failed to delete admin user';
            message.error(errorMessage);
        }
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (name: string, record: AdminUser) => (
                <div className="flex items-center gap-2">
                    <span>{name}</span>
                    {record.id === currentUser?.id && (
                        <Tag color="blue">You</Tag>
                    )}
                </div>
            ),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role: string) => (
                <Tag color={role === 'SUPER_ADMIN' ? 'gold' : 'blue'}>
                    {role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                </Tag>
            ),
        },
        {
            title: 'Created',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => dayjs(date).format('MMM D, YYYY'),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: unknown, record: AdminUser) => (
                <Popconfirm
                    title="Delete Admin User"
                    description="Are you sure you want to delete this admin user?"
                    onConfirm={() => handleDelete(record.id)}
                    okText="Delete"
                    cancelText="Cancel"
                    okButtonProps={{ danger: true }}
                    disabled={record.id === currentUser?.id}
                >
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        disabled={record.id === currentUser?.id}
                        loading={deleteMutation.isPending}
                    >
                        Delete
                    </Button>
                </Popconfirm>
            ),
        },
    ];

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Admin Users</h1>
                    <p className="text-gray-400">Manage admin accounts for the dashboard</p>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsModalOpen(true)}
                >
                    Add Admin
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={data?.admins}
                rowKey="id"
                loading={isLoading}
                pagination={false}
            />

            <Modal
                title="Add Admin User"
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    form.resetFields();
                }}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreate}
                    className="mt-4"
                >
                    <Form.Item
                        name="name"
                        label="Name"
                        rules={[{ required: true, message: 'Please enter a name' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Full name" />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Please enter an email' },
                            { type: 'email', message: 'Please enter a valid email' },
                        ]}
                    >
                        <Input prefix={<MailOutlined />} placeholder="admin@example.com" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Password"
                        rules={[
                            { required: true, message: 'Please enter a password' },
                            { min: 8, message: 'Password must be at least 8 characters' },
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Minimum 8 characters" />
                    </Form.Item>

                    <div className="flex justify-end gap-2 mt-6">
                        <Button onClick={() => {
                            setIsModalOpen(false);
                            form.resetFields();
                        }}>
                            Cancel
                        </Button>
                        <Button type="primary" htmlType="submit" loading={createMutation.isPending}>
                            Create Admin
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
}
