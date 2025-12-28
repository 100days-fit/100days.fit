# Product Requirements Document: Firebase Authentication System

## Document Information

| Field                | Value                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| **PRD ID**           | PRD-005                                                                                           |
| **Title**            | Firebase Authentication & Session Management                                                      |
| **Status**           | Draft                                                                                             |
| **Author**           | Claude Code                                                                                       |
| **Created**          | 2025-12-28                                                                                        |
| **Related Decision** | [005-firebase-authentication-retention.md](../decisions/005-firebase-authentication-retention.md) |

---

## 1. Executive Summary

### 1.1 Overview

This PRD defines the implementation of a comprehensive authentication system for 100days.fit using Firebase Authentication. The system will support multiple authentication providers (Google, Apple, Strava, Garmin), role-based access control (user, organizer, admin, premium_user), and unified session management across web and mobile platforms.

### 1.2 Goals

1. Implement secure, frictionless authentication across web and mobile apps
2. Enable social login with Google and Apple (mandatory) plus fitness platform integration (Strava, Garmin)
3. Establish role-based access control with 4 user roles
4. Provide unified session management for hybrid web/mobile experience
5. Support profile management and cross-device session control

### 1.3 Success Metrics

| Metric                              | Target           |
| ----------------------------------- | ---------------- |
| Authentication success rate         | > 99%            |
| Average login time                  | < 3 seconds      |
| Session sync latency across devices | < 2 seconds      |
| Password reset completion rate      | > 80%            |
| Social login adoption               | > 60% of signups |

---

## 2. Current State Analysis

### 2.1 Mobile App (Expo/React Native)

| Component              | Status              | Notes                         |
| ---------------------- | ------------------- | ----------------------------- |
| Firebase SDK           | Installed (v11.9.1) | Not initialized               |
| Login Screen           | Empty placeholder   | No implementation             |
| Signup Screen          | UI complete         | Non-functional, no validation |
| Auth Context           | Not exists          | No state management           |
| Token Management       | Not exists          | -                             |
| Walkthrough/Onboarding | Complete            | 3-screen flow ready           |

### 2.2 Website (Next.js)

| Component        | Status               | Notes                      |
| ---------------- | -------------------- | -------------------------- |
| Firebase SDK     | Installed (v10.12.2) | Partially configured       |
| Firebase Config  | Exists               | Uses env variables         |
| Auth Service     | Exists               | Basic email/password only  |
| Login/Signup UI  | Exists               | Tab-based UI, partial      |
| State Management | Mixed                | Recoil/Jotai inconsistency |
| Google Auth      | Button only          | Not implemented            |

### 2.3 API Gateway (Hasura)

| Component         | Status     | Notes                         |
| ----------------- | ---------- | ----------------------------- |
| JWT Configuration | Configured | HS256, needs Firebase RS256   |
| Users Table       | Exists     | Has firebase_uid, role field  |
| Role System       | Partial    | Only user/organizer defined   |
| Permissions       | Basic      | Needs expansion for all roles |
| Guest Role        | Configured | For unauthenticated access    |

---

## 3. Detailed Requirements

### 3.1 Authentication Providers

#### 3.1.1 Mandatory Providers

| Provider           | Priority | Platform Support  | Notes                      |
| ------------------ | -------- | ----------------- | -------------------------- |
| **Email/Password** | P0       | Web, iOS, Android | Core authentication        |
| **Google Sign-In** | P0       | Web, iOS, Android | OAuth 2.0 via Firebase     |
| **Apple Sign-In**  | P0       | Web, iOS, Android | Required for iOS App Store |

#### 3.1.2 Fitness Platform Providers

| Provider   | Priority | Implementation       | Notes            |
| ---------- | -------- | -------------------- | ---------------- |
| **Strava** | P1       | Integrations Service | See Decision 009 |
| **Garmin** | P1       | Integrations Service | See Decision 009 |

**Note:** Strava/Garmin authentication is handled by the Integrations Service (not Firebase directly). The Integrations Service performs OAuth, stores tokens, and issues Firebase custom tokens for login. This unified approach allows the same OAuth connection to serve both login AND activity data sync. See [009-integrations-service-architecture.md](../decisions/009-integrations-service-architecture.md) for details.

