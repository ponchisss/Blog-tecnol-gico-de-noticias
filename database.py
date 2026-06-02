import sqlite3
import os
from werkzeug.security import generate_password_hash

DB_PATH = os.path.join(os.path.dirname(__file__), 'blog.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    print("Initializing database...")
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'Reader',
        is_verified INTEGER NOT NULL DEFAULT 0,
        verification_code TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # Create articles table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        summary TEXT NOT NULL,
        category TEXT NOT NULL,
        author_id INTEGER NOT NULL,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE
    )
    ''')
    
    # Check if admin user exists, if not create it
    cursor.execute("SELECT * FROM users WHERE email = ?", ("admin@techblog.com",))
    admin = cursor.fetchone()
    
    if not admin:
        print("Creating default admin user...")
        admin_pass_hash = generate_password_hash("AdminPass123!")
        cursor.execute('''
        INSERT INTO users (email, password_hash, role, is_verified)
        VALUES (?, ?, ?, ?)
        ''', ("admin@techblog.com", admin_pass_hash, "Admin", 1))
        
    conn.commit()
    conn.close()
    print("Database initialized successfully.")

if __name__ == '__main__':
    init_db()
