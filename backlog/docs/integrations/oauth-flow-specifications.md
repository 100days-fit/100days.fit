# OAuth Flow Specifications

## Overview
This document specifies the OAuth 2.0 implementation for each fitness platform integration, including mobile-specific considerations, security requirements, and error handling strategies.

## Platform OAuth Configurations

### 1. Garmin Connect

#### OAuth 2.0 Configuration
```yaml
provider: Garmin Connect
auth_type: OAuth 2.0
grant_type: authorization_code
endpoints:
  authorize: https://connect.garmin.com/oauthConfirm
  token: https://connectapi.garmin.com/oauth-service/oauth/access_token
  api_base: https://apis.garmin.com/wellness-api/rest
scopes:
  required:
    - ACTIVITY_READ
    - WELLNESS_READ
  optional:
    - SLEEP_READ
    - NUTRITION_READ
token_expiry: 1 year
refresh_available: yes
```

#### Mobile OAuth Flow (Garmin)
```typescript
// React Native implementation
class GarminOAuth {
  async authenticate(): Promise<TokenSet> {
    // 1. Generate PKCE challenge
    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = await this.generateCodeChallenge(codeVerifier);
    
    // 2. Build authorization URL
    const authUrl = this.buildAuthUrl({
      client_id: Config.GARMIN_CLIENT_ID,
      redirect_uri: 'com.100days.fit://oauth/garmin',
      response_type: 'code',
      scope: 'ACTIVITY_READ WELLNESS_READ',
      state: this.generateState(),
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    });
    
    // 3. Open in-app browser
    const result = await InAppBrowser.openAuth(authUrl, 'com.100days.fit://oauth/garmin');
    
    // 4. Extract authorization code
    const { code, state } = this.parseCallback(result.url);
    
    // 5. Verify state
    if (!this.verifyState(state)) {
      throw new Error('Invalid state parameter');
    }
    
    // 6. Exchange code for tokens
    const tokens = await this.exchangeCode({
      code,
      client_id: Config.GARMIN_CLIENT_ID,
      client_secret: Config.GARMIN_CLIENT_SECRET,
      redirect_uri: 'com.100days.fit://oauth/garmin',
      grant_type: 'authorization_code',
      code_verifier: codeVerifier
    });
    
    // 7. Securely store tokens
    await this.storeTokens(tokens);
    
    return tokens;
  }
  
  async refreshToken(refreshToken: string): Promise<TokenSet> {
    const response = await fetch('https://connectapi.garmin.com/oauth-service/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: Config.GARMIN_CLIENT_ID,
        client_secret: Config.GARMIN_CLIENT_SECRET
      })
    });
    
    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.status}`);
    }
    
    return response.json();
  }
}
```

### 2. Strava

#### OAuth 2.0 Configuration
```yaml
provider: Strava
auth_type: OAuth 2.0
grant_type: authorization_code
endpoints:
  authorize: https://www.strava.com/oauth/authorize
  token: https://www.strava.com/oauth/token
  api_base: https://www.strava.com/api/v3
scopes:
  required:
    - read
    - activity:read
  optional:
    - activity:read_all
    - profile:read_all
token_expiry: 6 hours
refresh_available: yes
```

#### Mobile OAuth Flow (Strava)
```typescript
class StravaOAuth {
  async authenticate(): Promise<TokenSet> {
    // 1. Build authorization URL
    const authUrl = new URL('https://www.strava.com/oauth/authorize');
    authUrl.searchParams.append('client_id', Config.STRAVA_CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', 'com.100days.fit://oauth/strava');
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', 'read,activity:read');
    authUrl.searchParams.append('state', this.generateState());
    authUrl.searchParams.append('approval_prompt', 'auto');
    
    // 2. Open authentication flow
    const result = await Linking.openURL(authUrl.toString());
    
    // 3. Handle deep link callback
    const handleDeepLink = (url: string) => {
      const { code, state, error } = this.parseCallback(url);
      
      if (error) {
        throw new Error(`Authentication failed: ${error}`);
      }
      
      if (!this.verifyState(state)) {
        throw new Error('Invalid state parameter');
      }
      
      return code;
    };
    
    // 4. Exchange code for tokens
    const code = await this.waitForCallback(handleDeepLink);
    
    const tokens = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: Config.STRAVA_CLIENT_ID,
        client_secret: Config.STRAVA_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code'
      })
    }).then(res => res.json());
    
    // 5. Store tokens and athlete info
    await this.storeTokens(tokens);
    await this.storeAthleteInfo(tokens.athlete);
    
    return tokens;
  }
  
  // Strava tokens expire every 6 hours
  async ensureValidToken(): Promise<string> {
    const tokens = await this.getStoredTokens();
    
    if (Date.now() / 1000 > tokens.expires_at) {
      const refreshed = await this.refreshToken(tokens.refresh_token);
      await this.storeTokens(refreshed);
      return refreshed.access_token;
    }
    
    return tokens.access_token;
  }
}
```

### 3. Apple HealthKit (iOS Only)

#### HealthKit Authorization
```yaml
provider: Apple HealthKit
auth_type: Platform Native
grant_type: User Permission Dialog
data_access: On-device only
sync_method: Background delivery
privacy: Data never leaves device without explicit sharing
```

#### iOS HealthKit Implementation
```swift
// Swift implementation for React Native module
import HealthKit

