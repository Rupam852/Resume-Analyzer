import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

/**
 * Register a new user.
 */
export async function register(req, res) {
  try {
    const { name, email, password, targetJobRole } = req.body;

    if (!name || !email || !password || !targetJobRole) {
      return res.status(400).json({ error: 'All fields (name, email, password, targetJobRole) are required' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        targetJobRole
      }
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        targetJobRole: user.targetJobRole
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
}

/**
 * User login.
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        targetJobRole: user.targetJobRole
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
}

/**
 * Get current authenticated user profile.
 */
export async function getProfile(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      targetJobRole: user.targetJobRole,
      avatar: user.avatar
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Internal server error during profile fetch' });
  }
}

/**
 * Google OAuth Redirect handler.
 */
export function googleRedirect(req, res) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${req.protocol}://${req.get('host')}/api/auth/google/callback`;

  if (!clientId) {
    return res.status(500).json({ error: 'Google Client ID is not configured on the backend environment.' });
  }

  const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=openid%20profile%20email&prompt=select_account`;
  
  res.redirect(oauthUrl);
}

/**
 * Google OAuth Callback handler.
 */
export async function googleCallback(req, res) {
  try {
    const { code } = req.query;
    let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    // Automatically sanitize and ensure absolute URL protocol
    if (!frontendUrl.startsWith('http://') && !frontendUrl.startsWith('https://')) {
      frontendUrl = `https://${frontendUrl}`;
    }

    if (!code) {
      return res.redirect(`${frontendUrl}/login?error=Google auth authorization code was missing.`);
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${req.protocol}://${req.get('host')}/api/auth/google/callback`;

    // Exchange auth code for access tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });

    if (!tokenResponse.ok) {
      const errorDetails = await tokenResponse.text();
      console.error('Failed to exchange Google OAuth code:', errorDetails);
      return res.redirect(`${frontendUrl}/login?error=Google authentication token exchange failed.`);
    }

    const tokenData = await tokenResponse.json();
    const { access_token } = tokenData;

    // Fetch user details from Google UserInfo endpoint
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    if (!profileResponse.ok) {
      console.error('Failed to retrieve user profile from Google API');
      return res.redirect(`${frontendUrl}/login?error=Failed to retrieve user profile from Google.`);
    }

    const profileData = await profileResponse.json();
    const { email, name, picture } = profileData;

    if (!email) {
      return res.redirect(`${frontendUrl}/login?error=No email profile returned from Google OAuth.`);
    }

    // Check database for user profile
    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (user) {
      // Keep Google avatar synchronized in DB if changed
      if (picture && user.avatar !== picture) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { avatar: picture }
        });
      }
    } else {
      // Auto-register the Google authenticated user with a randomized password hash
      const randomPassword = Math.random().toString(36).slice(-10);
      const passwordHash = await bcrypt.hash(randomPassword, 10);
      user = await prisma.user.create({
        data: {
          name: name || 'Google User',
          email: email.toLowerCase(),
          passwordHash,
          targetJobRole: 'Software Engineer', // Default placeholder role
          avatar: picture || null
        }
      });
    }

    // Sign session token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production',
      { expiresIn: '7d' }
    );

    // Redirect to frontend login with query param
    res.redirect(`${frontendUrl}/login?token=${token}`);
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.redirect(`${frontendUrl}/login?error=Internal OAuth processing error.`);
  }
}
