# Commit Command

Create a conventional commit and push. Use `/commit` to run.

## Workflow

1. **Run lint first**: `bun run lint:ts` — fix any lint/type errors before proceeding. Don't mention these fixes in the commit message.

2. **Stage**: `git add -A`

3. **Analyze**: Use `git diff --cached` to see what changed.

4. **Commit message**: Conventional format `type(scope): subject`. Types: `feat`, `fix`, `refactor`, `chore`, `docs`, `style`, `test`, `perf`, `ci`, `build`. Scope from path: `api`, `render`, `docs`, `examples`, `server`, or `core`. Subject: imperative, lowercase, no period.

5. **Commit & push**:
    ```bash
    .cursor/scripts/commit.sh "type(scope): subject"
    ```

## Note

Do not add issue refs in the footer unless explicitly requested.
