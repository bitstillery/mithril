# Instructions for AI Assistants

This file provides guidance for AI assistants working on the Mithril project, particularly regarding architectural decisions and how to analyze previous decisions.

## Purpose

This document helps AI assistants:
- Understand how to analyze and reference architectural decisions
- Maintain consistency with existing architectural patterns
- Make informed recommendations that align with project direction
- Track the evolution of architectural decisions

## Architecture Decision Records (ADRs)

### Location

ADRs are located in `docs/architecture/adr/`:
- Individual ADRs: `docs/architecture/adr/XXXX-topic.md` (e.g., `0001-ssr-hydration.md`)
- ADR Index: `docs/architecture/adr/index.md` - Lists all ADRs with status

### Reading ADRs

When analyzing a decision:

1. **Read the full ADR**: Don't just read the summary - understand the context
2. **Check related ADRs**: Follow links to understand dependencies
3. **Note the status**: Proposed, Accepted, Rejected, Superseded, Deprecated
4. **Understand the rationale**: Why was this decision made?
5. **Review consequences**: What are the pros, cons, and risks?

### ADR Format

Each ADR contains:
- **Context**: Background and problem statement
- **Decision**: What was decided
- **Rationale**: Why this decision was made
- **Consequences**: Pros, cons, risks, trade-offs
- **Alternatives Considered**: Other options evaluated
- **Implementation Details**: Technical approach
- **Related ADRs**: Links to related decisions

## Before Making Architectural Decisions

### 1. Check Existing ADRs

**Always check `docs/architecture/adr/` before proposing architectural changes:**

- Search for relevant ADRs using keywords
- Read ADRs that might be related to your proposal
- Understand the context and constraints of previous decisions
- Check if your proposal conflicts with existing decisions

**Example:**
```
Before proposing a new state management approach:
1. Read ADR-0001 (SSR Hydration Support)
2. Read ADR-0002 (Custom Signals Implementation)
3. Understand how they work together
4. Ensure your proposal is compatible
```

### 2. Understand Current Architecture

**Understand the current architecture before proposing changes:**

- Read relevant code files mentioned in ADRs
- Understand how existing systems work
- Identify integration points
- Consider backward compatibility requirements

### 3. Consider Compatibility

**Ensure your proposal is compatible with existing decisions:**

- Does it conflict with any ADRs?
- Does it build on existing patterns?
- Does it maintain backward compatibility?
- Does it align with architectural principles?

## When Creating New ADRs

### When to Create an ADR

**Create an ADR for:**
- Significant architectural decisions
- Technology choices (frameworks, libraries, tools)
- Design patterns that affect multiple parts of the system
- Breaking changes or major API changes
- Decisions that affect long-term maintainability

**Don't create an ADR for:**
- Implementation details within existing patterns
- Bug fixes without architectural changes
- Routine dependency updates
- Minor API additions

### ADR Format and Structure

**Follow the standard ADR format:**

1. **Title**: `ADR-XXXX: [Decision Title]`
2. **Status**: Proposed | Accepted | Rejected | Superseded | Deprecated
3. **Date**: When decision was made
4. **Related ADRs**: Links to related decisions
5. **Context**: Background and problem statement
6. **Decision**: What was decided
7. **Rationale**: Why this decision was made
8. **Consequences**: Pros, cons, risks, trade-offs
9. **Alternatives Considered**: Other options evaluated
10. **Implementation Details**: Technical approach
11. **References**: External resources, PRs, issues

**Example structure:**
```markdown
# ADR-0003: [Decision Title]

**Status**: Proposed  
**Date**: 2025-01-XX  
**Related ADRs**: [ADR-0001](./0001-ssr-hydration.md), [ADR-0002](./0002-signals-implementation.md)

## Context
[Background and problem statement]

## Decision
[What was decided]

## Rationale
[Why this decision was made]

## Consequences
[Pros, cons, risks, trade-offs]

## Alternatives Considered
[Other options evaluated]

## Implementation Details
[Technical approach]

## References
[External resources, PRs, issues]
```

### Linking Related ADRs

**Always link to related ADRs:**

- If your decision builds on another ADR, link to it
- If your decision conflicts with another ADR, explain why
- If your decision supersedes another ADR, mark the old one as "Superseded"
- Update the ADR index when creating new ADRs

## Analyzing Previous Decisions

### How to Search for Relevant ADRs

**Search strategies:**

1. **Keyword search**: Search for terms related to your topic
   - State management → ADR-0002
   - SSR, hydration → ADR-0001
   - Performance, reactivity → ADR-0002

2. **Read the ADR index**: `docs/architecture/adr/index.md`
   - Lists all ADRs with brief descriptions
   - Shows status (Proposed, Accepted, etc.)

