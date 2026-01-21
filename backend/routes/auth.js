const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Toate câmpurile sunt obligatorii.' });
  }

  try {
    const countRes = await db.query('SELECT COUNT(*) FROM users');
    const userCount = parseInt(countRes.rows[0].count, 10);
    const assignedRole = userCount === 0 ? 'admin' : 'user';

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    const newUserQuery = `
      INSERT INTO users (username, email, password_hash, role) 
      VALUES ($1, $2, $3, $4) 
      RETURNING id, username, email, role
    `;
    
    const { rows } = await db.query(newUserQuery, [username, email, passwordHash, assignedRole]);
    const user = rows[0];

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.status(201).json({ 
      token, 
      user, 
      message: assignedRole === 'admin' ? 'Cont de administrator creat automat.' : 'Înregistrare reușită.' 
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Înregistrarea a eșuat. Username-ul sau email-ul ar putea fi deja utilizate.' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email-ul și parola sunt obligatorii.' });
  }

  try {
    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Credentiale invalide.' });
    }
    
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.json({ 
      token, 
      user: { id: user.id, username: user.username, email: user.email, role: user.role } 
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Eroare internă la login.' });
  }
});

module.exports = router;