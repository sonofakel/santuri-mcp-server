/**
 * MCP Tools integration tests.
 * Tests for existing tools: search and list-sources.
 * @module tests/tools
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the api-client module
vi.mock('../src/api-client.js', () => ({
  getApiConfig: vi.fn().mockReturnValue({
    apiKey: 'test-api-key',
    apiUrl: 'http://localhost:3000',
    stackId: 'test-stack-id',
  }),
  searchDocumentation: vi.fn().mockImplementation((query) => {
    if (query === 'test query') {
      return Promise.resolve({
        results: [
          {
            sourceId: 'anthropic',
            sourceName: 'Anthropic',
            sourceSlug: 'anthropic',
            category: 'AI/ML',
            title: 'Test Result',
            snippet: 'This is a test result',
            score: 0.95,
          },
        ],
        usage: {
          used: 10,
          limit: 100,
        },
      });
    }
    return Promise.resolve({
      results: [],
      usage: {
        used: 10,
        limit: 100,
      },
    });
  }),
  listSources: vi.fn().mockImplementation(() => {
    return Promise.resolve([
      {
        id: 'anthropic',
        name: 'Anthropic',
        slug: 'anthropic',
        category: 'AI/ML',
        description: 'Anthropic documentation',
        llmsTxtUrl: 'https://docs.anthropic.com/llms-full.txt',
      },
      {
        id: 'vercel',
        name: 'Vercel',
        slug: 'vercel',
        category: 'Platform',
        description: 'Vercel documentation',
        llmsTxtUrl: 'https://vercel.com/llms-full.txt',
      },
    ]);
  }),
}));

import { executeSearchDocumentation } from '../src/tools/search.js';
import { executeListSources } from '../src/tools/list-sources.js';

describe('search_documentation tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return search results for valid query', async () => {
    const result = await executeSearchDocumentation({
      query: 'test query',
      limit: 10,
    });

    expect(result.isError).toBeUndefined();
    expect(result.content).toHaveLength(1);
    expect(result.content[0]?.text).toContain('Search Results');
    expect(result.content[0]?.text).toContain('Anthropic');
  });

  it('should return no results message for empty results', async () => {
    const result = await executeSearchDocumentation({
      query: 'nonexistent query',
      limit: 10,
    });

    expect(result.isError).toBeUndefined();
    expect(result.content[0]?.text).toContain('No results found');
  });

  it('should include usage information in results', async () => {
    const result = await executeSearchDocumentation({
      query: 'test query',
      limit: 10,
    });

    expect(result.content[0]?.text).toContain('10/100');
  });
});

describe('list_sources tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return all sources in the stack', async () => {
    const result = await executeListSources({});

    expect(result.isError).toBeUndefined();
    expect(result.content[0]?.text).toContain('Documentation Sources');
    expect(result.content[0]?.text).toContain('Anthropic');
    expect(result.content[0]?.text).toContain('Vercel');
  });

  it('should filter by category when specified', async () => {
    const result = await executeListSources({
      category: 'AI/ML',
    });

    expect(result.isError).toBeUndefined();
    expect(result.content[0]?.text).toContain('AI/ML');
    expect(result.content[0]?.text).toContain('Anthropic');
    // Should not contain Platform sources when filtering
    expect(result.content[0]?.text).not.toContain('Vercel');
  });

  it('should show no sources message when category has no matches', async () => {
    const result = await executeListSources({
      category: 'NonexistentCategory',
    });

    expect(result.isError).toBeUndefined();
    expect(result.content[0]?.text).toContain('No documentation sources available');
  });

  it('should show stack ID in output', async () => {
    const result = await executeListSources({});

    expect(result.content[0]?.text).toContain('test-stack-id');
  });
});
