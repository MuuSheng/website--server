import React, { useState } from 'react';
import { API_BASE_URL } from '../utils/api';
import StatusMessage from './StatusMessage';

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
    if (!username.trim() || !password) {
      setError('请输入用户名和密码');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', username);
        onLogin();
      } else {
        setError('无效的凭据');
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