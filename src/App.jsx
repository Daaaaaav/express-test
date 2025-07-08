import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

// Pages
import PostList from "./pages/PostList";
import PostDetail from "./pages/PostDetail";
import CommentsPage from "./pages/CommentsPage";
import UserPage from "./pages/UserPage";
import NotFound from "./pages/NotFound";
import CreatePost from "./pages/CreatePost";
import EditPost from "./pages/EditPost";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import GoogleSuccess from "./pages/GoogleSuccess";

// Ant Design
import { Layout, Menu, Flex, message, Typography, Spin } from 'antd';
import { ReadOutlined, LoginOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';

// Config
import BASE_URL from "./apiConfig";
import { AuthProvider, useAuth } from './context/AuthContext';

// Images
import akcf from './images/akcf.webp';
import asean from './images/asean.png';
import elice from './images/elice.jpg';
import komdigi from './images/komdigi.png';
import ksa from './images/ksa.svg';
import nipa from './images/nipa.png';

// CSS
import "./App.css";

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

const AVAILABLE_USER_IDS = [1, 2, 3];

function AppCoreContent() {
  const { isAuthenticated, user, token, logout } = useAuth();

  const [animatedText, setAnimatedText] = useState('');
  const fullText = 'KADA Academy 2025';
  const animationSpeed = 150;
  const textRef = useRef(null);

  useEffect(() => {
    let charIndex = 0;
    const animationInterval = setInterval(() => {
      if (charIndex < fullText.length) {
        setAnimatedText(fullText.substring(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(animationInterval);
      }
    }, animationSpeed);
    return () => clearInterval(animationInterval);
  }, []);

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      window.location.href = '/';
    }
  };

  const addPost = async (newPost) => {
    try {
      if (!token) {
        message.error('Authentication token missing. Please log in.');
        return false;
      }
      const randomUserId = AVAILABLE_USER_IDS[Math.floor(Math.random() * AVAILABLE_USER_IDS.length)];
      const postDataToSend = {
        ...newPost,
        imageUrl: newPost.imageUrl || `https://picsum.photos/seed/${Date.now()}/400/250`,
        userId: randomUserId,
      };

      const response = await fetch(`${BASE_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postDataToSend),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401 || response.status === 403) {
          message.error(errorData.message || 'Not authorized to create post. Please log in.');
          logout();
        }
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      message.success('Post created successfully!');
      return true;
    } catch (e) {
      console.error("Failed to add post:", e);
      message.error(e.message || 'An unexpected error occurred during post creation.');
      return false;
    }
  };

  const updatePost = async (updatedPost) => {
    try {
      if (!token) {
        message.error('Authentication token missing. Please log in.');
        return false;
      }
      const response = await fetch(`${BASE_URL}/posts/${updatedPost._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedPost),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401 || response.status === 403) {
          message.error(errorData.message || 'Not authorized to update post. Please log in.');
          logout();
        }
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      message.success('Post updated successfully!');
      return true;
    } catch (e) {
      console.error("Failed to update post:", e);
      message.error(e.message || 'An unexpected error occurred during post update.');
      return false;
    }
  };

  const deletePost = async (postIdToDelete) => {
    try {
      if (!token) {
        message.error('Authentication token missing. Please log in.');
        return false;
      }
      const response = await fetch(`${BASE_URL}/posts/${postIdToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401 || response.status === 403) {
          message.error(errorData.message || 'Not authorized to delete post. Please log in.');
          logout();
        }
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      message.success('Post deleted successfully!');
      return true;
    } catch (e) {
      console.error("Failed to delete post:", e);
      message.error(e.message || 'An unexpected error occurred during post deletion.');
      return false;
    }
  };

  const mainMenuItems = [
    {
      key: '2',
      label: <Link to="/posts">Posts</Link>,
      style: { fontFamily: 'Poppins', fontWeight: '600' }
    },
  ];

  const authMenuItems = isAuthenticated ? [
    {
      key: 'welcome',
      label: <span style={{ pointerEvents: 'none', color: '#333' }}>Welcome, {user?.username || 'User'}!</span>,
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    }
  ] : [
    {
      key: 'login',
      label: <Link to="/auth/login">Login</Link>,
      icon: <LoginOutlined />,
      style: { marginLeft: 'auto' }
    },
    {
      key: 'signup',
      label: <Link to="/auth/signup">Sign Up</Link>,
      icon: <UserOutlined />
    }
  ];

  const logoImages = [akcf, asean, elice, komdigi, ksa, nipa];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{
        display: 'flex', alignItems: 'center', backgroundColor: '#fff',
        padding: '0 20px', position: 'fixed', width: '100%', top: 0, zIndex: 10
      }}>
        <div style={{ marginRight: '20px' }}>
          <Link to="/posts" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Title level={3} style={{
              margin: 0, color: '#001529', whiteSpace: 'nowrap',
              fontFamily: 'Poppins, sans-serif', fontWeight: '600'
            }}>
              {animatedText}
            </Title>
          </Link>
        </div>
        <Menu theme="light" mode="horizontal" defaultSelectedKeys={['2']}
          style={{ flex: 1, minWidth: 0, borderBottom: 'none' }}
          items={mainMenuItems}
        />
        <Menu theme="light" mode="horizontal" style={{ borderBottom: 'none' }} items={authMenuItems} />
      </Header>

      <Content style={{ padding: '0 50px', marginTop: 84 }}>
        <Flex justify="center" align="flex-start" style={{
          padding: 24, minHeight: 380, background: '#fff', borderRadius: '8px'
        }}>
          <Routes>
            <Route path="/" element={<Navigate to="/posts" replace />} />
            <Route path="/posts" element={<PostList />} />
            <Route path="/posts/create" element={<CreatePost addPost={addPost} />} />
            <Route path="/posts/:postId" element={<PostDetail deletePost={deletePost} />} />
            <Route path="/posts/:postId/edit" element={<EditPost updatePost={updatePost} />} />
            <Route path="/posts/:postId/comments" element={<CommentsPage />} />
            <Route path="/users/:userId" element={<UserPage />} />
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<GoogleSuccess />} />
            <Route path="/auth/signup" element={<SignupPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Flex>
      </Content>

      <Footer style={{ textAlign: 'center', backgroundColor: '#fff', overflow: 'hidden' }}>
        <div style={{ height: '60px', overflow: 'hidden', width: '100%' }}>
          <div className="logo-marquee">
            {logoImages.concat(logoImages).map((src, index) => (
              <img
                key={index}
                src={src}
                alt={`partner-logo-${index}`}
                style={{
                  height: '40px',
                  filter: 'grayscale(100%)',
                  margin: '0 2rem',
                  objectFit: 'contain'
                }}
              />
            ))}
          </div>
        </div>
        <div style={{ marginTop: 84 }}>
          Copyright ©{new Date().getFullYear()} Giovaldi Ramadhan. All rights reserved.
        </div>
      </Footer>
    </Layout>
  );
}

function AppWrapper() {
  const { authLoading } = useAuth();

  if (authLoading) {
    return (
      <Layout style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="large" tip="Loading authentication..." />
      </Layout>
    );
  }

  return <AppCoreContent />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppWrapper />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
