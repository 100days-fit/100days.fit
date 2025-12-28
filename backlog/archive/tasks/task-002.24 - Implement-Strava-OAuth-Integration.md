---
id: task-002.24
title: Implement Strava OAuth Integration
status: To Do
assignee: []
created_date: '2025-12-28 09:31'
labels: []
dependencies:
  - task-002.02
  - task-002.05
parent_task_id: task-002
priority: medium
---

## Description

Register app on Strava Developer Portal. Create Cloud Function for OAuth callback: exchange authorization code for tokens, encrypt tokens with AES-256, store in oauth_tokens table, link to Firebase user, update linked_accounts. Create Connect Strava button and OAuth flow for both mobile and web.

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 App registered on Strava Developer Portal
- [ ] #2 OAuth callback Cloud Function implemented
- [ ] #3 Tokens encrypted before storage
- [ ] #4 Connect Strava button on mobile and web
- [ ] #5 OAuth flow working on both platforms
- [ ] #6 linked_accounts updated in users table
- [ ] #7 Full integration tested
<!-- AC:END -->
