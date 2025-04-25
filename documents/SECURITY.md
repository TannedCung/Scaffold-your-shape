# Security Guidelines: Scaffold Your Shape

## Authentication
- All user authentication is handled via Auth.js (NextAuth) with secure session cookies.
- OAuth and email/password flows supported.
- Environment variables for secrets and keys are never committed.

## Database Security
- Supabase Row Level Security (RLS) is enabled on all tables.
- Only authenticated users can access personal data.
- Club and challenge data access is restricted by membership/participation.

## API Security
- All API endpoints validate user sessions.
- Input validation and sanitization are enforced.
- No sensitive credentials are ever exposed to the client.

## Deployment
- Use HTTPS for all production deployments.
- Keep dependencies up-to-date.
- Regularly audit for vulnerabilities.
