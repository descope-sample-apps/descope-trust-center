# Sentry Error Tracking Setup

This document provides instructions for configuring Sentry error tracking in the Next.js application.

## What's Included

Sentry has been integrated with the following features:

1. **Error tracking** for client, server, and edge runtime
2. **Source map uploads** for readable stack traces in production
3. **Session replay** for debugging user sessions
4. **Performance monitoring** with distributed tracing
5. **Environment tagging** (automatically detects Vercel environment)
6. **Error boundary** for graceful error handling
7. **Optional in development** - won't break local dev without Sentry DSN

## Files Created/Modified

### New Files

- `apps/nextjs/sentry.client.config.ts` - Client-side Sentry initialization
- `apps/nextjs/sentry.server.config.ts` - Server-side Sentry initialization
- `apps/nextjs/sentry.edge.config.ts` - Edge runtime Sentry initialization
- `apps/nextjs/src/app/_components/error-boundary.tsx` - Error boundary component
- `apps/nextjs/src/app/error.tsx` - Global error handler
- `apps/nextjs/src/app/api/test-sentry/route.ts` - Test endpoint for Sentry (disabled in production)
- `apps/nextjs/.sentryclirc.example` - Sentry CLI configuration template

### Modified Files

- `apps/nextjs/package.json` - Added @sentry/nextjs dependency
- `apps/nextjs/next.config.js` - Wrapped with withSentryConfig
- `apps/nextjs/src/env.ts` - Added Sentry environment variables to schema
- `.env.example` - Added Sentry configuration examples
- `turbo.json` - Added Sentry env vars to globalEnv

## Configuration Steps

### 1. Create a Sentry Project

1. Sign up or log in to [Sentry](https://sentry.io)
2. Create a new project for Next.js
3. Copy your DSN (Data Source Name) from the project settings

### 2. Set Environment Variables

Add the following to your `.env` file (or configure in Vercel):

```bash
# Required for error capture
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/your-project-id

# Required for source map uploads (build time only)
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug
SENTRY_AUTH_TOKEN=your-auth-token
```

### 3. Generate Auth Token

For automatic source map uploads during builds:

1. Go to Settings → Auth Tokens in Sentry
2. Create a new token with `project:releases` scope
3. Add it as `SENTRY_AUTH_TOKEN` in your environment

### 4. Configure for Vercel (Production)

In your Vercel project settings:

1. Add `NEXT_PUBLIC_SENTRY_DSN` to environment variables (all environments)
2. Add `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` (production only)
3. These will be automatically picked up during builds

## Testing

### Local Development

The integration is **optional in development** - the app will work fine without Sentry configured. To test Sentry locally:

1. Set `NEXT_PUBLIC_SENTRY_DSN` in your `.env` file
2. Start the dev server: `pnpm dev`
3. Visit `http://localhost:3000/api/test-sentry` to trigger a test error
4. Check your Sentry dashboard to see the error

### Production

After deploying with Sentry configured:

1. Errors are automatically captured and sent to Sentry
2. Source maps are uploaded during build for readable stack traces
3. Session replays are captured for 10% of sessions + 100% of errors
4. Environment is automatically tagged (production, preview, development)

## Features Explained

### Error Boundary

The `ErrorBoundary` component catches React errors and displays a user-friendly error page while logging the error to Sentry.

Location: `src/app/_components/error-boundary.tsx`

### Automatic Vercel Monitors

The configuration includes `automaticVercelMonitors: true`, which enables:

- Automatic cron monitoring for scheduled tasks
- Performance monitoring for API routes
- Integration with Vercel's monitoring features

### Sample Rates

Configured sample rates:

- **Traces**: 10% in production, 100% in development
- **Replay on error**: 100% (captures all sessions with errors)
- **Replay sessions**: 10% (captures 1 in 10 normal sessions)

### Environment Detection

Sentry automatically detects the environment:

- Uses `VERCEL_ENV` in Vercel deployments (production, preview, development)
- Falls back to `NODE_ENV` for local development
- Disabled by default in development unless DSN is explicitly set

## Alert Configuration

To set up alert rules in Sentry:

1. Go to Alerts → Create Alert Rule
2. Choose conditions (e.g., "When an event is seen more than 10 times in 1 hour")
3. Select notification channels (email, Slack, etc.)

Recommended alerts:

- **Critical errors**: Alert immediately on any error in production
- **High frequency**: Alert when error rate exceeds threshold
- **New issues**: Get notified of newly discovered errors

## Troubleshooting

### Source Maps Not Uploading

If stack traces are minified in production:

1. Verify `SENTRY_AUTH_TOKEN` is set correctly
2. Check build logs for source map upload status
3. Ensure `SENTRY_ORG` and `SENTRY_PROJECT` match your Sentry settings

### Errors Not Being Captured

1. Verify `NEXT_PUBLIC_SENTRY_DSN` is set
2. Check that the environment is not development (unless DSN is explicitly set)
3. Check browser console for Sentry initialization messages

### Local Development Issues

Sentry is intentionally disabled in local development unless you set the DSN. This prevents:

- Cluttering your Sentry dashboard with dev errors
- Slowing down development with network requests
- Requiring Sentry setup for every developer

## Cost Optimization

To reduce Sentry costs in high-traffic apps:

1. Adjust `tracesSampleRate` in the config files (e.g., 0.1 for 10%)
2. Reduce `replaysSessionSampleRate` (e.g., 0.01 for 1%)
3. Use Sentry's rate limiting features
4. Set up spike protection in Sentry settings

## Additional Resources

- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Source Maps Guide](https://docs.sentry.io/platforms/javascript/sourcemaps/)
- [Session Replay](https://docs.sentry.io/product/session-replay/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)
