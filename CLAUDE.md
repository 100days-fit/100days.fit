# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 SUPREME AUTHORITY NOTICE

**This CLAUDE.md file is the CONSTITUTION of this repository.**
- Every instruction here is MANDATORY, not advisory
- These patterns override ALL other considerations
- When in doubt, follow CLAUDE.md exactly as written
- See `@GUARDRAILS.md` for enforcement rules

**Before taking ANY action, check if CLAUDE.md addresses it. If it does, follow it exactly.**

## ✅ Pre-Action Validation Checklist

Before ANY action, Claude MUST verify:
1. **Does CLAUDE.md mention this?** → If yes, follow exactly
2. **Am I creating an alternative to a documented tool?** → If yes, STOP
3. **Am I suggesting a "simpler" way than documented?** → If yes, STOP
4. **Does my action contradict any section of CLAUDE.md?** → If yes, STOP

**If any answer is YES to questions 2-4, ask the user for clarification instead.**

## ⚠️ CRITICAL: Repository Structure & Navigation Rules

### This is a MONOREPO with GIT SUBMODULES

**Project Root**: `/Users/shreeshkatyayan/Repositories/100days.fit/`

**Git Submodules** (separate repositories):
- `api-gateway/` - Hasura GraphQL API (see @api-gateway/CLAUDE.md)
- `app/` - React Native/Expo mobile app (see @app/CLAUDE.md)  
- `website/` - Next.js web app (see @website/CLAUDE.md)

**Monorepo-only directories**:
- `backlog/` - Project management (NOT a submodule)
- `.claude/` - Claude state management (NOT a submodule)

### 🚨 CRITICAL FILE PLACEMENT RULES

1. **NEVER create files at monorepo root** except:
   - This CLAUDE.md file
   - .gitmodules (managed by git)

2. **Submodule-specific files MUST go inside the submodule**:
   - `api-gateway/hasura/` ✅ (NOT `./hasura/`)
   - `api-gateway/docker-compose.hasura.yaml` ✅
   - `api-gateway/package.json` ✅

