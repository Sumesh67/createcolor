import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret-change-in-production';

// CORS headers for mobile app
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * Returns true if the email domain strongly indicates a teacher/school account.
 * .edu, .k12.XX.us variants, and known school .org patterns.
 */
function isEducationalEmail(email: string): boolean {
  const lower = email.toLowerCase();
  const domain = lower.split('@')[1] || '';
  if (domain.endsWith('.edu')) return true;
  // k12.XX.us pattern: e.g. teacher@school.k12.ca.us
  if (/\.k12\.[a-z]{2}\.us$/.test(domain)) return true;
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role, isTeacher } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!name) {
      return NextResponse.json(
        { message: 'Name is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters long' },
        { status: 400, headers: corsHeaders }
      );
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return NextResponse.json(
        { message: 'An account with this email already exists' },
        { status: 409, headers: corsHeaders }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Determine role: auto-assign TEACHER for .edu/.k12 emails;
    // flag pending verification for self-identified teachers with personal email.
    const autoTeacher = isEducationalEmail(email);
    const selfIdentifiedTeacher = !autoTeacher && isTeacher === true;
    const finalRole = (autoTeacher || selfIdentifiedTeacher) ? 'TEACHER' : (role || 'PARENT');

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      role: finalRole,
      teacherPendingVerification: selfIdentifiedTeacher,
    });

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

    return NextResponse.json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    }, { status: 201, headers: corsHeaders });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'Failed to create account. Please try again.' },
      { status: 500, headers: corsHeaders }
    );
  }
}
