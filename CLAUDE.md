# Global Rules

## Commits & Attribution

- Never credit Claude, Claude Code, Happy, or any AI tool in commits (no co-author, "generated with", "via", etc.)

## Tooling

- Always use Context7 MCP for library/API docs, code generation, setup, or configuration — without being asked
- Before every commit, run /simplify first to review and clean up changed code
- When working in a language without an LSP plugin, look up and install the appropriate plugin from claude-plugins-official (or install the language server binary) at user scope before proceeding

## CI/CD Pipelines

Before fixing individual pipeline issues, do a full audit:

- Trace actual behavior of each pipeline type (not just the intended flow)
- Verify jobs do meaningful work (e.g., check if `nx affected` produces an empty diff)
- Check cache/dependency assumptions (does the job install deps or rely on cache?)
- Cross-check docs against actual config
- Be proactive, not reactive — don't just fix errors as they surface

## Code Style

- **Small functions**: Under 20 lines of executable code. One responsibility per function — split if it does more.
- **Minimal nesting**: Max 2 levels of indentation. Use guard clauses and early returns.
- **Explicit naming**: Searchable, intention-revealing names (`daysUntilExpiration` not `d`). Verbs for functions, nouns for classes.
- **Few arguments**: 0-3 parameters. Use objects/structs for complex inputs.
- **No dead code**: Remove commented-out code and TODOs without a ticket reference.

## SOLID Principles

- **SRP**: One reason to change per module. Separate logic from side effects.
- **OCP**: Open for extension, closed for modification. Use interfaces for new features.
- **LSP**: Subtypes must be substitutable for their base types. No `NotImplemented` in subclasses.
- **ISP**: Small, specific interfaces. Clients never depend on methods they don't use.
- **DIP**: Depend on abstractions, not concretions. Business logic doesn't know about DB or API details.

## Communication

- If a requested change violates these rules, refactor the surrounding code first.
- Before writing code, plan the architecture against SOLID principles.
- Keep explanations brief. Focus on "why" not "what" — the code speaks for itself.
