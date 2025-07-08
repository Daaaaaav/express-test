import { useParams, useNavigate } from "react-router-dom";
import { Typography, List, Empty, Spin, message, Form, Input, Button, Space } from 'antd';
import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeftOutlined } from '@ant-design/icons';
import InfiniteScroll from 'react-infinite-scroll-component';
import BASE_URL from "../apiConfig";

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

const COMMENTS_PER_LOAD = 5;

const CommentsPage = () => {
    const { postId } = useParams();
    const navigate = useNavigate();

    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [errorComments, setErrorComments] = useState(null);
    const [addingComment, setAddingComment] = useState(false);
    const [commentForm] = Form.useForm();

    const [hasMore, setHasMore] = useState(true);
    const [totalComments, setTotalComments] = useState(0);
    const pageRef = useRef(1);

    const fetchComments = useCallback(async () => {
        if (!hasMore && pageRef.current > 1) {
            return;
        }

        if (pageRef.current === 1) {
            setLoadingComments(true);
            setErrorComments(null);
        }

        try {
            const response = await fetch(`${BASE_URL}/posts/${postId}/comments?page=${pageRef.current}&limit=${COMMENTS_PER_LOAD}`, {
                credentials: 'include'
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            const newComments = result.comments;
            const total = result.totalCount;

            setComments(prev => [...prev, ...newComments]);
            setTotalComments(total);
            pageRef.current += 1;

            setHasMore((pageRef.current - 1) * COMMENTS_PER_LOAD < total);

            if (pageRef.current === 2 || total === 0) {
                setLoadingComments(false);
            }
        } catch (e) {
            console.error("Failed to fetch comments:", e);
            setErrorComments(e.message || "Failed to load comments.");
            message.error(e.message || "Failed to load comments.");
            setHasMore(false);
            setLoadingComments(false);
        } finally {
            setLoadingMore(false);
        }
    }, [postId, hasMore]);

    useEffect(() => {
        setComments([]);
        setTotalComments(0);
        setHasMore(true);
        setLoadingComments(true);
        setErrorComments(null);
        pageRef.current = 1;

        const timer = setTimeout(() => {
            fetchComments();
        }, 500);
        return () => clearTimeout(timer);
    }, [postId]);

    const handleAddComment = async (values) => {
        setAddingComment(true);
        try {
            const response = await fetch(`${BASE_URL}/posts/${postId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: values.commentContent }),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 401 || response.status === 403) {
                    message.error('You are not authorized to add a comment.');
                }
                throw new Error(errorData.message || 'Failed to add comment.');
            }

            const newComment = await response.json();

            setComments(prev => [newComment, ...prev]);
            setTotalComments(prevTotal => prevTotal + 1);

            if (!hasMore) setHasMore(true);

            message.success('Comment added successfully!');
            commentForm.resetFields();
        } catch (e) {
            console.error("Failed to add comment:", e);
            message.error(e.message || 'An unexpected error occurred during comment submission.');
        } finally {
            setAddingComment(false);
        }
    };

    if (loadingComments && comments.length === 0) {
        return <Spin tip="Loading comments..." style={{ display: 'block', margin: '20px auto' }} />;
    }

    if (errorComments && comments.length === 0) {
        return <Empty description={errorComments} style={{ marginTop: '50px' }} />;
    }

    return (
        <div className="container">
            <Space align="center" style={{ marginBottom: '1rem', width: '100%', justifyContent: 'space-between' }}>
                <Title level={2} style={{ margin: 0 }}>Comments for Post: #{postId}</Title>
                <Button type="default" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
                    Back
                </Button>
            </Space>

            <Form form={commentForm} layout="vertical" onFinish={handleAddComment} style={{ marginBottom: '2rem' }}>
                <Form.Item name="commentContent" rules={[{ required: true, message: 'Please input your comment!' }]}> 
                    <TextArea rows={4} placeholder="Write a comment..." />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={addingComment}>Add Comment</Button>
                </Form.Item>
            </Form>

            <div id="scrollableDiv" style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '16px', maxHeight: 200, overflowY: 'auto' }}>
                <InfiniteScroll
                    dataLength={comments.length}
                    next={fetchComments}
                    hasMore={hasMore}
                    loader={<Spin tip="Loading more comments..." style={{ display: 'block', margin: '20px auto' }} />}
                    endMessage={<p style={{ textAlign: 'center', margin: '20px', color: '#777' }}><b>Anda telah melihat semua komentar.</b></p>}
                    scrollableTarget="scrollableDiv"
                    height={200}
                >
                    {comments.length === 0 && !loadingComments ? (
                        <Empty description="Tidak ada komentar ditemukan untuk postingan ini." style={{ marginTop: '50px' }} />
                    ) : (
                        <List
                            dataSource={comments}
                            renderItem={comment => (
                                <List.Item key={comment._id} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '12px', marginBottom: '12px' }}>
                                    <Paragraph style={{ margin: 0 }}>{comment.content}</Paragraph>
                                    <span style={{ fontSize: '0.8em', color: '#888' }}>
                                        Diposting: {new Date(comment.createdAt).toLocaleString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </List.Item>
                            )}
                        />
                    )}
                </InfiniteScroll>
            </div>
        </div>
    );
};

export default CommentsPage;