import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/api';
import StatusMessage from './StatusMessage';

const FileViewer = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError('');
      
      // 获取上传目录中的文件列表
      const response = await fetch(`${API_BASE_URL}/api/files`);
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

  return (
    <div className="file-viewer">
      <h2>已上传文件</h2>
      <StatusMessage type="error" message={error} onRetry={fetchFiles} />
      
      {loading && <div className="loading-spinner"></div>}
      
      {!loading && files.length === 0 ? (
        <p className="glass-container">暂无上传文件。</p>
      ) : (
        <div className="file-list">
          {files.map((file, index) => (
            <div key={index} className="file-item">
              <h3>{file.name}</h3>
              <p>大小: {file.size} 字节</p>
              <p>上传时间: {new Date(file.uploadDate).toLocaleString()}</p>
              {file.type.startsWith('image/') ? (
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