# Technical Design Documents

## Purpose

This directory defines how the WiAI rewrite is built: architecture, module boundaries, runtime referee, Agent integration, deployment, and core UML diagrams.

## Read First

1. [architecture-overview.md](./architecture-overview.md)
2. [module-boundaries.md](./module-boundaries.md)
3. [design-pattern-oop-audit.md](./design-pattern-oop-audit.md)
4. [system-uml-diagrams.md](./system-uml-diagrams.md)
5. [domain-model-diagrams.md](./domain-model-diagrams.md)
6. [package-dependency-diagrams.md](./package-dependency-diagrams.md)
7. [visibility-and-trust-diagrams.md](./visibility-and-trust-diagrams.md)
8. [runtime-referee-design.md](./runtime-referee-design.md)

## Files

| File | Purpose |
|---|---|
| [architecture-overview.md](./architecture-overview.md) | Overall system design |
| [module-boundaries.md](./module-boundaries.md) | Package ownership and dependency rules |
| [design-pattern-oop-audit.md](./design-pattern-oop-audit.md) | Strict OOP, design pattern, and engineering audit |
| [runtime-referee-design.md](./runtime-referee-design.md) | Colyseus runtime and pure referee model |
| [agent-integration-design.md](./agent-integration-design.md) | Agent suggestion boundary and execution path |
| [deployment-environments.md](./deployment-environments.md) | Local, staging, and production environment expectations |
| [system-uml-diagrams.md](./system-uml-diagrams.md) | System-level Mermaid UML diagrams |
| [runtime-sequence-diagrams.md](./runtime-sequence-diagrams.md) | Runtime and phase transition sequence diagrams |
| [domain-model-diagrams.md](./domain-model-diagrams.md) | Pure domain class model diagrams |
| [package-dependency-diagrams.md](./package-dependency-diagrams.md) | Allowed and forbidden package dependency diagrams |
| [visibility-and-trust-diagrams.md](./visibility-and-trust-diagrams.md) | Hidden information and trust boundary diagrams |

## Update Rules

- Architecture changes require an ADR under [../08-adr](../08-adr/README.md).
- New runtime behavior must preserve server authority and the Agent suggestion boundary.
- Package dependency changes must update [package-dependency-diagrams.md](./package-dependency-diagrams.md).
- Hidden information changes must update [visibility-and-trust-diagrams.md](./visibility-and-trust-diagrams.md) and API specs.
