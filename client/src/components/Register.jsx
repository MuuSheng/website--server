import React, { useState } from 'react';
import { API_BASE_URL } from '../utils/api';
import StatusMessage from './StatusMessage';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validateForm = () => {
    if (!username.trim()) {
      setError('用户名不能为空');
      return false;
    }
    
    if (password.length < 6) {
      setError('密码长度至少为6位');
      return false;
    }
    
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 重置状态
    setError('');
    setSuccess('');
    
    // 验证表单
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      
      if (response.ok) {
        setSuccess('用户注册成功');
        // 清空表单
        setUsername('');
        setPassword('');
        setConfirmPassword('');
      } else {
        const text = await response.text();
        setError(`注册失败: ${text}`);
      }
    } catch (error) {
      setError(`网络错误: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>注册</h2>
      <StatusMessage type="error" message={error} />
      <StatusMessage type="success" message={success} />
      
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
        <div>
          <label>确认密码:</label>
          <input 
            type="password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            required 
            disabled={loading}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? '注册中...' : '注册'}
        </button>
      </form>
    </div>
  );
};

export default Register;