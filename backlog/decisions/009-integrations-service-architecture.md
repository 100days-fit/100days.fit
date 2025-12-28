# Decision: Integrations Service Architecture

## Status
**Approved**

## Date
2025-01-24

## Context
Following Decision 008 (Wearable Data Aggregation), we need a robust, secure, and scalable architecture for the integrations service that handles OAuth flows, token management, data synchronization, and compliance requirements.

## Decision
**Build a Fastify-based microservice as a separate git submodule with enterprise-grade security, comprehensive monitoring, and compliance-ready architecture from day one.**

## Technical Architecture

### Service Structure
```
integrations/                         # Git submodule
├── src/
│   ├── server.ts                    # Fastify server entry
│   ├── config/
│   │   ├── security.ts              # Encryption, vault config
│   │   ├── platforms.ts             # Platform-specific configs
│   │   └── database.ts              # NeonDB connection
│   ├── services/
│   │   ├── token-vault/             # Secure token storage
│   │   ├── data-lake/               # Raw data storage
│   │   ├── sync-engine/             # Synchronization logic
│   │   └── compliance/              # Audit, GDPR, etc.
│   ├── platforms/
│   │   ├── apple-health/            # Apple HealthKit
│   │   ├── garmin/                  # Garmin Connect
│   │   └── strava/                  # Strava API
│   ├── webhooks/
│   │   ├── receivers/               # Webhook endpoints
│   │   └── processors/              # Async processing
│   └── monitoring/
│       ├── metrics.ts               # Prometheus metrics
│       └── health.ts                # Health checks
├── database/
│   ├── migrations/                  # Database migrations
│   └── schemas/                     # TypeScript schemas
├── docs/
│   ├── api/                         # API documentation
│   ├── compliance/                  # HIPAA, SOC2, etc.
│   └── platform-guides/             # Integration guides
└── tests/
    ├── unit/                        # Unit tests
    ├── integration/                 # Integration tests
    └── security/                    # Security tests
```

### Core Components

#### 1. Token Vault
```typescript
interface TokenVault {
  // Encryption
  algorithm: 'AES-256-GCM'
  keyDerivation: 'PBKDF2'
  iterations: 100000
  
  // Storage
  store: PostgreSQL with encryption at rest
  backup: Automated encrypted backups
  
  // Operations
  encrypt(token: string, userId: string): EncryptedToken
  decrypt(encryptedToken: EncryptedToken, userId: string): string
  rotate(userId: string, platform: string): void
  revoke(userId: string, platform: string): void
  
  // Audit
  logAccess(userId: string, operation: string): void
  getAuditTrail(userId: string): AuditLog[]
}
```

#### 2. Data Lake Schema
```sql
-- Raw data storage
CREATE TABLE raw_fitness_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  platform VARCHAR(50) NOT NULL,
  data_type VARCHAR(100) NOT NULL,
  raw_data JSONB NOT NULL,
  metadata JSONB NOT NULL,
  received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  
  -- Partitioning
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Indexes for performance
CREATE INDEX idx_raw_fitness_user_platform ON raw_fitness_data(user_id, platform, created_at DESC);
CREATE INDEX idx_raw_fitness_processing ON raw_fitness_data(processed_at) WHERE processed_at IS NULL;

-- Aggregated views
CREATE MATERIALIZED VIEW user_fitness_summary AS
SELECT 
  user_id,
  DATE(created_at) as date,
  platform,
  COUNT(*) as data_points,
  jsonb_agg(DISTINCT data_type) as data_types
FROM raw_fitness_data
GROUP BY user_id, DATE(created_at), platform;
```

#### 3. OAuth Flow Manager
```typescript
interface OAuthManager {
  // Platform configurations
  platforms: {
    garmin: {
      clientId: string
      clientSecret: string
      authUrl: 'https://connect.garmin.com/oauthConfirm'
      tokenUrl: 'https://connectapi.garmin.com/oauth-service/oauth/access_token'
      scopes: ['activity_read', 'wellness_read']
    }
    strava: {
      clientId: string
      clientSecret: string
      authUrl: 'https://www.strava.com/oauth/authorize'
      tokenUrl: 'https://www.strava.com/oauth/token'
      scopes: ['read', 'activity:read_all']
    }
  }
  
  // Flow management
  initiateAuth(platform: string, userId: string): AuthUrl
  handleCallback(code: string, state: string): TokenSet
  refreshToken(userId: string, platform: string): TokenSet
  validateToken(token: string, platform: string): boolean
}
```

#### 4. Sync Engine
```typescript
interface SyncEngine {
  // Sync strategies
  strategies: {
    push: WebhookReceiver     // Real-time updates
    pull: PollingService      // Scheduled fetching
    hybrid: SmartSync         // Intelligent combination
  }
  
  // Operations
  syncUser(userId: string, platform: string): SyncResult
  syncHistorical(userId: string, platform: string, years: number): void
  reconcile(userId: string): ReconciliationReport
  
  // Optimization
  batchSync(userIds: string[]): BatchResult
  incrementalSync(userId: string, lastSyncTime: Date): void
  
  // Error handling
  retryPolicy: ExponentialBackoff
  circuitBreaker: CircuitBreakerConfig
  deadLetterQueue: FailedSyncQueue
}
```

### Security Architecture

#### Authentication & Authorization
```yaml
# API Security
authentication:
  - JWT tokens from Hasura
  - API keys for webhook endpoints
  - mTLS for service-to-service

authorization:
  - User-scoped data access
  - Platform-specific permissions
  - Admin override capabilities

rate_limiting:
  - Per-user limits
  - Per-platform limits
  - Webhook endpoint protection
```

