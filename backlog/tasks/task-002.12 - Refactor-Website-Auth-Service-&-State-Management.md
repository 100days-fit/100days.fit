---
id: task-002.12
title: Refactor Website Auth Service & State Management
status: Done
assignee: []
created_date: '2025-12-28 08:57'
updated_date: '2025-12-28 13:48'
labels: []
dependencies:
  - task-002.04
parent_task_id: task-002
priority: high
---

## Description

Update auth.service.ts with signInWithGoogle, signInWithApple, improved error handling. Remove Jotai, standardize on Recoil. Update auth.atom.ts with full AuthState interface. Create AuthProvider.tsx with Firebase listener and Recoil state sync. Create ProtectedRoute.tsx and RoleGate.tsx components.

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 auth.service.ts updated with Google/Apple sign-in
- [ ] #2 State management standardized on Recoil only
- [ ] #3 auth.atom.ts updated with full AuthState
- [ ] #4 AuthProvider.tsx created with Firebase listener
- [ ] #5 ProtectedRoute.tsx and RoleGate.tsx created
- [ ] #6 AuthProvider added to root layout
<!-- AC:END -->
