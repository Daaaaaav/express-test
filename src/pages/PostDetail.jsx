// src/pages/PostDetail.jsx
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Typography, Spin, Button, message, Space, Card, Popconfirm, Empty } from 'antd';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined, CommentOutlined } from '@ant-design/icons';
import BASE_URL from "../apiConfig";
import { useAuth } from '../context/AuthContext'; // <-- Import useAuth

const { Title, Paragraph, Text } = Typography;

const PostDetail = ({ deletePost }) => {
    // Gunakan useAuth untuk mendapatkan status autentikasi dan user yang login
    const { isAuthenticated, user } = useAuth();
    
    const { postId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isImageLoaded, setIsImageLoaded] = useState(false);

    // Hitung apakah user yang login adalah penulis post atau admin
    // post.author._id adalah ObjectId dari penulis post
    // user._id adalah ObjectId dari user yang sedang login
    // user.role adalah peran user yang sedang login ('user' atau 'admin')
    const canEditOrDelete = isAuthenticated && user && post?.author && (
        (user._id === post.author._id) || // User adalah penulis post
        (user.role === 'admin')           // Atau user adalah admin
    );

    useEffect(() => {
        const fetchPostDetail = async () => {
            setLoading(true);
            setError(null);
            setIsImageLoaded(false);
            try {
                const response = await fetch(`${BASE_URL}/posts/${postId}`);
                if (!response.ok) {
                    if (response.status === 404) throw new Error("Post not found.");
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setPost({
                    ...data,
                    imageUrl: data.imageUrl || `https://picsum.photos/seed/${data._id}/800/450`
                });
            } catch (e) {
                console.error("Failed to fetch post detail:", e);
                setError(e.message || "Failed to load post details.");
            } finally {
                setLoading(false);
            }
        };

        fetchPostDetail();
    }, [postId, location.key]);

   const handleDelete = async () => {
        if (!post || !post._id) {
            message.error("Cannot delete: Post not ready.");
            return;
        }
        const success = await deletePost(post._id);
        if (success) {
            navigate("/posts");
        }
    };


    if (loading) {
        return <Spin tip="Loading post..." style={{ display: 'block', margin: '20px auto' }} />;
    }

    if (error) {
        return <Empty description={error} style={{ marginTop: '50px' }} />;
    }

    if (!post) {
        return <Empty description="Post not found." style={{ marginTop: '50px' }} />;
    }

    return (
        <div className="container" style={{ padding: '20px' }}>
            <Card
                style={{ maxWidth: '800px', width: '100%', margin: '0 auto', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
                cover={
                    post.imageUrl ? (
                        <div className="post-detail-image-wrapper">
                            {!isImageLoaded && (
                                <div className="image-loader-placeholder">
                                    <Spin size="large" />
                                </div>
                            )}
                            <img
                                alt={post.title}
                                src={post.imageUrl}
                                className="post-detail-image-cover"
                                onLoad={() => setIsImageLoaded(true)}
                                onError={() => {
                                    setIsImageLoaded(true);
                                    console.error("Failed to load image:", post.imageUrl);
                                    message.error("Failed to load image for post detail.");
                                }}
                                style={{ opacity: isImageLoaded ? 1 : 0 }}
                            />
                        </div>
                    ) : (
                        <div className="post-detail-image-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', backgroundColor: '#f0f0f0' }}>
                            <Text type="secondary">No Image Available</Text>
                        </div>
                    )
                }
            >
                <div style={{ padding: '0' }}>
                    <Title level={1} style={{ marginTop: 0 }}>{post.title}</Title>
                    <Paragraph>{post.content}</Paragraph>
                    <Paragraph>
                        <Text strong>Author:</Text> <Link to={`/users/${post.author?._id}`}>{post.author?.username || 'Unknown'}</Link>
                    </Paragraph>
                    {post.createdAt && (
                        <Paragraph>
                            <Text strong>Published On:</Text> {new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </Paragraph>
                    )}
                </div>

                <Space size="middle" style={{ marginTop: '1rem', width: '100%', justifyContent: 'flex-start' }}>
                    <Button type="default" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
                        Back
                    </Button>
                    <Button type="default" icon={<CommentOutlined />}>
                        <Link to={`/posts/${post._id}/comments`}>View Comments</Link>
                    </Button>
                    
                    {canEditOrDelete && ( // <-- Tampilkan tombol Edit/Delete hanya jika user berwenang
                        <>
                            <Button type="primary" icon={<EditOutlined />}>
                                <Link to={`/posts/${post._id}/edit`} style={{ color: '#fff' }}>Edit Post</Link>
                            </Button>
                            <Popconfirm
                                title="Are you sure to delete this post?"
                                onConfirm={handleDelete}
                                okText="Yes"
                                cancelText="No"
                            >
                                <Button type="danger" icon={<DeleteOutlined />}>
                                    Delete Post
                                </Button>
                            </Popconfirm>
                        </>
                    )}
                </Space>
            </Card>
        </div>
    );
};

export default PostDetail;