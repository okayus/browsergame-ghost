This guide explains how to set up an environment for creating authenticated tests for a Clerk-powered application using the Playwright testing framework.

### 1. Install `@clerk/testing`
Clerk's testing package provides integration helpers. Install it using your preferred package manager:

**npm**
```bash
npm i @clerk/testing --save-dev
```

**yarn**
```bash
yarn add -D @clerk/testing
```

**pnpm**
```bash
pnpm add @clerk/testing -D
```

### 2. Set your API keys
Set your Publishable and Secret Keys as the `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` environment variables in your test runner. You can find these keys on the **API Keys** page in your Clerk Dashboard.

**Warning:** Ensure the Secret Key is provided securely, for example, by using secrets in GitHub Actions.

### 3. Configure Playwright with Clerk
The `clerkSetup()` function obtains a Testing Token when your test suite starts, making it available for all subsequent tests. Call this function in your global setup file.

**`global.setup.ts`**
```typescript
import { clerkSetup } from '@clerk/testing/playwright'
import { test as setup } from '@playwright/test'

// This is necessary if Playwright is configured to run fully parallel
setup.describe.configure({ mode: 'serial' })

setup('global setup', async ({}) => {
  await clerkSetup()
})
```
Alternatively, you can manually create a Testing Token via the Backend API and set it as the `CLERK_TESTING_TOKEN` environment variable.

### 4. Use `setupClerkTestingToken()`
In individual test cases, use the `setupClerkTestingToken()` function to inject the Testing Token. This allows the test to bypass Clerk's bot detection.

**`my-test.spec.ts`**
```typescript
import { setupClerkTestingToken } from '@clerk/testing/playwright'
import { test } from '@playwright/test'

test('sign up', async ({ page }) => {
  await setupClerkTestingToken({ page })

  await page.goto('/sign-up')
  // Add additional test logic here
})
```

A demo repository is available to see a full example of testing a Clerk-powered application with Testing Tokens.