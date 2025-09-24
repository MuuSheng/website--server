// 验证工具函数
const validator = {
  // 验证用户名
  validateUsername: (username) => {
    if (!username) {
      return { isValid: false, message: '用户名不能为空' };
    }
    
    if (typeof username !== 'string') {
      return { isValid: false, message: '用户名必须是字符串' };
    }
    
    if (username.length < 3) {
      return { isValid: false, message: '用户名长度至少为3个字符' };
    }
    
    if (username.length > 20) {
      return { isValid: false, message: '用户名长度不能超过20个字符' };
    }
    
    if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(username)) {
      return { isValid: false, message: '用户名只能包含字母、数字、下划线和中文字符' };
    }
    
    return { isValid: true, message: '' };
  },
  
  // 验证密码
  validatePassword: (password) => {
    if (!password) {
      return { isValid: false, message: '密码不能为空' };
    }
    
    if (typeof password !== 'string') {
      return { isValid: false, message: '密码必须是字符串' };
    }
    
    if (password.length < 6) {
      return { isValid: false, message: '密码长度至少为6个字符' };
    }
    
    if (password.length > 50) {
      return { isValid: false, message: '密码长度不能超过50个字符' };
    }
    
    // 检查是否包含至少一个字母和一个数字
    if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
      return { isValid: false, message: '密码必须包含至少一个字母和一个数字' };
    }
    
    return { isValid: true, message: '' };
  },
  
  // 验证任务标题
  validateTaskTitle: (title) => {
    if (!title) {
      return { isValid: false, message: '任务标题不能为空' };
    }
    
    if (typeof title !== 'string') {
      return { isValid: false, message: '任务标题必须是字符串' };
    }
    
    if (title.length > 100) {
      return { isValid: false, message: '任务标题长度不能超过100个字符' };
    }
    
    return { isValid: true, message: '' };
  },
  
  // 验证任务描述
  validateTaskDescription: (description) => {
    if (description && typeof description !== 'string') {
      return { isValid: false, message: '任务描述必须是字符串' };
    }
    
    if (description && description.length > 500) {
      return { isValid: false, message: '任务描述长度不能超过500个字符' };
    }
    
    return { isValid: true, message: '' };
  }
};

module.exports = validator;