# Decision: Wearable Data Aggregation Strategy

## Status
**Approved**

## Date
2025-01-24

## Context
100days.fit focuses on habit transformation through social accountability and gamification. Rather than building another workout tracking app, we aggregate existing fitness data from platforms users already use (Garmin, Apple Health, Strava) to create a comprehensive view of their fitness journey.

## Decision
**Implement a dedicated integrations service that aggregates wearable and fitness platform data through direct API integrations, storing raw data for future ML/AI capabilities while maintaining HIPAA/SOC2/ISO27001/GDPR compliance readiness.**

## Architecture Overview

### Data Flow
```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Wearables │────▶│ Integrations │────▶│  Raw Data   │
│   Platforms │     │   Service    │     │    Lake     │
└─────────────┘     └──────────────┘     └─────────────┘
                            │                    │
                            ▼                    ▼
                    ┌──────────────┐     ┌─────────────┐
                    │    Hasura    │────▶│ Aggregated  │
                    │   GraphQL    │     │    Views    │
                    └──────────────┘     └─────────────┘
```

### Integration Strategy

#### MVP Platforms (Phase 1)
1. **Apple Health** (iOS only)
   - HealthKit framework integration
   - Background delivery for real-time updates
   - 3-year historical data import
   - Data types: workouts, heart rate, steps, sleep, nutrition

2. **Garmin Connect**
   - OAuth2 authentication
   - Webhook push notifications
   - Activity, wellness, and sleep data
   - FIT file processing for detailed metrics

3. **Strava**
   - OAuth2 authentication
   - Webhook events for new activities
   - Social features integration
   - Segment and kudos data

#### Future Platforms (Phase 2)
- Fitbit (OAuth2, webhooks)
- Whoop (API pending)
- Oura Ring (OAuth2)
- Peloton (unofficial API)
- MyFitnessPal (nutrition data)

### Data Storage Strategy

#### Raw Data Lake
- **Purpose**: Store unprocessed data from all sources
- **Format**: JSON documents with source metadata
- **Retention**: Indefinite (compressed after 1 year)
- **Schema**: Flexible, source-specific structure
- **Benefits**: 
  - Future ML/AI training data
  - Retroactive feature development
  - Audit trail for compliance
  - No data loss from transformations

#### Aggregated Views
- **Purpose**: Normalized data for application use
- **Updates**: Real-time via triggers
- **Schema**: Standardized across all sources
- **Optimization**: Indexed for query performance

### Synchronization Strategies

#### Push (Webhooks) - Preferred
- **Garmin**: Activity uploads, wellness updates
- **Strava**: Activity creation, updates, deletions
- **Benefits**: Real-time, battery efficient, scalable

#### Pull (Polling) - Fallback
- **Apple Health**: On-demand from mobile app
- **Missing webhook data**: Scheduled reconciliation
- **Historical imports**: Batch processing

#### Hybrid Approach
- Webhooks for real-time events
- Daily reconciliation for missed events
- On-demand sync from mobile app
- Background sync every 4-6 hours

### Security & Compliance

#### Token Management
- AES-256-GCM encryption at rest
- Separate encryption keys per user
- Token rotation on refresh
- Audit logging for all access

#### Data Privacy
- User consent for each data type
- Granular permission controls
- Data deletion on request (GDPR)
- Encrypted data exports

#### Compliance Readiness
- HIPAA: Encryption, access controls, audit logs
- SOC2: Security policies, monitoring
- ISO27001: Risk management framework
- GDPR: Privacy by design, data portability

### Performance Considerations

#### Mobile Battery Optimization
- Background fetch scheduling
- Batch API requests
- Incremental sync (delta updates)
- Configurable sync frequency

#### API Rate Limits
- Garmin: 60 requests/minute
- Strava: 100 requests/15 minutes
- Rate limiting with exponential backoff
- Request queuing and prioritization

#### Data Processing
- Async webhook processing
- Queue-based architecture
- Horizontal scaling capability
- Circuit breakers for resilience

## Implementation Phases

### Phase 1: Foundation (Weeks 1-2)
- Fastify server setup
- Token vault implementation
- Database schema design
- Security middleware

### Phase 2: Apple Health (Weeks 3-4)
- iOS SDK integration
- HealthKit permissions
- Background delivery
- Historical import

### Phase 3: Garmin (Weeks 5-6)
- OAuth2 flow
- Webhook receivers
- FIT file parsing
- Activity sync

### Phase 4: Strava (Week 7)
- OAuth2 implementation
- Webhook subscription
- Activity import
- Social features

### Phase 5: Production Ready (Week 8)
- Monitoring dashboard
- Compliance documentation
- Security audit
- Performance testing

## Cost Analysis

### Infrastructure Costs (Monthly)
- **Compute**: $50 (Fastify on Cloud Run)
- **Database**: $25 (NeonDB for raw data)
- **Storage**: $20 (Cloud Storage for FIT files)
- **Monitoring**: $0 (free tier)
- **Total**: ~$95/month for 10K users

### Scaling Considerations
- Costs scale linearly with users
- Webhook model reduces API costs
- Compression reduces storage costs
- Caching minimizes database queries

## Risks & Mitigations

### Risk: API Changes
- **Mitigation**: Version-specific adapters, monitoring for deprecations

### Risk: Rate Limiting
- **Mitigation**: Queue management, exponential backoff, caching

### Risk: Data Privacy Violations
- **Mitigation**: Encryption, audit logs, consent management

### Risk: Service Downtime
- **Mitigation**: Circuit breakers, fallback to polling, retry logic

## Success Metrics
- 95% webhook delivery success rate
- <5 minute sync delay for push platforms
- <1 hour sync delay for pull platforms
- 99.9% uptime for integration service
- Zero data breaches or compliance violations

## Review Triggers
- Platform API major version changes
- New compliance requirements
- User base exceeds 50K MAU
- Storage costs exceed $500/month

## Decision Makers
- CTO: Approved (focus on compliance readiness)
- Lead Developer: Approved (raw data lake approach)
- Product Manager: Approved (MVP platform selection)