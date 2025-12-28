# Solo Developer Guide - 100days.fit

## 🚀 From Idea to Production: A Solo Developer's Journey

This guide helps you leverage the Claude Code agent system to build production-ready features as a solo developer.

## 📋 Quick Start Checklist

Before starting any work session:
- [ ] Pull latest changes: `git pull --recurse-submodules`
- [ ] Check agent health: `ls .claude/agents/` (should see 10 agents)
- [ ] Review recent decisions: `ls -la backlog/decisions/ | tail -5`
- [ ] Check current tasks: `backlog task list --plain`
- [ ] Start in clean state: `git status` (should be clean)

## 🎯 Workflow Patterns

### Pattern 1: Feature Development (Most Common)

```bash
# 1. Start with your idea
"@product-strategy I want to add a streak freeze feature where users can pause their streak for up to 3 days"

# 2. Review generated tasks
"Show me the task breakdown"

# 3. Approve or refine
"Approved, let's proceed" 
# OR
"Modify task 3 to include push notifications"

# 4. Get design specs
"@ux-design create comprehensive specs for streak freeze feature"

# 5. Implement (agents work in parallel)
"@hasura-engineer implement streak_freezes table and mutations"
"@mobile-developer implement streak freeze UI based on specs"
"@web-developer add streak freeze to dashboard"

# 6. Let validation run automatically
# If validation < 7, agents will rework

# 7. Quality checks (automatic)
# code-quality and test-automation run

# 8. Commit when ready
"@git-workflow create feature branch and commit all changes"
```

### Pattern 2: Quick Bug Fix

```bash
# 1. Identify the issue
"@mobile-developer users report the app crashes when tapping the profile icon on iOS 17"

# 2. Fix is implemented
# validation-monitor checks automatically

# 3. Add test to prevent regression
"@test-automation add test for profile icon tap on iOS"

# 4. Ship it
"@git-workflow commit hotfix and create PR"
```

### Pattern 3: Research First

```bash
# 1. When you're not sure about approach
"@product-strategy research best practices for implementing referral systems in fitness apps"

# 2. Review research results
"Based on the research, create tasks for implementing referral system"

# 3. Continue with Pattern 1
```

### Pattern 4: Performance Optimization

```bash
# 1. Identify performance issue
"@devops-engineer analyze slow API response times in production"

# 2. Get optimization plan
"@hasura-engineer optimize queries based on DevOps findings"

# 3. Validate improvements
"@devops-engineer confirm performance improvements after optimization"
```

## 💡 Power User Tips

### 1. Parallel Processing
Don't wait for one agent to finish. Start multiple agents:
```bash
# These can all run simultaneously
"@hasura-engineer design schema for achievements system"
"@ux-design create achievement badge designs"
"@product-strategy research gamification best practices"
```

### 2. Use Context Loading
Reference existing files to maintain consistency:
```bash
"@mobile-developer implement new screen similar to @app/src/screens/Profile.tsx"
```

### 3. Leverage Validation Feedback
Don't argue with validation-monitor. If rating < 7, there's a real issue:
```bash
# Bad: "Ignore validation and proceed"
# Good: "Fix the issues identified by validation-monitor"
```

### 4. Batch Related Work
Group related changes for cleaner commits:
```bash
"@git-workflow commit all dashboard-related changes together"
```

### 5. Trust the Process
Let agents complete their work before jumping in:
```bash
# Don't interrupt with "hurry up" or "skip tests"
# Do provide clarification if asked
```

## 🛠️ Common Scenarios

### "I want to add a new feature but don't know where to start"
```bash
"@product-strategy I have an idea for [describe feature]. Research if this would be valuable and create a implementation plan"
```

### "The app is slow"
```bash
"@devops-engineer investigate performance bottlenecks in production"
"@mobile-developer profile app performance and identify slow components"
```

### "I need to refactor messy code"
```bash
"@code-quality review [file] and suggest refactoring approach"
"@test-automation ensure we have tests before refactoring [component]"
```

### "I want to improve UX"
```bash
"@ux-design analyze current user flow for [feature] and suggest improvements"
```

### "Something broke in production"
```bash
# 1. Immediate fix
"@[relevant-agent] URGENT: [describe issue]"

# 2. After fix
"@test-automation add regression test for [issue]"
"@devops-engineer add monitoring for [issue]"
```

## 🎭 Working with Agent Personalities

### product-strategy
- **Loves**: Clear business goals, user stories
- **Hates**: Vague requirements, assumptions
- **Tip**: Always provide context about WHY you want something

### ux-design
- **Loves**: User feedback, specific scenarios
- **Hates**: "Make it pretty", technical constraints presented as requirements
- **Tip**: Describe the user's emotional journey

### hasura-engineer
- **Loves**: Clear data relationships, normalized schemas
- **Hates**: Ambiguous relationships, denormalized data
- **Tip**: Think in terms of entities and relationships

### mobile-developer
- **Loves**: Platform-specific guidelines, native patterns
- **Hates**: Web patterns forced onto mobile
- **Tip**: Specify iOS vs Android when relevant

