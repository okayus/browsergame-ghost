# Ghost Game E2E Test Plan

## Application Overview

Ghost Game is a browser-based RPG application built with React and Clerk authentication. The application features user authentication, save data management, and backend API integration. This test plan covers the minimal E2E tests for core functionality including application loading, authentication flow, and basic user interactions.

## Test Scenarios

### 1. Authentication and Initial Load

**Seed:** `tests/seed.spec.ts`

#### 1.1. Application loads successfully without authentication

**File:** `tests/auth-initial-load/app-loads-unauthenticated.spec.ts`

**Steps:**
  1. Navigate to the application root URL
  2. Wait for the page to fully load
  3. Verify the page title contains 'Ghost Game'
  4. Check that the main heading 'Ghost Game' is visible

**Expected Results:**
  - Page loads without errors
  - Main heading 'Ghost Game' is displayed
  - No console errors are present
  - Application renders the base layout

#### 1.2. Sign In and Sign Up buttons are visible when not authenticated

**File:** `tests/auth-initial-load/auth-buttons-visible.spec.ts`

**Steps:**
  1. Navigate to the application root URL
  2. Wait for the page to fully load
  3. Locate the 'Sign In' button in the header
  4. Locate the 'Sign Up' button in the header
  5. Verify both buttons are visible and enabled

**Expected Results:**
  - Sign In button is visible with correct text
  - Sign Up button is visible with correct text
  - Both buttons are clickable
  - UserButton component is not visible
  - Welcome message 'Sign in to start your adventure!' is displayed

#### 1.3. Technologies section is displayed on initial load

**File:** `tests/auth-initial-load/technologies-section.spec.ts`

**Steps:**
  1. Navigate to the application root URL
  2. Scroll to the Technologies section
  3. Verify the 'Technologies:' heading is present
  4. Check that all technology items are listed (React 19, Vite, TypeScript, Vitest, Tailwind CSS, Cloudflare Pages, Clerk Auth)

**Expected Results:**
  - Technologies section is visible
  - All 7 technologies are listed
  - Each technology has the correct color coding
  - Section is properly styled with ghost theme

### 2. Clerk Authentication Flow

**Seed:** `tests/seed.spec.ts`

#### 2.1. Sign In button opens Clerk modal

**File:** `tests/auth-flow/sign-in-modal-opens.spec.ts`

**Steps:**
  1. Setup Clerk testing token using setupClerkTestingToken()
  2. Navigate to the application root URL
  3. Click the 'Sign In' button
  4. Wait for the Clerk sign-in modal to appear
  5. Verify the modal contains sign-in form elements

**Expected Results:**
  - Clerk modal appears after clicking Sign In
  - Modal contains email/username input field
  - Modal contains password input field or authentication options
  - Modal can be closed without errors

#### 2.2. Successful authentication shows user interface

**File:** `tests/auth-flow/successful-authentication.spec.ts`

**Steps:**
  1. Setup Clerk testing token using setupClerkTestingToken()
  2. Navigate to the application root URL
  3. Perform authentication using Clerk testing utilities
  4. Wait for authentication to complete
  5. Verify UserButton appears in the header
  6. Verify Sign In and Sign Up buttons are no longer visible
  7. Check that 'You are signed in!' message appears at the bottom

**Expected Results:**
  - UserButton component is visible in the header
  - Sign In and Sign Up buttons are hidden
  - Authentication completes without errors
  - User remains signed in on page reload
  - Success message is displayed

#### 2.3. Authenticated user sees Backend API Response section

**File:** `tests/auth-flow/backend-api-section-visible.spec.ts`

**Steps:**
  1. Setup Clerk testing token using setupClerkTestingToken()
  2. Authenticate user
  3. Wait for the page to load after authentication
  4. Locate the 'Backend API Response:' section
  5. Verify the section displays ghost species data or loading state

**Expected Results:**
  - Backend API Response section is visible to authenticated users
  - Section shows loading state initially or fetched data
  - Message indicates number of ghost species fetched (e.g., 'Fetched X ghost species from backend.')
  - No error messages are displayed (or error is handled gracefully)
  - Section is not visible to unauthenticated users

#### 2.4. Authenticated user sees Save Data section

**File:** `tests/auth-flow/save-data-section-visible.spec.ts`

