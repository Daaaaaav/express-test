// src/pages/EditPost.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Form, Input, Button, Typography, message, Spin, Empty, Space } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import BASE_URL from "../apiConfig";
// Hapus import { useAuth } from '../context/AuthContext';

const { Title } = Typography;
const { TextArea } = Input;

const EditPost = ({ updatePost }) => {
    // Hapus useAuth
    // const { isAuthenticated, logout } = useAuth();
    const { postId } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPostDetail = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${BASE_URL}/posts/${postId}`);
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error("Post not found for editing.");
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setPost(data);
                form.setFieldsValue({
                    title: data.title,
                    content: data.content,
                });
            } catch (e) {
                console.error("Failed to fetch post detail for editing:", e);
                setError(e.message || "Failed to load post for editing.");
            } finally {
                setLoading(false);
            }
        };

        fetchPostDetail();
    }, [postId, form]);

    const onFinish = async (values) => {
        const success = await updatePost({ _id: postId, ...values, userId: post?.userId });
        if (success) {
            navigate(`/posts/${postId}`); // Kembali ke halaman detail post yang diedit
        }
    };

    if (loading) {
        return <Spin tip="Loading post..." style={{ display: 'block', margin: '20px auto' }} />;
    }

    if (error) {
        return <Empty description={error} style={{ marginTop: '50px' }} />;
    }

    if (!post) {
        return <Empty description="Post not found for editing." style={{ marginTop: '50px' }} />;
    }

    return (
        <div className="container">
            <Title level={2}>Edit Post</Title>
            <Form
                form={form}
                name="edit_post"
                layout="vertical"
                onFinish={onFinish}
                style={{ maxWidth: '600px', margin: '0 auto' }}
            >
                <Form.Item
                    label="Title"
                    name="title"
                    rules={[{ required: true, message: 'Please input the post title!' }]}
                >
                    <Input placeholder="Edit title" />
                </Form.Item>
                <Form.Item
                    label="Content"
                    name="content"
                    rules={[{ required: true, message: 'Please input the post content!' }]}
                >
                    <TextArea rows={6} placeholder="Edit content" />
                </Form.Item>
                <Form.Item>
                    <Space>
                        <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                            Save Changes
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

export default EditPost;