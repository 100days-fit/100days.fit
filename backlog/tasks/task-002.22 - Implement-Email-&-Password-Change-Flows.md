---
id: task-002.22
title: Implement Email & Password Change Flows
status: To Do
assignee: []
created_date: '2025-12-28 09:30'
labels: []
dependencies:
  - task-002.21
parent_task_id: task-002
priority: high
---

## Description

Implement email change: require re-authentication, call Firebase updateEmail, send verification to new address, update in Hasura after verification. Implement password change: require current password, validate new password strength, call Firebase updatePassword, trigger session revocation for other devices. Log events to auth_events.

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Email change requires re-authentication
- [ ] #2 Email verification sent to new address
- [ ] #3 Email updated in Hasura after verification
- [ ] #4 Password change validates current password
- [ ] #5 Password strength validation working
- [ ] #6 Other sessions revoked on password change
- [ ] #7 Events logged to auth_events
- [ ] #8 Implemented on both mobile and web
<!-- AC:END -->
