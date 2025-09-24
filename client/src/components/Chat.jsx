import React, { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import { SOCKET_IO_URL } from '../utils/api';
import StatusMessage from './StatusMessage';

const MAX_MESSAGES = 100; // 限制消息数量以提高性能

const Chat = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // 'connecting', 'connected', 'disconnected'
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const isAtBottomRef = useRef(true);

  // 检查是否在底部
  const checkIfAtBottom = useCallback(() => {
    const messagesContainer = document.querySelector('.chat-messages');
    if (!messagesContainer) return true;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
    return scrollTop + clientHeight >= scrollHeight - 10;
  }, []);

  // 滚动到底部
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    // 连接到服务器
    socketRef.current = io(SOCKET_IO_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    
    // 获取用户名
    const username = localStorage.getItem('username') || '匿名用户';
    
    // 发送用户名给服务器
    socketRef.current.emit('join', username);
    
    // 监听连接状态
    socketRef.current.on('connect', () => {
      setConnectionStatus('connected');
    });
    
    socketRef.current.on('disconnect', () => {
      setConnectionStatus('disconnected');
    });
    
    socketRef.current.on('connect_error', () => {
      setConnectionStatus('disconnected');
    });
    
    // 监听消息
    socketRef.current.on('message', (msg) => {
      setMessages(prevMessages => {
        // 限制消息数量以提高性能
        const newMessages = [...prevMessages, msg];
        if (newMessages.length > MAX_MESSAGES) {
          return newMessages.slice(-MAX_MESSAGES);
        }
        return newMessages;
      });
    });
    
    // 清理函数
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // 滚动处理
  useEffect(() => {
    const messagesContainer = document.querySelector('.chat-messages');
    if (!messagesContainer) return;

    const handleScroll = () => {
      isAtBottomRef.current = checkIfAtBottom();
    };

    messagesContainer.addEventListener('scroll', handleScroll);
    return () => messagesContainer.removeEventListener('scroll', handleScroll);
  }, [checkIfAtBottom]);

  // 消息更新时滚动到底部（如果之前在底部）
  useEffect(() => {
    if (isAtBottomRef.current) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (message.trim() && connectionStatus === 'connected') {
      // 发送消息到服务器
      socketRef.current.emit('message', message);
      setMessage('');
    }
  };

  // 格式化时间
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>实时聊天</h2>
        <div className="chat-status-container">
          {connectionStatus === 'connecting' && (
            <StatusMessage type="loading" message="正在连接到聊天服务器..." />
          )}
          
          {connectionStatus === 'disconnected' && (
            <StatusMessage 
              type="error" 
              message="与聊天服务器的连接已断开" 
              onRetry={() => window.location.reload()} 
            />
          )}
        </div>
      </div>
      
      <div className="chat-messages glass-container">
        {messages.map((msg, index) => (
          <div key={index} className="chat-message">
            <strong>{msg.username}</strong> 
            <span className="chat-time"> ({formatTime(msg.timestamp)})</span>
            <p>{msg.text}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form className="chat-input" onSubmit={handleSubmit}>
        <input 
          type="text" 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          placeholder="输入消息..." 
          disabled={connectionStatus !== 'connected'}
        />
        <button 
          type="submit" 
          disabled={connectionStatus !== 'connected' || !message.trim()}
        >
          发送
        </button>
      </form>
    </div>
  );
};

export default Chat;