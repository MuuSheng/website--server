import React, { useState, useEffect } from 'react';

const WelcomeBubble = ({ username }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // 2秒后开始退出动画
    const timer = setTimeout(() => {
      setIsExiting(true);
      // 动画结束后隐藏气泡
      setTimeout(() => {
        setIsVisible(false);
      }, 500); // 与CSS过渡时间匹配
    }, 2000);

    // 清理定时器
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`welcome-bubble ${isExiting ? 'exiting' : ''}`}>
      <span className="welcome-text">欢迎，{username}</span>
    </div>
  );
};

export default WelcomeBubble;