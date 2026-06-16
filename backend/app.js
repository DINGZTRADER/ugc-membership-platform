const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkeyforugcmembershipplatform';

const app = express();

app.use(cors());
app.use(express.json());

// --- In-Memory Database Fallback ---
let useMockDb = false;
let pool = null;
let dbCheckPromise = null;

if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  dbCheckPromise = pool.query('SELECT NOW()')
    .then(() => {
      console.log('✅ PostgreSQL Connected successfully.');
      useMockDb = false;
    })
    .catch((err) => {
      console.warn('⚠️ PostgreSQL connection failed. Falling back to In-Memory Mock Database:', err.message);
      useMockDb = true;
    });
} else {
  console.log('ℹ️ No DATABASE_URL found. Using In-Memory Mock Database.');
  useMockDb = true;
  dbCheckPromise = Promise.resolve();
}

app.use(async (req, res, next) => {
  if (dbCheckPromise) {
    await dbCheckPromise;
  }
  next();
});

// --- Mock Database ---
const mockDb = {
  users: [],
  creator_profiles: [],
  subscription_tiers: [],
  subscriptions: [],
  posts: [],
  transactions: []
};

let userIdCounter = 1;
let tierIdCounter = 1;
let postIdCounter = 1;
let subscriptionIdCounter = 1;
let transactionIdCounter = 1;

