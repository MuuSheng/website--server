import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/api';
import StatusMessage from './StatusMessage';

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  // 自动隐藏成功消息
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/tasks`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
        setError('');
      } else {
        setError('获取任务时出错');
      }
    } catch (error) {
      setError(`网络错误: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 重置状态
    setError('');
    
    // 验证输入
    if (!title.trim()) {
      setError('请输入任务标题');
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ title, description })
      });
      
      if (response.ok) {
        const newTask = await response.json();
        // 将新任务置顶
        setTasks([newTask, ...tasks]);
        setTitle('');
        setDescription('');
        setSuccess('任务创建成功');
      } else {
        setError('创建任务时出错');
      }
    } catch (error) {
      setError(`网络错误: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id, completed) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ completed })
      });
      
      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(tasks.map(task => task._id === id ? updatedTask : task));
      } else {
        setError('更新任务时出错');
      }
    } catch (error) {
      setError(`网络错误: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        setTasks(tasks.filter(task => task._id !== id));
        setSuccess('任务删除成功');
      } else {
        setError('删除任务时出错');
      }
    } catch (error) {
      setError(`网络错误: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="task-manager">
      <h2>任务管理器</h2>
      <StatusMessage type="error" message={error} onRetry={fetchTasks} />
      <StatusMessage type="success" message={success} />
      
      {loading && <div className="loading-spinner"></div>}
      
      <form onSubmit={handleSubmit} className="glass-container">
        <div>
          <label>标题:</label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
            disabled={loading}
          />
        </div>
        <div>
          <label>描述:</label>
          <textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            disabled={loading}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? '处理中...' : '添加任务'}
        </button>
      </form>
      
      <ul>
        {tasks.map(task => (
          <li key={task._id} className="glass-container">
            <h3 className={task.completed ? 'completed' : ''}>{task.title}</h3>
            <p>{task.description}</p>
            <p>已完成: {task.completed ? '是' : '否'}</p>
            <div className="task-actions">
              <button 
                onClick={() => handleUpdate(task._id, !task.completed)} 
                disabled={loading}
              >
                {task.completed ? '标记为未完成' : '标记为完成'}
              </button>
              <button 
                onClick={() => handleDelete(task._id)} 
                disabled={loading}
                className="destructive"
              >
                删除
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskManager;