---
id: task-002.07
title: Set Up Hasura Permissions for All Roles
status: Done
assignee: []
created_date: '2025-12-28 08:31'
updated_date: '2025-12-28 13:48'
labels: []
dependencies:
  - task-002.05
parent_task_id: task-002
priority: high
---

## Description

Define Hasura permissions for all 4 roles: user (SELECT/UPDATE own record), premium_user (inherit user + premium features), organizer (CRUD own events, SELECT users), admin (full CRUD). Update guest role restrictions. Apply to users, user_sessions, auth_events, events, event_registrations tables.

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 user role permissions defined for auth tables
- [ ] #2 premium_user role permissions defined with inheritance
- [ ] #3 organizer role permissions defined
- [ ] #4 admin role has full CRUD on all auth tables
- [ ] #5 guest role properly restricted
- [ ] #6 Metadata exported and committed
<!-- AC:END -->
