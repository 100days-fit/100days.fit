# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

## Project Overview

100days.fit is a fitness habit transformation platform with three main applications working together to deliver a comprehensive 100-day journey tracking experience.

### Architecture Overview
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Mobile App  │────▶│    Hasura    │────▶│  PostgreSQL  │
│    (Expo)    │     │   GraphQL    │     │   Database   │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
┌──────────────┐            │
│   Website    │────────────┤
│  (Next.js)   │            │
└──────────────┘            ▼
                    ┌──────────────┐
                    │ AWS Lambda   │
                    │  Functions   │
                    │  (Actions)   │
                    └──────────────┘
```

## Submodule Documentation

Each submodule has its own CLAUDE.md with specific guidance:

### API Gateway
@api-gateway/CLAUDE.md
- Hasura GraphQL configuration and commands
- Database migrations and schema management
- AWS Lambda functions for business logic
- Docker compose setup for local development

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