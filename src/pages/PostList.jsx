// src/pages/PostList.jsx
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Input, Button, Typography, Spin, Empty, Row, Col, message, Modal, Pagination } from 'antd';
import { PlusOutlined, SearchOutlined, HeartOutlined, EyeOutlined, CloseOutlined } from '@ant-design/icons';
import BASE_URL from "../apiConfig";
import { useAuth } from '../context/AuthContext'; // <-- Import useAuth

const { Title, Text } = Typography;

const POSTS_PER_PAGE = 8;

const PostList = () => {
    const { isAuthenticated } = useAuth(); // <-- Gunakan useAuth untuk mendapatkan status autentikasi
    const [searchTerm, setSearchTerm] = useState("");
    const [postsFromApi, setPostsFromApi] = useState([]);
    const [isPostsLoading, setIsPostsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPosts, setTotalPosts] = useState(0);

    const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
    const [tempSearchTerm, setTempSearchTerm] = useState("");

    useEffect(() => {
        const fetchPostsData = async () => {
            setIsPostsLoading(true);
            try {
                const url = `${BASE_URL}/posts?page=${currentPage}&pageSize=${POSTS_PER_PAGE}${searchTerm ? `&keyword=${searchTerm}` : ''}`;
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                const result = await response.json();
                const data = result.posts;
                const total = result.totalCount;

                const postsWithVisualData = data.map(post => ({
                    ...post,
                    imageUrl: post.imageUrl || `https://picsum.photos/seed/${post._id}/400/250`,
                    author: post.author?.username || 'KADA Team', // Akses username dari objek author
                    views: Math.floor(Math.random() * 100000),
                    likes: Math.floor(Math.random() * 50000),
                }));

                setPostsFromApi(postsWithVisualData);
                setTotalPosts(total);
            } catch (e) {
                console.error("Failed to fetch posts:", e);
                message.error("Failed to load posts.");
            } finally {
                setIsPostsLoading(false);
            }
        };

        fetchPostsData();
    }, [currentPage, searchTerm]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const showSearchModal = () => {
        setIsSearchModalVisible(true);
        setTempSearchTerm(searchTerm);
    };

    const handleModalInputChange = (e) => {
        setTempSearchTerm(e.target.value);
    };

    const handleModalSearch = () => {
        setSearchTerm(tempSearchTerm);
        setCurrentPage(1);
        setIsSearchModalVisible(false);
    };

    const handleCancelModal = () => {
        setIsSearchModalVisible(false);
    };

    const handleClearSearch = () => {
        setSearchTerm("");
        setTempSearchTerm("");
        setCurrentPage(1);
    };

    return (
        <div className="post-list-page">
            <div className="post-list-header">
                <div className="post-list-title-section">
                    <Title level={2}>Blog</Title>
                    <Text type="secondary" className="post-list-subtitle">
                        Inspirational posts for your daily read.
                    </Text>
                </div>
                <div className="actions">
                    {isAuthenticated && ( // <-- Tampilkan tombol ini HANYA JIKA isAuthenticated TRUE
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            style={{ marginBottom: '1rem', marginRight: '1rem' }}
                        >
                            <Link to="/posts/create" style={{ color: '#fff' }}>Create New Post</Link>
                        </Button>
                    )}
                    <Button
                        type="default"
                        shape="circle"
                        icon={<SearchOutlined />}
                        onClick={showSearchModal}
                        style={{ marginBottom: '1rem' }}
                    />
                    {searchTerm && (
                        <Button
                            type="default"
                            icon={<CloseOutlined />}
                            onClick={handleClearSearch}
                            style={{ marginBottom: '1rem', marginLeft: '1rem' }}
                        >
                            Clear Search
                        </Button>
                    )}
                </div>
            </div>

            {isPostsLoading ? (
                <Spin tip="Loading posts..." style={{ display: 'block', margin: '20px auto' }} />
            ) : postsFromApi.length > 0 ? (
                <>
                    <Row gutter={[24, 24]}>
                        {postsFromApi.map((item) => (
                            <Col key={item._id} xs={24} sm={12} md={8} lg={6}>
                                <Link to={`/posts/${item._id}`} className="post-card-link">
                                    <div className="post-card">
                                        <div className="post-card-image-container">
                                            <img src={item.imageUrl} alt={item.title} className="post-card-image" />
                                        </div>
                                        <div className="post-card-content">
                                            <h3 className="post-card-title">{item.title}</h3>
                                            <div className="post-card-meta">
                                                <div className="post-card-author-info">
                                                    <span className="post-card-author">{item.author}</span>
                                                    {item.createdAt && (
                                                        <span className="post-card-date">
                                                            {new Date(item.createdAt).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="post-card-stats">
                                                    <span><EyeOutlined /> {item.views}</span>
                                                    <span><HeartOutlined /> {item.likes}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </Col>
                        ))}
                    </Row>
                    {totalPosts > POSTS_PER_PAGE && (
                        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                            <Pagination
                                current={currentPage}
                                pageSize={POSTS_PER_PAGE}
                                total={totalPosts}
                                onChange={handlePageChange}
                                showSizeChanger={false}
                            />
                        </div>
                    )}
                </>
            ) : (
                <Empty description="No posts found." />
            )}

            <Modal
                open={isSearchModalVisible}
                onCancel={handleCancelModal}
                footer={null}
                width={600}
                centered
                maskClosable={true}
                maskStyle={{ backdropFilter: 'blur(6px)' }}
                closeIcon={false}
                bodyStyle={{ padding: '0px', borderRadius: '8px', overflow: 'hidden' }}
                style={{ top: '20vh' }}
            >
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Input
                        placeholder="Search posts..."
                        prefix={<SearchOutlined />}
                        value={tempSearchTerm}
                        onChange={handleModalInputChange}
                        onPressEnter={handleModalSearch}
                        autoFocus
                        size="large"
                        style={{
                            width: '80%',
                            height: '48px',
                            borderRadius: '8px',
                            border: 'none',
                            boxShadow: 'none',
                            paddingLeft: '20px',
                            paddingRight: '20px'
                        }}
                    />
                </div>
            </Modal>
        </div>
    );
};

export default PostList;