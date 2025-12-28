---
id: task-002.11
title: Create Mobile App Auth Context & Hooks
status: Done
assignee: []
created_date: '2025-12-28 08:55'
updated_date: '2025-12-28 13:48'
labels: []
dependencies:
  - task-002.10
parent_task_id: task-002
priority: high
---

## Description

Create AuthContext.tsx in app/src/contexts/ with user state, isLoading, isAuthenticated, role, and auth methods. Implement onAuthStateChanged listener, token refresh on app foreground, custom claims parsing. Create useAuth.ts, useRequireAuth.ts, useRole.ts hooks. Add AuthProvider to app root layout.

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 AuthContext.tsx created with full auth state
- [ ] #2 onAuthStateChanged listener implemented
- [ ] #3 Token refresh handled on app foreground
- [ ] #4 Custom claims parsed for role extraction
- [ ] #5 useAuth, useRequireAuth, useRole hooks created
- [ ] #6 AuthProvider added to root layout
- [ ] #7 100% test coverage on hooks
<!-- AC:END -->
