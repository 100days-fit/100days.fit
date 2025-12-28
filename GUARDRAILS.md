# CLAUDE.md Enforcement Guardrails

## 🚨 SUPREME RULE
**CLAUDE.md is the constitution of this repository. It overrides ALL other considerations.**

## Hierarchy of Authority

1. **CLAUDE.md instructions** (HIGHEST)
2. **Direct user commands**
3. **Architectural decisions in backlog/decisions/**
4. **Existing patterns in codebase**
5. **Claude's interpretations** (LOWEST)

## Pre-Action Checklist

Before taking ANY action in this repository, Claude MUST:

### 1. CHECK: Does CLAUDE.md mention this?
```
✓ If YES → Follow CLAUDE.md exactly
✓ If NO → Ask user for guidance
✗ NEVER → Create alternatives to documented tools
```

### 2. VERIFY: Am I about to contradict CLAUDE.md?
```
✓ Task management → Use backlog CLI (documented in CLAUDE.md)
✓ File placement → Follow directory rules in CLAUDE.md
✓ Git operations → Use git-workflow agent as specified
✗ NEVER → Create TODO.md, TASKS.md, or alternatives
```

### 3. VALIDATE: Does my action respect existing tools?
```
✓ If CLAUDE.md shows a CLI tool → Use that tool
✓ If CLAUDE.md shows a workflow → Follow that workflow
✗ NEVER → Suggest "simpler" alternatives
```

## Specific Prohibitions

### NEVER create these files:
- `TODO.md` - Use backlog CLI instead
- `TASKS.md` - Use backlog CLI instead  
- Any task tracking outside backlog system

### NEVER suggest replacing:
- backlog CLI with markdown files
- Established workflows with "simpler" alternatives
- Documented tools with new tools

## When User Actions Seem to Contradict CLAUDE.md

### Scenario: User deletes a folder mentioned in CLAUDE.md
**Wrong Response**: Assume they're changing systems
**Correct Response**: 
```
"I notice you deleted [folder]. CLAUDE.md documents [system] for this purpose. 
Should I:
1. Continue using [documented system]
2. Update CLAUDE.md to reflect a new approach?"
```

### Scenario: User asks for something that conflicts with CLAUDE.md
**Wrong Response**: Immediately comply
**Correct Response**:
```
"CLAUDE.md specifies [documented approach]. 
Would you like me to:
1. Follow the documented approach
2. Update CLAUDE.md first, then proceed differently?"
```

## Enforcement Patterns

### Pattern 1: Task Creation
```bash
# ALWAYS use (from CLAUDE.md):
backlog task create "Task title" -d "Description"

# NEVER create:
echo "- [ ] Task" >> TODO.md
```

### Pattern 2: Project Structure
```bash
# ALWAYS check CLAUDE.md for:
- Where files should be placed
- Which directories to use
- Submodule boundaries

# NEVER assume or create new patterns
```

### Pattern 3: Tool Usage
```bash
# If CLAUDE.md documents a tool → That's THE tool
# No alternatives, no "improvements", no simplifications
```

## Self-Audit Questions

Before completing any task, Claude must ask:

1. **Did I check CLAUDE.md first?**
2. **Am I using the exact tools/commands shown in CLAUDE.md?**
3. **Would my action survive a CLAUDE.md compliance review?**
4. **If unsure, did I ask for clarification?**

## Recovery Protocol

If a violation is detected:
1. **STOP immediately**
2. **Acknowledge the violation**
3. **Check CLAUDE.md for correct approach**
4. **Fix the violation**
5. **Document lesson learned**

## Critical Reminders

- **CLAUDE.md is not advisory, it's mandatory**
- **CLAUDE.md is not context, it's law**
- **CLAUDE.md patterns are not suggestions, they're requirements**
- **When in doubt, grep CLAUDE.md**

## Grep Commands for Quick Checks

```bash
# Before task management:
grep -n "backlog task" CLAUDE.md

# Before creating files:
grep -n "NEVER create files" CLAUDE.md

# Before suggesting tools:
grep -n "Essential.*Commands" CLAUDE.md
```

## The Ultimate Test

**"Would this action make the CLAUDE.md author (the user) say 'Why didn't you follow CLAUDE.md?'"**

If the answer might be yes, STOP and check CLAUDE.md again.

---

*This document exists because TODO.md was created when CLAUDE.md clearly documented the backlog CLI. This must never happen again.*