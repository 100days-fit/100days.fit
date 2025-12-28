# Decision: Database Strategy with NeonDB

## Status
**Approved**

## Date
2025-01-24

## Context
As a solo developer building 100days.fit, operational overhead is the enemy of progress. Traditional managed databases (RDS, Cloud SQL) require constant monitoring, capacity planning, and cost management. We need a database solution that provides enterprise-grade features with zero operational overhead and generous free tier to support growth to 50K MAU without infrastructure costs.

## Decision
**Adopt NeonDB as the primary database platform, leveraging its serverless PostgreSQL architecture with scale-to-zero capability, branching features for development workflow, and generous free tier.**

## Why NeonDB?

### Zero Operational Overhead
- **Scale-to-zero**: Database automatically sleeps after 5 minutes of inactivity
- **Automatic scaling**: Scales compute from 0.25 to 4 vCPU based on load
- **No capacity planning**: Storage grows automatically (up to 3GB free)
- **Built-in connection pooling**: PgBouncer built-in, no separate setup
- **Automatic backups**: Point-in-time recovery for 7 days (free tier)

### Generous Free Tier
```yaml
free_tier_limits:
  storage: 3 GB (across all branches)
  compute: 300 compute hours/month (0.25 vCPU)
  branches: 10 branches
  databases: Unlimited databases per branch
  projects: 1 project
  data_transfer: 5 GB/month
  backup_retention: 7 days
  point_in_time_recovery: Yes
  connection_pooling: Built-in
```

### Cost Projections
```
Users     | Storage | Compute Hours | Monthly Cost
----------|---------|---------------|-------------
0-10K     | 1 GB    | 300 (free)    | $0
10K-25K   | 2 GB    | 300 (free)    | $0  
25K-50K   | 3 GB    | 300 (free)    | $0
50K-100K  | 5 GB    | 750           | $20
100K+     | 10 GB   | 1500          | $50
```

### Developer Experience Features
1. **Database Branching**: Create isolated database copies for features
2. **Instant rollback**: Point-in-time recovery without downtime
3. **SQL Editor**: Built-in web-based query interface
4. **Connection string**: One connection string, works everywhere
5. **PostgreSQL 16**: Latest features and performance improvements

## Integration Architecture

### With Hasura GraphQL
```yaml
connection:
  type: PostgreSQL 16
  connection_string: postgresql://user:pass@ep-xxx.region.neon.tech/dbname
  ssl_mode: require
  pooling_mode: transaction (built-in PgBouncer)
  
hasura_benefits:
  - Direct PostgreSQL compatibility
  - Connection pooling included
  - SSL enforced by default
  - Low latency (choose region close to Hasura)
```

### With Integrations Service
```yaml
raw_data_storage:
  - JSONB columns for flexible schema
  - Automatic compression for large JSON
  - Efficient indexing with GIN indexes
  - Partitioning support for time-series data
  
performance_features:
  - Parallel query execution
  - Just-in-time compilation
  - Automatic query optimization
  - Smart caching layer
```

## Database Schema Strategy

### Core Application Data
```sql
-- Users and authentication (references Firebase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid VARCHAR(128) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Journey tracking
CREATE TABLE journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  started_at DATE NOT NULL,
  target_end_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  daily_entries JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Efficient indexing
CREATE INDEX idx_journeys_user ON journeys(user_id);
CREATE INDEX idx_journeys_status ON journeys(status) WHERE status = 'active';
```

### Raw Fitness Data (from integrations)
```sql
-- Partitioned table for scalability
CREATE TABLE raw_fitness_data (
  id UUID DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  platform VARCHAR(50) NOT NULL,
  data_type VARCHAR(100) NOT NULL,
  raw_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE raw_fitness_data_2025_01 PARTITION OF raw_fitness_data
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- GIN index for JSONB queries
CREATE INDEX idx_raw_data_jsonb ON raw_fitness_data USING GIN (raw_data);
```

## Migration Strategy

### From Current State
Since we're using Hasura with PostgreSQL already, migration is straightforward:
1. Export current schema and data
2. Create NeonDB project in same region as Hasura
3. Import schema and data
4. Update Hasura connection string
5. Test thoroughly
6. Switch DNS/connection strings

### To Future Providers (if needed)
```yaml
export_strategy:
  - Standard pg_dump works perfectly
  - Logical replication for zero-downtime migration
  - Compatible with any PostgreSQL 14+ provider
  
potential_targets:
  - Supabase (if we need built-in auth)
  - Railway PostgreSQL (if we need more control)
  - Self-hosted (if we reach massive scale)
  - TimescaleDB Cloud (if time-series becomes primary)
```

