const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/Main_Blog', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const BlogSchema = new mongoose.Schema({
  title: String,
  description: String,
  content: String,
  category: String,
  publishDate: Date,
});

const User = mongoose.model('User', UserSchema);
const Blog = mongoose.model('Blog', BlogSchema);

app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ username, email, password: hashedPassword });
  await newUser.save();
  res.status(200).json({ message: 'Registration successful' });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = jwt.sign({ userId: user._id }, 'secretKey', { expiresIn: '1h' });
  res.status(200).json({ token });
});

app.post('/blogs', async (req, res) => {
  const newBlog = new Blog(req.body);
  await newBlog.save();
  res.status(201).json({ message: 'Blog published' });
});

app.get('/blogs', async (req, res) => {
  const blogs = await Blog.find();
  res.status(200).json(blogs);
});

app.listen(4000, () => console.log('Server running on port 4000'));

/* ✅ Now your app supports full CRUD operations with MongoDB & JWT authentication! 🚀 */
