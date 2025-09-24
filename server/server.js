const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs').promises;

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
    fs.access(uploadDir).catch(() => {
      fs.mkdir(uploadDir).catch(console.error);
    });
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
  
  // 启动服务器
  const PORT = process.env.PORT || 26314;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
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

// 注册路由应该包含密码加密
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Register request:', { username, password });
    
    // 检查用户是否已存在
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send('Username already exists');
    }
    //加密密码
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

// 登录路由应该包含密码验证
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
app.get('/api/files', async (req, res) => {
  try {
    //确保uploads目录存在
    try {
      await fs.access('uploads');
    } catch (err) {
      //如果目录不存在，创建它
      await fs.mkdir('uploads',{recursive: ture});
    }

    const files = await fs.readdir('uploads');
    const fileDetails = await Promise.all(
      files.map(async (file)  => {
        try {
          const stats = await fs.stat('uploads/${file}');
          reture {
            name:file,
            size:stats.size,
            uploadDate:stats.birthtime,
            type:stats.isDirectory() ? 'directory' : 'file'
          };
        } catch(err) {
          //如果无法获取文件信息，跳过该文件
          console.error('Error reading file ${file}:',err);
          return null;
        }
      })
    );

    // 过滤掉目录和空值
    const filteredFiles = fileDetails.filter(file => file && file.type === 'file');
    
    res.json({ files: filteredFiles });
  } catch (error) {
    console.error('Error reading uploads directory:', error);
    res.status(500).send('Error reading files'+ error.message);
  }
});

// 图片文件列表路由
app.get('/api/images', async (req, res) => {
  try {
    //确保uploads目录存在
    try {
      await fs.access('uploads');
    } catch (err) {
      //如果目录不存在，创建它
      await fs.mkdir('uploads', { recursive: ture});
    }

    const files = await fs.readdir('uploads');
    const imageFiles = await Promise.all(
      files.map(async (file) => {
        try {
          const stats = await fs.stat(`uploads/${file}`);
          // 检查文件是否为图片
          const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file);
          if (isImage && !stats.isDirectory()) {
            return {
              name: file,
              size: stats.size,
              uploadDate: stats.birthtime
            };
          }
        } catch (err) {
          //如果无法获取文件信息，跳过该文件
          console.error('Error reading file ${file}:',err);
        }
        return null;
      })
    );
    
    // 过滤掉非图片文件和空值
    const filteredImages = imageFiles.filter(file => file !== null);
    
    res.json({ images: filteredImages });
  } catch (error) {
    console.error('Error reading uploads directory:', error);
    res.status(500).send('Error reading images');
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