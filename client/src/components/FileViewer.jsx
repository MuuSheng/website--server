import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/api';
import StatusMessage from './StatusMessage';
import LoadingSpinner from './LoadingSpinner';

const FileViewer = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async (search = '') => {
    try {
      setLoading(true);
      setError('');
      
      // 获取上传目录中的文件列表
      const searchParam = search ? `?search=${encodeURIComponent(search)}` : '';
      const response = await fetch(`${API_BASE_URL}/api/files${searchParam}`);
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files);
      } else {
        setError('获取文件列表时出错');
      }
    } catch (error) {
      setError(`网络错误: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchFiles(searchTerm);
  };

  // 检查文件是否为图片
  const isImageFile = (fileName) => {
    return /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName);
  };

  return (
    <div className="file-viewer">
      <h2>已上传文件</h2>
      <StatusMessage type="error" message={error} onRetry={() => fetchFiles(searchTerm)} />
      
      {loading && <LoadingSpinner message="加载中..." />}
      
      {/* 搜索表单 */}
      <form onSubmit={handleSearch} className="glass-container search-form">
        <div className="search-input-container">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索文件名..."
            disabled={loading}
            className="search-input"
          />
          <button type="submit" disabled={loading} className="search-button">
            搜索
          </button>
        </div>
      </form>
      
      {!loading && files.length === 0 ? (
        <p className="glass-container">暂无上传文件。</p>
      ) : (
        <div className="file-list">
          {files.map((file, index) => (
            <div key={index} className="file-item">
              <h3>{file.name}</h3>
              <p>大小: {file.size} 字节</p>
              <p>上传时间: {new Date(file.uploadDate).toLocaleString()}</p>
              {isImageFile(file.name) ? (
                <img 
                  src={`${API_BASE_URL}/uploads/${file.name}`} 
                  alt={file.name} 
                  style={{ maxWidth: '200px', maxHeight: '200px' }}
                />
              ) : (
                <a 
                  href={`${API_BASE_URL}/uploads/${file.name}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  下载文件
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileViewer;