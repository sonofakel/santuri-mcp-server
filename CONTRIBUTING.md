# Contributing to santuri-mcp-server

Thank you for your interest in contributing!

## Development Setup

```bash
# Clone the repository
git clone https://github.com/santuri-io/santuri.git
cd santuri/packages/mcp-server

# Install dependencies
pnpm install

# Run in development mode
pnpm dev
```

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start in watch mode |
| `pnpm build` | Compile TypeScript |
| `pnpm test` | Run tests |
| `pnpm lint` | Check code style |
| `pnpm typecheck` | Type check without emitting |

## Code Style

- TypeScript strict mode
- ESLint for linting
- Prettier for formatting (via ESLint)

## Testing

Run tests before submitting a PR:

```bash
pnpm test
pnpm lint
pnpm typecheck
```

## Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes
4. Run tests and linting
5. Commit with a descriptive message
6. Push to your fork
7. Open a Pull Request

## Commit Messages

Use clear, descriptive commit messages:

- `fix: resolve rate limit error handling`
- `feat: add source filtering by category`
- `docs: update installation instructions`
- `test: add search tool edge cases`

## Reporting Issues

- Check existing issues before creating a new one
- Use issue templates when available
- Provide reproduction steps for bugs
- Include environment details (Node version, OS, MCP client)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
