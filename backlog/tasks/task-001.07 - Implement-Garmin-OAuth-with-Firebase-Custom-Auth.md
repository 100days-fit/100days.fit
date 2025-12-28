---
id: task-001.07
title: Implement Garmin OAuth with Firebase Custom Auth
status: To Do
assignee: []
created_date: '2025-12-28 09:46'
labels: []
dependencies: []
parent_task_id: task-001
priority: high
---

## Description

Single OAuth 1.0a flow for both login and data sync. Apply for Garmin Health API access. Register app with scopes: activity_read, wellness_read. Store tokens in Token Vault. Generate Firebase custom token for login. Ref: Decision 009 (Token Vault, OAuth Manager sections).

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Garmin OAuth 1.0a flow handles both login and data sync
- [ ] #2 Tokens stored in Token Vault with AES-256 encryption
- [ ] #3 Firebase custom token generated for client auth
- [ ] #4 Connect Garmin button works on mobile and web
<!-- AC:END -->