3. **Follow related ADR links**: ADRs link to related decisions

### Understanding Decision Context

**When analyzing a previous decision:**

1. **Read the full ADR**: Don't just read summaries
2. **Understand the problem**: What problem was being solved?
3. **Review alternatives**: What other options were considered?
4. **Check implementation status**: Is it implemented? In progress?
5. **Note constraints**: What constraints influenced the decision?

### Identifying if a Decision is Still Valid

**Check if a decision is still valid:**

1. **Status**: Is it Accepted, Superseded, or Deprecated?
2. **Implementation**: Has it been implemented? Is it working?
3. **Context changes**: Has the context changed since the decision?
4. **Related decisions**: Have related decisions changed?
5. **Feedback**: Has there been feedback or issues with the decision?

**Example:**
```
ADR-0002 (Signals Implementation) is Proposed:
- Status: Proposed (not yet implemented)
- Related: ADR-0001 (SSR Hydration) is Accepted
- Context: Still relevant, builds on SSR hydration
- Conclusion: Decision is still valid, implementation pending
```

### Proposing Changes or Superseding ADRs

**If you want to change or supersede an ADR:**

1. **Understand the original decision**: Read the full ADR
2. **Identify what changed**: What has changed since the original decision?
3. **Create a new ADR**: Document the new decision
4. **Link to the old ADR**: Reference the ADR you're superseding
5. **Update the old ADR**: Mark it as "Superseded" with a link to the new ADR
6. **Update the ADR index**: Update status in the index

**Example:**
```markdown
# ADR-0003: New Approach

**Status**: Proposed  
**Related ADRs**: [ADR-0002](./0002-signals-implementation.md) (Supersedes)

## Context
ADR-0002 proposed a custom signals implementation. After evaluation, we've decided on a different approach...

## Decision
[New decision that supersedes ADR-0002]
```

## Examples

### Example 1: Referencing an ADR

**When proposing a feature that builds on existing architecture:**

```markdown
## Proposal: Enhanced SSR Support

This proposal builds on ADR-0001 (SSR Hydration Support) by adding...

**Compatibility:**
- Compatible with ADR-0001's state serialization approach
- Works with ADR-0002's signals implementation (when implemented)
- Maintains backward compatibility

**References:**
- ADR-0001: SSR Hydration Support
- ADR-0002: Custom Signals Implementation
```

### Example 2: Analyzing a Previous Decision

**When evaluating if a decision is still valid:**

```markdown
## Analysis: ADR-0002 Signals Implementation

**Status Check:**
- Current status: Proposed
- Implementation: Not yet started
- Related ADRs: ADR-0001 (Accepted, implemented)

**Context Review:**
- Original problem: Need fine-grained reactivity
- Current context: Still relevant, performance is important
- Related decisions: ADR-0001 provides SSR foundation

**Conclusion:**
Decision is still valid. Implementation should proceed as planned.
```

### Example 3: Proposing a New ADR

**When making a significant architectural decision:**

```markdown
# ADR-0003: Component-Level Redraw API

**Status**: Proposed  
**Date**: 2025-01-XX  
**Related ADRs**: [ADR-0002](./0002-signals-implementation.md) (Required for signals)

## Context
ADR-0002 (Signals Implementation) requires component-level redraws for fine-grained reactivity...

## Decision
We will implement a component-level redraw API similar to PR #3036...

## Rationale
- Required for ADR-0002's fine-grained reactivity
- Improves performance (only update what changed)
- Maintains backward compatibility with existing `m.redraw()`

## Consequences
[Pros, cons, risks]

## References
- ADR-0002: Custom Signals Implementation
- PR #3036: Component-Level Redraws
```

## Key Principles

1. **Always check ADRs first**: Before proposing architectural changes
2. **Understand context**: Read full ADRs, not just summaries
3. **Maintain compatibility**: Ensure proposals align with existing decisions
4. **Link related decisions**: Always link to related ADRs
5. **Update status**: Keep ADR status current (Proposed → Accepted, etc.)
6. **Document rationale**: Explain why decisions were made
7. **Track evolution**: Update ADRs when decisions change

## Resources

- **ADR Directory**: `docs/architecture/adr/`
- **ADR Index**: `docs/architecture/adr/index.md`
- **Architecture Overview**: `docs/architecture/index.md`
- **Project README**: `README.md`

## Questions?

If you're unsure about:
- Whether to create an ADR: Err on the side of creating one
- How to reference an ADR: Link to it and explain the relationship
- If a decision is still valid: Read the ADR, check status, review context
- How to propose changes: Create a new ADR, link to the old one, update status
