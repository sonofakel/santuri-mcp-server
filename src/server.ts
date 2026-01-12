/**
 * Santuri MCP Server.
 * Implements the Model Context Protocol for documentation access.
 * Connects to the Santuri SaaS platform via API.
 * @module server
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListResourceTemplatesRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { initApiClient } from './api-client.js';

import {
  searchDocumentationTool,
  executeSearchDocumentation,
} from './tools/search.js';
import type { SearchDocumentationInput } from './tools/search.js';
import {
  listSourcesTool,
  executeListSources,
} from './tools/list-sources.js';
import type { ListSourcesInput } from './tools/list-sources.js';

/**
 * Create and configure the MCP server
 */
export function createServer(): Server {
  const server = new Server(
    {
      name: 'santuri',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
        resources: {},
      },
    }
  );

  // Register tool handlers
  registerToolHandlers(server);

  // Register resource handlers
  registerResourceHandlers(server);

  return server;
}

/**
 * Register tool request handlers
 */
function registerToolHandlers(server: Server): void {
  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        searchDocumentationTool,
        listSourcesTool,
      ],
    };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    switch (name) {
      case 'search_documentation':
        return executeSearchDocumentation(args as unknown as SearchDocumentationInput);

      case 'list_sources':
        return executeListSources(args as unknown as ListSourcesInput);

      default:
        return {
          content: [
            {
              type: 'text' as const,
              text: `Unknown tool: ${name}`,
            },
          ],
          isError: true,
        };
    }
  });
}

/**
 * Register resource request handlers
 * Note: Resources are now fetched from the SaaS API
 */
function registerResourceHandlers(server: Server): void {
  // List available resources - minimal implementation
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return { resources: [] };
  });

  // Read a specific resource
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;
    throw new Error(`Resource not found: ${uri}. Use search_documentation to find content.`);
  });

  // List resource templates
  server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => {
    return { resourceTemplates: [] };
  });
}

/**
 * Start the MCP server with stdio transport
 */
export async function startServer(): Promise<void> {
  // Initialize the API client (validates configuration)
  try {
    const config = initApiClient();
    console.error(`Santuri MCP server initialized`);
    console.error(`  API URL: ${config.apiUrl}`);
    console.error(`  Mode: ${config.apiKey ? 'authenticated' : 'anonymous (100 searches/day)'}`);
    console.error(`  Stack ID: ${config.stackId || 'not configured (using all sources)'}`);
  } catch (error) {
    console.error(`Failed to initialize: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }

  const server = createServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);

  // Log to stderr since stdout is used for MCP communication
  console.error('Santuri MCP server started');
}
