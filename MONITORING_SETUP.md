# Monitoring and Error Tracking Setup

## Sentry Integration

### Installation

1. Install Sentry SDK:
   ```bash
   npm install @sentry/nextjs
   ```

2. Run Sentry wizard:
   ```bash
   npx @sentry/wizard@latest -i nextjs
   ```

3. Add environment variables:
   ```bash
   # .env.local
   NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
   SENTRY_ORG=your_org
   SENTRY_PROJECT=your_project
   SENTRY_AUTH_TOKEN=your_auth_token
   ```

4. Uncomment Sentry code in `lib/sentry.ts`

### Configuration

The Sentry integration includes:
- Error tracking
- Performance monitoring
- Session replay
- Breadcrumbs
- Release tracking

### Features

- **Automatic Error Capture**: Unhandled errors are automatically sent to Sentry
- **Custom Error Context**: Add custom context to errors
- **Performance Monitoring**: Track API response times
- **Session Replay**: Replay user sessions when errors occur
- **Source Maps**: Automatically uploaded for better stack traces

## Structured Logging

### Usage

The enhanced logger in `lib/logger.ts` provides structured logging:

```typescript
import { logger } from '@/lib/logger';

// General logging
logger.info('User logged in', { userId: '123' });
logger.warn('Rate limit approaching', { ip: '1.2.3.4' });
logger.error('Database error', error, { query: 'SELECT ...' });

// API logging
logger.apiRequest('POST', '/api/rsvp', { slug: 'my-wedding' });
logger.apiResponse('POST', '/api/rsvp', 201, 150);
logger.apiError('POST', '/api/rsvp', error);

// Database logging
logger.dbQuery('INSERT', 'rsvps', { invitationId: '123' });
logger.dbError('INSERT', 'rsvps', error);

// Auth logging
logger.authAttempt('user@example.com', true);
logger.authError('user@example.com', error);

// Payment logging
logger.paymentInitiated('user-123', 1999, 'light');
logger.paymentSuccess('user-123', 1999, 'txn-456');
logger.paymentFailed('user-123', 1999, 'Card declined');
```

### Log Format

**Development**: Human-readable with emojis
```
ℹ️ [INFO] User logged in { userId: '123' }
```

**Production**: JSON format for log aggregation
```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "level": "info",
  "message": "User logged in",
  "context": { "userId": "123" }
}
```

## Vercel Analytics

### Setup

1. Vercel Analytics is already installed (`@vercel/speed-insights`)

2. Verify it's imported in `app/layout.tsx`:
   ```typescript
   import { SpeedInsights } from '@vercel/speed-insights/next';
   ```

3. Enable in Vercel dashboard:
   - Go to your project settings
   - Navigate to Analytics
   - Enable Speed Insights

### Features

- Core Web Vitals tracking
- Real User Monitoring (RUM)
- Performance insights
- Geographic data

## Uptime Monitoring

### Recommended Services

1. **UptimeRobot** (Free)
   - Monitor: https://yourdomain.com/api/health
   - Interval: 5 minutes
   - Alerts: Email/SMS

2. **Better Uptime** (Paid)
   - More detailed monitoring
   - Status page
   - Incident management

3. **Vercel Monitoring** (Built-in)
   - Automatic deployment monitoring
   - Function execution tracking

### Health Check Endpoint

The `/api/health` endpoint is already implemented for monitoring:

```bash
curl https://yourdomain.com/api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "version": "0.1.0"
}
```

## Log Aggregation

### Recommended Services

1. **Vercel Logs** (Built-in)
   - Real-time logs in Vercel dashboard
   - Filter by function, status, etc.

2. **Datadog** (Enterprise)
   - Log aggregation
   - APM
   - Infrastructure monitoring

3. **LogRocket** (User Session Replay)
   - Session replay
   - Error tracking
   - Performance monitoring

### Setup Log Aggregation

For production, consider:
- Structured JSON logging (already implemented)
- Log retention policy
- Log analysis and alerting
- Cost optimization (log sampling)

## Performance Monitoring

### Metrics to Track

1. **API Response Times**
   - Target: < 200ms for most endpoints
   - Alert: > 1000ms

2. **Database Query Times**
   - Target: < 100ms
   - Alert: > 500ms

3. **Error Rates**
   - Target: < 0.1%
   - Alert: > 1%

4. **Uptime**
   - Target: 99.9%
   - Alert: < 99%

5. **Core Web Vitals**
   - LCP: < 2.5s
   - FID: < 100ms
   - CLS: < 0.1

### Monitoring Dashboard

Create a monitoring dashboard with:
- Real-time error count
- API response times
- Active users
- RSVP submission rate
- Payment success rate

## Alerting

### Critical Alerts

Set up alerts for:
- API error rate > 5%
- Database connection failures
- Payment gateway errors
- Authentication failures spike
- Server downtime

### Alert Channels

- Email (for all team members)
- Slack (for immediate response)
- PagerDuty (for on-call rotation)

## Security Monitoring

### Track These Events

- Failed login attempts (> 5 in 5 minutes)
- Rate limit violations
- Suspicious API usage patterns
- Unauthorized access attempts
- Data export activities

### Audit Logs

Consider implementing audit logs for:
- User registration/deletion
- Invitation creation/deletion
- Payment transactions
- Admin actions
- Data exports

## Monitoring Checklist

- [ ] Sentry installed and configured
- [ ] Structured logging implemented
- [ ] Vercel Analytics enabled
- [ ] Uptime monitoring configured
- [ ] Health check endpoint tested
- [ ] Alert channels configured
- [ ] Performance baselines established
- [ ] Security monitoring active
- [ ] Log retention policy defined
- [ ] Incident response plan documented

## Resources

- [Sentry Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Vercel Analytics](https://vercel.com/docs/analytics)
- [Next.js Monitoring](https://nextjs.org/docs/advanced-features/measuring-performance)
- [UptimeRobot](https://uptimerobot.com/)