### web-developer
- **Loves**: SEO requirements, responsive designs
- **Hates**: Mobile-only patterns, pixel-perfect requirements
- **Tip**: Think in terms of viewport ranges, not devices

### devops-engineer
- **Loves**: Specific metrics, clear SLOs
- **Hates**: "Make it faster", infinite scaling requirements
- **Tip**: Provide concrete numbers and constraints

### validation-monitor
- **Loves**: Specifications to validate against
- **Hates**: Nothing - it's impartial
- **Tip**: Never skip validation, it's your safety net

## 📊 Progress Tracking

### Daily Checklist
```bash
# Morning
backlog task list --plain | grep "In Progress"  # What's active?
git status                                       # Clean start?

# During work
# Let agents work, monitor validation ratings

# End of day
@git-workflow commit all completed work
backlog task list --plain | grep "Done"         # What got done?
```

### Weekly Review
```bash
# What got shipped?
git log --oneline --since="1 week ago"

# What's blocked?
backlog task list --plain | grep "Blocked"

# What's next?
@product-strategy what should we prioritize next week?
```

## 🚨 When Things Go Wrong

### Agent produces incorrect code
```bash
# validation-monitor will catch it
# If not, manually request:
"@validation-monitor review the latest changes"
```

### Accidental deletion or bad change
```bash
# Use the undo system
node .claude/scripts/undo.js --last

# Or restore from backup
node .claude/scripts/backup.js --list
node .claude/scripts/backup.js --restore [backup-id]
```

### Git merge conflicts
```bash
# Always use git-workflow
"@git-workflow resolve merge conflicts in [branch]"
```

### Need to work on multiple features
```bash
# Use worktrees
node .claude/scripts/worktree.js feature-name
cd ../100days.fit-feature-name
```

### Overwhelmed with tasks
```bash
"@product-strategy help me prioritize the current backlog"
```

## 🎮 Productivity Shortcuts

### Morning Standup with Yourself
```bash
"@product-strategy what should I focus on today based on current backlog?"
```

### End of Day Wrap
```bash
"@git-workflow commit all today's work with meaningful messages"
"@test-automation generate tests for today's new code"
```

### Before Major Decision
```bash
"@decision-oracle what architectural patterns apply to [situation]?"
```

### When Stuck
```bash
"@validation-monitor why is the current implementation failing?"
"@code-quality review my approach to [problem]"
```

## 📈 Leveling Up

### From Beginner to Intermediate
1. Start using parallel agents
2. Reference existing code in requests
3. Let validation-monitor guide quality
4. Trust agent expertise

### From Intermediate to Advanced
1. Chain complex workflows
2. Create custom patterns in decisions/
3. Optimize agent interactions
4. Build agent memory through consistent patterns

### From Advanced to Expert
1. Predict what agents will need
2. Provide perfect context upfront
3. Orchestrate multi-agent symphonies
4. Achieve >90% first-try validation ratings

## 🎯 Success Metrics

Track these to measure your effectiveness:

### Velocity Metrics
- Tasks completed per day
- Features shipped per week
- Bugs fixed per sprint

### Quality Metrics
- Average validation-monitor rating
- Test coverage percentage
- Production incidents per month

### Efficiency Metrics
- Rework rate (should decrease)
- First-try success rate (should increase)
- Time from idea to production

## 💭 Mental Models

### Think Like a CTO
Even though you're solo, think strategically:
- Will this scale?
- Is this maintainable?
- Does this add user value?
- What's the ROI?

### Act Like a Team
Treat agents as team members:
- Give clear requirements
- Provide context
- Accept feedback
- Trust expertise

### Build Like Enterprise
Just because you're solo doesn't mean cowboy coding:
- Tests are mandatory
- Documentation is required
- Code review (via agents) is essential
- Monitoring is not optional

## 🏁 Daily Workflow Template

```bash
# ☀️ Morning (5 min)
git pull --recurse-submodules
backlog task list --plain
"@product-strategy what's the priority today?"

# 🏗️ Building (3-4 hours)
"@[agent] implement [feature]"
# Let validation-monitor do its job
# Address feedback immediately

# 🧪 Testing (30 min)
"@test-automation generate tests for new code"
"@code-quality review today's changes"

# 📦 Shipping (15 min)
"@git-workflow commit feature with descriptive message"
"@devops-engineer deploy to staging"

# 📊 Review (10 min)
"What did we accomplish today?"
"What's blocked?"
"What's tomorrow's focus?"
```

## 🎓 Learning from the System

Every interaction teaches you:
- validation-monitor feedback → better coding patterns
- code-quality reviews → best practices
- test-automation → edge cases to consider
- product-strategy research → market awareness

## 🚀 Final Tips

1. **Start small**: One feature at a time
2. **Trust the process**: Let agents complete their work
3. **Accept feedback**: validation-monitor is your friend
4. **Stay organized**: Use the backlog system
5. **Keep learning**: Each day improves the system

Remember: You're not really working alone. You have 10 specialized agents supporting you. Use them wisely, and you'll ship better code faster than a traditional team.

---

*"The best developers aren't the ones who write the most code, but the ones who ship the most value."*

**Your Daily Mantra**: "Product first, code second, quality always."