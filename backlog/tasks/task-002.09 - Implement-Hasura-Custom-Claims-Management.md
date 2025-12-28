---
id: task-002.09
title: Implement Hasura Custom Claims Management
status: To Do
assignee: []
created_date: '2025-12-28 08:33'
labels: []
dependencies:
  - task-002.08
parent_task_id: task-002
priority: high
---

## Description

Create setHasuraClaims helper function to set x-hasura-allowed-roles, x-hasura-default-role, x-hasura-user-id. Call from onUserCreated. Create refreshClaims HTTP callable function to fetch current role from Hasura and update claims. Create updateUserRole admin function to change user roles.

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 setHasuraClaims helper function implemented
- [ ] #2 Claims set automatically on user creation
- [ ] #3 refreshClaims callable function working
- [ ] #4 updateUserRole admin function working
- [ ] #5 Token refresh forced on role change
- [ ] #6 Unit tests written
<!-- AC:END -->