## Development Workflow

### Branch-Based Development
```bash
# Create feature branch
neon branch create feature/user-profiles

# Get connection string for branch
neon connection-string feature/user-profiles

# Develop and test against branch
hasura migrate apply --database-url $BRANCH_URL

# Merge to main when ready
neon branch delete feature/user-profiles
```

### Local Development
```yaml
options:
  1_neon_branch:
    - Create dev branch in NeonDB
    - Zero cost if under 300 compute hours
    - Real PostgreSQL, same as production
    
  2_local_postgres:
    - Docker PostgreSQL for offline work
    - Periodic sync from NeonDB
    - Good for airplane mode development
```

## Performance Optimization

### Built-in Optimizations
- Query result caching at edge
- Connection pooling with PgBouncer
- Automatic vacuum and analyze
- Smart storage tiering

### Application-Level Optimizations
```sql
-- Use JSONB aggregation for efficient queries
CREATE MATERIALIZED VIEW user_fitness_summary AS
SELECT 
  user_id,
  DATE(created_at) as date,
  jsonb_agg(raw_data) as daily_data
FROM raw_fitness_data
GROUP BY user_id, DATE(created_at);

-- Refresh periodically
REFRESH MATERIALIZED VIEW CONCURRENTLY user_fitness_summary;
```

## Monitoring & Observability

### Built-in Monitoring
- Query performance insights in dashboard
- Slow query log
- Database size and growth trends
- Connection pool metrics
- Compute usage tracking

### Integration with Application Monitoring
```typescript
// Track database metrics in application
const metrics = {
  query_duration: histogram('db_query_duration_seconds'),
  connection_pool_size: gauge('db_connection_pool_size'),
  slow_queries: counter('db_slow_queries_total')
};
```

## Disaster Recovery

### Automatic Protection
- Point-in-time recovery (7 days free tier, 30 days paid)
- Automatic backups every 24 hours
- Cross-region backup storage
- One-click restore to any point

### Manual Backup Strategy
```bash
# Additional backup to S3 (for compliance)
pg_dump $NEON_DATABASE_URL | gzip > backup_$(date +%Y%m%d).sql.gz
aws s3 cp backup_*.sql.gz s3://100days-backups/
```

## Compliance Considerations

### Data Residency
- Choose region based on user location (GDPR)
- US-East, EU-Central available
- Data doesn't leave selected region

### Encryption
- Encryption at rest (AES-256)
- Encryption in transit (TLS 1.3)
- Connection requires SSL

### Access Control
- IP allowlisting available
- Database roles and permissions
- Audit logging (paid tier)

## Risks & Mitigations

### Risk: Vendor Lock-in
**Mitigation**: NeonDB is PostgreSQL-compatible, easy to migrate

### Risk: Free Tier Limits
**Mitigation**: Clear upgrade path, predictable pricing

### Risk: Cold Starts
**Mitigation**: 1-2 second wake time acceptable for our use case

### Risk: Regional Outage
**Mitigation**: Database backups in S3, can restore elsewhere

## Success Metrics
- Zero database-related operational tasks per month
- Database costs $0 until 50K MAU
- <2 second cold start latency
- 99.9% uptime (NeonDB SLA)
- <100ms query latency for hot queries

## Comparison with Alternatives

| Feature | NeonDB | Supabase | PlanetScale | Railway |
|---------|---------|----------|-------------|---------|
| Free Storage | 3 GB | 0.5 GB | 5 GB | 1 GB |
| Scale-to-zero | ✅ | ❌ | ✅ | ❌ |
| Branching | ✅ | ✅ | ✅ | ❌ |
| PostgreSQL | ✅ | ✅ | ❌ (MySQL) | ✅ |
| Connection Pooling | Built-in | Separate | Built-in | Manual |
| Point-in-time Recovery | ✅ | ✅ | ✅ | ❌ |
| Monthly Cost (10K users) | $0 | $25 | $29 | $5 |

## Review Triggers
- Exceeding 3 GB storage
- Need for read replicas
- Requirement for advanced features (logical replication)
- Consistent >300 compute hours/month usage

## Approval
- CTO: Approved (zero operational overhead is critical)
- Lead Developer: Approved (PostgreSQL compatibility maintained)
- DevOps: Approved (no infrastructure to manage)