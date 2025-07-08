// src/pages/UserPage.jsx
import { useParams, Link, useNavigate } from "react-router-dom";
import { Typography, List, Empty, Spin, message, Button, Space } from 'antd';
import { useState, useEffect } from "react";
import { ArrowLeftOutlined } from '@ant-design/icons';
import BASE_URL from "../apiConfig";

const { Title, Paragraph, Text } = Typography;

// Hapus hardcoded users karena user info akan diambil dari backend saat PostDetail populasi author
// const users = [
//     { id: 1, name: "Giovaldi", username: "gio", email: "gio@example.com" },
//     { id: 2, name: "Ramadhan", username: "rama", email: "rama@example.com" },
//     { id: 3, name: "Budi", username: "budi", email: "budi@example.com" }
// ];

const UserPage = () => {
    const { userId } = useParams(); // userId di sini adalah ObjectId dari user
    const navigate = useNavigate();
    const [userPosts, setUserPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userProfile, setUserProfile] = useState(null); // State baru untuk data user yang dikunjungi

    useEffect(() => {
        const fetchUserDataAndPosts = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch user profile data (asumsi ada endpoint /auth/users/:userId di backend)
                // Jika tidak ada, Anda perlu membuatnya atau mengubah strategi
                const userResponse = await fetch(`${BASE_URL}/auth/users/${userId}`); // Asumsi endpoint ini ada
                if (!userResponse.ok) {
                    if (userResponse.status === 404) throw new Error("User not found.");
                    throw new Error(`HTTP error! status: ${userResponse.status}`);
                }
                const userData = await userResponse.json();
                setUserProfile(userData.user); // Asumsi respons adalah { user: {...} }

                // Fetch semua post dan filter
                const postsResponse = await fetch(`${BASE_URL}/posts`);
                if (!postsResponse.ok) {
                    throw new Error(`HTTP error! status: ${postsResponse.status}`);
                }
                const result = await postsResponse.json();
                const allPosts = result.posts;

                // PERBAIKAN DI SINI: Filter berdasarkan author._id yang merupakan ObjectId string
                const filtered = allPosts.filter(p => p.author && p.author._id === userId);
                setUserPosts(filtered);

            } catch (e) {
                console.error("Failed to fetch user data or posts:", e);
                setError(e.message || "Failed to load user data or posts.");
                message.error("Failed to load user data or posts.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserDataAndPosts();
    }, [userId]); // Dependensi pada userId

    if (loading) {
        return <Spin tip="Loading user data..." style={{ display: 'block', margin: '20px auto' }} />;
    }

    if (error) {
        return <Empty description={error} style={{ marginTop: '50px' }} />;
    }

    // Tampilkan User not found jika userProfile null setelah loading selesai
    if (!userProfile) return <div className="container">User not found.</div>;

    return (
        <div className="container">
            <Title level={2}>User Info</Title>
            <Paragraph><Text strong>Name:</Text> {userProfile.username}</Paragraph> {/* Gunakan userProfile */}
            <Paragraph><Text strong>Email:</Text> {userProfile.email}</Paragraph> {/* Gunakan userProfile */}

            <Title level={3} style={{ marginTop: '1rem' }}>Posts by user: {userProfile.username}</Title>
            {userPosts.length === 0 ? (
                <Empty description="No posts found by this user." />
            ) : (
                <List
                    bordered
                    dataSource={userPosts}
                    renderItem={up => (
                        <List.Item>
                            <Link to={`/posts/${up._id}`}>
                                {`${up.title}`}
                            </Link>
                        </List.Item>
                    )}
                />
            )}
            <Space style={{ marginTop: '1rem' }}>
                <Button type="default" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
                    Back
                </Button>
            </Space>
        </div>
    );
};

export default UserPage;