### 3.2 User Roles

#### 3.2.1 Role Definitions

| Role           | Description                 | Permissions Summary                                             |
| -------------- | --------------------------- | --------------------------------------------------------------- |
| `user`         | Standard authenticated user | View events, register, track journey, manage profile            |
| `premium_user` | Paid subscriber             | All user permissions + premium features, priority support       |
| `organizer`    | Event organizer             | All user permissions + create/manage events, view registrations |
| `admin`        | Platform administrator      | Full system access, user management, content moderation         |

#### 3.2.2 Role Hierarchy

```
admin
  └── organizer
        └── premium_user
              └── user
```

#### 3.2.3 Hasura JWT Claims Structure

```json
{
  "https://hasura.io/jwt/claims": {
    "x-hasura-allowed-roles": ["user", "premium_user", "organizer", "admin"],
    "x-hasura-default-role": "user",
    "x-hasura-user-id": "<firebase-uid>",
    "x-hasura-org-id": "<organizer-id-if-applicable>"
  }
}
```

### 3.3 Authentication Flows

#### 3.3.1 Email/Password Registration

```
1. User enters email + password on signup form
2. Client validates input (email format, password strength)
3. Client calls Firebase createUserWithEmailAndPassword()
4. Firebase creates user, returns Firebase User object
5. Client triggers Cloud Function to:
   a. Create user record in Hasura (users table)
   b. Set custom claims for Hasura JWT
6. Client sends verification email
7. Client redirects to onboarding/dashboard
```

#### 3.3.2 Social Login (Google/Apple)

```
1. User taps social login button
2. Client initiates OAuth flow via Firebase signInWithPopup/signInWithRedirect
3. Provider authenticates user, returns to app
4. Firebase returns Firebase User object
5. Cloud Function checks if user exists in Hasura:
   a. If new: Create user record, set default role
   b. If exists: Update last_login, sync profile data
6. Cloud Function sets Hasura custom claims
7. Client receives updated token, proceeds to app
```

#### 3.3.3 Fitness Platform Linking (Strava/Garmin)

```
1. User clicks "Connect Strava" in profile
2. Client initiates OAuth flow to Strava/Garmin
3. User authorizes on provider site
4. Callback receives authorization code
5. Cloud Function exchanges code for tokens
6. Cloud Function stores tokens securely (encrypted in database)
7. Cloud Function links account to Firebase user (linkWithCredential equivalent)
8. User can now login via Strava/Garmin OAuth
```

#### 3.3.4 Password Reset

```
1. User enters email on forgot password screen
2. Client calls Firebase sendPasswordResetEmail()
3. User receives email with reset link
4. User clicks link, enters new password
5. Firebase updates password
6. Cloud Function logs password change event
7. All existing sessions are invalidated (security)
```

### 3.4 Session Management

#### 3.4.1 Token Strategy

| Token Type           | Storage              | Lifetime   | Refresh Strategy          |
| -------------------- | -------------------- | ---------- | ------------------------- |
| Firebase ID Token    | Memory (not storage) | 1 hour     | Auto-refresh via SDK      |
| Refresh Token        | Secure Storage       | Long-lived | Used to get new ID tokens |
| Session Cookie (Web) | HTTP-only cookie     | 5 days     | Server-side validation    |

#### 3.4.2 Cross-Device Session Sync

```
Requirements:
- User can be logged in on multiple devices simultaneously
- Profile changes sync across devices in real-time
- Security events (password change, suspicious activity) trigger re-auth on all devices
- User can view and manage active sessions

Implementation:
- Store active sessions in Hasura: sessions table
- Use Hasura subscriptions for real-time session updates
- Implement session revocation via Cloud Function
```

#### 3.4.3 Session Table Schema

```sql
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  device_name TEXT,
  device_type TEXT, -- 'mobile_ios', 'mobile_android', 'web'
  ip_address INET,
  user_agent TEXT,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_current BOOLEAN DEFAULT FALSE,
  revoked_at TIMESTAMPTZ,
  UNIQUE(user_id, device_id)
);
```