class HealthKitManager: NSObject {
    let healthStore = HKHealthStore()
    
    // Request permissions
    func requestAuthorization(completion: @escaping (Bool, Error?) -> Void) {
        // Define data types to read
        let typesToRead: Set<HKObjectType> = [
            HKWorkoutType.workoutType(),
            HKQuantityType.quantityType(forIdentifier: .heartRate)!,
            HKQuantityType.quantityType(forIdentifier: .stepCount)!,
            HKQuantityType.quantityType(forIdentifier: .distanceWalkingRunning)!,
            HKQuantityType.quantityType(forIdentifier: .activeEnergyBurned)!,
            HKCategoryType.categoryType(forIdentifier: .sleepAnalysis)!
        ]
        
        // Request authorization
        healthStore.requestAuthorization(toShare: nil, read: typesToRead) { success, error in
            completion(success, error)
        }
    }
    
    // Enable background delivery
    func enableBackgroundDelivery() {
        let workoutType = HKWorkoutType.workoutType()
        
        healthStore.enableBackgroundDelivery(for: workoutType, frequency: .immediate) { success, error in
            if success {
                print("Background delivery enabled for workouts")
            }
        }
    }
    
    // Query historical data
    func queryHistoricalWorkouts(startDate: Date, completion: @escaping ([HKWorkout]) -> Void) {
        let predicate = HKQuery.predicateForSamples(
            withStart: startDate,
            end: Date(),
            options: .strictStartDate
        )
        
        let sortDescriptor = NSSortDescriptor(
            key: HKSampleSortIdentifierStartDate,
            ascending: false
        )
        
        let query = HKSampleQuery(
            sampleType: HKWorkoutType.workoutType(),
            predicate: predicate,
            limit: HKObjectQueryNoLimit,
            sortDescriptors: [sortDescriptor]
        ) { query, samples, error in
            let workouts = samples as? [HKWorkout] ?? []
            completion(workouts)
        }
        
        healthStore.execute(query)
    }
}
```

#### React Native Bridge
```typescript
// JavaScript interface for HealthKit
import { NativeModules, NativeEventEmitter } from 'react-native';

const { HealthKitManager } = NativeModules;
const healthKitEmitter = new NativeEventEmitter(HealthKitManager);

class AppleHealthIntegration {
  async requestPermissions(): Promise<boolean> {
    try {
      const granted = await HealthKitManager.requestAuthorization();
      
      if (granted) {
        // Enable background delivery for real-time updates
        await HealthKitManager.enableBackgroundDelivery();
        
        // Set up listener for new data
        this.subscribeToUpdates();
      }
      
      return granted;
    } catch (error) {
      console.error('HealthKit authorization failed:', error);
      return false;
    }
  }
  
  subscribeToUpdates() {
    healthKitEmitter.addListener('HealthKitDataAvailable', async (data) => {
      // Send new data to backend
      await this.syncToBackend(data);
    });
  }
  
  async importHistoricalData(years: number = 3): Promise<void> {
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - years);
    
    const data = await HealthKitManager.queryHistoricalData({
      startDate: startDate.toISOString(),
      dataTypes: ['workouts', 'heartRate', 'steps', 'sleep']
    });
    
