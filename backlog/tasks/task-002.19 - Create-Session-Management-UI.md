---
id: task-002.19
title: Create Session Management UI
status: To Do
assignee: []
created_date: '2025-12-28 09:01'
labels: []
dependencies:
  - task-002.18
parent_task_id: task-002
priority: high
---

## Description

Create sessions list screen for both mobile (profile/sessions.tsx) and web (profile/sessions/page.tsx). Fetch active sessions via GraphQL. Display session cards with device name, type icon, last active time, current device badge, location. Add Sign out button per session and Sign out all other devices button. Implement session revocation.

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Sessions screen created for mobile app
- [ ] #2 Sessions page created for website
- [ ] #3 Sessions list displays correctly with device info
- [ ] #4 Current session identified
- [ ] #5 Individual session revocation working
- [ ] #6 Sign out all other devices working
- [ ] #7 Component tests written
<!-- AC:END -->
