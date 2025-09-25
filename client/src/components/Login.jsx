import React, { useState } from 'react';
import { apiFetch } from '../utils/api';
import StatusMessage from './StatusMessage';
import LoadingSpinner from './LoadingSpinner';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 重置错误状态
    setError('');
    
    // 验证输入
    if (!username.trim()) {
      setError('请输入用户名');
      return;
    }
    
    if (!password) {
      setError('请输入密码');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await apiFetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', username);
        onLogin();
      } else {
        const text = await response.text();
        setError(`登录失败: ${text}`);
      }
    } catch (error) {
      setError(`网络错误: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>登录</h2>
      <StatusMessage type="error" message={error} />
      
      {loading && <LoadingSpinner message="登录中..." />}
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>用户名:</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
            disabled={loading}
          />
        </div>
        <div>
          <label>密码:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            disabled={loading}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? '登录中...' : '登录'}
        </button>
      </form>
    </div>
  );
};

export default Login;