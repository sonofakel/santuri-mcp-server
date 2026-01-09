/**
 * list_sources MCP tool.
 * Lists available documentation sources using the SaaS API.
 * @module tools/list-sources
 */

import { z } from 'zod';
import { listSources, getApiConfig, type Source } from '../api-client.js';

/**
 * Tool input schema
 */
export const listSourcesSchema = z.object({
  category: z.string().optional().describe('Filter by category'),
});

export type ListSourcesInput = z.infer<typeof listSourcesSchema>;

/**
 * Tool definition for MCP
 */
export const listSourcesTool = {
  name: 'list_sources',
  description:
    'List documentation sources available in the configured stack. Shows source IDs that can be used with search_documentation.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      category: {
        type: 'string',
        description: 'Optional: Filter by category (e.g., "AI/ML", "Platform", "Database")',
      },
    },
    required: [],
  },
};

/**
 * Execute the list_sources tool
 */
export async function executeListSources(
  input: ListSourcesInput
): Promise<{
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
}> {
  try {
    const parsed = listSourcesSchema.parse(input);
    const { stackId } = getApiConfig();
    const stackDesc = stackId ? `stack ${stackId}` : 'all sources';

    // Fetch sources from the SaaS API, passing stackId for proper filtering
    let sources: Source[] = await listSources({ stackId });

    // Apply category filter if specified
    if (parsed.category) {
      sources = sources.filter((s) => s.category === parsed.category);
    }

    if (sources.length === 0) {
      let message = 'No documentation sources available';
      if (stackId) {
        message += ` in ${stackDesc}`;
      }
      if (parsed.category) {
        message += ` with category "${parsed.category}"`;
      }
      return {
        content: [{ type: 'text', text: message }],
      };
    }

    // Group by category
    const byCategory = new Map<string, Source[]>();
    for (const source of sources) {
      const cat = source.category ?? 'Uncategorized';
      if (!byCategory.has(cat)) {
        byCategory.set(cat, []);
      }
      byCategory.get(cat)!.push(source);
    }

    // Build formatted output
    let output = `# Documentation Sources\n\n`;
    output += `**Stack:** ${stackDesc}\n`;
    output += `**Sources:** ${sources.length}`;
    if (parsed.category) {
      output += ` (filtered by category "${parsed.category}")`;
    }
    output += '\n\n';

    for (const [category, categorySources] of byCategory) {
      output += `## ${category}\n\n`;

      for (const source of categorySources) {
        output += `### ${source.name}\n`;
        output += `- **ID:** \`${source.id}\`\n`;
        output += `- **Slug:** \`${source.slug}\`\n`;
        output += `- **URL:** ${source.llmsTxtUrl}\n`;
        if (source.description) {
          output += `- **Description:** ${source.description}\n`;
        }
        output += '\n';
      }
    }

    // Add usage tip
    output += `---\n\n`;
    output += `**Tip:** Use \`search_documentation\` to search across all these sources with a single query.`;

    return {
      content: [{ type: 'text', text: output }],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      content: [{ type: 'text', text: `Error listing sources: ${message}` }],
      isError: true,
    };
  }
}
