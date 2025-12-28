# Decision: Infrastructure Provider Selection for Solo Developer

## Status
**Approved**

## Date
2025-01-24

## Context
The original infrastructure decision (001) selected AWS for its comprehensive services and scalability. However, as a solo developer, the operational overhead of managing AWS infrastructure (VPCs, security groups, IAM policies, ECS clusters) consumes valuable development time. We need infrastructure that "just works" with zero configuration, generous free tiers, and scale-to-zero capabilities.

## Decision
**Adopt a best-of-breed serverless infrastructure stack optimized for solo developers: Vercel for frontend, Cloudflare for CDN/Workers, NeonDB for database, and Railway for Hasura hosting. Total cost: $0-50/month up to 50K MAU.**

## Infrastructure Stack

### Frontend Hosting: Vercel
```yaml
service: Next.js (website) and static hosting
why_vercel:
  - Zero-config deployment from GitHub
  - Automatic preview deployments for PRs
  - Global edge network (faster than CloudFront)
  - Built-in analytics and Web Vitals
  - Serverless functions for API routes

free_tier:
  - 100 GB bandwidth/month
  - Unlimited sites and deployments
  - Automatic HTTPS
  - Preview deployments
  - Edge functions (middleware)
  
pricing_beyond_free:
  - $20/month Pro (1 TB bandwidth)
  - Pay-as-you-go for overages
  
estimated_cost:
  - 0-50K MAU: $0
  - 50K-100K MAU: $20/month
```

### Mobile App Hosting: Expo + EAS
```yaml
service: React Native app distribution
why_expo:
  - Over-the-air updates without app store approval
  - Managed builds for iOS/Android
  - Push notifications infrastructure
  - Crash reporting and analytics

free_tier:
  - 10,000 monthly active users
  - Unlimited OTA updates
  - Basic analytics
  
pricing_beyond_free:
  - $99/month for 50K MAU
  - Includes priority builds
  
estimated_cost:
  - 0-10K MAU: $0
  - 10K-50K MAU: $99/month
```

### API/Backend: Railway
```yaml
service: Hasura GraphQL Engine hosting
why_railway:
  - One-click Hasura deployment
  - Automatic SSL and domains
  - Built-in metrics and logging
  - GitHub integration
  - Scale-to-zero available

free_tier:
  - $5 credit/month
  - 500 hours execution time
  
pricing:
  - $0.01/hour for Hasura (~$7/month 24/7)
  - Can configure scale-to-zero for development
  
estimated_cost:
  - Development: $0 (scale-to-zero)
  - Production: $7-15/month
```

### Database: NeonDB
```yaml
service: Serverless PostgreSQL
why_neondb:
  - Covered in Decision 006
  - Scale-to-zero
  - Database branching
  - 3 GB free storage

estimated_cost:
  - 0-50K MAU: $0
  - 50K-100K MAU: $20/month
```

### CDN & Edge Computing: Cloudflare
```yaml
service: CDN, Workers, R2 storage
why_cloudflare:
  - Unlimited bandwidth on free tier
  - DDoS protection included
  - Workers for edge computing
  - R2 storage (S3 compatible, no egress fees)
  - D1 database for edge data

free_tier:
  - Unlimited bandwidth CDN
  - 100,000 Workers requests/day
  - 10 GB R2 storage
  - 10 million R2 reads/month
  
use_cases:
  - Static asset caching
  - Image optimization (Polish)
  - API rate limiting
  - Webhook processing
  - File uploads (R2)
  
estimated_cost:
  - 0-100K MAU: $0
  - 100K+ MAU: $5/month (Workers Paid)
```

### Authentication: Firebase Auth
```yaml
service: Managed authentication
why_firebase:
  - Covered in Decision 005
  - 10,000 MAU free
  - Social login providers included
  - Phone auth (10K SMS/month free)
  
estimated_cost:
  - 0-10K MAU: $0
  - 10K-50K MAU: ~$50/month
```

### Serverless Functions: Cloudflare Workers
```yaml
service: Integrations service and webhooks
why_workers:
  - 0ms cold starts
  - Global deployment
  - Cheaper than AWS Lambda
  - Better DX than Lambda
  
implementation:
  - OAuth flows
  - Webhook receivers
  - Data processing
  - Scheduled jobs (Cron triggers)
  
free_tier:
  - 100,000 requests/day
  - 10ms CPU time per request
  
estimated_cost:
  - 0-100K MAU: $0
  - 100K+ MAU: $5/month
```

## Cost Comparison

### Traditional Cloud (AWS/GCP)
```
Service          | Monthly Cost
-----------------|-------------
EC2/GCE          | $50-100
RDS/Cloud SQL    | $50-100
Load Balancer    | $25
NAT Gateway      | $45
CloudFront/CDN   | $20
Lambda           | $20
Total            | $210-310/month
```

### Solo Developer Stack
```
Service          | 0-10K MAU | 10-50K MAU | 50-100K MAU
-----------------|-----------|------------|-------------
Vercel           | $0        | $0         | $20
Expo/EAS         | $0        | $99        | $99
Railway          | $7        | $7         | $15
NeonDB           | $0        | $0         | $20
Cloudflare       | $0        | $0         | $5
Firebase Auth    | $0        | $50        | $100
Total            | $7/month  | $156/month | $259/month
```

## Operational Overhead Comparison

