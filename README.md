# santuri-mcp-server

MCP (Model Context Protocol) server for [Santuri](https://santuri.io) - providing documentation context to AI coding assistants.

## Overview

This server implements the [Model Context Protocol](https://modelcontextprotocol.io/) to give AI assistants like Claude, Cursor, and Windsurf access to up-to-date technical documentation. Search across 50+ documentation sources including React, Next.js, Supabase, Tailwind, and more.

## Installation

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "santuri": {
      "command": "npx",
      "args": ["-y", "santuri-mcp-server"]
    }
  }
}
```

### Claude Code

```bash
claude mcp add santuri -- npx -y santuri-mcp-server
```

### Cursor / Windsurf

Add to your MCP configuration:

```json
{
  "mcpServers": {
    "santuri": {
      "command": "npx",
      "args": ["-y", "santuri-mcp-server"]
    }
  }
}
```

## Configuration

The server works out of the box with anonymous access (20 searches/day). For higher limits, configure an API key.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SANTURI_API_KEY` | No | API key for authenticated access (higher rate limits) |
| `SANTURI_STACK_ID` | No | Limit searches to a specific documentation stack |
| `SANTURI_API_URL` | No | Custom API endpoint (defaults to `https://santuri.io`) |

### With API Key

```json
{
  "mcpServers": {
    "santuri": {
      "command": "npx",
      "args": ["-y", "santuri-mcp-server"],
      "env": {
        "SANTURI_API_KEY": "your-api-key"
      }
    }
  }
}
```

Get your API key at [santuri.io/settings](https://santuri.io/settings).

## Available Tools

### `search_documentation`

Search across all configured documentation sources using semantic search.

**Parameters:**
- `query` (required): Natural language search query
- `limit` (optional): Maximum results (1-50, default: 10)

**Example:**
```
Search for: "how to set up authentication in Next.js with Supabase"
```

### `list_sources`

List all available documentation sources.

**Parameters:**
- `category` (optional): Filter by category (e.g., "AI/ML", "Platform", "Database")

## Rate Limits

| Plan | Daily Searches |
|------|----------------|
| Anonymous | 20 |
| Free | 100 |
| Pro | Unlimited |

## Development

```bash
# Clone the repository
git clone https://github.com/sonofakel/santuri-mcp-server.git
cd santuri-mcp-server

# Install dependencies
pnpm install

# Run in development mode
pnpm dev

# Run tests
pnpm test

# Build
pnpm build
```

## Security

This package:
- Never stores or logs API keys
- Uses HTTPS for all API communication
- Validates all inputs with Zod schemas
- Has minimal dependencies (2 production deps)

For security concerns, see [SECURITY.md](SECURITY.md) or email security@santuri.io.

## License

MIT - see [LICENSE](LICENSE)

## Links

- [Santuri Website](https://santuri.io)
- [Documentation](https://santuri.io/docs)
- [GitHub Issues](https://github.com/sonofakel/santuri-mcp-server/issues)
- [Model Context Protocol](https://modelcontextprotocol.io/)
