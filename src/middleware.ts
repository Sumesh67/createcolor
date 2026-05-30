import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(_req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow static image/asset files without auth
        if (/\.(png|jpe?g|gif|svg|ico|webp|avif)$/i.test(req.nextUrl.pathname)) {
          return true;
        }
        return !!token;
      },
    },
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  matcher: ['/gallery/:path*', '/parent/:path*', '/upload/:path*', '/storybook/:path*'],
};
