---
id: task-002.05
title: Create Database Migration for Auth Tables
status: Done
assignee: []
created_date: '2025-12-28 08:27'
updated_date: '2025-12-28 15:08'
labels: []
dependencies: []
parent_task_id: task-002
priority: high
---

## Description

Create Hasura migration for: 1) users table enhancements (avatar_url, phone_number, date_of_birth, bio, timezone, notification_preferences, linked_accounts, email_verified, last_login_at, login_count, account_status, deleted_at), 2) Add premium_user and admin to user_role enum, 3) Create user_sessions table, 4) Create auth_events table (audit log), 5) Create oauth_tokens table (encrypted).

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 users table enhanced with new profile and status columns
- [ ] #2 user_role enum includes user, premium_user, organizer, admin
- [ ] #3 user_sessions table created with device tracking fields
- [ ] #4 auth_events table created for audit logging
- [ ] #5 oauth_tokens table created with encrypted token storage
- [ ] #6 Proper indexes added for performance
- [ ] #7 Migration tested up/down locally
<!-- AC:END -->

## Implementation Notes

Auth enhancements migration created with user_sessions and auth_events tables
