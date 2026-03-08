
CREATE TABLE IF NOT EXISTS t_p39907740_project_quantum_leap.users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p39907740_project_quantum_leap.posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES t_p39907740_project_quantum_leap.users(id),
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p39907740_project_quantum_leap.likes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES t_p39907740_project_quantum_leap.users(id),
  post_id INTEGER NOT NULL REFERENCES t_p39907740_project_quantum_leap.posts(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

CREATE TABLE IF NOT EXISTS t_p39907740_project_quantum_leap.comments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES t_p39907740_project_quantum_leap.users(id),
  post_id INTEGER NOT NULL REFERENCES t_p39907740_project_quantum_leap.posts(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p39907740_project_quantum_leap.sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES t_p39907740_project_quantum_leap.users(id),
  token VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);
