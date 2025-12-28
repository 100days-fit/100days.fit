# MCP - Model Context Protocol Integration

## Overview

The MCP (Model Context Protocol) servers provide specialized capabilities that enhance Claude Code's functionality in the 100days.fit monorepo. This document describes the available MCP servers configured in `.mcp.json`.

## 🔌 Active MCP Servers

### Currently Configured (in .mcp.json)

| Server | Type | Purpose | Key Operations |
|--------|------|---------|----------------|
| **sequential-thinking** | npx | Complex reasoning and problem decomposition | planning, multi-step analysis, decision trees |
| **context7** | SSE | Documentation lookup | library docs, API references, best practices |
| **sentry** | HTTP | Error tracking & monitoring | issue analysis, performance monitoring, release tracking |

## 🔄 How to Use MCP Servers in Claude Code

### Sequential Thinking
For complex problem decomposition and planning:
```javascript
mcp__sequential-thinking__sequentialthinking({
  thought: "Breaking down the authentication implementation",
  nextThoughtNeeded: true,
  thoughtNumber: 1,
  totalThoughts: 5
})
```

### Context7 Documentation
For library documentation and API references:
```javascript
// First resolve the library ID
mcp__context7__resolve-library-id({
  libraryName: "hasura"
})

// Then get documentation
mcp__context7__get-library-docs({
  context7CompatibleLibraryID: "/hasura/graphql-engine",
  topic: "migrations",
  tokens: 5000
})
```

### Sentry Operations
For error tracking and monitoring:
```javascript
// Search for issues
mcp__sentry__search_issues({
  organizationSlug: "100days-fit",
  naturalLanguageQuery: "unresolved errors from last week"
})

// Analyze issue with AI
mcp__sentry__analyze_issue_with_seer({
  organizationSlug: "100days-fit",
  issueId: "PROJECT-123"
})
```

## 📊 Recommended Usage by Agent

### Planning Agents
- **product-strategy**: Use sequential-thinking for task breakdown, context7 for research

### Development Agents  
- **hasura-engineer**: Use context7 for Hasura/GraphQL documentation
- **mobile-developer**: Use context7 for React Native/Expo documentation
- **web-developer**: Use context7 for Next.js documentation, sentry for error tracking

### Quality Agents
- **validation-monitor**: Use sequential-thinking for validation strategies
- **devops-engineer**: Use sentry for infrastructure monitoring

## 🎯 MCP Usage Guidelines

### When to Use Each Server

#### context7
**Use for:**
- Library documentation lookup
- API reference searches
- Best practices research
- Code examples discovery

#### sequential-thinking
**Use for:**
- Complex problem decomposition
- Multi-step planning
- Decision tree analysis
- Hypothesis generation and validation

#### sentry
**Use for:**
- Error tracking and analysis
- Performance monitoring
- Release tracking
- Issue management

## 🚨 Important Notes

1. **Configuration**: The actual MCP servers available are defined in `.mcp.json`
2. **API Keys**: Should be stored as environment variables, not in the configuration file
3. **Agent Access**: Agents use MCP through Claude Code's built-in functions
4. **Availability**: Only the 3 servers listed above are currently configured

## 📚 Viewing Current Configuration

To see the actual MCP configuration:
```bash
cat /Users/shreeshkatyayan/Repositories/100days.fit/.mcp.json
```

---

*Last Updated: 2025-01-25*
*Note: This document reflects the actual MCP configuration in `.mcp.json`*