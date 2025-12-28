---
id: task-002.08
title: Implement User Creation Sync Cloud Function
status: To Do
assignee: []
created_date: '2025-12-28 08:32'
labels: []
dependencies:
  - task-002.02
  - task-002.05
parent_task_id: task-002
priority: high
---

## Description

Create onUserCreated trigger function that listens to auth.user().onCreate(). Extract user data (uid, email, displayName, photoURL, provider), create user record in Hasura via GraphQL mutation, set initial role as user, log creation event to auth_events. Implement Hasura GraphQL client, error handling with retry logic.

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 onUserCreated trigger function implemented
- [ ] #2 User record created in Hasura on Firebase signup
- [ ] #3 Auth event logged for user creation
- [ ] #4 Error handling with exponential backoff retry
- [ ] #5 Unit tests written for function
<!-- AC:END -->
