// Home.jsx
import { Typography, Flex } from 'antd';
import React from 'react';

const { Title, Paragraph } = Typography;

const Home = () => {
    return (
        <Flex
            justify="center"
            align="center"
            style={{
                // Tinggi agar mengisi ruang yang tersedia
                height: 'calc(100vh - 64px - 68px)', // Tinggi layar dikurangi Header dan Footer
                minHeight: '380px', // Tinggi minimum agar flex bekerja dengan baik (sesuai App.jsx Content)
                width: '100%',
                // Tidak ada gambar latar belakang atau overlay
                backgroundColor: '#fff', // Latar belakang putih bersih
            }}
        >
            <Flex
                flexDirection="column"
                justify="center"
                align="center"
                style={{
                    textAlign: 'center',
                    padding: '20px',
                    maxWidth: '80%', // Batasi lebar teks agar tidak terlalu panjang
                    color: '#333', // Warna teks default gelap
                }}
            >
                <Title level={1} style={{ fontSize: '5em', lineHeight: 1, margin: 0, color: '#333' }}>
                    KADA ACADEMY<span style={{ color: '#f5222d' }}>.</span> {/* Titik merah opsional */}
                </Title>
            </Flex>
        </Flex>
    );
};

export default Home;