### 3.5 Profile Management

#### 3.5.1 Profile Data

| Field                    | Type   | Editable                    | Sync Source                  |
| ------------------------ | ------ | --------------------------- | ---------------------------- |
| email                    | string | Yes (requires verification) | Firebase                     |
| display_name             | string | Yes                         | User input                   |
| full_name                | string | Yes                         | User input / Social provider |
| avatar_url               | string | Yes                         | Upload / Social provider     |
| phone_number             | string | Yes (optional)              | User input                   |
| date_of_birth            | date   | Yes                         | User input                   |
| bio                      | text   | Yes                         | User input                   |
| timezone                 | string | Yes                         | Auto-detect / User input     |
| notification_preferences | jsonb  | Yes                         | User input                   |
| linked_accounts          | jsonb  | Read-only                   | System managed               |

#### 3.5.2 Profile Operations

- **View Profile**: Any authenticated user can view their profile
- **Update Profile**: User can update their own profile fields
- **Upload Avatar**: Support image upload to Firebase Storage
- **Change Email**: Requires re-authentication + email verification
- **Change Password**: Requires re-authentication
- **Delete Account**: Soft delete with 30-day grace period, requires re-authentication

#### 3.5.3 Linked Accounts Management

```json
{
  "linked_accounts": {
    "google": {
      "linked_at": "2025-01-15T10:30:00Z",
      "email": "user@gmail.com",
      "last_used": "2025-01-20T14:00:00Z"
    },
    "strava": {
      "linked_at": "2025-01-16T08:00:00Z",
      "athlete_id": "12345678",
      "scopes": ["activity:read", "profile:read"],
      "last_sync": "2025-01-20T06:00:00Z"
    }
  }
}
```

---

## 4. Technical Architecture

### 4.1 System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
├──────────────────────────┬──────────────────────────────────────┤
│     Mobile App (Expo)    │         Website (Next.js)            │
│  - Firebase SDK v11      │    - Firebase SDK v10                │
│  - Expo SecureStore      │    - HTTP-only cookies               │
│  - React Context         │    - Recoil state                    │
└──────────────┬───────────┴────────────────┬─────────────────────┘
               │                            │
               ▼                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FIREBASE AUTH                                │
│  - Email/Password     - Google OAuth      - Apple OAuth          │
│  - Custom Claims      - ID Tokens         - Refresh Tokens       │
└──────────────────────────┬──────────────────────────────────────┘
                           │
               ┌───────────┴───────────┐
               │                       │
               ▼                       ▼
┌──────────────────────┐   ┌──────────────────────────────────────┐
│  Firebase Functions  │   │           HASURA GRAPHQL              │
│  - User sync         │   │  - JWT validation (RS256)             │
│  - Custom claims     │   │  - Role-based permissions             │
│  - OAuth handlers    │   │  - Real-time subscriptions            │
│  - Session mgmt      │   │  - User/Session tables                │
└──────────┬───────────┘   └───────────────────┬──────────────────┘
           │                                   │
           └───────────────┬───────────────────┘
                           ▼
              ┌────────────────────────┐
              │   PostgreSQL (NeonDB)  │
              │  - users table         │
              │  - user_sessions table │
              │  - linked_accounts     │
              └────────────────────────┘
