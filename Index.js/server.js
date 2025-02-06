// const express = require('express');
// const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const cors = require('cors');
// require('dotenv').config();

// const app = express();
// app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
// app.use(express.json());


// // process.env.MONGO_URI,
// mongoose.connect('mongodb://127.0.0.1:27017/Main_Blog', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// const UserSchema = new mongoose.Schema({
//   username: { type: String, required: true, unique: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
// });

// const BlogSchema = new mongoose.Schema({
//   title: String,
//   description: String,
//   content: String,
//   category: String,
//   publishDate: Date,
// });

// const User = mongoose.model('User', UserSchema);
// const Blog = mongoose.model('Blog', BlogSchema);

// app.post('/register', async (req, res) => {
//   const { username, email, password } = req.body;
//   const hashedPassword = await bcrypt.hash(password, 10);
//   const newUser = new User({ username, email, password: hashedPassword });
//   await newUser.save();
//   res.status(200).json({ message: 'Registration successful' });
// });

// app.post('/login', async (req, res) => {
//   const { email, password } = req.body;
//   const user = await User.findOne({ email });
//   if (!user || !(await bcrypt.compare(password, user.password))) {
//     return res.status(401).json({ message: 'Invalid credentials' });
//   }
//   const token = jwt.sign({ userId: user._id }, 'secretKey', { expiresIn: '1h' });
//   res.status(200).json({ token });
// });

// app.post('/blogs', async (req, res) => {
//   const newBlog = new Blog(req.body);
//   await newBlog.save();
//   res.status(201).json({ message: 'Blog published' });
// });

// app.get('/blogs', async (req, res) => {
//   const blogs = await Blog.find();
//   res.status(200).json(blogs);
// });

// app.listen(4000, () => console.log('Server running on port 4000'));

// /* ✅ Now your app supports full CRUD operations with MongoDB & JWT authentication! 🚀 */





const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000 // 5 seconds timeout
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// Handle MongoDB connection error
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

// Handle MongoDB connection success
mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB successfully');
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
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.status(200).json({ message: 'Registration successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Registration failed' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, 'secretKey', { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed' });
  }
});

app.post('/blogs', async (req, res) => {
  try {
    const newBlog = new Blog(req.body);
    await newBlog.save();
    res.status(201).json({ message: 'Blog published' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to publish blog' });
  }
});

app.get('/blogs', async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.status(200).json(blogs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch blogs' });
  }
});

app.listen(4000, () => console.log('Server running on port 4000'));
