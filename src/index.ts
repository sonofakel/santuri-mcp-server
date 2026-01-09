#!/usr/bin/env node
/**
 * Santuri MCP Server Entry Point.
 * Executable entry point for the MCP server.
 * @module mcp-server
 */

import { startServer } from './server.js';

// Start the server
startServer().catch((error) => {
  console.error('Failed to start Santuri MCP server:', error);
  process.exit(1);
});
