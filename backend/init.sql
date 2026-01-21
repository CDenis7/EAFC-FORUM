SET client_min_messages TO WARNING;

DROP TABLE IF EXISTS user_achievements;
DROP TABLE IF EXISTS achievements;
DROP TABLE IF EXISTS votes;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
    avatar_url VARCHAR(255),
    bio TEXT,
    stat_pac INTEGER DEFAULT 70,
    stat_sho INTEGER DEFAULT 70,
    stat_pas INTEGER DEFAULT 70,
    stat_dri INTEGER DEFAULT 70,
    stat_def INTEGER DEFAULT 70,
    stat_phy INTEGER DEFAULT 70,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50) DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    content TEXT NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    vote_count INTEGER NOT NULL DEFAULT 0,
    is_closed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    parent_comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE, 
    vote_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE achievements (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    requirement_type VARCHAR(50) NOT NULL,
    requirement_value INTEGER DEFAULT 1
);

CREATE TABLE user_achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id INTEGER NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    awarded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_id)
);

INSERT INTO categories (name, description, icon) VALUES 
('Ultimate Team', 'Share your pack pulls, SBC solutions, and market tips.', ''),
('Tactics & Formations', 'Discuss the current meta, custom tactics, and instructions.', ''),
('Career Mode', 'Document your journey to glory or share hidden wonderkids.', ''),
('Pro Clubs', 'Find a club or recruit players for your squad.', ''),
('Gameplay Feedback', 'Technical issues, skill moves, and patch notes discussion.', '');

INSERT INTO achievements (name, description, requirement_type, requirement_value) VALUES 
('Market Debut', 'Started your first thread.', 'first_post', 1),
('Pitch Side', 'Posted your first comment.', 'first_comment', 1),
('Clinical Finisher', 'Created 5 threads.', 'post_count', 5),
('Playmaker', 'Replied to 10 threads.', 'comment_count', 10);