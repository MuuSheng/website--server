import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/api';
import StatusMessage from './StatusMessage';

const ImageGallery = ({ isVisible }) => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isVisible) {
      fetchImages();
    }
  }, [isVisible]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${API_BASE_URL}/api/images`);
      if (response.ok) {
        const data = await response.json();
        setImages(data.images);
      } else {
        setError('获取图片时出错');
      }
    } catch (error) {
      setError(`网络错误: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const openImage = (image) => {
    setSelectedImage(image);
  };

  const closeImage = () => {
    setSelectedImage(null);
  };

  // 下载图片
  const downloadImage = (imageName) => {
    // 检查API_BASE_URL是否以斜杠结尾，避免双斜杠
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    const link = document.createElement('a');
    link.href = `${baseUrl}/uploads/${imageName}`;
    link.download = imageName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 格式化文件大小
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 格式化日期
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="image-gallery">
      <h2>图片画廊</h2>
      <StatusMessage type="error" message={error} onRetry={fetchImages} />
      
      {loading && <div className="loading-spinner"></div>}
      
      {!loading && images.length === 0 ? (
        <p className="glass-container">暂无图片。</p>
      ) : (
        <div className="image-grid">
          {images.map((image, index) => (
            <div key={index} className="image-item glass-container">
              <div className="image-wrapper" onClick={() => openImage(image)}>
                <img 
                  src={`${API_BASE_URL.replace(/\/$/, '')}/uploads/${image.name}`} 
                  alt={image.name} 
                  className="gallery-image"
                  onError={(e) => {
                    console.error('Image load error:', e.target.src);
                    // 图片加载失败时的处理
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2Ij5JbWFnZSBOb3QgRm91bmQ8L3RleHQ+PC9zdmc+';
                  }}
                />
              </div>
              <div className="image-info">
                <h3 className="image-title">{image.name}</h3>
                <p className="image-meta">
                  <span className="file-size">{formatFileSize(image.size)}</span>
                  <span className="upload-date">{formatDate(image.uploadDate)}</span>
                </p>
                <button 
                  onClick={() => downloadImage(image.name)}
                  className="secondary"
                  style={{ width: '100%', marginTop: '10px' }}
                >
                  下载
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedImage && (
        <div className="image-modal" onClick={closeImage}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={closeImage}>×</span>
            <div className="modal-image-wrapper">
              <img 
                src={`${API_BASE_URL.replace(/\/$/, '')}/uploads/${selectedImage.name}`} 
                alt={selectedImage.name} 
                className="modal-image"
                onError={(e) => {
                  console.error('Modal image load error:', e.target.src);
                  // 图片加载失败时的处理
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2Ij5JbWFnZSBOb3QgRm91bmQ8L3RleHQ+PC9zdmc+';
                }}
              />
            </div>
            <div className="image-info">
              <h3>{selectedImage.name}</h3>
              <p>大小: {formatFileSize(selectedImage.size)}</p>
              <p>上传时间: {formatDate(selectedImage.uploadDate)}</p>
              <button 
                onClick={() => downloadImage(selectedImage.name)}
                className="secondary"
                style={{ marginTop: '10px' }}
              >
                下载图片
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;