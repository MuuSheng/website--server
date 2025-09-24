import React, { useState, useMemo } from 'react';
import Register from './components/Register.jsx';
import Login from './components/Login.jsx';
import TaskManager from './components/TaskManager.jsx';
import FileUpload from './components/FileUpload.jsx';
import Chat from './components/Chat.jsx';
import FileViewer from './components/FileViewer.jsx';
import ImageGallery from './components/ImageGallery.jsx';
import Navigation from './components/Navigation.jsx';
import WelcomeBubble from './components/WelcomeBubble.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('register');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks');

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    setActiveTab('tasks');
  };

  // 处理选项卡切换
  const handleTabChange = (newTab) => {
    if (newTab !== activeTab) {
      setActiveTab(newTab);
    }
  };

  // 使用 useMemo 优化组件渲染
  const renderedComponents = useMemo(() => {
    return {
      tasks: <TaskManager />,
      files: <FileUpload />,
      gallery: <ImageGallery />,
      viewer: <FileViewer />,
      chat: <Chat />
    };
  }, []);

  if (!isLoggedIn) {
    return (
      <ThemeProvider>
        <div className="App">
          <h1>Welcome</h1>
          <div className="glass-container">
            {currentView === 'register' ? (
              <div>
                <Register />
                <p style={{ textAlign: 'center', marginTop: '20px' }}>
                  已有账户？{' '}
                  <button className="secondary" onClick={() => setCurrentView('login')}>登录</button>
                </p>
              </div>
            ) : (
              <div>
                <Login onLogin={handleLogin} />
                <p style={{ textAlign: 'center', marginTop: '20px' }}>
                  没有账户？{' '}
                  <button className="secondary" onClick={() => setCurrentView('register')}>注册</button>
                </p>
              </div>
            )}
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="App">
        <h1>Welcome</h1>
        <WelcomeBubble username={localStorage.getItem('username') || '用户'} />
        <Navigation 
          activeTab={activeTab} 
          onTabChange={handleTabChange} 
          isLoggedIn={isLoggedIn} 
          onLogout={handleLogout} 
        />
        <div className="tab-content">
          <div className={`tab-panel ${activeTab === 'tasks' ? 'active' : ''}`}>
            {activeTab === 'tasks' && renderedComponents.tasks}
          </div>
          <div className={`tab-panel ${activeTab === 'files' ? 'active' : ''}`}>
            {activeTab === 'files' && renderedComponents.files}
          </div>
          <div className={`tab-panel ${activeTab === 'gallery' ? 'active' : ''}`}>
            {activeTab === 'gallery' && renderedComponents.gallery}
          </div>
          <div className={`tab-panel ${activeTab === 'viewer' ? 'active' : ''}`}>
            {activeTab === 'viewer' && renderedComponents.viewer}
          </div>
          <div className={`tab-panel ${activeTab === 'chat' ? 'active' : ''}`}>
            {activeTab === 'chat' && renderedComponents.chat}
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;