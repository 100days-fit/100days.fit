---
id: task-002.20
title: Implement Real-time Session Sync & Security Events
status: To Do
assignee: []
created_date: '2025-12-28 09:02'
labels: []
dependencies:
  - task-002.19
parent_task_id: task-002
priority: high
---

## Description

Create Hasura subscription for session changes. Handle session revocation in real-time (force logout if current session revoked, notification for other changes). Implement Cloud Functions for password change (revoke all sessions except current, send notification email) and suspicious activity detection.

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Hasura subscription for session changes working
- [ ] #2 Real-time logout on session revocation
- [ ] #3 Cross-device session sync working
- [ ] #4 Password change triggers session revocation
- [ ] #5 Security events logged to auth_events
- [ ] #6 Tested across mobile and web
<!-- AC:END -->
