import { useState, useEffect } from 'react';
import { Form, Input, Button, Alert, Card } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '@/context/AuthContext';

interface LoginFormValues {
    email: string;
    password: string;
}

export default function Login() {
    const { login, isAuthenticated, loginError, isLoggingIn } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [form] = Form.useForm();
    const [error, setError] = useState<string | null>(null);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/';
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, location]);

    const handleSubmit = async (values: LoginFormValues) => {
        setError(null);
        try {
            await login(values);
        } catch {
            setError(loginError ?? 'Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
            <Card
                className="w-full max-w-md"
                style={{
                    backgroundColor: '#141414',
                    borderColor: '#303030',
                }}
            >
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-white mb-2">
                        SyndicApp Admin
                    </h1>
                    <p className="text-gray-400">
                        Sign in to access the admin dashboard
                    </p>
                </div>

                {(error ?? loginError) && (
                    <Alert
                        title={error ?? loginError}
                        type="error"
                        showIcon
                        className="mb-6"
                    />
                )}

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    autoComplete="off"
                >
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Please enter your email' },
                            { type: 'email', message: 'Please enter a valid email' },
                        ]}
                    >
                        <Input
                            prefix={<MailOutlined className="text-gray-400" />}
                            placeholder="Email"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[
                            { required: true, message: 'Please enter your password' },
                            { min: 8, message: 'Password must be at least 8 characters' },
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined className="text-gray-400" />}
                            placeholder="Password"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item className="mb-0">
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            block
                            loading={isLoggingIn}
                        >
                            Sign In
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}