#### Encryption Strategy
```yaml
# Data Protection
at_rest:
  - Database: AES-256 encryption
  - File storage: Encrypted buckets
  - Backups: Encrypted archives

in_transit:
  - TLS 1.3 minimum
  - Certificate pinning for mobile
  - Encrypted webhook payloads

key_management:
  - AWS KMS or HashiCorp Vault
  - Automatic key rotation
  - Separate keys per environment
```

### Monitoring & Observability

#### Metrics Collection
```typescript
// Prometheus metrics
const metrics = {
  // Business metrics
  sync_operations_total: Counter
  sync_duration_seconds: Histogram
  active_integrations: Gauge
  
  // Technical metrics
  api_request_duration: Histogram
  webhook_processing_time: Histogram
  token_refresh_failures: Counter
  
  // Compliance metrics
  data_access_audit: Counter
  encryption_operations: Counter
  gdpr_requests: Counter
}
```

#### Health Checks
```typescript
// Kubernetes-style health endpoints
GET /health/live    // Is service running?
GET /health/ready   // Can service handle requests?
GET /health/startup // Initial startup checks

// Detailed health status
{
  "status": "healthy",
  "version": "1.0.0",
  "checks": {
    "database": "ok",
    "token_vault": "ok",
    "garmin_api": "ok",
    "strava_api": "degraded",
    "queue": "ok"
  },
  "metrics": {
    "uptime": 864000,
    "requests_per_minute": 450,
    "error_rate": 0.001
  }
}
```

### Compliance Implementation

#### HIPAA Compliance
```yaml
technical_safeguards:
  - Access controls with audit logs
  - Encryption for PHI data
  - Automatic logoff after 15 minutes
  - Unique user identification

administrative_safeguards:
  - Risk assessments documented
  - Workforce training logs
  - Incident response procedures
  - Business associate agreements

physical_safeguards:
  - Data center compliance (cloud provider)
  - Workstation security policies
  - Device and media controls
```

#### GDPR Compliance
```typescript
interface GDPRCompliance {
  // User rights
  exportUserData(userId: string): DataExport
  deleteUserData(userId: string): DeletionReport
  updateConsent(userId: string, consents: Consent[]): void
  
  // Data processing
  logProcessingActivity(activity: ProcessingActivity): void
  getProcessingRecords(userId: string): ProcessingRecord[]
  
  // Breach notification
  reportBreach(breach: DataBreach): void
  notifyUsers(userIds: string[], breach: DataBreach): void
}
```

### Deployment Strategy

#### Infrastructure
```yaml
# Kubernetes deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: integrations-service
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    spec:
      containers:
      - name: integrations
        image: gcr.io/100days-fit/integrations:latest
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        env:
        - name: NODE_ENV
          value: "production"
        livenessProbe:
          httpGet:
            path: /health/live
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

#### CI/CD Pipeline
```yaml
# GitHub Actions workflow
name: Deploy Integrations Service
on:
  push:
    branches: [main]
    paths:
      - 'integrations/**'

jobs:
  test:
    - Unit tests with coverage
    - Integration tests
    - Security scanning (Snyk)
    - SAST analysis
    
  build:
    - Docker image build
    - Vulnerability scanning
    - Push to registry
    
  deploy:
    - Blue-green deployment
    - Health check validation
    - Rollback on failure
    - Notify team
```

### Performance Optimization

#### Caching Strategy
```yaml
layers:
  - CDN: Static assets, documentation
  - Redis: Session data, temporary tokens
  - Application: In-memory caches
  - Database: Query result caching

ttl_settings:
  - User tokens: 1 hour
  - Platform configs: 24 hours
  - Webhook secrets: Until rotated
  - API responses: 5 minutes
```

#### Queue Management
```typescript
// Bull queue for async processing
const queues = {
  webhookProcessing: {
    concurrency: 10,
    rateLimit: { max: 100, duration: 60000 },
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 }
    }
  },
  
  historicalImport: {
    concurrency: 2,
    rateLimit: { max: 10, duration: 60000 },
    defaultJobOptions: {
      attempts: 5,
      timeout: 600000 // 10 minutes
    }
  },
  
  dataReconciliation: {
    concurrency: 1,
    cronPattern: '0 2 * * *', // 2 AM daily
    defaultJobOptions: {
      preventOverlap: true
    }
  }
}
```

## Cost Projections

### Monthly Costs by User Tier
```
0-1K users:    $50 (free tier maximization)
1K-10K users:  $95 (minimal infrastructure)
10K-50K users: $450 (auto-scaling enabled)
50K+ users:    $2000+ (full redundancy)
```

### Cost Optimization Strategies
- Serverless for sporadic workloads
- Reserved instances for predictable load
- Data lifecycle policies (compress, archive)
- Efficient caching to reduce API calls

## Migration Path

### From Terra API (if initially used)
1. Parallel run both systems
2. Gradually migrate platform by platform
3. Validate data consistency
4. Sunset Terra integration
5. Cost savings: ~$500/month at 10K users

### To Managed Services (at scale)
1. MongoDB Atlas for raw data (>100K users)
2. Dedicated Kubernetes cluster (>50K users)
3. Managed Redis cluster (>25K users)
4. DataDog for monitoring (>10K users)

## Success Criteria
- 99.9% uptime SLA
- <100ms p50 API latency
- <1 minute webhook processing time
- Zero security incidents
- 100% GDPR request compliance
- <$10 per 1000 users operational cost

## Review Schedule
- Weekly: Security patches and updates
- Monthly: Performance and cost review
- Quarterly: Architecture review
- Annually: Compliance audit

## Approval
- CTO: Approved (security-first approach)
- DevOps Lead: Approved (monitoring strategy)
- Compliance Officer: Approved (HIPAA/GDPR readiness)