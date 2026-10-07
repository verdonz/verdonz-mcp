#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/server/stdio';
import { loadConfig } from './config.js';
import { createServer } from './server.js';
import { log } from './utils/logging.js';

async function main(): Promise<void> {
  try {
    const config = loadConfig();
    const server = createServer(config);
    await server.connect(new StdioServerTransport());
    log(`started in ${config.mock ? 'mock' : 'production'} mode`);
  } catch (error) {
    process.stderr.write(
      `[verdonz-mcp] startup failed: ${error instanceof Error ? error.message : 'unknown error'}\n`,
    );
    process.exitCode = 1;
  }
}

void main();