```

### 4.2 Firebase Configuration

#### 4.2.1 Firebase Project Setup

```javascript
// Required Firebase services
- Authentication (Email, Google, Apple providers)
- Cloud Functions (user sync, claims management)
- Storage (avatar uploads)
- Remote Config (feature flags - optional)
```

#### 4.2.2 Cloud Functions Required

| Function            | Trigger                | Purpose                                  |
| ------------------- | ---------------------- | ---------------------------------------- |
| `onUserCreated`     | auth.user().onCreate() | Sync user to Hasura, set initial claims  |
| `onUserDeleted`     | auth.user().onDelete() | Cleanup user data in Hasura              |
| `setCustomClaims`   | HTTP callable          | Update Hasura claims when role changes   |
| `handleStravaOAuth` | HTTP trigger           | Exchange Strava OAuth code, link account |
| `handleGarminOAuth` | HTTP trigger           | Exchange Garmin OAuth code, link account |
| `revokeSession`     | HTTP callable          | Revoke specific session                  |
| `revokeAllSessions` | HTTP callable          | Revoke all user sessions (security)      |

### 4.3 Hasura Configuration

#### 4.3.1 JWT Configuration Update

```yaml
# Update docker-compose.yaml / Railway env
HASURA_GRAPHQL_JWT_SECRET: |
  {
    "type": "RS256",
    "jwk_url": "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
    "audience": "<FIREBASE_PROJECT_ID>",
    "issuer": "https://securetoken.google.com/<FIREBASE_PROJECT_ID>",
    "claims_namespace": "https://hasura.io/jwt/claims"
  }
```

#### 4.3.2 Role Permissions Matrix

| Table               | guest         | user          | premium_user | organizer      | admin |
| ------------------- | ------------- | ------------- | ------------ | -------------- | ----- |
| users               | -             | R (self)      | R (self)     | R (all)        | CRUD  |
| user_sessions       | -             | RD (self)     | RD (self)    | RD (self)      | CRUD  |
| events              | R (published) | R (published) | R (all)      | CRUD (own)     | CRUD  |
| event_registrations | -             | CR (self)     | CR (self)    | R (own events) | CRUD  |
| organizers          | R (verified)  | R             | R            | RU (self)      | CRUD  |

### 4.4 Client Architecture

#### 4.4.1 Mobile App (Expo)

```typescript
// Auth context structure
interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: UserRole;
  linkedAccounts: LinkedAccount[];
}

// Storage strategy
- ID Token: In-memory only (refreshed via SDK)
- Refresh Token: expo-secure-store
- User preferences: AsyncStorage

// Key modules
src/
├── services/
│   └── auth/
│       ├── firebase.config.ts
│       ├── auth.service.ts
│       ├── session.service.ts
│       └── providers/
│           ├── google.provider.ts
│           ├── apple.provider.ts
│           └── fitness.provider.ts
├── contexts/
│   └── AuthContext.tsx
├── hooks/
│   ├── useAuth.ts
│   └── useSession.ts
└── screens/
    └── auth/
        ├── LoginScreen.tsx
        ├── SignupScreen.tsx
        ├── ForgotPasswordScreen.tsx
        └── ProfileScreen.tsx
```

#### 4.4.2 Website (Next.js)

```typescript
// Auth state management (standardize on Recoil)
interface AuthAtom {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: UserRole;
  sessions: Session[];
}

// Session strategy
- Server-side: Firebase Admin SDK session cookies
- Client-side: onAuthStateChanged listener
- API routes for session management

// Key modules
src/
├── app/
│   └── auth/
│       ├── firebase.config.ts
│       ├── auth.service.ts
│       ├── login/
│       ├── signup/
│       ├── forgot-password/
│       └── api/
│           ├── session/route.ts
│           └── logout/route.ts
├── lib/
│   └── firebase-admin.ts
├── hooks/
│   ├── useAuth.ts
│   └── useSession.ts
└── components/
    └── auth/
        ├── AuthProvider.tsx
        ├── ProtectedRoute.tsx
        └── RoleGate.tsx
