import React, { useState, useRef } from 'react';
import { API_BASE_URL } from '../utils/api';
import StatusMessage from './StatusMessage';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    // 重置状态
    setError('');
    setSuccess('');
    setUploadStatus('');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    // 重置状态
    setError('');
    setSuccess('');
    setUploadStatus('');
    
    if (!file) {
      setError('请选择一个文件');
      return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        setSuccess(`文件上传成功`);
        setUploadStatus(data.filePath);
        // 清空文件选择
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setError('上传文件时出错');
      }
    } catch (error) {
      setError(`网络错误: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChooseFileClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="file-upload">
      <h2>文件上传</h2>
      <StatusMessage type="error" message={error} />
      <StatusMessage type="success" message={success} />
      
      {loading && <div className="loading-spinner"></div>}
      
      <form onSubmit={handleUpload} className="glass-container">
        <div className="file-input-container">
          <input 
            type="file" 
            onChange={handleFileChange} 
            disabled={loading}
            ref={fileInputRef}
            className="file-input"
          />
          <button 
            type="button" 
            className="file-choose-button"
            onClick={handleChooseFileClick}
            disabled={loading}
          >
            {file ? file.name : '选择文件'}
          </button>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? '上传中...' : '上传'}
        </button>
      </form>
      {uploadStatus && <p className="glass-container">文件路径: {uploadStatus}</p>}
    </div>
  );
};

export default FileUpload;