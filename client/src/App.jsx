import React, { useState, useMemo, useEffect } from 'react';
import Register from './components/Register.jsx';
import Login from './components/Login.jsx';
import TaskManager from './components/TaskManager.jsx';
import FileUpload from './components/FileUpload.jsx';
import Chat from './components/Chat.jsx';
import FileViewer from './components/FileViewer.jsx';
import ImageGallery from './components/ImageGallery.jsx';
import AboutMe from './components/AboutMe.jsx';
import Navigation from './components/Navigation.jsx';
import WelcomeBubble from './components/WelcomeBubble.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('register');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks');
  const [loading, setLoading] = useState(true);

  // 模拟加载状态
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

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
      tasks: (
        <ErrorBoundary>
          <TaskManager />
        </ErrorBoundary>
      ),
      files: (
        <ErrorBoundary>
          <FileUpload />
        </ErrorBoundary>
      ),
      gallery: (
        <ErrorBoundary>
          <ImageGallery isVisible={activeTab === 'gallery'} />
        </ErrorBoundary>
      ),
      viewer: (
        <ErrorBoundary>
          <FileViewer />
        </ErrorBoundary>
      ),
      chat: (
        <ErrorBoundary>
          <Chat />
        </ErrorBoundary>
      ),
      about: (
        <ErrorBoundary>
          <AboutMe />
        </ErrorBoundary>
      )
    };
  }, [activeTab]);

  if (loading) {
    return (
      <ThemeProvider>
        <div className="App">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div className="loading-spinner" role="status" aria-label="加载中"></div>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  if (!isLoggedIn) {
    return (
      <ThemeProvider>
        <div className="App">
          <h1>Welcome</h1>
          <div className="glass-container">
            {currentView === 'register' ? (
              <div>
                <ErrorBoundary>
                  <Register />
                </ErrorBoundary>
                <p style={{ textAlign: 'center', marginTop: '20px' }}>
                  已有账户？{' '}
                  <button className="secondary" onClick={() => setCurrentView('login')}>登录</button>
                </p>
              </div>
            ) : (
              <div>
                <ErrorBoundary>
                  <Login onLogin={handleLogin} />
                </ErrorBoundary>
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
        <div className="tab-content" role="tabpanel" id={`${activeTab}-panel`}>
          <div className={`tab-panel ${activeTab === 'tasks' ? 'active' : ''}`} role="tabpanel" hidden={activeTab !== 'tasks'}>
            {activeTab === 'tasks' && renderedComponents.tasks}
          </div>
          <div className={`tab-panel ${activeTab === 'files' ? 'active' : ''}`} role="tabpanel" hidden={activeTab !== 'files'}>
            {activeTab === 'files' && renderedComponents.files}
          </div>
          <div className={`tab-panel ${activeTab === 'gallery' ? 'active' : ''}`} role="tabpanel" hidden={activeTab !== 'gallery'}>
            {activeTab === 'gallery' && renderedComponents.gallery}
          </div>
          <div className={`tab-panel ${activeTab === 'viewer' ? 'active' : ''}`} role="tabpanel" hidden={activeTab !== 'viewer'}>
            {activeTab === 'viewer' && renderedComponents.viewer}
          </div>
          <div className={`tab-panel ${activeTab === 'chat' ? 'active' : ''}`} role="tabpanel" hidden={activeTab !== 'chat'}>
            {activeTab === 'chat' && renderedComponents.chat}
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;