import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/api';
import StatusMessage from './StatusMessage';
import LoadingSpinner from './LoadingSpinner';

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalTasks: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  useEffect(() => {
    fetchTasks(pagination.currentPage, searchTerm);
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

  const fetchTasks = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
      const response = await fetch(`${API_BASE_URL}/api/tasks?page=${page}&limit=5${searchParam}`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks);
        setPagination(data.pagination);
        setError('');
      } else {
        const text = await response.text();
        setError(`获取任务时出错: ${text}`);
      }
    } catch (error) {
      setError(`网络错误: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTasks(1, searchTerm);
  };

  const validateTask = () => {
    if (!title.trim()) {
      setError('请输入任务标题');
      return false;
    }
    
    if (title.length > 100) {
      setError('任务标题长度不能超过100个字符');
      return false;
    }
    
    if (description && description.length > 500) {
      setError('任务描述长度不能超过500个字符');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 重置状态
    setError('');
    
    // 验证输入
    if (!validateTask()) {
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
        // 重新获取第一页任务以确保分页正确
        fetchTasks(1, searchTerm);
      } else {
        const text = await response.text();
        setError(`创建任务时出错: ${text}`);
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
        const text = await response.text();
        setError(`更新任务时出错: ${text}`);
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
        // 重新获取当前页任务
        fetchTasks(pagination.currentPage, searchTerm);
      } else {
        const text = await response.text();
        setError(`删除任务时出错: ${text}`);
      }
    } catch (error) {
      setError(`网络错误: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchTasks(newPage, searchTerm);
    }
  };

  return (
    <div className="task-manager" role="main">
      <h2>任务管理器</h2>
      <StatusMessage type="error" message={error} onRetry={() => fetchTasks(pagination.currentPage, searchTerm)} />
      <StatusMessage type="success" message={success} />
      
      {loading && <LoadingSpinner message="处理中..." />}
      
      <form onSubmit={handleSubmit} className="glass-container" aria-label="添加新任务">
        <div>
          <label htmlFor="task-title">标题:</label>
          <input 
            id="task-title"
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
            disabled={loading}
            maxLength="100"
            aria-describedby="title-help"
          />
          <div id="title-help" className="sr-only">请输入任务标题，最多100个字符</div>
        </div>
        <div>
          <label htmlFor="task-description">描述:</label>
          <textarea 
            id="task-description"
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            disabled={loading}
            maxLength="500"
            rows="4"
            aria-describedby="description-help"
          />
          <div id="description-help" className="sr-only">请输入任务描述，最多500个字符</div>
        </div>
        <button type="submit" disabled={loading} aria-busy={loading}>
          {loading ? '处理中...' : '添加任务'}
        </button>
      </form>
      
      {/* 搜索表单 */}
      <form onSubmit={handleSearch} className="glass-container search-form" aria-label="搜索任务">
        <div className="search-input-container">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索任务标题或描述..."
            disabled={loading}
            className="search-input"
            aria-label="搜索词"
          />
          <button type="submit" disabled={loading} className="search-button" aria-busy={loading}>
            搜索
          </button>
        </div>
      </form>
      
      <ul role="list" aria-label="任务列表">
        {tasks.map(task => (
          <li key={task._id} className="glass-container" role="listitem">
            <h3 className={task.completed ? 'completed' : ''}>{task.title}</h3>
            <p>{task.description}</p>
            <p>已完成: {task.completed ? '是' : '否'}</p>
            <div className="task-actions">
              <button 
                onClick={() => handleUpdate(task._id, !task.completed)} 
                disabled={loading}
                aria-pressed={task.completed}
              >
                {task.completed ? '标记为未完成' : '标记为完成'}
              </button>
              <button 
                onClick={() => handleDelete(task._id)} 
                disabled={loading}
                className="destructive"
                aria-label={`删除任务: ${task.title}`}
              >
                删除
              </button>
            </div>
          </li>
        ))}
      </ul>
      
      {/* 分页控件 */}
      {pagination.totalPages > 1 && (
        <div className="pagination" role="navigation" aria-label="任务列表分页">
          <button 
            onClick={() => handlePageChange(pagination.currentPage - 1)} 
            disabled={!pagination.hasPrevPage || loading}
            className="pagination-btn"
            aria-label="上一页"
          >
            上一页
          </button>
          
          <span className="pagination-info" aria-live="polite">
            第 {pagination.currentPage} 页，共 {pagination.totalPages} 页
            {searchTerm && ` (搜索: "${searchTerm}")`}
          </span>
          
          <button 
            onClick={() => handlePageChange(pagination.currentPage + 1)} 
            disabled={!pagination.hasNextPage || loading}
            className="pagination-btn"
            aria-label="下一页"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskManager;