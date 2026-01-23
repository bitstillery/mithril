# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records (ADRs) for the Mithril project. ADRs document important architectural decisions, their context, rationale, and consequences.

## What are ADRs?

Architecture Decision Records are documents that capture important architectural decisions made in the project. They help:

- Understand why certain decisions were made
- Track the evolution of the architecture
- Provide context for future decisions
- Onboard new team members

## ADR Index

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [0001](./0001-ssr-hydration.md) | SSR Hydration Support | Accepted | 2025-01-XX |
| [0002](./0002-signals-implementation.md) | Custom Signals Implementation | Proposed | 2025-01-XX |
| [0003](./0003-typescript-typing-consolidation.md) | TypeScript Typing Consolidation | Proposed | 2025-01-XX |
| [0004](./0004-ssr-state-serialization-signal-stores.md) | SSR State Serialization for Signal Stores | Proposed | 2025-01-23 |
| [0005](./0005-state-naming-and-store-persistence.md) | State Naming and Store Persistence | Proposed | 2025-01-23 |
| [0006](./0006-unified-serialization-computed-properties.md) | Unified Serialization/Deserialization and Computed Property Restoration | Proposed | 2025-01-23 |
| [0007](./0007-store-ssr-persistence-strategy.md) | Store SSR and Persistence Strategy | Proposed | 2025-01-23 |
| [0008](./0008-session-state-update-api.md) | Session State Update API | Proposed | 2025-01-23 |
| [0009](./0009-ssr-server-abstraction.md) | SSR Server Component Abstraction | Proposed | 2025-01-23 |

## Status Definitions

- **Proposed**: Decision is under consideration
- **Accepted**: Decision has been approved and is being implemented
- **Rejected**: Decision was considered but not adopted
- **Superseded**: Decision has been replaced by a newer ADR
- **Deprecated**: Decision is no longer relevant but kept for historical reference

## How to Read ADRs

Each ADR follows a standard format:

1. **Context**: Background and problem statement
2. **Decision**: What was decided
3. **Rationale**: Why this decision was made
4. **Consequences**: Pros, cons, risks, trade-offs
5. **Alternatives Considered**: Other options evaluated
6. **Implementation Details**: Technical approach
7. **Related ADRs**: Links to related decisions

## Creating a New ADR

When making a significant architectural decision:

1. Create a new ADR file: `XXXX-topic.md` (where XXXX is the next number)
2. Follow the standard ADR format
3. Update this index with the new ADR
4. Link to related ADRs

## Related Documentation

- [Architecture Overview](../index.md)
- [AGENTS.md](../../../AGENTS.md) - Instructions for AI assistants on analyzing ADRs
