import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/api';
import StatusMessage from './StatusMessage';

const ImageGallery = () => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchImages();
  }, []);

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
            <div key={index} className="image-item glass-container" onClick={() => openImage(image)}>
              <div className="image-wrapper">
                <img 
                  src={`${API_BASE_URL}/uploads/${image.name}`} 
                  alt={image.name} 
                  className="gallery-image"
                />
              </div>
              <div className="image-info">
                <h3 className="image-title">{image.name}</h3>
                <p className="image-meta">
                  <span className="file-size">{formatFileSize(image.size)}</span>
                  <span className="upload-date">{formatDate(image.uploadDate)}</span>
                </p>
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
                src={`${API_BASE_URL}/uploads/${selectedImage.name}`} 
                alt={selectedImage.name} 
                className="modal-image"
              />
            </div>
            <div className="image-info">
              <h3>{selectedImage.name}</h3>
              <p>大小: {formatFileSize(selectedImage.size)}</p>
              <p>上传时间: {formatDate(selectedImage.uploadDate)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;