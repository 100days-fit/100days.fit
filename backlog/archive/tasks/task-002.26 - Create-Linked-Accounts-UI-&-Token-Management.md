---
id: task-002.26
title: Create Linked Accounts UI & Token Management
status: To Do
assignee: []
created_date: '2025-12-28 09:33'
labels: []
dependencies:
  - task-002.24
  - task-002.25
parent_task_id: task-002
priority: medium
---

## Description

Create linked-accounts section in profile for both platforms. Display connected accounts with status, connect/disconnect buttons, last sync time. Implement account unlinking (revoke tokens on provider side, delete from oauth_tokens, update linked_accounts). Create scheduled Cloud Function to refresh expiring tokens.

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Linked accounts section on mobile profile
- [ ] #2 Linked accounts section on web profile
- [ ] #3 Connected accounts display correctly
- [ ] #4 Account unlinking working
- [ ] #5 Token refresh Cloud Function scheduled
- [ ] #6 Connection errors handled gracefully
- [ ] #7 Component tests written
<!-- AC:END -->
