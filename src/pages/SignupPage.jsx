import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Form, Input, Button, Typography, Flex, Card, message, Spin } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import BASE_URL from '../apiConfig';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

const SignupPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get("token");
        const errorMessage = params.get("message");

        if (token) {
            localStorage.setItem("token", token);
            message.success("Signed up with Google!");
            navigate('/posts', { replace: true });
        }

        if (errorMessage) {
            message.error(decodeURIComponent(errorMessage));
        }
    }, [location, navigate]);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/posts', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleGoogleSignup = () => {
        window.location.href = "http://localhost:3000/auth/google/signup";
    };

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: values.username,
                    email: values.email,
                    password: values.password,
                }),
            });

            const result = await response.json();
            console.log("Response from backend:", result);

            if (!response.ok) {
                const fieldErrors = [];
                const messageText = result.message?.toLowerCase() || '';

                if (messageText.includes('username')) {
                    fieldErrors.push({ name: 'username', errors: [result.message] });
                }

                if (messageText.includes('email')) {
                    fieldErrors.push({ name: 'email', errors: [result.message] });
                }

                if (fieldErrors.length > 0) {
                    form.setFields(fieldErrors);
                    return;
                }

                message.error(result.message || 'Sign up failed. Please try again.');
                return;
            }

            message.success(result.message || 'Sign up successful! Please log in.');
            navigate('/auth/login');

        } catch (error) {
            console.error('Sign up error (frontend catch):', error);
            message.error({
                content: error.message || 'Unexpected error during sign up.',
                duration: 3,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Flex justify="center" align="center" style={{ minHeight: 'calc(100vh - 64px - 68px)' }}>
            <Card style={{ maxWidth: 400, width: '100%', padding: '20px' }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <Title level={2} style={{ margin: 0 }}>Sign Up</Title>
                    <Text type="secondary">Create your KADA Academy account</Text>
                </div>

                <Spin spinning={loading}>
                    <Form
                        form={form}
                        name="signup"
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                    >
                        <Form.Item
                            name="username"
                            rules={[{ required: true, message: 'Please input your Username!' }]}
                        >
                            <Input prefix={<UserOutlined />} placeholder="Username" />
                        </Form.Item>

                        <Form.Item
                            name="email"
                            rules={[
                                { required: true, message: 'Please input your Email!' },
                                { type: 'email', message: 'Please enter a valid Email!' }
                            ]}
                        >
                            <Input prefix={<MailOutlined />} placeholder="Email" />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[{ required: true, message: 'Please input your Password!' }]}
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                        </Form.Item>

                        <Form.Item
                            name="confirm"
                            dependencies={['password']}
                            hasFeedback
                            rules={[
                                { required: true, message: 'Please confirm your Password!' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(
                                            new Error('The two passwords that you entered do not match!')
                                        );
                                    },
                                }),
                            ]}
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                style={{ width: '100%' }}
                            >
                                Sign Up
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
                                onClick={handleGoogleSignup}
                                style={{ width: '100%', marginTop: 8 }}
                            >
                                Sign Up with Google
                            </Button>
                        </Form.Item>

                        <Form.Item style={{ marginBottom: 0 }}>
                            <Flex justify="space-between">
                                <Text>
                                    Already have an account? <Link to="/auth/login">Log in now!</Link>
                                </Text>
                            </Flex>
                        </Form.Item>
                    </Form>
                </Spin>
            </Card>
        </Flex>
    );
};

export default SignupPage;
