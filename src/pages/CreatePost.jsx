// src/pages/CreatePost.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Typography, message, Space } from 'antd';
import { PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
// Hapus import { useAuth } from '../context/AuthContext';

const { Title } = Typography;
const { TextArea } = Input;

const CreatePost = ({ addPost }) => { // Menerima addPost sebagai prop
    // Hapus useAuth
    // const { isAuthenticated, logout } = useAuth();
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const onFinish = async (values) => {
        // Hapus pengecekan isAuthenticated
        // if (!isAuthenticated) {
        //     message.error('You must be logged in to create a post.');
        //     // navigate('/auth/login');
        //     return;
        // }

        const success = await addPost(values); // addPost akan menangani error API
        if (success) {
            form.resetFields();
            navigate("/posts"); // Kembali ke daftar posts
        }
    };

    return (
        <div className="container">
            <Title level={2}>Create New Post</Title>
            <Form
                form={form}
                name="create_post"
                layout="vertical"
                onFinish={onFinish}
                initialValues={{ title: "", content: "" }}
                style={{ maxWidth: '600px', margin: '0 auto' }}
            >
                <Form.Item
                    label="Title"
                    name="title"
                    rules={[{ required: true, message: 'Please input your post title!' }]}
                >
                    <Input placeholder="Enter title" />
                </Form.Item>
                <Form.Item
                    label="Content"
                    name="content"
                    rules={[{ required: true, message: 'Please input your post content!' }]}
                >
                    <TextArea rows={6} placeholder="Enter content" />
                </Form.Item>
                <Form.Item>
                    <Space>
                        <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
                            Create Post
                        </Button>
                        <Button type="default" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
                            Back
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </div>
    );
};

export default CreatePost;