import React from 'react';
import ThemeToggle from './ThemeToggle';

const Navigation = ({ activeTab, onTabChange, isLoggedIn, onLogout }) => {
  if (!isLoggedIn) {
    return null;
  }

  const tabs = [
    { id: 'tasks', label: '任务管理' },
    { id: 'files', label: '文件上传' },
    { id: 'gallery', label: '图片画廊' },
    { id: 'viewer', label: '文件查看' },
    { id: 'chat', label: '实时聊天' }
  ];

  return (
    <div className="nav-tabs glass-container">
      <div className="nav-tabs-container">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </div>
        ))}
        <div className="nav-tab theme-toggle-container">
          <ThemeToggle />
        </div>
        <div className="nav-tab logout-tab" onClick={onLogout}>
          退出
        </div>
      </div>
    </div>
  );
};

export default Navigation;