    // Batch upload to backend
    await this.batchUpload(data);
  }
  
  private async syncToBackend(data: any) {
    // Encrypt sensitive health data
    const encrypted = await this.encryptHealthData(data);
    
    // Send to integrations service
    await fetch(`${Config.API_URL}/integrations/apple-health/sync`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${await this.getAuthToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        platform: 'apple_health',
        data: encrypted,
        device: await this.getDeviceInfo()
      })
    });
  }
}
```

## Security Implementation

### PKCE (Proof Key for Code Exchange)
```typescript
class PKCEManager {
  generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return this.base64URLEncode(array);
  }
  
  async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return this.base64URLEncode(new Uint8Array(hash));
  }
  
  private base64URLEncode(buffer: Uint8Array): string {
    const base64 = btoa(String.fromCharCode(...buffer));
    return base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }
}
```

### State Parameter Validation
```typescript
class StateValidator {
  private states = new Map<string, StateData>();
  
  generateState(): string {
    const state = crypto.randomUUID();
    
    this.states.set(state, {
      created: Date.now(),
      used: false
    });
    
    // Clean up old states
    this.cleanupExpiredStates();
    
    return state;
  }
  
  verifyState(state: string): boolean {
    const stateData = this.states.get(state);
    
    if (!stateData) {
      return false;
    }
    
    if (stateData.used) {
      console.error('State already used');
      return false;
    }
    
    // State expires after 10 minutes
    if (Date.now() - stateData.created > 600000) {
      console.error('State expired');
      return false;
    }
    
    // Mark as used
    stateData.used = true;
    this.states.delete(state);
    
    return true;
  }
  
  private cleanupExpiredStates() {
    const now = Date.now();
    
    for (const [state, data] of this.states.entries()) {
      if (now - data.created > 600000) {
        this.states.delete(state);
      }
    }
  }
}
```

### Token Storage (Mobile)
```typescript
import * as Keychain from 'react-native-keychain';
import CryptoJS from 'crypto-js';

class SecureTokenStorage {
  private readonly SERVICE_NAME = 'com.100days.fit.oauth';
  
  async storeTokens(platform: string, tokens: TokenSet): Promise<void> {
    // Generate unique encryption key per user
    const encryptionKey = await this.getOrCreateEncryptionKey();
    
    // Encrypt tokens
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(tokens),
      encryptionKey
    ).toString();
    
    // Store in iOS Keychain / Android Keystore
    await Keychain.setInternetCredentials(
      `${platform}.oauth.100days.fit`,
      platform,
      encrypted,
      {
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        authenticatePrompt: 'Authenticate to access your fitness data',
        authenticationPromptBiometric: true
      }
    );
    
    // Audit log
    await this.auditLog('token_stored', platform);
  }
  
  async getTokens(platform: string): Promise<TokenSet | null> {
    try {
      // Retrieve from secure storage
      const credentials = await Keychain.getInternetCredentials(
        `${platform}.oauth.100days.fit`
      );
      
      if (!credentials) {
        return null;
      }
      
      // Decrypt tokens
      const encryptionKey = await this.getOrCreateEncryptionKey();
      const decrypted = CryptoJS.AES.decrypt(
        credentials.password,
        encryptionKey
      ).toString(CryptoJS.enc.Utf8);
      
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Failed to retrieve tokens:', error);
      return null;
    }
  }
  
  async removeTokens(platform: string): Promise<void> {
    await Keychain.resetInternetCredentials(
      `${platform}.oauth.100days.fit`
    );
    
    await this.auditLog('token_removed', platform);
  }
  
  private async getOrCreateEncryptionKey(): Promise<string> {
    const keyAlias = 'com.100days.fit.encryption.key';
    
    // Try to get existing key
    let credentials = await Keychain.getInternetCredentials(keyAlias);
    
    if (!credentials) {
      // Generate new key
      const key = CryptoJS.lib.WordArray.random(256/8).toString();
      
      await Keychain.setInternetCredentials(
        keyAlias,
        'encryption',
        key,
        {
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY
        }
      );
      
      return key;
    }
    
    return credentials.password;
  }
}
```

## Error Handling

### OAuth Error Codes
```typescript
enum OAuthError {
  // Authorization errors
  ACCESS_DENIED = 'access_denied',
  UNAUTHORIZED_CLIENT = 'unauthorized_client',
  INVALID_REQUEST = 'invalid_request',
  INVALID_SCOPE = 'invalid_scope',
  SERVER_ERROR = 'server_error',
  
