import express from 'express';
import session from 'express-session';
import cors from 'cors';
import db from './db.js';
import path from 'path';
import { fileURLToPath } from 'url';
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60
  }
}));


app.use(express.static(path.join(__dirname, '../frontEnd')));


// fetching with /regiter.html
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    await db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, password]);
    res.json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});


// fetching with /login.html
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
    if (rows.length > 0) {
      req.session.user = { id: rows[0].id, username: rows[0].username };
      res.json({ message: 'Login successful', username: rows[0].username });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Checking login status
app.get('/login-status', (req, res) => {
  if (req.session.user) {
    res.json({ username: req.session.user.username });
  } else {
    res.status(401).json({ error: 'Not logged in' });
  }
});

// Auth middleware
function authMiddleware(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

// fetching with user posts
app.get('/posts', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT posts.id, posts.content, users.username AS author
      FROM posts
      JOIN users ON posts.user_id = users.id
      ORDER BY posts.id DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load posts' });
  }
});


// CUD operations for posts 

// Create
app.post('/posts', authMiddleware, async (req, res) => {
  const { content } = req.body;
  await db.query('INSERT INTO posts (content, user_id) VALUES (?, ?)', [content, req.session.user.id]);
  res.json({ message: 'Post created' });
});


// Update post 
app.put('/posts/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  const [rows] = await db.query('SELECT * FROM posts WHERE id = ? AND user_id = ?', [id, req.session.user.id]);
  if (rows.length === 0) return res.status(403).json({ error: 'Forbidden' });

  await db.query('UPDATE posts SET content = ? WHERE id = ?', [content, id]);
  res.json({ message: 'Post updated' });
});

// Delete post 
app.delete('/posts/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  const [rows] = await db.query('SELECT * FROM posts WHERE id = ? AND user_id = ?', [id, req.session.user.id]);
  if (rows.length === 0) return res.status(403).json({ error: 'Forbidden' });

  await db.query('DELETE FROM posts WHERE id = ?', [id]);
  res.json({ message: 'Post deleted' });
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login.html');
  });
});



app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