```

---

## 5. Security Requirements

### 5.1 Authentication Security

| Requirement                  | Implementation                                |
| ---------------------------- | --------------------------------------------- |
| Password strength            | Min 8 chars, 1 uppercase, 1 number, 1 special |
| Rate limiting                | 5 failed attempts = 15 min lockout            |
| Brute force protection       | Firebase built-in + Cloud Function monitoring |
| Session hijacking prevention | Device fingerprinting + IP validation         |
| CSRF protection              | SameSite cookies + CSRF tokens                |

### 5.2 Token Security

| Requirement            | Implementation                          |
| ---------------------- | --------------------------------------- |
| Token storage (mobile) | expo-secure-store (Keychain/Keystore)   |
| Token storage (web)    | HTTP-only, Secure, SameSite cookies     |
| Token transmission     | HTTPS only, Authorization header        |
| Token refresh          | Silent refresh before expiry            |
| Token revocation       | Immediate propagation via session table |

### 5.3 Data Protection

| Requirement               | Implementation                         |
| ------------------------- | -------------------------------------- |
| Sensitive data encryption | AES-256 for OAuth tokens in database   |
| PII handling              | GDPR-compliant, minimal data retention |
| Audit logging             | All auth events logged with IP/device  |
| Account recovery          | Email verification + optional 2FA      |

### 5.4 Compliance

- GDPR: Consent management, data portability, right to deletion
- SOC2: Firebase provides compliance
- App Store Guidelines: Apple Sign-In requirement met
- Google Play Requirements: OAuth consent screen configured

---

## 6. User Experience Requirements

### 6.1 Login Experience

| Requirement              | Target                                       |
| ------------------------ | -------------------------------------------- |
| Login methods visible    | All (Email, Google, Apple) without scrolling |
| Social login taps        | 2 taps maximum (button + provider consent)   |
| Error messages           | Clear, actionable, non-technical             |
| Remember me              | Optional, extends session to 30 days         |
| Biometric login (mobile) | Face ID / Fingerprint after initial login    |

### 6.2 Signup Experience

| Requirement        | Target                                         |
| ------------------ | ---------------------------------------------- |
| Required fields    | Email, password only (name optional)           |
| Password feedback  | Real-time strength indicator                   |
| Terms acceptance   | Single checkbox, links to ToS/Privacy          |
| Email verification | Soft requirement (can use app, reminder shown) |
| Onboarding flow    | 3-screen walkthrough post-signup               |

### 6.3 Profile Management

| Requirement          | Target                                   |
| -------------------- | ---------------------------------------- |
| Profile completeness | Visual indicator, gamification potential |
| Avatar upload        | Camera + gallery, crop support           |
| Account linking      | One-tap connect for each provider        |
| Session management   | List all devices, revoke individually    |
| Account deletion     | Clear process, 30-day recovery window    |

### 6.4 Error Handling

| Error Type          | User Message                                    | Action                    |
| ------------------- | ----------------------------------------------- | ------------------------- |
| Invalid credentials | "Email or password is incorrect"                | Show forgot password link |
| Account exists      | "Account already exists with this email"        | Show login option         |
| Network error       | "Connection failed. Please try again"           | Retry button              |
| Rate limited        | "Too many attempts. Try again in X minutes"     | Show countdown            |
| Session expired     | "Your session has expired. Please log in again" | Redirect to login         |

---

## 7. Integration Requirements

### 7.1 Strava Integration

| Aspect          | Details                                               |
| --------------- | ----------------------------------------------------- |
| OAuth Scopes    | `activity:read_all`, `profile:read_all`               |
| Callback URL    | `/auth/strava/callback`                               |
| Token Storage   | Encrypted in database, refresh before expiry          |
| Data Sync       | Activity data synced every 6 hours (separate feature) |
| Account Linking | Link to existing Firebase user                        |

### 7.2 Garmin Integration

| Aspect              | Details                           |
| ------------------- | --------------------------------- |
| OAuth Version       | OAuth 1.0a (legacy)               |
| Consumer Key/Secret | Stored in Firebase Config         |
| Callback URL        | `/auth/garmin/callback`           |
| Token Storage       | Encrypted in database             |
| Data Sync           | Webhook-based (Garmin Health API) |
| Account Linking     | Link to existing Firebase user    |

### 7.3 Hasura Integration

| Aspect           | Details                                       |
| ---------------- | --------------------------------------------- |
| JWT Format       | Firebase RS256 with custom claims             |
| Claims Namespace | `https://hasura.io/jwt/claims`                |
| User Sync        | Firebase Function → Hasura mutation           |
| Role Updates     | Firebase Function → Custom claims + DB update |
| Session Tracking | Real-time subscriptions for active sessions   |

---