  // Token errors
  INVALID_GRANT = 'invalid_grant',
  INVALID_CLIENT = 'invalid_client',
  EXPIRED_TOKEN = 'expired_token',
  REVOKED_TOKEN = 'revoked_token',
  
  // Network errors
  NETWORK_ERROR = 'network_error',
  TIMEOUT = 'timeout',
  
  // App errors
  USER_CANCELLED = 'user_cancelled',
  BROWSER_ERROR = 'browser_error',
  STATE_MISMATCH = 'state_mismatch'
}

class OAuthErrorHandler {
  handle(error: OAuthError, platform: string): ErrorResponse {
    switch (error) {
      case OAuthError.ACCESS_DENIED:
        return {
          userMessage: `You need to grant permission to connect ${platform}`,
          action: 'RETRY_AUTH',
          recoverable: true
        };
      
      case OAuthError.EXPIRED_TOKEN:
        return {
          userMessage: 'Your session has expired',
          action: 'REFRESH_TOKEN',
          recoverable: true
        };
      
      case OAuthError.REVOKED_TOKEN:
        return {
          userMessage: `${platform} access has been revoked. Please reconnect.`,
          action: 'REAUTHORIZE',
          recoverable: true
        };
      
      case OAuthError.NETWORK_ERROR:
        return {
          userMessage: 'Network error. Please check your connection.',
          action: 'RETRY',
          recoverable: true
        };
      
      case OAuthError.USER_CANCELLED:
        return {
          userMessage: 'Authorization cancelled',
          action: 'NONE',
          recoverable: true
        };
      
      default:
        return {
          userMessage: 'An error occurred. Please try again.',
          action: 'CONTACT_SUPPORT',
          recoverable: false
        };
    }
  }
}
```

## Webhook Registration

### Garmin Webhook Setup
```typescript
class GarminWebhooks {
  async register(userId: string): Promise<void> {
    const callbackUrl = `${Config.API_URL}/webhooks/garmin/${userId}`;
    
    const response = await fetch('https://apis.garmin.com/wellness-api/rest/user/webhooks', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${await this.getAccessToken(userId)}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        callbackUrl,
        eventTypes: [
          'ACTIVITY',
          'WELLNESS',
          'SLEEP',
          'BODY_COMPOSITION'
        ]
      })
    });
    
    if (!response.ok) {
      throw new Error(`Webhook registration failed: ${response.status}`);
    }
    
    // Store webhook ID for management
    const { webhookId } = await response.json();
    await this.storeWebhookId(userId, webhookId);
  }
  
  async handleWebhook(payload: any): Promise<void> {
    // Verify webhook signature
    if (!this.verifySignature(payload)) {
      throw new Error('Invalid webhook signature');
    }
    
    // Process based on event type
    switch (payload.eventType) {
      case 'ACTIVITY':
        await this.processActivity(payload);
        break;
      case 'WELLNESS':
        await this.processWellness(payload);
        break;
      // ... other event types
    }
  }
  
  private verifySignature(payload: any): boolean {
    const signature = payload.headers['x-garmin-signature'];
    const computed = crypto
      .createHmac('sha256', Config.GARMIN_WEBHOOK_SECRET)
      .update(JSON.stringify(payload.body))
      .digest('hex');
    
    return signature === computed;
  }
}
```

### Strava Webhook Setup
```typescript
class StravaWebhooks {
  async subscribe(): Promise<void> {
    const response = await fetch('https://www.strava.com/api/v3/push_subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: Config.STRAVA_CLIENT_ID,
        client_secret: Config.STRAVA_CLIENT_SECRET,
        callback_url: `${Config.API_URL}/webhooks/strava`,
        verify_token: Config.STRAVA_VERIFY_TOKEN
      })
    });
    
    const { id } = await response.json();
    console.log(`Strava webhook subscription created: ${id}`);
  }
  
  // Webhook verification endpoint
  async verifyWebhook(req: Request): Promise<Response> {
    const { 'hub.mode': mode, 'hub.verify_token': token, 'hub.challenge': challenge } = req.query;
    
    if (mode === 'subscribe' && token === Config.STRAVA_VERIFY_TOKEN) {
      return new Response(challenge, { status: 200 });
    }
    
    return new Response('Verification failed', { status: 403 });
  }
  
  async handleEvent(event: StravaEvent): Promise<void> {
    switch (event.object_type) {
      case 'activity':
        await this.handleActivityEvent(event);
        break;
      case 'athlete':
        await this.handleAthleteEvent(event);
        break;
    }
  }
  
  private async handleActivityEvent(event: StravaEvent) {
    if (event.aspect_type === 'create') {
      // Fetch full activity details
      const activity = await this.fetchActivity(event.object_id, event.owner_id);
      
      // Store in data lake
      await this.storeActivity(activity);
      
      // Trigger notifications if needed
      await this.notifyIfPersonalRecord(activity);
    }
  }
}
```

## Rate Limiting & Retry Logic

### Platform-Specific Rate Limits
```typescript
const RATE_LIMITS = {
  garmin: {
    requests_per_minute: 60,
    requests_per_day: 86400,
    burst_limit: 10
  },
  strava: {
    requests_per_15_minutes: 100,
    requests_per_day: 1000,
    burst_limit: 5
  }
};

