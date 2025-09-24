import React, { useState, useEffect } from 'react';

const StatusMessage = ({ type, message, onRetry }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (message) {
      setShouldRender(true);
      // 短暂延迟后设置可见性，确保动画能正确触发
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      // 等待动画完成后移除元素
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!shouldRender) return null;

  return (
    <div className={`status-message ${type} ${isVisible ? 'enter' : 'exit'}`}>
      <p>{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="retry-button">
          重试
        </button>
      )}
    </div>
  );
};

export default StatusMessage;