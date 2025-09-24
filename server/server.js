const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

// 初始化 Express 应用
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : "*",
    methods: ["GET", "POST"]
  }
});

// 中间件
app.use(express.json());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : true,
  credentials: true
}));

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    // 确保上传目录存在
    const fs = require('fs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// 提供上传文件的静态访问
app.use('/uploads', express.static('uploads'));

// MongoDB 连接
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mywebsite';
mongoose.connect(MONGODB_URI, {
  // 新版本的MongoDB驱动不再需要这些选项
}).then(() => {
  console.log('Connected to MongoDB');
  
  // 确保uploads目录存在
  const fs = require('fs');
  const uploadDir = path.join(__dirname, 'uploads');
  
  // 使用同步方法确保目录存在
  if (!fs.existsSync(uploadDir)) {
    try {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('Created uploads directory at:', uploadDir);
    } catch (err) {
      console.error('Failed to create uploads directory:', err);
    }
  } else {
    console.log('Uploads directory already exists at:', uploadDir);
  }
  
  // 启动服务器
  const PORT = process.env.PORT || 26314;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Uploads directory path:', uploadDir);
  });
}).catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});

// 用户模型
const userSchema = new mongoose.Schema({
  username: String,
  password: String
});
const User = mongoose.model('User', userSchema);

// 任务模型
const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  completed: Boolean
});
const Task = mongoose.model('Task', taskSchema);

// JWT 密钥
const JWT_SECRET = process.env.JWT_SECRET || 'mysecretkey';

// 注册路由
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Register request:', { username, password });
    
    // 检查用户是否已存在
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send('Username already exists');
    }
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    console.log('User registered successfully:', username);
    res.status(201).send('User registered successfully');
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send('Error registering user: ' + error.message);
  }
});

// 登录路由
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).send('Invalid credentials');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send('Invalid credentials');
    }
    const token = jwt.sign({ userId: user._id }, JWT_SECRET);
    res.json({ token });
  } catch (error) {
    res.status(500).send('Error logging in');
  }
});

// 文件上传路由
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }
  res.json({ filePath: req.file.path });
});

// 文件列表路由
app.get('/api/files', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const uploadDir = path.join(__dirname, 'uploads');

  try {
    // 检查目录是否存在
    if (!fs.existsSync(uploadDir)) {
      console.log('Uploads directory does not exist, creating it...');
      fs.mkdirSync(uploadDir, { recursive: true });
      return res.json({ files: [] });
    }

    const files = fs.readdirSync(uploadDir);
    const fileDetails = [];

    files.forEach(file => {
      try {
        const filePath = path.join(uploadDir, file);
        const stats = fs.statSync(filePath);
        if (!stats.isDirectory()) {
          fileDetails.push({
            name: file,
            size: stats.size,
            uploadDate: stats.birthtime,
            type: 'file'
          });
        }
      } catch (err) {
        console.error(`Error reading file ${file}:`, err);
      }
    });

    res.json({ files: fileDetails });
  } catch (error) {
    console.error('Error reading uploads directory:', error);
    // 即使出错也返回空数组而不是500错误
    res.json({ files: [] });
  }
});

// 图片文件列表路由
app.get('/api/images', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const uploadDir = path.join(__dirname, 'uploads');

  try {
    // 检查目录是否存在
    if (!fs.existsSync(uploadDir)) {
      console.log('Uploads directory does not exist, creating it...');
      fs.mkdirSync(uploadDir, { recursive: true });
      return res.json({ images: [] });
    }

    const files = fs.readdirSync(uploadDir);
    const imageFiles = [];

    files.forEach(file => {
      try {
        const filePath = path.join(uploadDir, file);
        const stats = fs.statSync(filePath);
        // 检查文件是否为图片
        const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file);
        if (isImage && !stats.isDirectory()) {
          imageFiles.push({
            name: file,
            size: stats.size,
            uploadDate: stats.birthtime
          });
        }
      } catch (err) {
        console.error(`Error reading file ${file}:`, err);
      }
    });

    res.json({ images: imageFiles });
  } catch (error) {
    console.error('Error reading uploads directory:', error);
    // 即使出错也返回空数组而不是500错误
    res.json({ images: [] });
  }
});

// 任务管理路由
// 创建任务
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description } = req.body;
    const task = new Task({ title, description, completed: false });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).send('Error creating task');
  }
});

// 获取所有任务
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
    res.status(500).send('Error fetching tasks');
  }
});

// 更新任务
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, completed } = req.body;
    const task = await Task.findByIdAndUpdate(id, { title, description, completed }, { new: true });
    res.json(task);
  } catch (error) {
    res.status(500).send('Error updating task');
  }
});

// 删除任务
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Task.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).send('Error deleting task');
  }
});

// 实时通信
io.on('connection', (socket) => {
  console.log('User connected');
  
  // 监听用户加入聊天
  socket.on('join', (username) => {
    socket.username = username;
    console.log(`${username} joined the chat`);
  });
  
  // 监听客户端发送的消息
  socket.on('message', (msg) => {
    console.log('Message received:', msg);
    // 将消息和用户名广播给所有连接的客户端
    io.emit('message', {
      username: socket.username || 'Anonymous',
      text: msg,
      timestamp: new Date()
    });
  });
  
  socket.on('disconnect', () => {
    console.log(`${socket.username || 'User'} disconnected`);
  });
});