---
id: task-002.06
title: Configure Hasura JWT for Firebase RS256
status: In Progress
assignee: []
created_date: '2025-12-28 08:30'
updated_date: '2025-12-28 12:29'
labels: []
dependencies:
  - task-002.01
parent_task_id: task-002
priority: high
---

## Description

Update Hasura JWT configuration from HS256 to RS256 for Firebase. Configure HASURA_GRAPHQL_JWT_SECRET with Firebase JWKS URL, audience, and issuer. Test JWT validation with sample Firebase tokens.

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 docker-compose.yaml updated with Firebase RS256 JWT config
- [ ] #2 Railway production environment configured
- [ ] #3 JWT validation tested with real Firebase token
- [ ] #4 Configuration documented in README
<!-- AC:END -->
