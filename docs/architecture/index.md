# Architecture Documentation

This directory contains architecture documentation for the Mithril project, including Architecture Decision Records (ADRs) and architectural patterns.

## Overview

Mithril is a modern JavaScript framework for building web applications. This documentation captures the architectural decisions and patterns that guide the framework's development.

## Contents

- **[Architecture Decision Records (ADRs)](./adr/)** - Important architectural decisions and their rationale
- **[ADR Index](./adr/index.md)** - List of all ADRs

## Key Architectural Decisions

### SSR and Hydration

- **[ADR-0001](./adr/0001-ssr-hydration.md)**: SSR Hydration Support
  - Generic state serialization approach
  - Hydration detection and state restoration
  - Works with proxy-based state system

### State Management

- **[ADR-0002](./adr/0002-signals-implementation.md)**: Custom Signals Implementation
  - Fine-grained reactivity system
  - Component-level redraws
  - Builds on SSR hydration support

## Architectural Principles

1. **Backward Compatibility**: Existing Mithril behavior must not break
2. **Performance**: Fine-grained updates, only re-render what changed
3. **Self-Contained**: Minimal external dependencies
4. **SSR-First**: Design for server-side rendering from the start
5. **Developer Experience**: Intuitive APIs, easy migration paths

## Related Documentation

- [AGENTS.md](../../AGENTS.md) - Instructions for AI assistants on analyzing architectural decisions
- [README.md](../../README.md) - Project overview
