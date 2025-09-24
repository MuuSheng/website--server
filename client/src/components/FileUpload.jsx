import React, { useState, useRef, useCallback } from 'react';
import { API_BASE_URL } from '../utils/api';
import StatusMessage from './StatusMessage';
import LoadingSpinner from './LoadingSpinner';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (file) => {
    setFile(file);
    // 重置状态
    setError('');
    setSuccess('');
    setUploadStatus('');
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
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

  // 拖放事件处理函数
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  }, []);

  return (
    <div className="file-upload">
      <h2>文件上传</h2>
      <StatusMessage type="error" message={error} />
      <StatusMessage type="success" message={success} />
      
      {loading && <LoadingSpinner message="上传中..." />}
      
      <form 
        onSubmit={handleUpload} 
        className={`glass-container ${isDragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="file-input-container">
          <input 
            type="file" 
            onChange={handleFileInputChange} 
            disabled={loading}
            ref={fileInputRef}
            className="file-input"
          />
          <div 
            className={`file-choose-button ${isDragOver ? 'drag-over' : ''}`}
            onClick={handleChooseFileClick}
            disabled={loading}
            aria-label="选择文件或拖放文件到此区域"
          >
            {file ? file.name : (
              isDragOver ? '释放文件以上传' : '选择文件或拖放文件到此区域'
            )}
          </div>
        </div>
        <button type="submit" disabled={loading || !file} aria-busy={loading}>
          {loading ? '上传中...' : '上传'}
        </button>
      </form>
      {uploadStatus && <p className="glass-container">文件路径: {uploadStatus}</p>}
    </div>
  );
};

export default FileUpload;