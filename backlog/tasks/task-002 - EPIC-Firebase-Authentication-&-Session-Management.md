---
id: task-002
title: 'EPIC: Firebase Authentication & Session Management'
status: To Do
assignee: []
created_date: '2025-12-28 08:22'
labels: []
dependencies: []
priority: high
---

## Description

Implement comprehensive authentication system using Firebase Auth with Google/Apple social login, role-based access control (user, premium_user, organizer, admin), cross-platform session management, profile management, and Strava/Garmin integration. Reference: backlog/docs/PRD-firebase-authentication.md

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 User can sign up/login with email/password
- [ ] #2 User can sign up/login with Google
- [ ] #3 User can sign up/login with Apple
- [ ] #4 JWT tokens contain correct Hasura claims for all 4 roles
- [ ] #5 Sessions tracked across devices with real-time sync
- [ ] #6 User can manage profile, change email/password, delete account
- [ ] #7 User can link/unlink Strava and Garmin accounts
- [ ] #8 90%+ test coverage on auth modules
<!-- AC:END -->
