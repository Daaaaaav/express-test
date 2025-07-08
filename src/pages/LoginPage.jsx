// src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react'; // <-- Pastikan useEffect ada di sini
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Typography, Flex, Card } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

const LoginPage = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/posts', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const onFinish = async (values) => {
        setLoading(true);
        const success = await login(values.email, values.password);
        if (success) {
            // Navigasi akan ditangani oleh useEffect jika login berhasil
        }
        setLoading(false);
    };
     const handleGoogleLogin = () => {
        window.location.href = "http://localhost:3000/auth/google/login";
    };

    return (
        <Flex justify="center" align="center" style={{ minHeight: 'calc(100vh - 64px - 68px)' }}>
            <Card style={{ maxWidth: 400, width: '100%', padding: '20px' }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <Title level={2} style={{ margin: 0 }}>Login</Title>
                    <Text type="secondary">Sign in to your KADA Academy account</Text>
                </div>
                <Form
                    form={form}
                    name="login"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                >
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Please input your Email!' },
                            { type: 'email', message: 'Please enter a valid Email!' }
                        ]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Email" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please input your Password!' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%' }}>
                            Log in
                        </Button>
                   <Button
                        type="primary"
                        icon={
                            <img
                                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
                                alt="Google"
                                width={18}
                                style={{ marginRight: 8, verticalAlign: 'middle' }}
                            />
                        }
                        onClick={handleGoogleLogin}
                        style={{ width: '100%', marginTop: 8 }}> Login with Google
                        </Button>
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0 }}>
                        <Flex justify="space-between">
                            <Text>
                                Don't have an account? <Link to="/auth/signup">Sign up now!</Link>
                            </Text>
                        </Flex>
                    </Form.Item>
                </Form>
            </Card>
        </Flex>
    );
};

export default LoginPage;