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
    { id: 'chat', label: '实时聊天' },
    { id: 'about', label: '关于我' }
  ];

  return (
    <div className="nav-tabs glass-container" role="navigation" aria-label="主导航">
      <div className="nav-tabs-container">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`${tab.id}-panel`}
            tabIndex={activeTab === tab.id ? 0 : -1}
          >
            {tab.label}
          </div>
        ))}
        <div className="nav-tab theme-toggle-container" role="button" tabIndex="0">
          <ThemeToggle />
        </div>
        <div 
          className="nav-tab logout-tab" 
          onClick={onLogout}
          role="button"
          aria-label="退出登录"
          tabIndex="0"
        >
          退出
        </div>
      </div>
    </div>
  );
};

export default Navigation;