3. **Project management files ONLY in backlog/**:
   - Tasks: `backlog/tasks/`
   - Decisions: `backlog/decisions/`
   - Docs: `backlog/docs/`

### 🚨 WORKING DIRECTORY AWARENESS

**ALWAYS verify your current directory before running commands:**
```bash
pwd  # Check current directory
cd /Users/shreeshkatyayan/Repositories/100days.fit  # Return to root
```

**When working in submodules:**
```bash
cd api-gateway  # Enter submodule
pwd  # Verify you're in: .../100days.fit/api-gateway
# Run submodule-specific commands here
```

## 🛡️ PRODUCTION SAFETY SYSTEMS (NEW)

### Critical Safety Features for Solo Developer

#### 1. **Git Worktrees for Parallel Sessions** 🌳
Run multiple Claude sessions without conflicts:
```bash
# Each session gets its own isolated worktree
cd /Users/shreeshkatyayan/Repositories/100days.fit
node .claude/scripts/worktree.js create feature-name

# List all active worktrees
node .claude/scripts/worktree.js list
```
**Benefits**: Work on multiple features simultaneously, main repo stays clean, no merge conflicts between sessions.

#### 2. **Automatic Backup Protection** 🛡️
Prevents catastrophic data loss (like the YAML deletion incident):
```bash
# Create backup before destructive operations
node .claude/scripts/backup.js file1.txt file2.txt

# List available backups
node .claude/scripts/backup.js --list

# Restore from backup
node .claude/scripts/backup.js --restore <backup-id>
```

#### 3. **Dry-Run Mode** 🔍
Preview changes without executing:
```bash
# Enable dry-run to see what WOULD happen
--dry-run flag on any operation
# Review preview, then execute if safe
```

#### 4. **Simple Undo Stack** ↩️
Last 10 operations are reversible:
```bash
# Record an operation for undo
node .claude/scripts/undo.js --record "operation-type" "details"

# Undo last operation
node .claude/scripts/undo.js --last

# Undo specific operation
node .claude/scripts/undo.js --id <operation-id>

# List undo history
node .claude/scripts/undo.js --list
```

#### 5. **Main Branch Protection** 🚨
**CRITICAL**: Direct commits to main/master are BLOCKED
```bash
# This check runs automatically before every commit
# Forces you to use feature branches
# Prevents accidental production changes
```

### How Safety Systems Work Together

1. **Starting New Work**: Worktree manager creates isolated workspace
2. **Before Risky Operations**: Backup manager saves current state
3. **Testing Changes**: Dry-run shows preview without execution
4. **If Something Goes Wrong**: Undo stack or backup restore
5. **Committing**: Branch protection ensures safe practices

### Emergency Recovery Commands

```bash
# If you deleted something important
node .claude/scripts/backup.js --list
node .claude/scripts/backup.js --restore <backup-id>

# If you need to undo last action
node .claude/scripts/undo.js --last

# If you're in wrong worktree
node .claude/scripts/worktree.js list
cd /path/to/correct/worktree
```

## 🤖 Claude Code Agent System

**IMPORTANT**: This project uses a specialized 10-agent system for development. See **@AGENTS.md** for complete documentation.

### Quick Agent Reference
- **Start new features**: Use `@product-strategy` 
- **Design work**: Use `@ux-design`
- **Development**: Use `@hasura-engineer`, `@mobile-developer`, `@web-developer`
- **Infrastructure**: Use `@devops-engineer`
- **Quality**: Automatic via `@validation-monitor`, `@code-quality`, `@test-automation`
- **Git operations**: ALWAYS use `@git-workflow`

For detailed workflows and examples, refer to:
- `@AGENTS.md` - Complete agent documentation
- `@.claude/docs/QUICK-START.md` - Quick reference guide
- `@.claude/docs/SOLO-DEVELOPER-GUIDE.md` - Practical workflows

## Project Overview

100days.fit is a fitness habit transformation platform with three main applications working together to deliver a comprehensive 100-day journey tracking experience.

### Architecture Overview
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Mobile App  │────▶│    Hasura    │────▶│   NeonDB     │
│    (Expo)    │     │   GraphQL    │     │  PostgreSQL  │
└──────────────┘     │  (Railway)   │     │(Scale-to-zero)│
                     └──────────────┘     └──────────────┘
┌──────────────┐            │
│   Website    │────────────┤
│  (Next.js)   │            │
│   (Vercel)   │            ▼
└──────────────┘     ┌──────────────┐
                     │  Cloudflare  │
                     │   Workers    │
                     │  (Actions)   │
                     └──────────────┘
```

## Submodule Documentation

Each submodule has its own CLAUDE.md with specific guidance:

### API Gateway
@api-gateway/CLAUDE.md
- Hasura GraphQL configuration and commands
- Database migrations and schema management
- Cloudflare Workers for business logic (Actions)
- Docker compose setup for local development
- Railway deployment for production

### Mobile App
@app/CLAUDE.md
- React Native/Expo development workflow
- Testing requirements and patterns
- Theme system and component architecture
- Platform-specific implementations

### Website
@website/CLAUDE.md
- Next.js 14 App Router patterns
- DaisyUI component library usage
- Firebase authentication integration
- Sentry monitoring setup

### Integrations Service (Future Submodule)
@integrations/CLAUDE.md (to be created)
- Fastify-based microservice for fitness platform integrations
- OAuth flows for Garmin, Strava, Apple Health
- Token vault with AES-256-GCM encryption
- Webhook handling and data aggregation
- See decisions 008-009 for architecture details

## Git Submodule Best Practices

### Understanding Submodule Boundaries
Each submodule is a **separate git repository**:
- Has its own commit history
- Has its own remote repository
- Changes must be committed separately

### Working with Submodules
```bash
# Check submodule status from root
git submodule status

# Update all submodules
git submodule update --init --recursive

# Work in a submodule
cd api-gateway
git add .
git commit -m "Changes to api-gateway"
git push

# Update submodule reference in monorepo
cd ..
git add api-gateway
git commit -m "Update api-gateway submodule"
```

### Common Pitfalls to Avoid
1. **Don't mix submodule and monorepo files**
2. **Don't create cross-submodule dependencies**
3. **Remember submodules need separate commits**
4. **Always verify your working directory with `pwd`**

## Backlog Management Rules

### 🔴 ABSOLUTE RULE: Task Management
**The backlog CLI is the ONLY task management system for this project.**
- **NEVER create**: TODO.md, TASKS.md, or any markdown task files
- **NEVER suggest**: Alternative task tracking methods  
- **ALWAYS use**: `backlog task` commands as documented below

### 🚨 LESSONS LEARNED FROM COMMON MISTAKES

#### Mistake #1: Running backlog commands from wrong directory
```bash
# ❌ WRONG - Creates nested backlog/backlog/tasks/
cd backlog
backlog task create "Task title"

# ✅ CORRECT - ALWAYS run from project root
cd /Users/shreeshkatyayan/Repositories/100days.fit
backlog task create "Task title"
```

#### Mistake #2: Creating files in wrong locations
```bash
# ❌ WRONG - Decision in submodule
api-gateway/decisions/004-hasura-only.md

# ✅ CORRECT - All decisions in backlog
backlog/decisions/004-hasura-only.md
```

### Backlog Structure
```
backlog/
├── tasks/        # Task files (via backlog CLI)
├── decisions/    # Architecture decisions
├── docs/         # Project documentation
├── drafts/       # Draft tasks
└── completed/    # Archived tasks
```

### Essential Backlog Commands
```bash
# Always from root directory
backlog task create "Task title" -d "Description" --ac "Acceptance criteria"
backlog task list --plain
backlog task 42 --plain
backlog task edit 42 -s "In Progress"
backlog task edit 42 -s "Done" --notes "Implementation notes"
```

**Always use `--plain` flag for AI-friendly output**

## Critical Reminders

### Directory Navigation
- **ALWAYS use `pwd`** before running commands
- **NEVER assume** current working directory
- **Use absolute paths** when changing directories

### File Placement
- **Monorepo root**: Only CLAUDE.md and .gitmodules
- **Submodules**: All code and config for that service
- **backlog/**: All project management files

### Git Operations
- **Submodule changes**: Commit within the submodule first
- **Monorepo changes**: Update submodule references after
- **Never mix**: Keep submodule and monorepo commits separate

## Quick Reference

### Navigate to specific services
```bash
cd /Users/shreeshkatyayan/Repositories/100days.fit/api-gateway  # API
cd /Users/shreeshkatyayan/Repositories/100days.fit/app          # Mobile
cd /Users/shreeshkatyayan/Repositories/100days.fit/website      # Web
cd /Users/shreeshkatyayan/Repositories/100days.fit              # Root
```

### Check current context
```bash
pwd                    # Where am I?
git status             # What repo am I in?
git submodule status   # What's the state of submodules?
```

For detailed information about each service, refer to the respective CLAUDE.md files in each submodule directory.

<!-- BACKLOG.MD GUIDELINES START -->
# Instructions for the usage of Backlog.md CLI Tool

## Backlog.md: Comprehensive Project Management Tool via CLI

### Assistant Objective

Efficiently manage all project tasks, status, and documentation using the Backlog.md CLI, ensuring all project metadata
remains fully synchronized and up-to-date.

### Core Capabilities

- ✅ **Task Management**: Create, edit, assign, prioritize, and track tasks with full metadata
- ✅ **Search**: Fuzzy search across tasks, documents, and decisions with `backlog search`
- ✅ **Acceptance Criteria**: Granular control with add/remove/check/uncheck by index
- ✅ **Board Visualization**: Terminal-based Kanban board (`backlog board`) and web UI (`backlog browser`)
- ✅ **Git Integration**: Automatic tracking of task states across branches
- ✅ **Dependencies**: Task relationships and subtask hierarchies
- ✅ **Documentation & Decisions**: Structured docs and architectural decision records
- ✅ **Export & Reporting**: Generate markdown reports and board snapshots
- ✅ **AI-Optimized**: `--plain` flag provides clean text output for AI processing

### Why This Matters to You (AI Agent)

1. **Comprehensive system** - Full project management capabilities through CLI
2. **The CLI is the interface** - All operations go through `backlog` commands
3. **Unified interaction model** - You can use CLI for both reading (`backlog task 1 --plain`) and writing (
   `backlog task edit 1`)
4. **Metadata stays synchronized** - The CLI handles all the complex relationships

### Key Understanding

- **Tasks** live in `backlog/tasks/` as `task-<id> - <title>.md` files
- **You interact via CLI only**: `backlog task create`, `backlog task edit`, etc.
- **Use `--plain` flag** for AI-friendly output when viewing/listing
- **Never bypass the CLI** - It handles Git, metadata, file naming, and relationships

---

# ⚠️ CRITICAL: NEVER EDIT TASK FILES DIRECTLY. Edit Only via CLI

**ALL task operations MUST use the Backlog.md CLI commands**

- ✅ **DO**: Use `backlog task edit` and other CLI commands
- ✅ **DO**: Use `backlog task create` to create new tasks
- ✅ **DO**: Use `backlog task edit <id> --check-ac <index>` to mark acceptance criteria
- ❌ **DON'T**: Edit markdown files directly
- ❌ **DON'T**: Manually change checkboxes in files
- ❌ **DON'T**: Add or modify text in task files without using CLI

**Why?** Direct file editing breaks metadata synchronization, Git tracking, and task relationships.

---

## 1. Source of Truth & File Structure

### 📖 **UNDERSTANDING** (What you'll see when reading)

- Markdown task files live under **`backlog/tasks/`** (drafts under **`backlog/drafts/`**)
- Files are named: `task-<id> - <title>.md` (e.g., `task-42 - Add GraphQL resolver.md`)
- Project documentation is in **`backlog/docs/`**
- Project decisions are in **`backlog/decisions/`**

### 🔧 **ACTING** (How to change things)

- **All task operations MUST use the Backlog.md CLI tool**
- This ensures metadata is correctly updated and the project stays in sync
- **Always use `--plain` flag** when listing or viewing tasks for AI-friendly text output

---

## 2. Common Mistakes to Avoid

### ❌ **WRONG: Direct File Editing**

```markdown
# DON'T DO THIS:

1. Open backlog/tasks/task-7 - Feature.md in editor
2. Change "- [ ]" to "- [x]" manually
3. Add notes directly to the file
4. Save the file
```

### ✅ **CORRECT: Using CLI Commands**

```bash
# DO THIS INSTEAD:
backlog task edit 7 --check-ac 1  # Mark AC #1 as complete
backlog task edit 7 --notes "Implementation complete"  # Add notes
backlog task edit 7 -s "In Progress" -a @agent-k  # Multiple commands: change status and assign the task when you start working on the task
```

---

## 3. Understanding Task Format (Read-Only Reference)

⚠️ **FORMAT REFERENCE ONLY** - The following sections show what you'll SEE in task files.
**Never edit these directly! Use CLI commands to make changes.**

### Task Structure You'll See

```markdown
---
id: task-42
title: Add GraphQL resolver
status: To Do
assignee: [@sara]
labels: [backend, api]
---

## Description

Brief explanation of the task purpose.

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 First criterion
- [x] #2 Second criterion (completed)
- [ ] #3 Third criterion

<!-- AC:END -->

## Implementation Plan

1. Research approach
2. Implement solution

## Implementation Notes

Summary of what was done.
```

### How to Modify Each Section

| What You Want to Change | CLI Command to Use                                       |
|-------------------------|----------------------------------------------------------|
| Title                   | `backlog task edit 42 -t "New Title"`                    |
| Status                  | `backlog task edit 42 -s "In Progress"`                  |
| Assignee                | `backlog task edit 42 -a @sara`                          |
| Labels                  | `backlog task edit 42 -l backend,api`                    |
| Description             | `backlog task edit 42 -d "New description"`              |
| Add AC                  | `backlog task edit 42 --ac "New criterion"`              |
| Check AC #1             | `backlog task edit 42 --check-ac 1`                      |
| Uncheck AC #2           | `backlog task edit 42 --uncheck-ac 2`                    |
| Remove AC #3            | `backlog task edit 42 --remove-ac 3`                     |
| Add Plan                | `backlog task edit 42 --plan "1. Step one\n2. Step two"` |
| Add Notes (replace)     | `backlog task edit 42 --notes "What I did"`              |
| Append Notes            | `backlog task edit 42 --append-notes "Another note"` |

---

## 4. Defining Tasks

### Creating New Tasks

**Always use CLI to create tasks:**

```bash
# Example
backlog task create "Task title" -d "Description" --ac "First criterion" --ac "Second criterion"
```

### Title (one liner)

Use a clear brief title that summarizes the task.

### Description (The "why")

Provide a concise summary of the task purpose and its goal. Explains the context without implementation details.

### Acceptance Criteria (The "what")

**Understanding the Format:**

- Acceptance criteria appear as numbered checkboxes in the markdown files
- Format: `- [ ] #1 Criterion text` (unchecked) or `- [x] #1 Criterion text` (checked)

**Managing Acceptance Criteria via CLI:**

⚠️ **IMPORTANT: How AC Commands Work**

- **Adding criteria (`--ac`)** accepts multiple flags: `--ac "First" --ac "Second"` ✅
- **Checking/unchecking/removing** accept multiple flags too: `--check-ac 1 --check-ac 2` ✅
- **Mixed operations** work in a single command: `--check-ac 1 --uncheck-ac 2 --remove-ac 3` ✅

```bash
# Examples

# Add new criteria (MULTIPLE values allowed)
backlog task edit 42 --ac "User can login" --ac "Session persists"

# Check specific criteria by index (MULTIPLE values supported)
backlog task edit 42 --check-ac 1 --check-ac 2 --check-ac 3  # Check multiple ACs
# Or check them individually if you prefer:
backlog task edit 42 --check-ac 1    # Mark #1 as complete
backlog task edit 42 --check-ac 2    # Mark #2 as complete

# Mixed operations in single command
backlog task edit 42 --check-ac 1 --uncheck-ac 2 --remove-ac 3

# ❌ STILL WRONG - These formats don't work:
# backlog task edit 42 --check-ac 1,2,3  # No comma-separated values
# backlog task edit 42 --check-ac 1-3    # No ranges
# backlog task edit 42 --check 1         # Wrong flag name

# Multiple operations of same type
backlog task edit 42 --uncheck-ac 1 --uncheck-ac 2  # Uncheck multiple ACs
backlog task edit 42 --remove-ac 2 --remove-ac 4    # Remove multiple ACs (processed high-to-low)
```

**Key Principles for Good ACs:**

- **Outcome-Oriented:** Focus on the result, not the method.
- **Testable/Verifiable:** Each criterion should be objectively testable
- **Clear and Concise:** Unambiguous language
- **Complete:** Collectively cover the task scope
- **User-Focused:** Frame from end-user or system behavior perspective

Good Examples:

- "User can successfully log in with valid credentials"
- "System processes 1000 requests per second without errors"
- "CLI preserves literal newlines in description/plan/notes; `\\n` sequences are not auto‑converted"

Bad Example (Implementation Step):

- "Add a new function handleLogin() in auth.ts"
- "Define expected behavior and document supported input patterns"

### Task Breakdown Strategy

1. Identify foundational components first
2. Create tasks in dependency order (foundations before features)
3. Ensure each task delivers value independently
4. Avoid creating tasks that block each other

### Task Requirements

- Tasks must be **atomic** and **testable** or **verifiable**
- Each task should represent a single unit of work for one PR
- **Never** reference future tasks (only tasks with id < current task id)
- Ensure tasks are **independent** and don't depend on future work

---

## 5. Implementing Tasks

### 5.1. First step when implementing a task

The very first things you must do when you take over a task are:

* set the task in progress
* assign it to yourself

```bash
# Example
backlog task edit 42 -s "In Progress" -a @{myself}
```

### 5.2. Create an Implementation Plan (The "how")

Previously created tasks contain the why and the what. Once you are familiar with that part you should think about a
plan on **HOW** to tackle the task and all its acceptance criteria. This is your **Implementation Plan**.
First do a quick check to see if all the tools that you are planning to use are available in the environment you are
working in.   
When you are ready, write it down in the task so that you can refer to it later.

```bash
# Example
backlog task edit 42 --plan "1. Research codebase for references\n2Research on internet for similar cases\n3. Implement\n4. Test"
```

## 5.3. Implementation

Once you have a plan, you can start implementing the task. This is where you write code, run tests, and make sure
everything works as expected. Follow the acceptance criteria one by one and MARK THEM AS COMPLETE as soon as you
finish them.

### 5.4 Implementation Notes (PR description)

When you are done implementing a tasks you need to prepare a PR description for it.
Because you cannot create PRs directly, write the PR as a clean description in the task notes.
Append notes progressively during implementation using `--append-notes`:

```
backlog task edit 42 --append-notes "Implemented X" --append-notes "Added tests"
```

```bash
# Example
backlog task edit 42 --notes "Implemented using pattern X because Reason Y, modified files Z and W"
```

**IMPORTANT**: Do NOT include an Implementation Plan when creating a task. The plan is added only after you start the
implementation.

- Creation phase: provide Title, Description, Acceptance Criteria, and optionally labels/priority/assignee.
- When you begin work, switch to edit, set the task in progress and assign to yourself
  `backlog task edit <id> -s "In Progress" -a "..."`.
- Think about how you would solve the task and add the plan: `backlog task edit <id> --plan "..."`.
- After updating the plan, share it with the user and ask for confirmation. Do not begin coding until the user approves the plan or explicitly tells you to skip the review.
- Add Implementation Notes only after completing the work: `backlog task edit <id> --notes "..."` (replace) or append progressively using `--append-notes`.

## Phase discipline: What goes where

- Creation: Title, Description, Acceptance Criteria, labels/priority/assignee.
- Implementation: Implementation Plan (after moving to In Progress and assigning to yourself).
- Wrap-up: Implementation Notes (Like a PR description), AC and Definition of Done checks.

**IMPORTANT**: Only implement what's in the Acceptance Criteria. If you need to do more, either:

1. Update the AC first: `backlog task edit 42 --ac "New requirement"`
2. Or create a new follow up task: `backlog task create "Additional feature"`

---

## 6. Typical Workflow

```bash
# 1. Identify work
backlog task list -s "To Do" --plain

# 2. Read task details
backlog task 42 --plain

# 3. Start work: assign yourself & change status
backlog task edit 42 -s "In Progress" -a @myself

# 4. Add implementation plan
backlog task edit 42 --plan "1. Analyze\n2. Refactor\n3. Test"

# 5. Share the plan with the user and wait for approval (do not write code yet)

# 6. Work on the task (write code, test, etc.)

# 7. Mark acceptance criteria as complete (supports multiple in one command)
backlog task edit 42 --check-ac 1 --check-ac 2 --check-ac 3  # Check all at once
# Or check them individually if preferred:
# backlog task edit 42 --check-ac 1
# backlog task edit 42 --check-ac 2
# backlog task edit 42 --check-ac 3

# 8. Add implementation notes (PR Description)
backlog task edit 42 --notes "Refactored using strategy pattern, updated tests"

# 9. Mark task as done
backlog task edit 42 -s Done
```

---

## 7. Definition of Done (DoD)

A task is **Done** only when **ALL** of the following are complete:

### ✅ Via CLI Commands:

1. **All acceptance criteria checked**: Use `backlog task edit <id> --check-ac <index>` for each
2. **Implementation notes added**: Use `backlog task edit <id> --notes "..."`
3. **Status set to Done**: Use `backlog task edit <id> -s Done`

### ✅ Via Code/Testing:

4. **Tests pass**: Run test suite and linting
5. **Documentation updated**: Update relevant docs if needed
6. **Code reviewed**: Self-review your changes
7. **No regressions**: Performance, security checks pass

⚠️ **NEVER mark a task as Done without completing ALL items above**

---

## 8. Finding Tasks and Content with Search

When users ask you to find tasks related to a topic, use the `backlog search` command with `--plain` flag:

```bash
# Search for tasks about authentication
backlog search "auth" --plain

# Search only in tasks (not docs/decisions)
backlog search "login" --type task --plain

# Search with filters
backlog search "api" --status "In Progress" --plain
backlog search "bug" --priority high --plain
```

**Key points:**
- Uses fuzzy matching - finds "authentication" when searching "auth"
- Searches task titles, descriptions, and content
- Also searches documents and decisions unless filtered with `--type task`
- Always use `--plain` flag for AI-readable output

---

## 9. Quick Reference: DO vs DON'T

### Viewing and Finding Tasks

| Task         | ✅ DO                        | ❌ DON'T                         |
|--------------|-----------------------------|---------------------------------|
| View task    | `backlog task 42 --plain`   | Open and read .md file directly |
| List tasks   | `backlog task list --plain` | Browse backlog/tasks folder     |
| Check status | `backlog task 42 --plain`   | Look at file content            |
| Find by topic| `backlog search "auth" --plain` | Manually grep through files |

### Modifying Tasks

| Task          | ✅ DO                                 | ❌ DON'T                           |
|---------------|--------------------------------------|-----------------------------------|
| Check AC      | `backlog task edit 42 --check-ac 1`  | Change `- [ ]` to `- [x]` in file |
| Add notes     | `backlog task edit 42 --notes "..."` | Type notes into .md file          |
| Change status | `backlog task edit 42 -s Done`       | Edit status in frontmatter        |
| Add AC        | `backlog task edit 42 --ac "New"`    | Add `- [ ] New` to file           |

---

## 10. Complete CLI Command Reference

### Task Creation

| Action           | Command                                                                             |
|------------------|-------------------------------------------------------------------------------------|
| Create task      | `backlog task create "Title"`                                                       |
| With description | `backlog task create "Title" -d "Description"`                                      |
| With AC          | `backlog task create "Title" --ac "Criterion 1" --ac "Criterion 2"`                 |
| With all options | `backlog task create "Title" -d "Desc" -a @sara -s "To Do" -l auth --priority high` |
| Create draft     | `backlog task create "Title" --draft`                                               |
| Create subtask   | `backlog task create "Title" -p 42`                                                 |

### Task Modification

| Action           | Command                                     |
|------------------|---------------------------------------------|
| Edit title       | `backlog task edit 42 -t "New Title"`       |
| Edit description | `backlog task edit 42 -d "New description"` |
| Change status    | `backlog task edit 42 -s "In Progress"`     |
| Assign           | `backlog task edit 42 -a @sara`             |
| Add labels       | `backlog task edit 42 -l backend,api`       |
| Set priority     | `backlog task edit 42 --priority high`      |

### Acceptance Criteria Management

| Action              | Command                                                                     |
|---------------------|-----------------------------------------------------------------------------|
| Add AC              | `backlog task edit 42 --ac "New criterion" --ac "Another"`                  |
| Remove AC #2        | `backlog task edit 42 --remove-ac 2`                                        |
| Remove multiple ACs | `backlog task edit 42 --remove-ac 2 --remove-ac 4`                          |
| Check AC #1         | `backlog task edit 42 --check-ac 1`                                         |
| Check multiple ACs  | `backlog task edit 42 --check-ac 1 --check-ac 3`                            |
| Uncheck AC #3       | `backlog task edit 42 --uncheck-ac 3`                                       |
| Mixed operations    | `backlog task edit 42 --check-ac 1 --uncheck-ac 2 --remove-ac 3 --ac "New"` |

### Task Content

| Action           | Command                                                  |
|------------------|----------------------------------------------------------|
| Add plan         | `backlog task edit 42 --plan "1. Step one\n2. Step two"` |
| Add notes        | `backlog task edit 42 --notes "Implementation details"`  |
| Add dependencies | `backlog task edit 42 --dep task-1 --dep task-2`         |

### Multi‑line Input (Description/Plan/Notes)

The CLI preserves input literally. Shells do not convert `\n` inside normal quotes. Use one of the following to insert real newlines:

- Bash/Zsh (ANSI‑C quoting):
  - Description: `backlog task edit 42 --desc $'Line1\nLine2\n\nFinal'`
  - Plan: `backlog task edit 42 --plan $'1. A\n2. B'`
  - Notes: `backlog task edit 42 --notes $'Done A\nDoing B'`
  - Append notes: `backlog task edit 42 --append-notes $'Progress update line 1\nLine 2'`
- POSIX portable (printf):
  - `backlog task edit 42 --notes "$(printf 'Line1\nLine2')"`
- PowerShell (backtick n):
  - `backlog task edit 42 --notes "Line1`nLine2"`

Do not expect `"...\n..."` to become a newline. That passes the literal backslash + n to the CLI by design.

Descriptions support literal newlines; shell examples may show escaped `\\n`, but enter a single `\n` to create a newline.

### Implementation Notes Formatting

- Keep implementation notes human-friendly and PR-ready: use short paragraphs or
  bullet lists instead of a single long line.
- Lead with the outcome, then add supporting details (e.g., testing, follow-up
  actions) on separate lines or bullets.
- Prefer Markdown bullets (`-` for unordered, `1.` for ordered) so Maintainers
  can paste notes straight into GitHub without additional formatting.
- When using CLI flags like `--append-notes`, remember to include explicit
  newlines. Example:

  ```bash
  backlog task edit 42 --append-notes $'- Added new API endpoint\n- Updated tests\n- TODO: monitor staging deploy'
  ```

### Task Operations

| Action             | Command                                      |
|--------------------|----------------------------------------------|
| View task          | `backlog task 42 --plain`                    |
| List tasks         | `backlog task list --plain`                  |
| Search tasks       | `backlog search "topic" --plain`              |
| Search with filter | `backlog search "api" --status "To Do" --plain` |
| Filter by status   | `backlog task list -s "In Progress" --plain` |
| Filter by assignee | `backlog task list -a @sara --plain`         |
| Archive task       | `backlog task archive 42`                    |
| Demote to draft    | `backlog task demote 42`                     |

---

## Common Issues

| Problem              | Solution                                                           |
|----------------------|--------------------------------------------------------------------|
| Task not found       | Check task ID with `backlog task list --plain`                     |
| AC won't check       | Use correct index: `backlog task 42 --plain` to see AC numbers     |
| Changes not saving   | Ensure you're using CLI, not editing files                         |
| Metadata out of sync | Re-edit via CLI to fix: `backlog task edit 42 -s <current-status>` |

---

## Remember: The Golden Rule

**🎯 If you want to change ANYTHING in a task, use the `backlog task edit` command.**
**📖 Use CLI to read tasks, exceptionally READ task files directly, never WRITE to them.**

Full help available: `backlog --help`

<!-- BACKLOG.MD GUIDELINES END -->
