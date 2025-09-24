import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 在组件挂载时检查本地存储中的主题偏好
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        setIsDarkMode(savedTheme === 'dark');
      } else {
        // 如果没有保存的主题偏好，检查系统偏好
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkMode(prefersDark);
      }
    } catch (error) {
      console.warn('Error reading theme from localStorage:', error);
      // 默认使用浅色主题
      setIsDarkMode(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 当主题状态改变时，更新DOM和本地存储
  useEffect(() => {
    if (isLoading) return;

    try {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    } catch (error) {
      console.warn('Error saving theme to localStorage:', error);
    }
  }, [isDarkMode, isLoading]);

  const toggleTheme = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  const value = {
    isDarkMode,
    toggleTheme,
    isLoading
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired
};