---
id: task-002.18
title: Implement Session Tracking Service
status: To Do
assignee: []
created_date: '2025-12-28 09:00'
labels: []
dependencies:
  - task-002.11
  - task-002.12
parent_task_id: task-002
priority: high
---

## Description

Create session.service.ts for both mobile and web. Generate unique device ID (expo-device + secure random for mobile, fingerprint/UUID for web). Detect device info (name, type, OS version, app version). Create session in Hasura on login, mark as current, update last_active_at periodically.

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Session service created for mobile app
- [ ] #2 Session service created for website
- [ ] #3 Unique device ID generated per platform
- [ ] #4 Device info detected correctly
- [ ] #5 Session created in Hasura on login
- [ ] #6 last_active_at updated periodically
<!-- AC:END -->
