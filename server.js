

const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

const VAULT_ADDR = process.env.VAULT_ADDR;  
const VAULT_TOKEN = process.env.VAULT_TOKEN;  
const SECRET_PATH = 'jwt-tokens';

const users = { padmanaban: 'password123' };  

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (users[username] !== password) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ username }, 'your_jwt_secret', { expiresIn: '1h' });

  try {
    // Store in Vault
    await axios.post(
      `${VAULT_ADDR}/v1/${SECRET_PATH}/${username}`,
      { data: { token } },
      { headers: { 'X-Vault-Token': VAULT_TOKEN } }
    );

    res.json({ message: 'Login successful' });  // No token sent to client
  } catch (err) {
    res.status(500).json({ error: 'Vault storage failed', details: err.message });
  }
});

app.listen(3001, () => console.log('API running on port 3001'));