## 8. Database Schema Updates

### 8.1 Users Table Enhancement

```sql
-- Add columns to existing users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS
  avatar_url TEXT,
  phone_number TEXT,
  date_of_birth DATE,
  bio TEXT,
  timezone TEXT DEFAULT 'UTC',
  notification_preferences JSONB DEFAULT '{}',
  linked_accounts JSONB DEFAULT '{}',
  email_verified BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMPTZ,
  login_count INTEGER DEFAULT 0,
  account_status TEXT DEFAULT 'active', -- active, suspended, deleted
  deleted_at TIMESTAMPTZ;

-- Add role enum values
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'premium_user';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';
```

### 8.2 User Sessions Table (New)

```sql
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  firebase_session_id TEXT,
  device_id TEXT NOT NULL,
  device_name TEXT,
  device_type TEXT CHECK (device_type IN ('mobile_ios', 'mobile_android', 'web', 'unknown')),
  os_version TEXT,
  app_version TEXT,
  ip_address INET,
  location_city TEXT,
  location_country TEXT,
  user_agent TEXT,
  is_current BOOLEAN DEFAULT FALSE,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  revocation_reason TEXT,
  UNIQUE(user_id, device_id)
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_active ON user_sessions(user_id) WHERE revoked_at IS NULL;
```

### 8.3 Auth Events Table (Audit Log)

```sql
CREATE TABLE auth_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL, -- login, logout, password_reset, account_linked, session_revoked, etc.
  provider TEXT, -- email, google, apple, strava, garmin
  ip_address INET,
  user_agent TEXT,
  device_id TEXT,
  success BOOLEAN DEFAULT TRUE,
  failure_reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_auth_events_user_id ON auth_events(user_id);
CREATE INDEX idx_auth_events_created_at ON auth_events(created_at DESC);
```

### 8.4 OAuth Tokens Table (Encrypted)

```sql
CREATE TABLE oauth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- strava, garmin
  access_token_encrypted BYTEA NOT NULL, -- AES-256 encrypted
  refresh_token_encrypted BYTEA,
  token_type TEXT DEFAULT 'Bearer',
  expires_at TIMESTAMPTZ,
  scopes TEXT[],
  provider_user_id TEXT,
  provider_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

CREATE INDEX idx_oauth_tokens_user_provider ON oauth_tokens(user_id, provider);
```

---

## 9. API Endpoints

### 9.1 GraphQL Mutations (Hasura)

```graphql
# User management
mutation CreateUser($input: users_insert_input!) {
  insert_users_one(object: $input) {
    id
    email
    role
  }
}

mutation UpdateUserProfile($userId: uuid!, $input: users_set_input!) {
  update_users_by_pk(pk_columns: { id: $userId }, _set: $input) {
    id
  }
}

mutation DeleteAccount($userId: uuid!) {
  update_users_by_pk(
    pk_columns: { id: $userId }
    _set: { account_status: "deleted", deleted_at: "now()" }
  ) {
    id
  }
}

# Session management
mutation CreateSession($input: user_sessions_insert_input!) {
  insert_user_sessions_one(
    object: $input
    on_conflict: {
      constraint: user_sessions_user_id_device_id_key
      update_columns: [last_active_at]
    }
  ) {
    id
  }
}

mutation RevokeSession($sessionId: uuid!) {
  update_user_sessions_by_pk(
    pk_columns: { id: $sessionId }
    _set: { revoked_at: "now()", revocation_reason: "user_revoked" }
  ) {
    id
  }
}
```

### 9.2 GraphQL Queries

```graphql
# Get current user with sessions
query GetCurrentUser {
  users(where: { firebase_uid: { _eq: "X-Hasura-User-Id" } }) {
    id
    email
    full_name
    avatar_url
    role
    linked_accounts
    user_sessions(
      where: { revoked_at: { _is_null: true } }
      order_by: { last_active_at: desc }
    ) {
      id
      device_name
      device_type
      last_active_at
      is_current
    }
  }
}

# Get active sessions
query GetActiveSessions($userId: uuid!) {
  user_sessions(
    where: { user_id: { _eq: $userId }, revoked_at: { _is_null: true } }
    order_by: { last_active_at: desc }
  ) {
    id
    device_name
    device_type
    location_city
    location_country
    last_active_at
    created_at
    is_current
  }
}
```

