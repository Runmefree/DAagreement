import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { getDatabase } from '../models/database';
import { generateToken, TokenPayload } from '../middleware/auth';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '357095799558-j0sipl6qhovh51003ac47nfpimr6hgki.apps.googleusercontent.com';
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

export async function signup(req: Request, res: Response) {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = getDatabase();
    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);

    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await db.run(
      'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
      [email, hashedPassword, name]
    );

    const user = {
      id: result.lastID,
      email,
      name
    };

    const token = generateToken(user as TokenPayload);

    res.status(201).json({
      user,
      token
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    const db = getDatabase();
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);

    if (!user || !user.password_hash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      name: user.name
    };

    const token = generateToken(tokenPayload);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function googleLogin(req: Request, res: Response) {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: 'Missing credential' });
    }

    // Verify the token with Google
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return res.status(400).json({ error: 'Invalid token' });
    }

    const db = getDatabase();
    let user = await db.get('SELECT * FROM users WHERE email = ?', [payload.email]);

    if (!user) {
      // Create new user from Google data
      const result = await db.run(
        'INSERT INTO users (email, name, google_id) VALUES (?, ?, ?)',
        [payload.email, payload.name || '', payload.sub]
      );

      user = {
        id: result.lastID,
        email: payload.email,
        name: payload.name || '',
        google_id: payload.sub
      };
    } else if (!user.google_id) {
      // Update existing user with Google ID
      await db.run(
        'UPDATE users SET google_id = ? WHERE id = ?',
        [payload.sub, user.id]
      );
      user.google_id = payload.sub;
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      name: user.name
    };

    const token = generateToken(tokenPayload);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getProfile(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const db = getDatabase();
    const user = await db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
