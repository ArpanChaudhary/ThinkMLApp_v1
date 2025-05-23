from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import hashlib
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Database setup
def init_db():
    if not os.path.exists('users.db'):
        conn = sqlite3.connect('users.db')
        c = conn.cursor()
        c.execute('''
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                identifier TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()
        conn.close()

def get_db():
    conn = sqlite3.connect('users.db')
    conn.row_factory = sqlite3.Row  # This enables column access by name
    return conn

# Password hashing
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# Helper function to create user response
def create_user_response(user):
    return {
        'id': user['id'],
        'identifier': user['identifier'],
        'created_at': user['created_at']
    }

@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        if not data or 'identifier' not in data or 'password' not in data:
            return jsonify({
                'status': 'error',
                'message': 'Missing required fields'
            }), 400

        identifier = data['identifier']
        password = data['password']

        # Basic validation
        if not identifier or not password:
            return jsonify({
                'status': 'error',
                'message': 'Identifier and password are required'
            }), 400

        if len(password) < 6:
            return jsonify({
                'status': 'error',
                'message': 'Password must be at least 6 characters long'
            }), 400

        # Hash password
        hashed_password = hash_password(password)

        # Check if user already exists
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('SELECT id FROM users WHERE identifier = ?', (identifier,))
        if cursor.fetchone():
            conn.close()
            return jsonify({
                'status': 'error',
                'message': 'User already exists'
            }), 400

        # Insert new user
        cursor.execute(
            'INSERT INTO users (identifier, password) VALUES (?, ?)',
            (identifier, hashed_password)
        )
        conn.commit()

        # Get the created user
        cursor.execute('SELECT * FROM users WHERE identifier = ?', (identifier,))
        user = cursor.fetchone()
        conn.close()

        return jsonify({
            'status': 'success',
            'message': 'User registered successfully',
            'user': create_user_response(user)
        }), 201

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data or 'identifier' not in data or 'password' not in data:
            return jsonify({
                'status': 'error',
                'message': 'Missing required fields'
            }), 400

        identifier = data['identifier']
        password = data['password']

        # Basic validation
        if not identifier or not password:
            return jsonify({
                'status': 'error',
                'message': 'Identifier and password are required'
            }), 400

        # Hash password
        hashed_password = hash_password(password)

        # Check credentials
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute(
            'SELECT * FROM users WHERE identifier = ? AND password = ?',
            (identifier, hashed_password)
        )
        user = cursor.fetchone()
        conn.close()

        if not user:
            return jsonify({
                'status': 'error',
                'message': 'Invalid credentials'
            }), 401

        return jsonify({
            'status': 'success',
            'message': 'Login successful',
            'user': create_user_response(user)
        }), 200

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    init_db()  # Initialize database on startup
    app.run(debug=True, port=5000) 