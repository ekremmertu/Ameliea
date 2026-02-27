import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// Rate limiting store (in-memory)
// For production, use Redis or Upstash
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limit configuration
const RATE_LIMITS = {
  api: { maxRequests: 100, windowMs: 60000 }, // 100 requests per minute
  auth: { maxRequests: 5, windowMs: 60000 }, // 5 requests per minute
  payment: { maxRequests: 10, windowMs: 60000 }, // 10 requests per minute
  rsvp: { maxRequests: 10, windowMs: 300000 }, // 10 requests per 5 minutes
};

function getRateLimitKey(ip: string, path: string): string {
  return `${ip}:${path}`;
}

function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    // Create new record
    const resetTime = now + windowMs;
    rateLimitStore.set(key, { count: 1, resetTime });
    return { allowed: true, remaining: maxRequests - 1, resetTime };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  // Increment count
  record.count++;
  rateLimitStore.set(key, record);
  return { allowed: true, remaining: maxRequests - record.count, resetTime: record.resetTime };
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get client IP
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

  // Apply rate limiting based on path
  let rateLimit: { maxRequests: number; windowMs: number } | null = null;
  
  if (pathname.startsWith('/api/auth/')) {
    rateLimit = RATE_LIMITS.auth;
  } else if (pathname.startsWith('/api/payments/')) {
    rateLimit = RATE_LIMITS.payment;
  } else if (pathname.startsWith('/api/rsvp')) {
    rateLimit = RATE_LIMITS.rsvp;
  } else if (pathname.startsWith('/api/')) {
    rateLimit = RATE_LIMITS.api;
  }

  if (rateLimit) {
    const key = getRateLimitKey(ip, pathname);
    const { allowed, remaining, resetTime } = checkRateLimit(
      key,
      rateLimit.maxRequests,
      rateLimit.windowMs
    );

    if (!allowed) {
      return NextResponse.json(
        {
          error: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': rateLimit.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(resetTime).toISOString(),
          },
        }
      );
    }

    // Add rate limit headers to response
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', rateLimit.maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(resetTime).toISOString());
  }

  // Protected routes - require authentication
  const protectedPaths = [
    '/dashboard',
    '/customize',
    '/checkout',
    '/api/invitations/create',
    '/api/invitations/[^/]+/update',
    '/api/invitations/[^/]+/update-slug',
    '/api/invitations/[^/]+/tokens',
    '/api/payments/initialize',
    '/api/purchases',
    '/api/admin',
  ];

  const isProtectedPath = protectedPaths.some((path) => {
    const regex = new RegExp(`^${path}$`);
    return regex.test(pathname);
  });

  if (isProtectedPath) {
    try {
      const supabase = await createSupabaseServerClient();
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        // Redirect to login for page routes
        if (!pathname.startsWith('/api/')) {
          const loginUrl = new URL('/login', request.url);
          loginUrl.searchParams.set('redirect', pathname);
          return NextResponse.redirect(loginUrl);
        }
        
        // Return 401 for API routes
        return NextResponse.json(
          { error: 'UNAUTHORIZED', message: 'Authentication required' },
          { status: 401 }
        );
      }
    } catch (error) {
      console.error('Middleware auth check error:', error);
      
      if (!pathname.startsWith('/api/')) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      
      return NextResponse.json(
        { error: 'AUTH_ERROR', message: 'Authentication check failed' },
        { status: 500 }
      );
    }
  }

  // Admin routes - require admin email
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    try {
      const supabase = await createSupabaseServerClient();
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        if (!pathname.startsWith('/api/')) {
          return NextResponse.redirect(new URL('/login', request.url));
        }
        return NextResponse.json(
          { error: 'UNAUTHORIZED', message: 'Authentication required' },
          { status: 401 }
        );
      }

      // Check if user is admin
      const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
      if (!adminEmails.includes(user.email || '')) {
        if (!pathname.startsWith('/api/')) {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        return NextResponse.json(
          { error: 'FORBIDDEN', message: 'Admin access required' },
          { status: 403 }
        );
      }
    } catch (error) {
      console.error('Middleware admin check error:', error);
      
      if (!pathname.startsWith('/api/')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      
      return NextResponse.json(
        { error: 'AUTH_ERROR', message: 'Admin check failed' },
        { status: 500 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