### 9.3 Firebase Cloud Functions (HTTP)

| Endpoint                    | Method | Purpose                    |
| --------------------------- | ------ | -------------------------- |
| `/auth/strava/callback`     | GET    | Strava OAuth callback      |
| `/auth/garmin/callback`     | GET    | Garmin OAuth callback      |
| `/auth/link-account`        | POST   | Link OAuth account to user |
| `/auth/unlink-account`      | POST   | Unlink OAuth account       |
| `/auth/revoke-session`      | POST   | Revoke specific session    |
| `/auth/revoke-all-sessions` | POST   | Revoke all user sessions   |
| `/auth/refresh-claims`      | POST   | Refresh Hasura JWT claims  |

---

## 10. Non-Functional Requirements

### 10.1 Performance

| Metric                     | Target                             |
| -------------------------- | ---------------------------------- |
| Login response time        | < 2 seconds                        |
| Token refresh time         | < 500ms                            |
| Session list load time     | < 1 second                         |
| Profile update time        | < 1 second                         |
| Social login complete time | < 5 seconds (includes provider UI) |

### 10.2 Reliability

| Metric                   | Target                             |
| ------------------------ | ---------------------------------- |
| Authentication uptime    | 99.9% (Firebase SLA)               |
| Session sync reliability | 99.5%                              |
| Graceful degradation     | Offline mode for mobile            |
| Retry mechanism          | 3 retries with exponential backoff |

### 10.3 Scalability

| Metric               | Target          |
| -------------------- | --------------- |
| Concurrent users     | 10,000 (MVP)    |
| Sessions per user    | Up to 10 active |
| Auth events/second   | 100             |
| Database connections | Pooled, max 50  |

---

## 11. Risks and Mitigations

| Risk                           | Probability | Impact   | Mitigation                                       |
| ------------------------------ | ----------- | -------- | ------------------------------------------------ |
| Strava/Garmin OAuth complexity | High        | Medium   | Implement after core auth, separate phase        |
| Firebase rate limits           | Low         | High     | Implement caching, batch operations              |
| Session sync delays            | Medium      | Medium   | Use optimistic updates, background sync          |
| Token security breach          | Low         | Critical | Short token lifetime, secure storage, monitoring |
| Apple Sign-In rejection        | Low         | High     | Test thoroughly, follow guidelines exactly       |
| Cross-platform inconsistencies | Medium      | Medium   | Shared auth service logic, comprehensive testing |

---

## 12. Dependencies

### 12.1 External Dependencies

| Dependency               | Required For              | Risk Level           |
| ------------------------ | ------------------------- | -------------------- |
| Firebase Authentication  | Core auth                 | Low (Google SLA)     |
| Firebase Cloud Functions | User sync, OAuth handling | Low                  |
| Google OAuth             | Google Sign-In            | Low                  |
| Apple OAuth              | Apple Sign-In             | Low                  |
| Strava API               | Strava integration        | Medium (API changes) |
| Garmin Health API        | Garmin integration        | Medium (API access)  |

### 12.2 Internal Dependencies

| Dependency          | Required For                 | Status  |
| ------------------- | ---------------------------- | ------- |
| Hasura GraphQL      | JWT validation, data storage | Ready   |
| PostgreSQL (NeonDB) | User data, sessions          | Ready   |
| Mobile app base     | UI implementation            | Ready   |
| Website base        | UI implementation            | Partial |

---

## 13. Out of Scope

The following are explicitly **NOT** included in this PRD:

1. **Two-Factor Authentication (2FA)** - Future enhancement
2. **Enterprise SSO (SAML/OIDC)** - Post-MVP corporate feature
3. **Passwordless Authentication (Magic Links)** - Future enhancement
4. **Phone Number Authentication** - Not required for MVP
5. **Anonymous Authentication** - Guest access via Hasura unauthorized role only
6. **User Impersonation (Admin)** - Future admin feature
7. **Social Features** - Handled by separate feature set
8. **Activity Data Sync from Strava/Garmin** - Separate PRD (uses auth established here)

