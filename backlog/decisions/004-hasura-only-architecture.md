# Decision: Hasura-Only GraphQL Architecture

## Status
**Approved**

## Date
2024-08-21

## Context
The initial architecture included both NestJS backend service and Hasura GraphQL engine running in parallel, creating unnecessary complexity and resource overhead. After analysis, we identified that Hasura can handle most backend requirements directly, making NestJS redundant for our use case.

## Decision
**Remove NestJS and use Hasura GraphQL Engine as the sole API layer, with serverless functions for complex business logic when needed.**

## Rationale

### Benefits of Hasura-Only Architecture
1. **Reduced Complexity**: Single API layer instead of two
2. **Cost Savings**: ~50% reduction in compute resources
3. **Faster Development**: Instant CRUD APIs, real-time subscriptions
4. **Built-in Features**: Authorization, rate limiting, caching
5. **Better Performance**: Direct database queries without ORM overhead
6. **Real-time by Default**: WebSocket subscriptions out of the box

### What Hasura Provides Natively
- ✅ GraphQL API generation from database schema
- ✅ Role-based access control (RBAC)
- ✅ JWT authentication integration
- ✅ Real-time subscriptions
- ✅ Database migrations and metadata management
- ✅ Query optimization and caching
- ✅ Webhook triggers for events
- ✅ Scheduled triggers (cron jobs)
- ✅ Actions for custom business logic

### Business Logic Handling
For complex logic that can't be handled by Hasura alone:

1. **Hasura Actions**: Call serverless functions for:
   - Identity score calculation
   - Partner matching algorithm
   - Complex aggregations
   - Third-party integrations

2. **Database Functions**: PostgreSQL functions for:
   - Data validation
   - Computed fields
   - Triggers for automatic updates

3. **Event Triggers**: Webhooks for:
   - Sending notifications
   - Analytics events
   - Data synchronization

## Implementation Strategy

### Phase 1: Current State Analysis
- NestJS handles authentication, user management
- Hasura provides GraphQL API
- Both services running in parallel

### Phase 2: Migration Plan
1. Continue using Firebase Authentication with Hasura JWT integration
2. Implement user management via Hasura mutations
3. Create Hasura Actions for complex logic
4. Set up proper permissions and roles
5. Remove NestJS dependencies

### Phase 3: New Architecture
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Mobile App  │────▶│    Hasura    │────▶│  PostgreSQL  │
│    (Expo)    │     │   GraphQL    │     │   Database   │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │  Serverless  │
                    │   Functions  │
                    │  (Optional)  │
                    └──────────────┘
```

## Migration Path

### Keep
- Hasura GraphQL Engine
- PostgreSQL database
- Database migrations and seeds
- GraphQL schema and metadata

### Remove
- NestJS application code
- Prisma ORM
- Express server
- NestJS-specific dependencies

### Add
- Hasura Actions for complex logic
- PostgreSQL functions for computed fields
- Firebase Authentication integration (existing)
- Serverless functions (AWS Lambda/Vercel)

## Cost Impact

### Before (NestJS + Hasura)
- 2 containers running continuously
- ~$120/month for compute (ECS/Cloud Run)
- Complex deployment pipeline
- Higher maintenance overhead

### After (Hasura Only)
- 1 container running
- ~$60/month for compute
- Serverless functions on-demand (~$10/month)
- Simplified deployment
- **Total Savings: ~40-50% reduction**

## Risks and Mitigations

### Risk 1: Complex Business Logic
- **Mitigation**: Use Hasura Actions with serverless functions

### Risk 2: Learning Curve
- **Mitigation**: Hasura has excellent documentation and community

### Risk 3: Vendor Lock-in
- **Mitigation**: Hasura is open-source, can self-host

### Risk 4: Limited Customization
- **Mitigation**: PostgreSQL functions and triggers provide flexibility

## Affected Components

### Tasks to Update
- Remove Task 1.2 (NestJS backend development)
- Update Task 3.1 (Onboarding via GraphQL mutations)
- Update Task 4.1 (Partner matching as Hasura Action)
- Update Task 5.1 (Badge system via database triggers)

### Documentation to Update
- API documentation (REST → GraphQL)
- Authentication flow documentation
- Development setup guide
- Deployment procedures

## Success Criteria
- All existing functionality works via GraphQL
- Performance improvement (< 100ms p95 latency)
- Simplified deployment process
- Reduced infrastructure costs
- Maintained security standards

## Review Date
After first 1000 users to validate architecture decision

## Approval
- CTO: Approved
- Lead Developer: Approved
- DevOps Lead: Approved