const express = require('express');
const cors = require('cors');
const { getFeed, recordSwipe, getMatches, resetStore } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const router = express.Router();

// GET /feed
router.get('/feed', (req, res) => {
  res.json({ profiles: getFeed() });
});

// POST /swipe
router.post('/swipe', (req, res) => {
  const { profileId, action } = req.body;
  if (!profileId || !['like', 'pass'].includes(action)) {
    return res.status(400).json({ error: 'profileId and valid action (like|pass) required' });
  }
  try {
    const result = recordSwipe(profileId, action);
    res.json(result);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// GET /matches
router.get('/matches', (req, res) => {
  res.json({ matches: getMatches() });
});

// Optional helper endpoint to reset demo state during testing
router.post('/reset', (req, res) => {
  resetStore();
  res.json({ ok: true });
});

// Mount at both / and /api so direct calls and Vite proxy calls both work
app.use('/', router);
app.use('/api', router);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Coy Discover backend running on http://localhost:${PORT}`);
});