**Steps:**
  1. Setup Clerk testing token using setupClerkTestingToken()
  2. Authenticate user
  3. Wait for the page to load after authentication
  4. Locate the 'Save Data:' section
  5. Verify the section displays save data or 'No save data found' message

**Expected Results:**
  - Save Data section is visible to authenticated users
  - Section shows loading state initially
  - Either save data is displayed (Player name, Position, Party, Items) or 'No save data found. Start a new game!' message appears
  - Save data loads from backend API
  - Section is not visible to unauthenticated users

### 3. API Integration

**Seed:** `tests/seed.spec.ts`

#### 3.1. Ghost species data is fetched from backend

**File:** `tests/api-integration/fetch-ghost-species.spec.ts`

**Steps:**
  1. Setup Clerk testing token
  2. Authenticate user
  3. Monitor network requests for API calls to /api/master/ghosts
  4. Wait for the Backend API Response section to update
  5. Verify the response contains ghost species data

**Expected Results:**
  - API request to /api/master/ghosts is made
  - Request includes authentication token
  - Response is successful (200 status)
  - Message displays the number of ghost species
  - No error message is shown

#### 3.2. Save data is loaded on authentication

**File:** `tests/api-integration/load-save-data.spec.ts`

**Steps:**
  1. Setup Clerk testing token
  2. Authenticate user
  3. Monitor network requests for API calls to /api/save
  4. Wait for the Save Data section to update
  5. Verify save data is loaded or 'no save data' message appears

**Expected Results:**
  - API request to /api/save is made after authentication
  - Request includes authentication token
  - Response is handled correctly (200 for existing data, 404 for no data)
  - Save data section displays appropriate content
  - Loading state is shown during fetch

#### 3.3. API requests include authentication headers

**File:** `tests/api-integration/auth-headers-present.spec.ts`

**Steps:**
  1. Setup Clerk testing token
  2. Authenticate user
  3. Intercept network requests to the backend API
  4. Verify that all API requests include Authorization header
  5. Check that the token format is correct

**Expected Results:**
  - All API requests include Authorization header
  - Token is in the correct format (Bearer token)
  - Requests without authentication fail appropriately
  - Token is obtained from Clerk's getToken method

### 4. Error Handling

**Seed:** `tests/seed.spec.ts`

#### 4.1. Application handles API errors gracefully

**File:** `tests/error-handling/api-error-handling.spec.ts`

**Steps:**
  1. Setup Clerk testing token
  2. Mock API to return error responses
  3. Authenticate user
  4. Wait for error messages to appear
  5. Verify error messages are displayed in the appropriate sections

**Expected Results:**
  - Error message is displayed in Backend API Response section when ghost fetch fails
  - Error message is displayed in Save Data section when save load fails
  - Errors are styled with ghost-danger class (red color)
  - Application remains stable despite errors
  - User can still interact with other parts of the application

#### 4.2. Missing Clerk publishable key shows error

**File:** `tests/error-handling/missing-clerk-key.spec.ts`

**Steps:**
  1. Remove VITE_CLERK_PUBLISHABLE_KEY environment variable
  2. Attempt to load the application
  3. Check for error message or exception

**Expected Results:**
  - Application throws error 'Missing Clerk Publishable Key'
  - Error is caught and displayed appropriately
  - Application does not proceed with undefined Clerk configuration

### 5. Responsive Design and Styling

**Seed:** `tests/seed.spec.ts`

#### 5.1. Application uses ghost theme colors correctly

**File:** `tests/styling/ghost-theme-colors.spec.ts`

**Steps:**
  1. Navigate to the application
  2. Inspect the main container styling
  3. Verify background color is ghost-bg
  4. Verify text color is ghost-text
  5. Check that buttons use ghost-primary colors

**Expected Results:**
  - Background uses ghost-bg color (dark theme)
  - Text uses ghost-text color
  - Primary buttons use ghost-primary background
  - Hover states change to ghost-primary-light
  - Surface elements use ghost-surface background

#### 5.2. Layout is centered and properly constrained

**File:** `tests/styling/layout-constraints.spec.ts`

**Steps:**
  1. Navigate to the application at various viewport sizes
  2. Verify the main content is centered (max-w-2xl mx-auto)
  3. Check padding and spacing is applied
  4. Verify rounded corners and borders are present

**Expected Results:**
  - Content container has max-width constraint
  - Container is horizontally centered
  - Proper padding is applied (p-8)
  - Elements have rounded corners
  - Border is applied with ghost-primary color
