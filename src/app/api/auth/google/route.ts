import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret-change-in-production';

// Verify Google ID token
async function verifyGoogleToken(idToken: string) {
  try {
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);

    if (!response.ok) {
      throw new Error('Invalid token');
    }

    const data = await response.json();

    // Verify the token is for our app
    if (!process.env.GOOGLE_CLIENT_ID) {
      throw new Error('GOOGLE_CLIENT_ID not configured');
    }

    if (data.aud !== process.env.GOOGLE_CLIENT_ID) {
      throw new Error('Token audience mismatch');
    }

    return {
      email: data.email,
      name: data.name,
      picture: data.picture,
      email_verified: data.email_verified,
    };
  } catch (error) {
    console.error('Google token verification error:', error);
    throw new Error('Failed to verify Google token');
  }
}

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json(
        { message: 'ID token is required' },
        { status: 400 }
      );
    }

    // Verify the Google ID token
    const googleUser = await verifyGoogleToken(idToken);

    if (!googleUser.email_verified) {
      return NextResponse.json(
        { message: 'Email not verified with Google' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find or create user
    let user = await User.findOne({ email: googleUser.email.toLowerCase() });

    if (!user) {
      // Create new user from Google account
      user = await User.create({
        email: googleUser.email.toLowerCase(),
        name: googleUser.name || googleUser.email.split('@')[0],
        image: googleUser.picture,
        role: 'PARENT',
        // No password for Google OAuth users
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Return user data and token
    return NextResponse.json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Google login error:', error);
    return NextResponse.json(
      { message: error.message || 'Google authentication failed. Please try again.' },
      { status: 500 }
    );
  }
}
