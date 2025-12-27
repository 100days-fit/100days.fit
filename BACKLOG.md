# 100days.fit Project Backlog

## Overview
Centralized task tracking for the 100days.fit monorepo and all submodules.

---

## 🔴 In Progress

_No tasks currently in progress_

---

## 🟡 Up Next

_No tasks queued_

---

## 🟢 Completed

| Task | Submodule | Date |
|------|-----------|------|
| Initialize monorepo with submodules | root | 2024 |
| Configure Hasura GraphQL Engine | api-gateway | 2024 |
| Initialize all git submodules | root | 2024-12-27 |

---

## 📋 Backlog (Unprioritized)

### API Gateway
- [ ] Set up production deployment (AWS ECS Fargate)
- [ ] Configure JWT authentication with external provider
- [ ] Implement Lambda actions (calculateIdentityScore, matchPartners, etc.)
- [ ] Set up database migrations workflow

### Mobile App
- [ ] Implement login screen functionality
- [ ] Integrate Firebase authentication
- [ ] Connect to Hasura GraphQL API
- [ ] Implement core feature screens
- [ ] Add unit tests for remaining components

### Website
- [ ] Set up Firebase authentication
- [ ] Connect to Hasura GraphQL API
- [ ] Implement landing page
- [ ] Configure production Sentry monitoring

### Cross-Cutting
- [ ] Set up CI/CD pipelines for all submodules
- [ ] Configure shared environment variables
- [ ] Document API contracts between services

---

## 📝 Decisions Log

| ID | Decision | Date | Status |
|----|----------|------|--------|
| 001 | Use Hasura as GraphQL API layer | 2024 | Accepted |
| 002 | Monorepo with git submodules structure | 2024 | Accepted |
| 003 | Centralized backlog at monorepo root | 2024-12-27 | Accepted |

---

## How to Use This Backlog

1. **Adding tasks**: Add to "Backlog (Unprioritized)" under the appropriate section
2. **Starting work**: Move task to "In Progress" with assignee
3. **Completing**: Move to "Completed" table with date
4. **Decisions**: Log architectural decisions in the Decisions Log