class RateLimiter {
  private buckets = new Map<string, TokenBucket>();
  
  async acquireToken(platform: string, userId: string): Promise<void> {
    const key = `${platform}:${userId}`;
    
    if (!this.buckets.has(key)) {
      this.buckets.set(key, new TokenBucket(RATE_LIMITS[platform]));
    }
    
    const bucket = this.buckets.get(key)!;
    
    if (!bucket.tryConsume(1)) {
      const waitTime = bucket.timeUntilNextToken();
      
      // If wait time is reasonable, wait
      if (waitTime < 60000) {
        await this.sleep(waitTime);
        return this.acquireToken(platform, userId);
      }
      
      throw new Error(`Rate limit exceeded for ${platform}. Try again in ${waitTime}ms`);
    }
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### Exponential Backoff
```typescript
class ExponentialBackoff {
  private readonly maxRetries = 5;
  private readonly baseDelay = 1000;
  private readonly maxDelay = 32000;
  
  async execute<T>(
    fn: () => Promise<T>,
    context: string
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on non-recoverable errors
        if (this.isNonRecoverable(error)) {
          throw error;
        }
        
        // Calculate delay with jitter
        const delay = Math.min(
          this.baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
          this.maxDelay
        );
        
        console.log(`Retry ${attempt + 1}/${this.maxRetries} for ${context} after ${delay}ms`);
        
        await this.sleep(delay);
      }
    }
    
    throw new Error(`Max retries exceeded for ${context}: ${lastError!.message}`);
  }
  
  private isNonRecoverable(error: any): boolean {
    // Don't retry on client errors (4xx)
    if (error.status >= 400 && error.status < 500) {
      return error.status !== 429; // Except rate limiting
    }
    
    return false;
  }
}
```

## Testing OAuth Flows

### Mock OAuth Server
```typescript
// Development/testing OAuth mock server
class MockOAuthServer {
  private tokens = new Map<string, TokenSet>();
  
  async handleAuthorize(req: Request): Promise<Response> {
    const { client_id, redirect_uri, state } = req.query;
    
    // Simulate user approval
    const code = 'mock_auth_code_' + crypto.randomUUID();
    
    // Store code for exchange
    this.storeAuthCode(code, client_id);
    
    // Redirect back to app
    const callbackUrl = new URL(redirect_uri);
    callbackUrl.searchParams.append('code', code);
    callbackUrl.searchParams.append('state', state);
    
    return Response.redirect(callbackUrl.toString());
  }
  
  async handleToken(req: Request): Promise<Response> {
    const { code, client_id, client_secret } = await req.json();
    
    // Validate code
    if (!this.validateAuthCode(code, client_id)) {
      return new Response(JSON.stringify({
        error: 'invalid_grant'
      }), { status: 400 });
    }
    
    // Generate tokens
    const tokens = {
      access_token: 'mock_access_' + crypto.randomUUID(),
      refresh_token: 'mock_refresh_' + crypto.randomUUID(),
      expires_in: 3600,
      token_type: 'Bearer'
    };
    
    this.tokens.set(tokens.access_token, tokens);
    
    return new Response(JSON.stringify(tokens), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
```