# Decision: FOSS-First Technology Stack

## Status
**Approved**

## Date
2024-08-21

## Context
To achieve sustainable unit economics while maintaining enterprise-grade capabilities, we need to select FOSS alternatives that can provide 72.5% cost savings compared to managed services.

## Decision
**Adopt a FOSS-first approach with clearly defined migration triggers to managed services.**

## Selected Stack

### Core Infrastructure
- **Database**: PostgreSQL 15 + TimescaleDB + pgvector
- **Cache**: DragonflyDB (25x memory efficiency vs Redis)
- **Message Queue**: BullMQ (Redis-based)
- **Search**: MeiliSearch
- **File Storage**: MinIO (dev) → CloudFlare R2 (prod)

### Application Services
- **Authentication**: Firebase Authentication (managed service exception)
- **Real-time**: Socket.io → Centrifugo (at scale)
- **API Gateway**: Traefik
- **GraphQL**: Hasura CE (existing)

### Observability
- **Metrics**: VictoriaMetrics + Grafana
- **Logs**: Loki + Promtail
- **APM**: SigNoz
- **Error Tracking**: Sentry CE
- **Analytics**: PostHog CE

## Cost Analysis
- **FOSS Stack**: $660/month at 10K users
- **Managed Equivalent**: $2,400/month
- **Savings**: $1,740/month (72.5%)
- **Operational Overhead**: 50-95 hours/month

## Migration Triggers
Each component has defined thresholds for migration to managed services:
- Operational overhead exceeds cost savings
- Stability issues affecting user experience
- Need for enterprise features/support
- Team capacity constraints

## Implementation Priority
1. **Week 1**: Monitoring stack deployment
2. **Week 2**: Analytics implementation
3. **Week 3**: Caching layer
4. **Week 4**: Firebase Auth JWT integration with Hasura

## Risks & Mitigations
- **Risk**: Higher operational overhead
  - **Mitigation**: Hire dedicated DevOps engineer by Month 3
- **Risk**: Security vulnerabilities
  - **Mitigation**: Automated updates, security scanning
- **Risk**: Lack of enterprise support
  - **Mitigation**: Maintain migration playbooks

## Review Schedule
- Monthly reviews for first quarter
- Quarterly reviews thereafter
- Immediate review if operational overhead exceeds 100 hours/month