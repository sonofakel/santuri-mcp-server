/**
 * search_documentation MCP tool.
 * Searches across all documentation content using the SaaS API.
 * This is the PREFERRED way to query documentation (RAG-style) to save tokens.
 * Automatically scoped to the SANTURI_STACK_ID configured via environment variable.
 * @module tools/search
 */

import { z } from 'zod';
import { searchDocumentation, getApiConfig } from '../api-client.js';

/**
 * Tool input schema
 */
export const searchDocumentationSchema = z.object({
  query: z.string().describe('Search query'),
  limit: z.number().min(1).max(50).default(10).describe('Maximum number of results'),
});

export type SearchDocumentationInput = z.infer<typeof searchDocumentationSchema>;

/**
 * Tool definition for MCP
 */
export const searchDocumentationTool = {
  name: 'search_documentation',
  description:
    '🔍 RECOMMENDED: Search documentation using RAG-style retrieval. Returns only relevant snippets (not full docs) to save tokens. Automatically searches within the configured documentation stack. Just provide your query - no need to specify technology names.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      query: {
        type: 'string',
        description: 'Search query - use natural language or keywords to find relevant documentation sections',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results (1-50, default: 10)',
        default: 10,
      },
    },
    required: ['query'],
  },
};

/**
 * Execute the search_documentation tool
 */
export async function executeSearchDocumentation(
  input: SearchDocumentationInput
): Promise<{
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
}> {
  try {
    const parsed = searchDocumentationSchema.parse(input);

    // Get the configured stack from SANTURI_STACK_ID env var
    const { stackId } = getApiConfig();
    const stackDescription = stackId ? `stack ${stackId}` : 'all sources';

    // Call the SaaS API
    const response = await searchDocumentation(parsed.query, {
      stackId: stackId,
      limit: parsed.limit,
    });

    const results = response.results;

    if (results.length === 0) {
      let message = `No results found for query: "${parsed.query}"`;
      message += `\n\n**Searched:** ${stackDescription}`;
      message += `\n**Usage:** ${response.usage.used}/${response.usage.limit} searches used this month`;

      return {
        content: [{ type: 'text', text: message }],
      };
    }

    // Format results
    const formattedResults = results.map((result, index) => {
      return `## Result ${index + 1}: ${result.sourceName}

**Source ID:** ${result.sourceId}
**Category:** ${result.category}
**Title:** ${result.title}
**Relevance Score:** ${(result.score * 100).toFixed(0)}%

${result.snippet}

---`;
    });

    const responseText = `# Search Results for "${parsed.query}"

Found ${results.length} result(s) in ${stackDescription}
**Usage:** ${response.usage.used}/${response.usage.limit} searches this month

${formattedResults.join('\n\n')}`;

    return {
      content: [{ type: 'text', text: responseText }],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      content: [{ type: 'text', text: `Error searching documentation: ${message}` }],
      isError: true,
    };
  }
}
