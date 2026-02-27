# Security Guidelines

## Environment Variables

### Critical Security Rules

1. **NEVER commit `.env.local` or `.env.production` to git**
   - These files are in `.gitignore` by default
   - Always use `.env.example` as a template

2. **Service Role Key Security**
   - `SUPABASE_SERVICE_ROLE_KEY` has FULL database access
   - It bypasses Row Level Security (RLS)
   - Only use server-side (API routes, server components)
   - Never expose to client-side code
   - Rotate immediately if compromised

3. **API Keys**
   - Keep `IYZICO_API_KEY` and `IYZICO_SECRET_KEY` secret
   - Use sandbox keys for development
   - Use production keys only in production environment

### Environment Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your actual values from:
   - Supabase: https://app.supabase.com/project/_/settings/api
   - Iyzico: https://merchant.iyzipay.com/
   - Google Maps: https://console.cloud.google.com/google/maps-apis

3. Never share your `.env.local` file

### Production Deployment

For production (Vercel, etc.):
1. Set environment variables in the hosting platform dashboard
2. Never commit production secrets to git
3. Use different keys for development and production
4. Enable secret scanning in your repository

## Security Features

### Implemented Protections

1. **Rate Limiting**
   - API routes: 100 requests/minute
   - Auth routes: 5 requests/minute
   - Payment routes: 10 requests/minute
   - RSVP routes: 10 requests/5 minutes

2. **Input Sanitization**
   - All user input is sanitized to prevent XSS
   - HTML tags and dangerous scripts are removed
   - Email and phone validation

3. **Content Security Policy (CSP)**
   - Restricts script sources
   - Prevents inline script execution
   - Blocks dangerous protocols

4. **Authentication & Authorization**
   - Supabase Auth with Row Level Security (RLS)
   - Protected routes require authentication
   - Admin routes require admin email verification

5. **Payment Security**
   - Server-side price validation
   - Client cannot manipulate payment amounts
   - 3D Secure integration with Iyzico

### Security Headers

The following security headers are automatically applied:
- `Strict-Transport-Security` (HSTS)
- `X-Frame-Options` (Clickjacking protection)
- `X-Content-Type-Options` (MIME sniffing protection)
- `X-XSS-Protection`
- `Content-Security-Policy`
- `Referrer-Policy`
- `Permissions-Policy`

## Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** create a public GitHub issue
2. Email the security team at: [security@example.com]
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Security Checklist for Deployment

- [ ] All environment variables set in production
- [ ] Service role key is different from development
- [ ] HTTPS is enabled (SSL certificate)
- [ ] Rate limiting is active
- [ ] Database RLS policies are enabled
- [ ] Admin emails are configured
- [ ] Payment gateway is in production mode
- [ ] Error messages don't expose sensitive data
- [ ] Logging doesn't include sensitive information
- [ ] Regular security updates are scheduled

## Best Practices

1. **Regular Updates**
   - Keep dependencies up to date
   - Run `npm audit` regularly
   - Update Next.js and Supabase SDKs

2. **Code Review**
   - Review all code changes for security issues
   - Never commit secrets or API keys
   - Use environment variables for all sensitive data

3. **Monitoring**
   - Monitor for unusual activity
   - Set up alerts for failed authentication attempts
   - Track API usage and rate limit violations

4. **Backup**
   - Regular database backups
   - Store backups securely
   - Test backup restoration

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [Supabase Security](https://supabase.com/docs/guides/auth/row-level-security)
