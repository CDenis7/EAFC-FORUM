const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const categoryRoutes = require('./routes/categories'); 
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const commentRoutes = require('./routes/comments');
const voteRoutes = require('./routes/votes');
const searchRoutes = require('./routes/search');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/categories', categoryRoutes); 
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/search', searchRoutes);

app.listen(PORT, () => {
    console.log(`[SERVER] Categorized Forum active on port ${PORT}`);
});