function seedMockDb() {
  const passwordHash = bcrypt.hashSync('password123', 8);
  const creators = [
    { username: 'cyber_artist', email: 'cyber@art.com', display_name: 'Cyber Horizon Studio', bio: 'Creating next-gen sci-fi digital art, neon interfaces, and futuristic 3D assets.', avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80', banner: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=800&auto=format&fit=crop&q=80' },
    { username: 'lofi_vibes', email: 'lofi@vibes.com', display_name: 'Lofi Horizon', bio: 'Chill beats to study, relax, and code to. Monthly music packs and exclusive loops.', avatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=80', banner: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&auto=format&fit=crop&q=80' }
  ];

  creators.forEach(c => {
    const uId = userIdCounter++;
    mockDb.users.push({ id: uId, username: c.username, email: c.email, password_hash: passwordHash, is_creator: true, created_at: new Date() });
    mockDb.creator_profiles.push({ user_id: uId, display_name: c.display_name, bio: c.bio, avatar_url: c.avatar, banner_url: c.banner });
    const tiers = [
      { name: 'Bronze Explorer', price: 4.99, level: 1, description: 'Access to general feed and subscriber-only newsletter.' },
      { name: 'Silver Curator', price: 9.99, level: 2, description: 'Bronze perks + monthly high-quality wallpapers or audio downloads.' },
      { name: 'Gold VIP', price: 24.99, level: 3, description: 'Full access to all source files, raw loops, and direct Q&A priority.' }
    ];
    tiers.forEach(t => mockDb.subscription_tiers.push({ id: tierIdCounter++, creator_id: uId, ...t }));
    mockDb.posts.push({ id: postIdCounter++, creator_id: uId, title: 'Welcome to my creative space!', body: 'Hey everyone! This is a public post welcoming you all to my membership page. I will be sharing updates, BTS, and exclusive assets here. Stay tuned!', required_tier_level: 0, image_url: c.banner, created_at: new Date(Date.now() - 86400000 * 3) });
    mockDb.posts.push({ id: postIdCounter++, creator_id: uId, title: '[Bronze Exclusive] Secret Project Sneak Peek', body: "Here's a sneak peek of the upcoming project. The moodboard centers on cyberpunk rain streets and holographic billboards. Thanks for being a supporter!", required_tier_level: 1, image_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80', created_at: new Date(Date.now() - 86400000 * 2) });
    mockDb.posts.push({ id: postIdCounter++, creator_id: uId, title: '[Silver Exclusive] Asset Pack Download', body: 'The new asset pack is officially live! Download link: https://example.com/download-drive-link-xyz. Hope you create something amazing!', required_tier_level: 2, image_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500&auto=format&fit=crop&q=80', created_at: new Date(Date.now() - 86400000) });
  });
}
seedMockDb();

// --- DB Helper ---
async function dbQuery(text, params) {
  if (useMockDb) throw new Error('Database is in mock mode');
  return await pool.query(text, params);
}

// --- Auth Middleware ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// --- Router ---
const router = express.Router();

// AUTH
router.post('/api/auth/register', async (req, res) => {
  const { username, email, password, isCreator } = req.body;
  if (!username || !email || !password) return res.status(400).json({ error: 'Username, email, and password are required' });
  const hashedPassword = await bcrypt.hash(password, 8);
  const isCreatorBool = !!isCreator;
  if (useMockDb) {
    if (mockDb.users.find(u => u.username === username || u.email === email)) return res.status(400).json({ error: 'Username or email already exists' });
    const newId = userIdCounter++;
    const newUser = { id: newId, username, email, password_hash: hashedPassword, is_creator: isCreatorBool, created_at: new Date() };
    mockDb.users.push(newUser);
    if (isCreatorBool) {
      mockDb.creator_profiles.push({ user_id: newId, display_name: username.replace('_', ' '), bio: 'Welcome to my creator profile!', avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80', banner_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80' });
      [{ name: 'Bronze Supporter', price: 4.99, level: 1, description: 'Access to general feed.' }, { name: 'Silver Pro', price: 9.99, level: 2, description: 'Bronze + additional exclusive materials.' }, { name: 'Gold Executive', price: 19.99, level: 3, description: 'Full access + premium benefits.' }].forEach(t => mockDb.subscription_tiers.push({ id: tierIdCounter++, creator_id: newId, ...t }));
    }
    const token = jwt.sign({ id: newUser.id, username: newUser.username, isCreator: newUser.is_creator }, JWT_SECRET);
    return res.json({ token, user: { id: newUser.id, username: newUser.username, email: newUser.email, isCreator: newUser.is_creator } });
  }
  try {
    const existing = await dbQuery('SELECT id FROM users WHERE username = $1 OR email = $2', [username, email]);
    if (existing.rows.length > 0) return res.status(400).json({ error: 'Username or email already exists' });
    const result = await dbQuery('INSERT INTO users (username, email, password_hash, is_creator) VALUES ($1, $2, $3, $4) RETURNING id, username, email, is_creator', [username, email, hashedPassword, isCreatorBool]);
    const newUser = result.rows[0];
    if (isCreatorBool) {
      await dbQuery('INSERT INTO creator_profiles (user_id, display_name, bio, avatar_url, banner_url) VALUES ($1, $2, $3, $4, $5)', [newUser.id, username, 'Welcome!', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80']);
      for (const t of [{ name: 'Bronze Supporter', price: 4.99, level: 1 }, { name: 'Silver Pro', price: 9.99, level: 2 }, { name: 'Gold Executive', price: 19.99, level: 3 }]) {
        await dbQuery('INSERT INTO subscription_tiers (creator_id, name, price, level) VALUES ($1, $2, $3, $4)', [newUser.id, t.name, t.price, t.level]);
      }
    }
    const token = jwt.sign({ id: newUser.id, username: newUser.username, isCreator: newUser.is_creator }, JWT_SECRET);
    return res.json({ token, user: { id: newUser.id, username: newUser.username, email: newUser.email, isCreator: newUser.is_creator } });
  } catch (err) { console.error(err); return res.status(500).json({ error: 'Registration failed' }); }
});

router.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  if (useMockDb) {
    const user = mockDb.users.find(u => u.username === username);
    if (!user || !bcrypt.compareSync(password, user.password_hash)) return res.status(400).json({ error: 'Invalid username or password' });
    const token = jwt.sign({ id: user.id, username: user.username, isCreator: user.is_creator }, JWT_SECRET);
    return res.json({ token, user: { id: user.id, username: user.username, email: user.email, isCreator: user.is_creator } });
  }
  try {
    const result = await dbQuery('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) return res.status(400).json({ error: 'Invalid username or password' });
    const user = result.rows[0];
    if (!await bcrypt.compare(password, user.password_hash)) return res.status(400).json({ error: 'Invalid username or password' });
    const token = jwt.sign({ id: user.id, username: user.username, isCreator: user.is_creator }, JWT_SECRET);
    return res.json({ token, user: { id: user.id, username: user.username, email: user.email, isCreator: user.is_creator } });
  } catch (err) { return res.status(500).json({ error: 'Login failed' }); }
});

router.get('/api/auth/me', authenticateToken, async (req, res) => {
  if (useMockDb) {
    const user = mockDb.users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ id: user.id, username: user.username, email: user.email, isCreator: user.is_creator });
  }
  try {
    const result = await dbQuery('SELECT id, username, email, is_creator FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    return res.json(result.rows[0]);
  } catch (err) { return res.status(500).json({ error: 'Failed to fetch user' }); }
});

// CREATORS
router.get('/api/creators', async (req, res) => {
  if (useMockDb) {
    return res.json(mockDb.creator_profiles.map(p => ({ ...p, username: (mockDb.users.find(u => u.id === p.user_id) || {}).username || '' })));
  }
  try {
    const result = await dbQuery('SELECT cp.*, u.username FROM creator_profiles cp JOIN users u ON cp.user_id = u.id');
    return res.json(result.rows);
  } catch (err) { return res.status(500).json({ error: 'Failed to fetch creators' }); }
});

router.get('/api/creators/:id', async (req, res) => {
  const creatorId = parseInt(req.params.id);
  if (useMockDb) {
    const profile = mockDb.creator_profiles.find(cp => cp.user_id === creatorId);
    if (!profile) return res.status(404).json({ error: 'Creator not found' });
    const user = mockDb.users.find(u => u.id === creatorId);
    const tiers = mockDb.subscription_tiers.filter(st => st.creator_id === creatorId).sort((a, b) => a.level - b.level);
    return res.json({ ...profile, username: user ? user.username : '', tiers });
  }
  try {
    const profileResult = await dbQuery('SELECT cp.*, u.username FROM creator_profiles cp JOIN users u ON cp.user_id = u.id WHERE cp.user_id = $1', [creatorId]);
    if (profileResult.rows.length === 0) return res.status(404).json({ error: 'Creator not found' });
    const tiersResult = await dbQuery('SELECT * FROM subscription_tiers WHERE creator_id = $1 ORDER BY level ASC', [creatorId]);
    return res.json({ ...profileResult.rows[0], tiers: tiersResult.rows });
  } catch (err) { return res.status(500).json({ error: 'Failed to fetch creator' }); }
});

router.put('/api/creators/profile', authenticateToken, async (req, res) => {
  if (!req.user.isCreator) return res.status(403).json({ error: 'Only creators can update their profiles' });
  const { display_name, bio, avatar_url, banner_url, tiers } = req.body;
  if (useMockDb) {
    const idx = mockDb.creator_profiles.findIndex(cp => cp.user_id === req.user.id);
    const profile = { user_id: req.user.id, display_name: display_name || '', bio: bio || '', avatar_url: avatar_url || '', banner_url: banner_url || '' };
    if (idx >= 0) mockDb.creator_profiles[idx] = profile; else mockDb.creator_profiles.push(profile);
    if (tiers && Array.isArray(tiers)) {
      tiers.forEach(t => {
        const i = mockDb.subscription_tiers.findIndex(st => st.creator_id === req.user.id && st.level === t.level);
        if (i >= 0) mockDb.subscription_tiers[i] = { ...mockDb.subscription_tiers[i], ...t, price: parseFloat(t.price) };
        else mockDb.subscription_tiers.push({ id: tierIdCounter++, creator_id: req.user.id, ...t, price: parseFloat(t.price) });
      });
    }
    return res.json({ message: 'Profile updated successfully', profile });
  }
  try {
    await dbQuery('INSERT INTO creator_profiles (user_id, display_name, bio, avatar_url, banner_url) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (user_id) DO UPDATE SET display_name=EXCLUDED.display_name, bio=EXCLUDED.bio, avatar_url=EXCLUDED.avatar_url, banner_url=EXCLUDED.banner_url', [req.user.id, display_name, bio, avatar_url, banner_url]);
    if (tiers && Array.isArray(tiers)) {
      for (const t of tiers) await dbQuery('INSERT INTO subscription_tiers (creator_id, name, description, price, level) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (creator_id, level) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, price=EXCLUDED.price', [req.user.id, t.name, t.description, parseFloat(t.price), t.level]);
    }
    return res.json({ message: 'Profile updated successfully' });
  } catch (err) { return res.status(500).json({ error: 'Failed to update profile' }); }
});

// SUBSCRIPTIONS
router.post('/api/subscriptions/subscribe', authenticateToken, async (req, res) => {
  const { creator_id, tier_id } = req.body;
  if (!creator_id || !tier_id) return res.status(400).json({ error: 'Creator ID and Tier ID are required' });
  if (useMockDb) {
    const tier = mockDb.subscription_tiers.find(st => st.id === parseInt(tier_id));
    if (!tier) return res.status(404).json({ error: 'Tier not found' });
    mockDb.subscriptions = mockDb.subscriptions.filter(s => !(s.subscriber_id === req.user.id && s.creator_id === parseInt(creator_id)));
    const sub = { id: subscriptionIdCounter++, subscriber_id: req.user.id, creator_id: parseInt(creator_id), tier_id: parseInt(tier_id), status: 'active', created_at: new Date() };
    mockDb.subscriptions.push(sub);
    mockDb.transactions.push({ id: transactionIdCounter++, subscriber_id: req.user.id, creator_id: parseInt(creator_id), amount: parseFloat(tier.price), created_at: new Date() });
    return res.json({ message: 'Subscribed successfully', subscription: sub });
  }
  try {
    const tierResult = await dbQuery('SELECT price FROM subscription_tiers WHERE id = $1', [tier_id]);
    if (tierResult.rows.length === 0) return res.status(404).json({ error: 'Tier not found' });
    await dbQuery('DELETE FROM subscriptions WHERE subscriber_id = $1 AND creator_id = $2', [req.user.id, creator_id]);
    const subResult = await dbQuery('INSERT INTO subscriptions (subscriber_id, creator_id, tier_id) VALUES ($1, $2, $3) RETURNING *', [req.user.id, creator_id, tier_id]);
    await dbQuery('INSERT INTO transactions (subscriber_id, creator_id, amount) VALUES ($1, $2, $3)', [req.user.id, creator_id, tierResult.rows[0].price]);
    return res.json({ message: 'Subscribed successfully', subscription: subResult.rows[0] });
  } catch (err) { return res.status(500).json({ error: 'Subscription failed' }); }
});

router.get('/api/subscriptions/active', authenticateToken, async (req, res) => {
  if (useMockDb) {
    const list = mockDb.subscriptions.filter(s => s.subscriber_id === req.user.id && s.status === 'active');
    return res.json(list.map(s => ({ ...s, creator: mockDb.creator_profiles.find(cp => cp.user_id === s.creator_id) || {}, tier: mockDb.subscription_tiers.find(t => t.id === s.tier_id) || {} })));
  }
  try {
    const result = await dbQuery('SELECT s.*, cp.display_name as creator_display_name, cp.avatar_url as creator_avatar_url, st.name as tier_name, st.price as tier_price, st.level as tier_level FROM subscriptions s JOIN creator_profiles cp ON s.creator_id = cp.user_id JOIN subscription_tiers st ON s.tier_id = st.id WHERE s.subscriber_id = $1 AND s.status = \'active\'', [req.user.id]);
    return res.json(result.rows);
  } catch (err) { return res.status(500).json({ error: 'Failed to retrieve subscriptions' }); }
});

// POSTS
router.get('/api/posts/creator/:creatorId', async (req, res) => {
  const creatorId = parseInt(req.params.creatorId);
  let userId = null;
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.split(' ')[1]) {
    try { userId = jwt.verify(authHeader.split(' ')[1], JWT_SECRET).id; } catch (e) {}
  }
  let userTierLevel = 0;
  if (userId) {
    if (userId === creatorId) { userTierLevel = 999; }
    else if (useMockDb) {
      const sub = mockDb.subscriptions.find(s => s.subscriber_id === userId && s.creator_id === creatorId && s.status === 'active');
      if (sub) { const tier = mockDb.subscription_tiers.find(t => t.id === sub.tier_id); if (tier) userTierLevel = tier.level; }
    } else {
      try {
        const r = await dbQuery('SELECT st.level FROM subscriptions s JOIN subscription_tiers st ON s.tier_id = st.id WHERE s.subscriber_id = $1 AND s.creator_id = $2 AND s.status = \'active\'', [userId, creatorId]);
        if (r.rows.length > 0) userTierLevel = r.rows[0].level;
      } catch (e) {}
    }
  }
  const mapPost = p => { const isLocked = p.required_tier_level > userTierLevel; return { ...p, body: isLocked ? '🔒 Content locked. Subscribe to this tier or higher to unlock.' : p.body, is_locked: isLocked }; };
  if (useMockDb) return res.json(mockDb.posts.filter(p => p.creator_id === creatorId).map(mapPost));
  try {
    const result = await dbQuery('SELECT * FROM posts WHERE creator_id = $1 ORDER BY created_at DESC', [creatorId]);
    return res.json(result.rows.map(mapPost));
  } catch (err) { return res.status(500).json({ error: 'Failed to retrieve posts' }); }
});

router.post('/api/posts', authenticateToken, async (req, res) => {
  if (!req.user.isCreator) return res.status(403).json({ error: 'Only creators can create posts' });
  const { title, body, required_tier_level, image_url } = req.body;
  if (!title || !body) return res.status(400).json({ error: 'Title and body are required' });
  const requiredLevel = parseInt(required_tier_level) || 0;
  if (useMockDb) {
    const newPost = { id: postIdCounter++, creator_id: req.user.id, title, body, required_tier_level: requiredLevel, image_url: image_url || null, created_at: new Date() };
    mockDb.posts.push(newPost);
    return res.json({ message: 'Post created successfully', post: newPost });
  }
  try {
    const result = await dbQuery('INSERT INTO posts (creator_id, title, body, required_tier_level, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *', [req.user.id, title, body, requiredLevel, image_url || null]);
    return res.json({ message: 'Post created successfully', post: result.rows[0] });
  } catch (err) { return res.status(500).json({ error: 'Failed to create post' }); }
});

// ANALYTICS
router.get('/api/analytics/creator', authenticateToken, async (req, res) => {
  if (!req.user.isCreator) return res.status(403).json({ error: 'Only creators can view analytics' });
  if (useMockDb) {
    const subs = mockDb.subscriptions.filter(s => s.creator_id === req.user.id && s.status === 'active');
    const txs = mockDb.transactions.filter(t => t.creator_id === req.user.id);
    return res.json({ subscribersCount: subs.length, totalEarnings: parseFloat(txs.reduce((sum, t) => sum + t.amount, 0).toFixed(2)), transactions: txs.sort((a, b) => b.created_at - a.created_at) });
  }
  try {
    const subsResult = await dbQuery("SELECT COUNT(*) FROM subscriptions WHERE creator_id = $1 AND status = 'active'", [req.user.id]);
    const transResult = await dbQuery('SELECT SUM(amount) FROM transactions WHERE creator_id = $1', [req.user.id]);
    const listResult = await dbQuery('SELECT t.*, u.username as subscriber_name FROM transactions t JOIN users u ON t.subscriber_id = u.id WHERE t.creator_id = $1 ORDER BY t.created_at DESC', [req.user.id]);
    return res.json({ subscribersCount: parseInt(subsResult.rows[0].count), totalEarnings: parseFloat(transResult.rows[0].sum || 0).toFixed(2), transactions: listResult.rows });
  } catch (err) { return res.status(500).json({ error: 'Failed to fetch analytics' }); }
});

// Mount router
app.use('/', router);

module.exports = app;
