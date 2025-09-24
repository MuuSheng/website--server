import React from 'react';
import './AboutMe.css';

const AboutMe = () => {
  return (
    <div className="about-me-container glass-container">
      <h2>关于我</h2>
      <div className="about-content">
        <div className="about-section">
          <h3>个人简介</h3>
          <p>
            您好！我是[您的姓名]，一名热爱技术的开发者。我专注于Web开发，喜欢创造实用且美观的应用程序。
          </p>
        </div>
        
        <div className="about-section">
          <h3>技能专长</h3>
          <ul>
            <li>前端开发：React, JavaScript, HTML/CSS</li>
            <li>后端开发：Node.js, Express</li>
            <li>数据库：MongoDB</li>
            <li>其他：Git, RESTful API设计</li>
          </ul>
        </div>
        
        <div className="about-section">
          <h3>联系方式</h3>
          <p>邮箱：[您的邮箱地址]</p>
          <p>GitHub：[您的GitHub链接]</p>
        </div>
      </div>
    </div>
  );
};

export default AboutMe;