---
id: task-002.23
title: Implement Account Deletion Flow
status: To Do
assignee: []
created_date: '2025-12-28 09:31'
labels: []
dependencies:
  - task-002.21
parent_task_id: task-002
priority: high
---

## Description

Create confirmation dialog with warning about data loss. Require re-authentication before deletion. Implement soft delete in Hasura (set account_status=deleted, deleted_at). Revoke all sessions. Send confirmation email. Create Cloud Function for permanent deletion after 30-day grace period.

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Confirmation dialog with clear warning
- [ ] #2 Re-authentication required
- [ ] #3 Soft delete in Hasura (30-day grace period)
- [ ] #4 All sessions revoked
- [ ] #5 Confirmation email sent
- [ ] #6 Scheduled permanent deletion after 30 days
- [ ] #7 Implemented on both mobile and web
<!-- AC:END -->