### Traditional Cloud Tasks (Hours/Month)
- VPC and networking setup: 10 hours
- Security groups and IAM: 8 hours
- Monitoring and alerting: 6 hours
- Scaling and capacity planning: 8 hours
- Certificate management: 4 hours
- Backup configuration: 4 hours
- **Total: 40 hours/month**

### Solo Developer Stack Tasks (Hours/Month)
- Push code to GitHub: 0 hours (automated)
- Monitor dashboards: 2 hours
- Review bills: 1 hour
- **Total: 3 hours/month**

**Time Saved: 37 hours/month = 1 week of development time**

## Migration Path

### From Current Infrastructure
```bash
# 1. Website (Next.js) → Vercel
vercel --prod
# Automatic deployment from GitHub

# 2. Hasura → Railway
railway up
# One-click template deployment

# 3. Database → NeonDB
pg_dump current_db | psql $NEON_DATABASE_URL
# Update Hasura connection string

# 4. Static Assets → Cloudflare R2
rclone copy ./assets r2:100days-assets
# Update asset URLs to R2

# 5. API Functions → Cloudflare Workers
wrangler deploy
# Deploy integration functions
```

### To Future Infrastructure (if needed)
All services use standard protocols:
- Vercel → Any Node.js host
- Railway → Any Docker host
- NeonDB → Any PostgreSQL
- Cloudflare Workers → Any serverless platform
- Firebase Auth → Self-hosted auth

## Developer Experience Benefits

### Local Development
```yaml
local_setup:
  - Next.js: npm run dev
  - Hasura: hasura console
  - Database: neon branch or local PostgreSQL
  - Workers: wrangler dev
  - All services with hot reload
  
time_to_start: <5 minutes
```

### CI/CD Pipeline
```yaml
automation:
  - Push to main → Production deployment
  - Push to PR → Preview deployment
  - No Jenkins, no CircleCI, no configuration
  - Built-in rollbacks and versioning
```

### Monitoring & Debugging
```yaml
built_in_tools:
  - Vercel: Analytics, Web Vitals, Logs
  - Railway: Metrics, Logs, Observability
  - NeonDB: Query insights, Slow query log
  - Cloudflare: Analytics, Workers logs
  - No DataDog, no New Relic needed
```

## Security Benefits

### Automatic Security
- **DDoS Protection**: Cloudflare (unlimited)
- **SSL/TLS**: Automatic everywhere
- **Firewall**: Cloudflare WAF included
- **Secrets Management**: Platform native
- **Compliance**: SOC2, GDPR ready platforms

### Reduced Attack Surface
- No SSH keys to manage
- No server patching
- No open ports
- No VPC misconfigurations
- Automatic security updates

## Scaling Strategy

### Phase 1: 0-10K MAU
- Everything on free tiers
- Monitor usage metrics
- Cost: ~$7/month

### Phase 2: 10K-50K MAU
- Upgrade Expo for OTA updates
- Add Firebase Auth budget
- Cost: ~$156/month

### Phase 3: 50K-100K MAU
- Vercel Pro for bandwidth
- Scale Railway Hasura
- Cost: ~$259/month

### Phase 4: 100K+ MAU
- Evaluate dedicated infrastructure
- Consider hiring DevOps
- Potential move to Kubernetes

## Disaster Recovery

### Automatic Backups
- **Database**: NeonDB point-in-time recovery
- **Code**: GitHub versioning
- **Assets**: Cloudflare R2 versioning
- **Config**: Infrastructure as Code

### Recovery Time Objectives
- **Frontend**: <1 minute (rollback deployment)
- **API**: <5 minutes (Railway rollback)
- **Database**: <15 minutes (NeonDB restore)
- **Full Stack**: <30 minutes

## Risks & Mitigations

### Risk: Vendor Lock-in
**Mitigation**: All services use standard protocols, migration paths documented

### Risk: Service Outages
**Mitigation**: Multi-provider strategy, each service independent

### Risk: Scaling Limits
**Mitigation**: Clear upgrade paths, no architectural changes needed

### Risk: Cost Overruns
**Mitigation**: Usage alerts, spending limits, predictable pricing

## Success Criteria
- <5 minutes from code push to production
- <3 hours/month operational overhead
- <$50/month infrastructure cost until 50K MAU
- Zero security incidents
- 99.9% uptime achieved

## Comparison with AWS Decision (001)

| Aspect | AWS (Original) | Solo Developer Stack |
|--------|---------------|---------------------|
| Monthly Cost (10K MAU) | $200+ | $7 |
| Setup Time | 40 hours | 2 hours |
| Operational Hours/Month | 40 | 3 |
| Time to First Deploy | 2 days | 30 minutes |
| Required Knowledge | Extensive | Minimal |
| Scaling Complexity | High | Automatic |
| Security Setup | Manual | Automatic |

## Why Not Other "Simple" Platforms?

### Why Not Heroku?
- Expensive ($25/dyno)
- Cold starts on free tier
- Limited free PostgreSQL (10K rows)
- No edge computing

### Why Not Render?
- Good option, but more expensive
- Less generous free tier
- No database branching
- Fewer edge locations

### Why Not Fly.io?
- More complex than Railway
- Requires Dockerfile knowledge
- Better for complex deployments
- Overkill for Hasura

## Approval
- CTO: Approved (37 hours/month saved for feature development)
- Lead Developer: Approved (superior developer experience)
- Finance: Approved (93% cost reduction vs AWS)