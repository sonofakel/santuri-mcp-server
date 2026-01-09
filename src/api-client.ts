/**
 * SaaS API Client for MCP Server.
 * Handles authenticated API calls to the Santuri SaaS platform.
 * @module api-client
 */

export interface SearchResult {
  sourceId: string;
  sourceName: string;
  sourceSlug: string;
  category: string;
  title: string;
  snippet: string;
  score: number;
}

export interface SearchResponse {
  results: SearchResult[];
  usage: {
    used: number;
    limit: number;
  };
}

export interface Source {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  llmsTxtUrl: string;
}

export interface SourcesResponse {
  sources: Source[];
}

export interface ApiClientConfig {
  apiKey: string | null;
  apiUrl: string;
  stackId?: string;
}

let config: ApiClientConfig | null = null;

/**
 * Initialize the API client configuration from environment variables.
 * API key is optional - anonymous users get rate-limited access.
 */
export function initApiClient(): ApiClientConfig {
  if (config) {
    return config;
  }

  // API key is optional - anonymous users get 20 searches/day
  const apiKey = process.env.SANTURI_API_KEY || null;

  // Default to production URL; override with SANTURI_API_URL for development
  const apiUrl = process.env.SANTURI_API_URL || 'https://santuri.io';
  const stackId = process.env.SANTURI_STACK_ID;

  config = {
    apiKey,
    apiUrl,
    stackId,
  };

  return config;
}

/**
 * Get the API client configuration
 */
export function getApiConfig(): ApiClientConfig {
  if (!config) {
    return initApiClient();
  }
  return config;
}

/**
 * Make an API request (authenticated if API key is configured)
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const { apiKey, apiUrl } = getApiConfig();

  const url = `${apiUrl}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  // Only add Authorization header if API key is configured
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: null })) as { error?: string };
    throw new Error(errorData.error || `API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

/**
 * Search documentation using the SaaS API
 */
export async function searchDocumentation(
  query: string,
  options: {
    stackId?: string;
    limit?: number;
  } = {}
): Promise<SearchResponse> {
  const { stackId: configStackId } = getApiConfig();
  
  // Use the provided stackId or fall back to configured one
  const effectiveStackId = options.stackId || configStackId;

  const body = {
    query,
    stackId: effectiveStackId,
    limit: options.limit || 10,
  };

  return apiRequest<SearchResponse>('/api/mcp/search', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * List available sources
 * Uses the MCP-authenticated sources endpoint
 */
export async function listSources(options: { stackId?: string } = {}): Promise<Source[]> {
  const { stackId: configStackId } = getApiConfig();
  
  // Use the provided stackId or fall back to configured one
  const effectiveStackId = options.stackId || configStackId;
  
  // Build query string with stackId if available
  const queryParams = effectiveStackId ? `?stackId=${encodeURIComponent(effectiveStackId)}` : '';
  const response = await apiRequest<SourcesResponse>(`/api/mcp/sources${queryParams}`);
  return response.sources;
}

/**
 * Get a single source by ID or slug
 */
export async function getSource(idOrSlug: string, options: { stackId?: string } = {}): Promise<Source | null> {
  try {
    const sources = await listSources(options);
    return sources.find(s => s.id === idOrSlug || s.slug === idOrSlug) || null;
  } catch {
    return null;
  }
}

/**
 * Clear the cached configuration (useful for testing)
 */
export function clearApiClientCache(): void {
  config = null;
}