---

## 14. Acceptance Criteria

### 14.1 Authentication

- [ ] User can sign up with email/password
- [ ] User can log in with email/password
- [ ] User can sign up/log in with Google
- [ ] User can sign up/log in with Apple
- [ ] Password reset flow works end-to-end
- [ ] Email verification flow works
- [ ] JWT tokens contain correct Hasura claims
- [ ] Role-based access control works in Hasura

### 14.2 Session Management

- [ ] Sessions are tracked across devices
- [ ] User can view all active sessions
- [ ] User can revoke individual sessions
- [ ] User can revoke all sessions except current
- [ ] Sessions sync in real-time across devices
- [ ] Session expiration is enforced

### 14.3 Profile Management

- [ ] User can view their profile
- [ ] User can update profile fields
- [ ] User can upload avatar
- [ ] User can change email (with verification)
- [ ] User can change password
- [ ] User can delete account (soft delete)
- [ ] User can view linked accounts

### 14.4 Fitness Platform Integration

- [ ] User can link Strava account
- [ ] User can link Garmin account
- [ ] User can unlink accounts
- [ ] Linked accounts persist across sessions
- [ ] OAuth tokens are stored securely (encrypted)

### 14.5 Security

- [ ] Passwords meet strength requirements
- [ ] Rate limiting prevents brute force
- [ ] Tokens stored securely on each platform
- [ ] HTTPS enforced for all auth endpoints
- [ ] Audit log captures all auth events

### 14.6 Cross-Platform

- [ ] Auth state syncs between web and mobile
- [ ] Logging in on web logs in on mobile (same account)
- [ ] Profile changes sync across platforms
- [ ] Session revocation affects all platforms

---

## 15. Glossary

| Term                | Definition                                             |
| ------------------- | ------------------------------------------------------ |
| **Firebase UID**    | Unique identifier assigned by Firebase to each user    |
| **JWT**             | JSON Web Token, used for authentication with Hasura    |
| **Custom Claims**   | Additional data embedded in JWT for Hasura RBAC        |
| **Hasura Claims**   | Specific JWT claims format required by Hasura          |
| **Account Linking** | Connecting multiple auth providers to one user account |
| **Session**         | An active login instance on a specific device          |
| **ID Token**        | Short-lived token (1 hour) for API authentication      |
| **Refresh Token**   | Long-lived token to obtain new ID tokens               |
| **RS256**           | RSA Signature with SHA-256, asymmetric JWT signing     |

---

## Appendix A: Environment Variables

### Mobile App (.env)

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_HASURA_ENDPOINT=
EXPO_PUBLIC_STRAVA_CLIENT_ID=
EXPO_PUBLIC_GARMIN_CONSUMER_KEY=
```

### Website (.env.local)

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_HASURA_ENDPOINT=
NEXT_PUBLIC_STRAVA_CLIENT_ID=
FIREBASE_ADMIN_PRIVATE_KEY=
FIREBASE_ADMIN_CLIENT_EMAIL=
STRAVA_CLIENT_SECRET=
GARMIN_CONSUMER_SECRET=
```

### API Gateway (.env)

```bash
HASURA_GRAPHQL_JWT_SECRET=<see section 4.3.1>
FIREBASE_PROJECT_ID=
ENCRYPTION_KEY=<32-byte hex for AES-256>
```

---

## Appendix B: Related Documents

1. [Decision 005: Firebase Authentication Retention](../decisions/005-firebase-authentication-retention.md)
2. [Decision 003: MVP Scope Definition](../decisions/003-mvp-scope-definition.md)
3. [Decision 004: Hasura-Only Architecture](../decisions/004-hasura-only-architecture.md)
4. API Gateway CLAUDE.md (Hasura development guidelines)
5. App CLAUDE.md (Mobile development guidelines)
6. Website CLAUDE.md (Web development guidelines)
