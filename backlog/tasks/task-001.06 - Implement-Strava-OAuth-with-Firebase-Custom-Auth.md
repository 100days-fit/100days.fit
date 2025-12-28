---
id: task-001.06
title: Implement Strava OAuth with Firebase Custom Auth
status: To Do
assignee: []
created_date: '2025-12-28 09:45'
labels: []
dependencies: []
parent_task_id: task-001
priority: high
---

## Description

Single OAuth flow for both login and data sync. Register app on Strava Developer Portal with scopes: profile:read_all, activity:read_all. Store tokens in Token Vault. Generate Firebase custom token for login. Ref: Decision 009 (Token Vault, OAuth Manager sections).

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Strava OAuth flow handles both login and data sync
- [ ] #2 Tokens stored in Token Vault with AES-256 encryption
- [ ] #3 Firebase custom token generated for client auth
- [ ] #4 Connect Strava button works on mobile and web
<!-- AC:END -->
