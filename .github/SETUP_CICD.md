# CI/CD Setup Guide

## GitHub Actions Workflows

Three workflows have been configured:

### 1. CI Workflow (`.github/workflows/ci.yml`)
Runs on every push and pull request to `main` and `develop` branches.

**Jobs:**
- **Lint**: Runs ESLint and TypeScript type checking
- **Test**: Runs unit tests with coverage reporting
- **Build**: Builds the application

### 2. Deploy Workflow (`.github/workflows/deploy.yml`)
Runs on every push to `main` branch or manual trigger.

**Jobs:**
- **Deploy**: Runs tests, builds, and deploys to Vercel

### 3. E2E Tests Workflow (`.github/workflows/e2e.yml`)
Runs on push/PR and daily at 2 AM UTC.

**Jobs:**
- **E2E**: Runs Playwright end-to-end tests

## Required GitHub Secrets

Configure these secrets in your GitHub repository settings:

### Supabase
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (production only)

### Application
- `NEXT_PUBLIC_APP_URL` - Your production URL (e.g., https://yourdomain.com)
- `ADMIN_EMAILS` - Comma-separated admin emails
- `NEXT_PUBLIC_ADMIN_EMAILS` - Comma-separated admin emails (client-side)

### Iyzico Payment
- `IYZICO_API_KEY` - Iyzico API key
- `IYZICO_SECRET_KEY` - Iyzico secret key
- `IYZICO_BASE_URL` - Iyzico base URL (production: https://api.iyzipay.com)

### Vercel (for deployment)
- `VERCEL_TOKEN` - Vercel authentication token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID

### Optional
- `CODECOV_TOKEN` - Codecov token for coverage reports

## Setting Up Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Add each secret with its value

## Vercel Setup

1. Install Vercel CLI: `npm i -g vercel`
2. Link your project: `vercel link`
3. Get your Vercel token:
   - Go to https://vercel.com/account/tokens
   - Create a new token
   - Add it as `VERCEL_TOKEN` secret
4. Get your Vercel IDs:
   ```bash
   cat .vercel/project.json
   ```
   - Copy `orgId` → `VERCEL_ORG_ID`
   - Copy `projectId` → `VERCEL_PROJECT_ID`

## Pre-commit Hooks (Optional)

To add pre-commit hooks with Husky and lint-staged:

1. Install dependencies:
   ```bash
   npm install --save-dev husky lint-staged
   ```

2. Initialize Husky:
   ```bash
   npx husky init
   ```

3. Add lint-staged config to `package.json`:
   ```json
   {
     "lint-staged": {
       "*.{js,jsx,ts,tsx}": [
         "eslint --fix",
         "prettier --write"
       ],
       "*.{json,md,yml,yaml}": [
         "prettier --write"
       ]
     }
   }
   ```

4. Create pre-commit hook:
   ```bash
   echo "npx lint-staged" > .husky/pre-commit
   chmod +x .husky/pre-commit
   ```

## Manual Deployment

To manually trigger a deployment:

1. Go to **Actions** tab in your GitHub repository
2. Select **Deploy to Production** workflow
3. Click **Run workflow**
4. Select branch and click **Run workflow**

## Monitoring CI/CD

- View workflow runs in the **Actions** tab
- Check build status badges (add to README.md):
  ```markdown
  ![CI](https://github.com/username/repo/actions/workflows/ci.yml/badge.svg)
  ![Deploy](https://github.com/username/repo/actions/workflows/deploy.yml/badge.svg)
  ```

## Troubleshooting

### Build fails with "Module not found"
- Ensure all dependencies are in `package.json`
- Run `npm ci --legacy-peer-deps` locally to test

### Tests fail in CI but pass locally
- Check environment variables are set correctly
- Ensure test database/mocks are configured

### Deployment fails
- Verify all Vercel secrets are set
- Check Vercel project is linked correctly
- Review deployment logs in Vercel dashboard

## Best Practices

1. **Never commit secrets** - Always use GitHub Secrets
2. **Test before merging** - CI should pass before merging PRs
3. **Review deployment logs** - Check for warnings and errors
4. **Monitor coverage** - Aim for >60% test coverage
5. **Keep workflows fast** - Optimize build and test times

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Deployment Documentation](https://vercel.com/docs/deployments/overview)
- [Playwright CI Documentation](https://playwright.dev/docs/ci)
