// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App as AntdApp } from 'antd'; // Import komponen App dari Ant Design
import App from './App.jsx'; // Ini adalah komponen App utama Anda

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AntdApp> {/* Bungkus aplikasi utama Anda dengan AntdApp */}
      <App />
    </AntdApp>
  </StrictMode>
);