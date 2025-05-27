const cors = require('cors');
const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

const VAULT_ADDR = process.env.VAULT_ADDR;  
const VAULT_TOKEN = process.env.VAULT_TOKEN;  
const SECRET_PATH = 'jwt-tokens';  // Base path in Vault

const users = { padmanaban: 'password123' };

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (users[username] !== password) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ username }, 'your_jwt_secret', { expiresIn: '1h' });

  try {
    // Vault KV v2 requires the path: /v1/<mount>/data/<secret>
    const vaultPath = `${VAULT_ADDR}/v1/${SECRET_PATH}/data/${username}`;

    await axios.post(
      vaultPath,
      { data: { token } },
      { headers: { 'X-Vault-Token': VAULT_TOKEN } }
    );

    res.json({ message: 'Login successful' });
  } catch (err) {
    console.error('Vault error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Vault storage failed', details: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
