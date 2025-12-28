# Quick Start Guide - 100days.fit Agent System

## 🚀 Your 10-Agent Team

### Entry Points
1. **New Feature/Task**: Start with `@product-strategy`
2. **Bug Fix**: Go directly to relevant development agent
3. **Infrastructure**: Use `@devops-engineer`
4. **Git Operations**: ALWAYS use `@git-workflow`

### The Core Workflow
```
Idea → @product-strategy → @ux-design → Development → Validation → Ship
```

## 📋 Essential Commands

### Starting New Work
```bash
# Analyze requirements and create tasks
"@product-strategy analyze this PRD: [requirements]"

# After task approval, get design specs
"@ux-design create comprehensive specs for [feature]"

# Then implement (can be parallel)
"@hasura-engineer implement [backend feature]"
"@mobile-developer implement [mobile feature]"
"@web-developer implement [web feature]"
```

### Quality Gates (Automatic)
- `validation-monitor` runs after EVERY development action
- Rating < 7 = Must rework
- Rating ≥ 7 = Can proceed

### Shipping Code
```bash
# After validation passes
"@code-quality review all changes"
"@test-automation generate comprehensive tests"
"@git-workflow create feature branch and commit"
```

## 🎯 Agent Cheat Sheet

| Agent | When to Use | Key Command |
|-------|------------|-------------|
| product-strategy | New features, research | `@product-strategy analyze [requirements]` |
| ux-design | Need UI/UX specs | `@ux-design create specs for [feature]` |
| hasura-engineer | Backend/API work | `@hasura-engineer implement [API feature]` |
| mobile-developer | React Native changes | `@mobile-developer implement [screen/component]` |
| web-developer | Next.js changes | `@web-developer implement [page/component]` |
| devops-engineer | Infrastructure | `@devops-engineer setup [infrastructure]` |
| code-quality | Review code | Runs automatically or `@code-quality review` |
| test-automation | Generate tests | Runs automatically or `@test-automation test [component]` |
| git-workflow | ANY git operation | `@git-workflow [commit/push/branch]` |
| validation-monitor | Check quality | Runs automatically after development |

## 🛡️ Safety Rules

1. **NEVER** run git commands directly - use `@git-workflow`
2. **NEVER** skip validation ratings < 7
3. **ALWAYS** wait for validation before proceeding
4. **ALWAYS** start complex features with `@product-strategy`

## 💡 Pro Tips

### Parallel Work
```bash
# These can run simultaneously
"@hasura-engineer design schema"
"@ux-design create mockups"
"@mobile-developer setup navigation"
```

### Quick Bug Fix
```bash
"@mobile-developer fix crash on startup"
# validation-monitor checks automatically
"@test-automation add regression test"
"@git-workflow commit hotfix"
```

### When Stuck
```bash
"@validation-monitor why is this failing?"
"@code-quality what's wrong with this approach?"
```

## 📚 Deep Dive

- **Philosophy**: `.claude/docs/DEVELOPMENT-PHILOSOPHY.md`
- **Technical Standards**: `.claude/docs/TECHNICAL-PRINCIPLES.md`
- **Agent Collaboration**: `.claude/docs/AGENT-COLLABORATION.md`
- **Solo Dev Guide**: `.claude/docs/SOLO-DEVELOPER-GUIDE.md`
- **Full Documentation**: `AGENTS.md`

## 🏁 Your First Session

```bash
# 1. Check you have all agents
ls .claude/agents/ | wc -l  # Should show 10-11 files

# 2. Start with an idea
"@product-strategy I want to add user profiles with achievement badges"

# 3. Follow the workflow
# The agents will guide you through implementation

# 4. Ship when ready
"@git-workflow create PR for user profiles feature"
```

Remember: You're not alone. You have 10 specialized experts ready to help. Use them!